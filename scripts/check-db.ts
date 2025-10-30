import { createClient } from '@supabase/supabase-js';
const env1 = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const env2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseUrl = env2.startsWith('https://') ? env2 : env1;
const supabaseKey = env2.startsWith('https://') ? env1 : env2;
const supabase = createClient(supabaseUrl, supabaseKey);
async function check() {
  const { data: cats } = await supabase.from('categories').select('id, name, group_id');
  const { data: grps } = await supabase.from('groups').select('id, name');
  const { data: items } = await supabase.from('items').select('id, name, category_id');
  console.log('=== GRUPOS ===');
  grps?.forEach(g => console.log(`- ${g.name} (${g.id})`));
  console.log('\n=== CATEGORIAS ===');
  cats?.forEach(c => console.log(`- ${c.name} - Group: ${c.group_id}`));
  console.log(`\n=== PRODUTOS ===`);
  console.log(`Total: ${items?.length || 0} produtos`);
}
check();
