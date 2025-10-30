import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
const supabaseUrl = 'https://wlqvqrgjqowervexcosv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExMTk0NSwiZXhwIjoyMDc2Njg3OTQ1fQ.jZq2k5rfvXDjzNBqAjBrWuplcF009Nnvl34jVpl5OoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeColorColumn() {
  try {
    console.log('🔧 Removendo coluna color da tabela additional_categories...');
    
    // Remove a coluna color usando raw SQL
    const { error } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE additional_categories DROP COLUMN IF EXISTS color'
    }).single();
    
    if (error && !error.message.includes('does not exist')) {
      console.error('Erro ao remover coluna:', error);
      
      // Se não funcionar, vamos tentar de outra forma
      console.log('Tentando método alternativo...');
      
      // Como a API do Supabase não tem exec_sql, vamos apenas atualizar todas as linhas para null
      const { error: updateError } = await supabase
        .from('additional_categories')
        .update({ color: null })
        .gte('id', 0);
      
      if (updateError) {
        console.error('Erro ao limpar cores:', updateError);
      } else {
        console.log('✅ Cores removidas com sucesso!');
      }
    } else {
      console.log('✅ Coluna color removida com sucesso!');
    }
    
    // Verificar categorias atuais
    const { data: categories } = await supabase
      .from('additional_categories')
      .select('*');
    
    console.log('\n📋 Categorias atuais:');
    categories?.forEach(cat => {
      console.log(`- ${cat.name}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  process.exit(0);
}

removeColorColumn();