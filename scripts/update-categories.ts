import { createClient } from '@supabase/supabase-js';

const env1 = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const env2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseUrl = env2.startsWith('https://') ? env2 : env1;
const supabaseKey = env2.startsWith('https://') ? env1 : env2;
const supabase = createClient(supabaseUrl, supabaseKey);

const categoryData: Record<string, { description: string; image: string }> = {
  'Entradas': {
    description: 'Comece sua experiência com nossas deliciosas entradas tradicionais japonesas',
    image: '/fotos/produtos/japanese_appetizers__d7763c52.jpg'
  },
  'Sashimis': {
    description: 'Peixes frescos cortados em fatias finas, servidos crus com elegância',
    image: '/fotos/produtos/fresh_sashimi_salmon_1dcdf0d8.jpg'
  },
  'Niguiris': {
    description: 'Bolinhos de arroz cobertos com peixe fresco ou frutos do mar',
    image: '/fotos/produtos/nigiri_sushi_variety_e71d90a4.jpg'
  },
  'Suco': {
    description: 'Sucos naturais frescos e saudáveis',
    image: '/fotos/produtos/edamame_soybeans_jap_7a726b98.jpg'
  },
  'Refrigerantes': {
    description: 'Refrigerantes gelados para acompanhar sua refeição',
    image: '/fotos/produtos/edamame_soybeans_jap_9d16802f.jpg'
  },
  'Cervejas': {
    description: 'Cervejas especiais geladas',
    image: '/fotos/produtos/gyoza_dumplings_japa_9610cc0c.jpg'
  }
};

async function updateCategories() {
  console.log('📝 Atualizando categorias com descrições e imagens...\n');

  const { data: categories } = await supabase.from('categories').select('*');
  
  if (!categories) {
    console.error('❌ Erro ao buscar categorias');
    return;
  }

  for (const cat of categories) {
    const data = categoryData[cat.name];
    if (data) {
      const { error } = await supabase
        .from('categories')
        .update({ description: data.description, image: data.image })
        .eq('id', cat.id);
      
      if (error) {
        console.error(`❌ Erro ao atualizar ${cat.name}:`, error);
      } else {
        console.log(`✅ ${cat.name} atualizada`);
      }
    }
  }

  console.log('\n✨ Categorias atualizadas!');
}

updateCategories();
