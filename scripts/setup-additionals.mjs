import { createClient } from '@supabase/supabase-js';

// Credenciais corretas (estavam trocadas nos secrets)
const supabaseUrl = 'https://wlqvqrgjqowervexcosv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExMTk0NSwiZXhwIjoyMDc2Njg3OTQ1fQ.jZq2k5rfvXDjzNBqAjBrWuplcF009Nnvl34jVpl5OoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdditionals() {
  try {
    console.log('🗑️ Apagando todos os adicionais existentes...');
    
    // Apagar todos os adicionais
    const { error: deleteAddError } = await supabase
      .from('additionals')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos
    
    if (deleteAddError) {
      console.error('Erro ao deletar adicionais:', deleteAddError);
    }
    
    // Apagar todas as categorias
    const { error: deleteCatError } = await supabase
      .from('additional_categories')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos
    
    if (deleteCatError) {
      console.error('Erro ao deletar categorias:', deleteCatError);
    }
    
    console.log('✅ Tabelas limpas!');
    
    // Criar categoria Refrigerante
    console.log('📁 Criando categoria Refrigerante...');
    const { data: category, error: catError } = await supabase
      .from('additional_categories')
      .insert([
        { name: 'Refrigerante', color: '#2196F3', sort_order: 1 }
      ])
      .select()
      .single();
    
    if (catError) {
      console.error('Erro ao criar categoria:', catError);
      return;
    }
    
    console.log('✅ Categoria criada:', category.name);
    
    // Adicionar os 2 itens da foto
    console.log('➕ Adicionando Gelo e Limão...');
    const { data: additionals, error: addError } = await supabase
      .from('additionals')
      .insert([
        {
          name: 'Gelo',
          description: 'Para refrescar',
          price: 0.00,
          additional_category_id: category.id,
          active: true,
          sort_order: 1
        },
        {
          name: 'Limão',
          description: 'Frescaria pura',
          price: 0.00,
          additional_category_id: category.id,
          active: true,
          sort_order: 2
        }
      ])
      .select();
    
    if (addError) {
      console.error('Erro ao criar adicionais:', addError);
      return;
    }
    
    console.log('✅ Adicionais criados:', additionals.map(a => a.name).join(', '));
    
    // Verificar resultado
    const { data: finalCheck, error: checkError } = await supabase
      .from('additionals')
      .select(`
        *,
        additional_categories (
          name,
          color
        )
      `);
    
    if (checkError) {
      console.error('Erro ao verificar:', checkError);
      return;
    }
    
    console.log('\n📋 Resultado final:');
    console.log('Total de adicionais:', finalCheck.length);
    finalCheck.forEach(item => {
      console.log(`- ${item.name}: ${item.price === 0 ? 'Grátis' : 'R$ ' + item.price}`);
    });
    
    console.log('\n✨ Configuração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  process.exit(0);
}

setupAdditionals();