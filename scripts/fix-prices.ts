import { createClient } from '@supabase/supabase-js';

const env1 = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const env2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseUrl = env2.startsWith('https://') ? env2 : env1;
const supabaseKey = env2.startsWith('https://') ? env1 : env2;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixPrices() {
  console.log('💰 Ajustando preços...\n');

  const { data: groups } = await supabase.from('groups').select('*');
  
  if (!groups) {
    console.error('❌ Erro ao buscar grupos');
    return;
  }

  const rodizioIds = groups
    .filter(g => g.name.includes('Rodízio'))
    .map(g => g.id);
  
  console.log('🗑️  Removendo preços dos rodízios...');
  const { error: updateError } = await supabase
    .from('items')
    .update({ price: null })
    .in('group_id', rodizioIds);

  if (updateError) {
    console.error('❌ Erro ao atualizar:', updateError);
  } else {
    console.log('✅ Preços dos rodízios removidos!');
  }

  const { data: items } = await supabase
    .from('items')
    .select('name, price, group_id')
    .order('group_id');

  console.log('\n📋 Produtos atualizados:');
  for (const item of items || []) {
    const group = groups.find(g => g.id === item.group_id);
    const priceStr = item.price ? `R$ ${item.price.toFixed(2)}` : 'SEM PREÇO';
    console.log(`  ${item.name} (${group?.name}): ${priceStr}`);
  }
}

fixPrices();
