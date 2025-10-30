import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Detectar configuração do Supabase
const getSupabaseConfig = () => {
  const env1 = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const env2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  let supabaseUrl = null;
  let supabaseKey = null;
  
  if (env1.startsWith('https://') && env1.includes('.supabase.')) {
    supabaseUrl = env1;
    supabaseKey = env2;
  } else if (env2.startsWith('https://') && env2.includes('.supabase.')) {
    supabaseUrl = env2;
    supabaseKey = env1;
  }
  
  return { url: supabaseUrl, anonKey: supabaseKey };
};

const config = getSupabaseConfig();

if (!config.url || !config.anonKey) {
  console.error('❌ Erro: Configuração do Supabase não encontrada');
  process.exit(1);
}

const supabase = createClient(config.url, config.anonKey);

async function createTables() {
  console.log('🚀 Criando tabelas de adicionais...');
  
  try {
    // Criar tabela de categorias de adicionais
    const { error: catError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS additional_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          color VARCHAR(7) DEFAULT '#FF6B00',
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    }).single();
    
    if (catError && !catError.message.includes('already exists')) {
      console.log('⚠️  Tabela additional_categories pode já existir ou erro:', catError.message);
    } else {
      console.log('✅ Tabela additional_categories criada/verificada');
    }
    
    // Criar tabela de adicionais
    const { error: addError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS additionals (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL DEFAULT 0,
          additional_category_id UUID REFERENCES additional_categories(id) ON DELETE SET NULL,
          active BOOLEAN DEFAULT true,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `
    }).single();
    
    if (addError && !addError.message.includes('already exists')) {
      console.log('⚠️  Tabela additionals pode já existir ou erro:', addError.message);
    } else {
      console.log('✅ Tabela additionals criada/verificada');
    }
    
    // Inserir categorias de exemplo
    const categoriesData = [
      { name: 'Extras', color: '#FF6B00', sort_order: 1 },
      { name: 'Substituições', color: '#4CAF50', sort_order: 2 },
      { name: 'Acompanhamentos', color: '#2196F3', sort_order: 3 },
      { name: 'Molhos', color: '#9C27B0', sort_order: 4 }
    ];
    
    const { data: categories, error: insertCatError } = await supabase
      .from('additional_categories')
      .upsert(categoriesData, { onConflict: 'name' })
      .select();
    
    if (insertCatError) {
      console.log('⚠️  Erro ao inserir categorias:', insertCatError.message);
    } else {
      console.log('✅ Categorias de adicionais inseridas');
    }
    
    // Inserir adicionais de exemplo
    if (categories && categories.length > 0) {
      const extrasId = categories.find(c => c.name === 'Extras')?.id;
      const substituicoesId = categories.find(c => c.name === 'Substituições')?.id;
      const acompanhamentosId = categories.find(c => c.name === 'Acompanhamentos')?.id;
      const molhosId = categories.find(c => c.name === 'Molhos')?.id;
      
      const additionalsData = [
        // Extras
        { name: 'Cream Cheese Extra', description: 'Porção adicional de cream cheese', price: 5.00, additional_category_id: extrasId, active: true, sort_order: 1 },
        { name: 'Salmão Extra', description: 'Porção adicional de salmão', price: 12.00, additional_category_id: extrasId, active: true, sort_order: 2 },
        { name: 'Shimeji Extra', description: 'Porção adicional de shimeji', price: 8.00, additional_category_id: extrasId, active: true, sort_order: 3 },
        
        // Substituições
        { name: 'Trocar por Salmão', description: 'Substituir proteína por salmão', price: 8.00, additional_category_id: substituicoesId, active: true, sort_order: 1 },
        { name: 'Trocar por Atum', description: 'Substituir proteína por atum', price: 6.00, additional_category_id: substituicoesId, active: true, sort_order: 2 },
        { name: 'Sem Cream Cheese', description: 'Remover cream cheese do prato', price: 0.00, additional_category_id: substituicoesId, active: true, sort_order: 3 },
        
        // Acompanhamentos
        { name: 'Gohan (Arroz Japonês)', description: 'Porção de arroz japonês', price: 8.00, additional_category_id: acompanhamentosId, active: true, sort_order: 1 },
        { name: 'Sunomono', description: 'Salada de pepino agridoce', price: 12.00, additional_category_id: acompanhamentosId, active: true, sort_order: 2 },
        { name: 'Missoshiru', description: 'Sopa de missô', price: 10.00, additional_category_id: acompanhamentosId, active: true, sort_order: 3 },
        
        // Molhos
        { name: 'Molho Tarê', description: 'Molho doce tradicional', price: 2.00, additional_category_id: molhosId, active: true, sort_order: 1 },
        { name: 'Molho Shoyu', description: 'Molho de soja', price: 0.00, additional_category_id: molhosId, active: true, sort_order: 2 },
        { name: 'Molho Spicy Mayo', description: 'Maionese picante', price: 3.00, additional_category_id: molhosId, active: true, sort_order: 3 }
      ].filter(item => item.additional_category_id); // Remove items sem categoria
      
      const { error: insertAddError } = await supabase
        .from('additionals')
        .upsert(additionalsData, { onConflict: 'name' });
      
      if (insertAddError) {
        console.log('⚠️  Erro ao inserir adicionais:', insertAddError.message);
      } else {
        console.log('✅ Adicionais inseridos com sucesso');
      }
    }
    
    console.log('🎉 Processo concluído!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    process.exit(1);
  }
}

createTables();