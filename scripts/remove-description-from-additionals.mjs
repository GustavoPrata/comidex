import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
const supabaseUrl = 'https://wlqvqrgjqowervexcosv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExMTk0NSwiZXhwIjoyMDc2Njg3OTQ1fQ.jZq2k5rfvXDjzNBqAjBrWuplcF009Nnvl34jVpl5OoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDescriptionColumn() {
  try {
    console.log('🔧 Removendo coluna description da tabela additionals...');
    
    // Primeiro, vamos limpar todos os valores de description
    const { error: updateError } = await supabase
      .from('additionals')
      .update({ description: null })
      .gte('id', 0);
    
    if (updateError) {
      console.error('Erro ao limpar descrições:', updateError);
    } else {
      console.log('✅ Descrições removidas com sucesso!');
    }
    
    // Verificar adicionais atuais
    const { data: additionals } = await supabase
      .from('additionals')
      .select('id, name, price, additional_category_id, active, sort_order');
    
    console.log('\n📋 Adicionais atuais:');
    additionals?.forEach(add => {
      console.log(`- ${add.name} (R$ ${add.price || 0})`);
    });
    
    console.log('\n✨ Campo description removido do código.');
    console.log('ℹ️  Para remover completamente da estrutura do banco, você precisará alterar o schema no Supabase Dashboard.');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
  
  process.exit(0);
}

removeDescriptionColumn();