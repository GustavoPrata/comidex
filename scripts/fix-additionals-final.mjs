import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
const supabaseUrl = 'https://wlqvqrgjqowervexcosv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExMTk0NSwiZXhwIjoyMDc2Njg3OTQ1fQ.jZq2k5rfvXDjzNBqAjBrWuplcF009Nnvl34jVpl5OoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAdditionals() {
  try {
    console.log('🔍 Verificando adicionais atuais...');
    
    // Verificar o que existe agora
    const { data: currentAdditionals, error: checkError } = await supabase
      .from('additionals')
      .select('*');
    
    if (checkError) {
      console.error('Erro ao verificar:', checkError);
      return;
    }
    
    console.log('Adicionais encontrados:');
    currentAdditionals.forEach(item => {
      console.log(`- ${item.name}`);
    });
    
    console.log('\n🗑️ Limpando TUDO novamente...');
    
    // Apagar TODOS os adicionais
    const { error: deleteAddError } = await supabase
      .from('additionals')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteAddError) {
      console.error('Erro ao deletar adicionais:', deleteAddError);
    }
    
    // Apagar TODAS as categorias
    const { error: deleteCatError } = await supabase
      .from('additional_categories')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteCatError) {
      console.error('Erro ao deletar categorias:', deleteCatError);
    }
    
    console.log('✅ Banco limpo completamente!');
    
    // Criar APENAS a categoria Refrigerante
    console.log('\n📁 Criando categoria Refrigerante...');
    const { data: category, error: catError } = await supabase
      .from('additional_categories')
      .insert([
        { 
          name: 'Refrigerante', 
          color: '#2196F3', 
          sort_order: 1 
        }
      ])
      .select()
      .single();
    
    if (catError) {
      console.error('Erro ao criar categoria:', catError);
      return;
    }
    
    // Adicionar APENAS Gelo e Limão (como na foto)
    console.log('➕ Adicionando APENAS Gelo e Limão...');
    const { data: newAdditionals, error: addError } = await supabase
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
    
    // Verificar resultado final
    const { data: finalCheck, count } = await supabase
      .from('additionals')
      .select('*', { count: 'exact' });
    
    console.log('\n✅ CONCLUÍDO!');
    console.log(`📋 Total de adicionais: ${count} (deve ser exatamente 2)`);
    console.log('Adicionais criados:');
    finalCheck.forEach(item => {
      console.log(`✓ ${item.name} - ${item.description} (${item.price === 0 ? 'Grátis' : 'R$ ' + item.price})`);
    });
    
    if (count !== 2) {
      console.log('⚠️ ATENÇÃO: Deveria ter exatamente 2 adicionais!');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  process.exit(0);
}

fixAdditionals();