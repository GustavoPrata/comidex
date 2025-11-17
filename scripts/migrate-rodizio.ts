import { createBrowserClient } from '@supabase/ssr';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { getSupabaseConfig } from '../lib/supabase/auto-detect';

// Configuração do Supabase usando a detecção automática
const config = getSupabaseConfig();
if (!config.configured || !config.url || !config.anonKey) {
  console.error('❌ Supabase não está configurado!');
  process.exit(1);
}

const supabase = createBrowserClient(config.url, config.anonKey);

// Interface para os dados parseados
interface ParsedItem {
  name: string;
  description: string;
  isPremium: boolean;
  categoryName: string;
}

interface ParsedCategory {
  name: string;
  items: ParsedItem[];
}

// Função para parsear o HTML
function parseHTML(): ParsedCategory[] {
  const htmlPath = path.join(process.cwd(), 'produtos.html');
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);
  
  const categories: ParsedCategory[] = [];
  
  // Parsear cada categoria
  $('.menu-category').each((_, categoryElement) => {
    const categoryTitle = $(categoryElement).find('.category-title').text().trim();
    const items: ParsedItem[] = [];
    
    // Parsear cada item da categoria
    $(categoryElement).find('.menu-item').each((_, itemElement) => {
      const $item = $(itemElement);
      const isPremium = $item.hasClass('premium');
      const name = $item.attr('data-name') || '';
      const description = $item.attr('data-description') || 'Sem descrição no momento';
      
      if (name) {
        items.push({
          name,
          description,
          isPremium,
          categoryName: categoryTitle
        });
      }
    });
    
    if (categoryTitle && items.length > 0) {
      categories.push({
        name: categoryTitle,
        items
      });
    }
  });
  
  return categories;
}

