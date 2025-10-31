import { createClient } from '@supabase/supabase-js';

// Testar conexão com as credenciais fornecidas
const SUPABASE_URL = 'https://wlqvqrgjqowervexcosv.supabase.co';

// Tentar com diferentes chaves
const keys = [
  {
    name: 'ANON_KEY atual',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTE5NDUsImV4cCI6MjA3NjY4Nzk0NX0.MAZpzWMLZ8_fw4eiHAp3S6D3d6v18rDewMyX4-QMCBc'
  },
  {
    name: 'SERVICE_ROLE',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTExMTk0NSwiZXhwIjoyMDc2Njg3OTQ1fQ.jZq2k5rfvXDjzNBqAjBrWuplcF009Nnvl34jVpl5OoE'
  }
];

console.log('🔍 Testando conexão com Supabase...\n');

for (const keyConfig of keys) {
  console.log(`\n📊 Testando com ${keyConfig.name}:`);
  console.log('=' + '='.repeat(50));
  
  try {
    const supabase = createClient(SUPABASE_URL, keyConfig.key);
    
    // Verificar estrutura das tabelas
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type')
      .eq('table_schema', 'public')
      .eq('column_name', 'id')
      .in('table_name', ['groups', 'categories', 'items', 'additionals'])
      .order('table_name');
    
    if (tableError) {
      // Tentar consulta direta
      const { data: groups, error: groupError } = await supabase
        .from('groups')
        .select('id, name')
        .limit(3);
        
      if (groupError) {
        console.log('❌ Erro ao conectar:', groupError.message);
      } else {
        console.log('✅ CONEXÃO FUNCIONANDO!');
        console.log('\n📋 Grupos encontrados:');
        groups?.forEach(g => {
          console.log(`   ID: ${g.id} (tipo: ${typeof g.id}) - ${g.name}`);
        });
        
        // Verificar produtos
        const { data: items, error: itemsError } = await supabase
          .from('items')
          .select('id, name')
          .limit(3);
          
        if (!itemsError) {
          console.log('\n📦 Produtos encontrados:');
          items?.forEach(i => {
            console.log(`   ID: ${i.id} (tipo: ${typeof i.id}) - ${i.name}`);
          });
        }
        
        // Verificar adicionais
        const { data: additionals, error: addError } = await supabase
          .from('additionals')
          .select('id, name')
          .limit(3);
          
        if (!addError) {
          console.log('\n➕ Adicionais encontrados:');
          additionals?.forEach(a => {
            console.log(`   ID: ${a.id} (tipo: ${typeof a.id}) - ${a.name}`);
          });
        }
        
        // Verificar se IDs são UUIDs ou integers
        if (groups && groups.length > 0) {
          const firstId = groups[0].id;
          const isUUID = typeof firstId === 'string' && firstId.length === 36 && firstId.includes('-');
          const isInteger = typeof firstId === 'number' || (typeof firstId === 'string' && !isNaN(parseInt(firstId)));
          
          console.log('\n🔍 ANÁLISE DOS IDs:');
          console.log(`   Tipo de dado: ${typeof firstId}`);
          console.log(`   Valor exemplo: ${firstId}`);
          console.log(`   É UUID? ${isUUID ? '✅ SIM' : '❌ NÃO'}`);
          console.log(`   É Integer? ${isInteger ? '✅ SIM' : '❌ NÃO'}`);
        }
      }
    } else {
      console.log('✅ Schema info:', tables);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

console.log('\n' + '='.repeat(52));
console.log('📊 TESTE CONCLUÍDO');
console.log('='.repeat(52));