import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlqvqrgjqowervexcosv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTE5NDUsImV4cCI6MjA3NjY4Nzk0NX0.MAZpzWMLZ8_fw4eiHAp3S6D3d6v18rDewMyX4-QMCBc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🎉 TESTE FINAL - VERIFICANDO IDs INTEIROS NO SUPABASE\n');
console.log('=' + '='.repeat(55));

// Testar grupos
const { data: groups } = await supabase
  .from('groups')
  .select('id, name, type, price')
  .order('id');

console.log('\n📊 GRUPOS (IDs inteiros):');
groups?.forEach(g => {
  console.log(`   ID ${g.id} (tipo: ${typeof g.id}): ${g.name} - ${g.type}${g.price ? ` - R$ ${g.price}` : ''}`);
});

// Testar categorias
const { data: categories } = await supabase
  .from('categories')
  .select('id, name, group_id')
  .order('id')
  .limit(5);

console.log('\n📁 CATEGORIAS (IDs inteiros):');
categories?.forEach(c => {
  console.log(`   ID ${c.id} (tipo: ${typeof c.id}): ${c.name} (grupo ${c.group_id})`);
});

// Testar produtos
const { data: items } = await supabase
  .from('items')
  .select('id, name, price, category_id, group_id')
  .order('id')
  .limit(5);

console.log('\n🍱 PRODUTOS (IDs inteiros):');
items?.forEach(i => {
  console.log(`   ID ${i.id} (tipo: ${typeof i.id}): ${i.name} - R$ ${i.price} (cat ${i.category_id}, grupo ${i.group_id})`);
});

// Testar adicionais
const { data: additionals } = await supabase
  .from('additionals')
  .select('id, name, price')
  .order('id')
  .limit(5);

console.log('\n➕ ADICIONAIS (IDs inteiros):');
additionals?.forEach(a => {
  console.log(`   ID ${a.id} (tipo: ${typeof a.id}): ${a.name} - R$ ${a.price}`);
});

// Análise final
console.log('\n' + '=' + '='.repeat(55));
console.log('✅ RESULTADO FINAL:');

if (groups && groups.length > 0) {
  const firstId = groups[0].id;
  const isNumber = typeof firstId === 'number';
  const isSimpleInt = isNumber && firstId < 100; // IDs simples são menores que 100
  
  if (isSimpleInt) {
    console.log('   🎉 SUCESSO! O banco está usando IDs inteiros simples (1, 2, 3...)');
    console.log('   ✅ Migração concluída com sucesso!');
  } else {
    console.log('   ⚠️ Os IDs ainda não são inteiros simples');
  }
} else {
  console.log('   ❌ Sem dados no banco');
}

console.log('=' + '='.repeat(55));