// Função principal de migração
async function migrateRodizio() {
  console.log('🚀 Iniciando migração dos produtos do rodízio...');
  
  try {
    // 1. Parsear o HTML
    console.log('📖 Parseando arquivo HTML...');
    const parsedCategories = parseHTML();
    console.log(`✅ Encontradas ${parsedCategories.length} categorias com ${parsedCategories.reduce((acc, cat) => acc + cat.items.length, 0)} produtos`);
    
    // 2. Buscar ou criar os grupos de Rodízio
    console.log('\n🔍 Buscando grupos de rodízio...');
    
    // Buscar grupo Rodízio Tradicional
    let { data: tradicionalGroup, error: errorTrad } = await supabase
      .from('groups')
      .select('*')
      .ilike('name', 'Rodízio Tradicional')
      .single();
    
    if (!tradicionalGroup) {
      console.log('📝 Criando grupo Rodízio Tradicional...');
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: 'Rodízio Tradicional',
          active: true,
          price: 89.90
        })
        .select()
        .single();
      
      if (error) throw error;
      tradicionalGroup = data;
    }
    
    // Buscar grupo Rodízio Premium
    let { data: premiumGroup, error: errorPrem } = await supabase
      .from('groups')
      .select('*')
      .ilike('name', 'Rodízio Premium')
      .single();
    
    if (!premiumGroup) {
      console.log('📝 Criando grupo Rodízio Premium...');
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: 'Rodízio Premium',
          active: true,
          price: 119.90
        })
        .select()
        .single();
      
      if (error) throw error;
      premiumGroup = data;
    }
    
    console.log(`✅ Grupos encontrados: Tradicional (ID: ${tradicionalGroup.id}), Premium (ID: ${premiumGroup.id})`);
    
    // 3. Deletar todos os itens existentes dos grupos de rodízio
    console.log('\n🗑️ Removendo produtos existentes dos rodízios...');
    
    // Buscar todas as categorias dos grupos de rodízio
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .in('group_id', [tradicionalGroup.id, premiumGroup.id]);
    
    if (existingCategories && existingCategories.length > 0) {
      const categoryIds = existingCategories.map(c => c.id);
      
      // Deletar itens das categorias
      const { error: deleteItemsError } = await supabase
        .from('items')
        .delete()
        .in('category_id', categoryIds);
      
      if (deleteItemsError) {
        console.error('Erro ao deletar itens:', deleteItemsError);
      }
      
      // Deletar as categorias
      const { error: deleteCategoriesError } = await supabase
        .from('categories')
        .delete()
        .in('group_id', [tradicionalGroup.id, premiumGroup.id]);
      
      if (deleteCategoriesError) {
        console.error('Erro ao deletar categorias:', deleteCategoriesError);
      }
    }
    
    console.log('✅ Produtos e categorias antigas removidas');
    
    // 4. Criar categorias e produtos
    console.log('\n📝 Criando categorias e produtos...');
    
    for (const parsedCategory of parsedCategories) {
      console.log(`\n📁 Processando categoria: ${parsedCategory.name}`);
      
      // Criar categoria para o Rodízio Tradicional
      const { data: tradCategory, error: tradCatError } = await supabase
        .from('categories')
        .insert({
          name: parsedCategory.name,
          group_id: tradicionalGroup.id,
          active: true,
          sort_order: parsedCategories.indexOf(parsedCategory) + 1
        })
        .select()
        .single();
      
      if (tradCatError) {
        console.error(`Erro ao criar categoria ${parsedCategory.name} no Tradicional:`, tradCatError);
        continue;
      }
      
      // Criar categoria para o Rodízio Premium (todas as categorias aparecem no Premium)
      const { data: premCategory, error: premCatError } = await supabase
        .from('categories')
        .insert({
          name: parsedCategory.name,
          group_id: premiumGroup.id,
          active: true,
          sort_order: parsedCategories.indexOf(parsedCategory) + 1
        })
        .select()
        .single();
      
      if (premCatError) {
        console.error(`Erro ao criar categoria ${parsedCategory.name} no Premium:`, premCatError);
        continue;
      }
      
      // Adicionar produtos
      let tradCount = 0;
      let premCount = 0;
      
      for (const item of parsedCategory.items) {
        // Produtos normais vão para o Tradicional
        if (!item.isPremium && tradCategory) {
          const { error } = await supabase
            .from('items')
            .insert({
              name: item.name,
              description: item.description,
              price: 0, // Preço 0 para itens do rodízio
              category_id: tradCategory.id,
              group_id: tradicionalGroup.id,
              active: true
            });
          
          if (error) {
            console.error(`Erro ao criar item ${item.name}:`, error);
          } else {
            tradCount++;
          }
        }
        
        // TODOS os produtos (normais + premium) vão para o Premium
        if (premCategory) {
          const { error } = await supabase
            .from('items')
            .insert({
              name: item.name,
              description: item.description,
              price: 0, // Preço 0 para itens do rodízio
              category_id: premCategory.id,
              group_id: premiumGroup.id,
              active: true
            });
          
          if (error) {
            console.error(`Erro ao criar item ${item.name} no Premium:`, error);
          } else {
            premCount++;
          }
        }
      }
      
      console.log(`  ✅ ${tradCount} produtos adicionados ao Tradicional`);
      console.log(`  ✅ ${premCount} produtos adicionados ao Premium`);
    }
    
    console.log('\n🎉 Migração concluída com sucesso!');
    
    // Mostrar estatísticas finais
    const { data: finalTradItems } = await supabase
      .from('items')
      .select('id')
      .eq('group_id', tradicionalGroup.id);
    
    const { data: finalPremItems } = await supabase
      .from('items')
      .select('id')
      .eq('group_id', premiumGroup.id);
    
    console.log('\n📊 Estatísticas finais:');
    console.log(`  - Rodízio Tradicional: ${finalTradItems?.length || 0} produtos`);
    console.log(`  - Rodízio Premium: ${finalPremItems?.length || 0} produtos`);
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar a migração
migrateRodizio()
  .then(() => {
    console.log('\n✅ Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });