import { createClient } from '@supabase/supabase-js';

const env1 = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const env2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseUrl = env2.startsWith('https://') ? env2 : env1;
const supabaseKey = env2.startsWith('https://') ? env1 : env2;
const supabase = createClient(supabaseUrl, supabaseKey);

async function populate() {
  console.log('🚀 Criando 2 produtos para cada categoria...\n');

  const { data: categories } = await supabase.from('categories').select('*');
  const { data: groups } = await supabase.from('groups').select('*');
  
  if (!categories || !groups) {
    console.error('❌ Erro ao buscar dados');
    return;
  }

  console.log(`✅ ${categories.length} categorias encontradas\n`);

  // Deletar todos os produtos
  console.log('🗑️  Deletando produtos...');
  await supabase.from('items').delete().not('id', 'is', null);

  const products: any[] = [];

  // Para cada categoria, criar 2 produtos
  categories.forEach((cat, idx) => {
    const categoryName = cat.name;
    const groupData = groups.find(g => g.id === cat.group_id);
    const groupName = groupData?.name || '';

    let product1, product2;

    if (categoryName === 'Entradas') {
      product1 = {
        name: 'Gyoza',
        description: 'Deliciosos pastéis japoneses recheados com carne de porco e vegetais, fritos até ficarem crocantes',
        price: 18.90,
        quantity: 'Porção',
        image: '/fotos/produtos/gyoza_dumplings_japa_c63a2d4f.jpg',
        sort_order: 0
      };
      product2 = {
        name: 'Edamame',
        description: 'Vagens de soja cozidas no vapor e temperadas com sal marinho',
        price: 14.90,
        quantity: 'Porção',
        image: '/fotos/produtos/edamame_soybeans_jap_7a726b98.jpg',
        sort_order: 1
      };
    } else if (categoryName === 'Sashimis') {
      product1 = {
        name: 'Sashimi de Salmão',
        description: 'Fatias frescas de salmão rosado servido com wasabi e molho shoyu',
        price: 38.90,
        quantity: '8 peças',
        image: '/fotos/produtos/salmon_tuna_sashimi__5aa02e87.jpg',
        sort_order: 0
      };
      product2 = {
        name: 'Sashimi de Atum',
        description: 'Atum vermelho fresco cortado em fatias perfeitas',
        price: 42.90,
        quantity: '8 peças',
        image: '/fotos/produtos/tuna_sashimi_fresh_r_62faebde.jpg',
        sort_order: 1
      };
    } else if (categoryName === 'Niguiris') {
      product1 = {
        name: 'Niguiri de Salmão',
        description: 'Bolinho de arroz coberto com salmão fresco',
        price: 9.90,
        quantity: '2 peças',
        image: '/fotos/produtos/nigiri_sushi_salmon__a814f2cb.jpg',
        sort_order: 0
      };
      product2 = {
        name: 'Niguiri de Camarão',
        description: 'Bolinho de arroz tradicional com camarão cozido',
        price: 10.90,
        quantity: '2 peças',
        image: '/fotos/produtos/shrimp_ebi_nigiri_su_12073d5b.jpg',
        sort_order: 1
      };
    } else if (categoryName === 'Suco') {
      product1 = {
        name: 'Suco de Laranja',
        description: 'Suco natural de laranja espremido na hora',
        price: 8.90,
        quantity: '300ml',
        image: '/fotos/produtos/edamame_soybeans_jap_7a726b98.jpg',
        sort_order: 0
      };
      product2 = {
        name: 'Suco de Limão',
        description: 'Suco natural de limão refrescante',
        price: 8.90,
        quantity: '300ml',
        image: '/fotos/produtos/edamame_soybeans_jap_9d16802f.jpg',
        sort_order: 1
      };
    } else if (categoryName === 'Refrigerantes') {
      product1 = {
        name: 'Coca-Cola',
        description: 'Refrigerante Coca-Cola gelado',
        price: 6.90,
        quantity: '350ml',
        image: '/fotos/produtos/edamame_soybeans_jap_7a726b98.jpg',
        sort_order: 0
      };
      product2 = {
        name: 'Guaraná',
        description: 'Refrigerante Guaraná Antarctica gelado',
        price: 6.90,
        quantity: '350ml',
        image: '/fotos/produtos/edamame_soybeans_jap_9d16802f.jpg',
        sort_order: 1
      };
    } else if (categoryName === 'Cervejas') {
      product1 = {
        name: 'Heineken',
        description: 'Cerveja Heineken Long Neck gelada',
        price: 12.90,
        quantity: '330ml',
        image: '/fotos/produtos/edamame_soybeans_jap_7a726b98.jpg',
        sort_order: 0
      };
      product2 = {
        name: 'Skol',
        description: 'Cerveja Skol gelada',
        price: 9.90,
        quantity: '350ml',
        image: '/fotos/produtos/edamame_soybeans_jap_9d16802f.jpg',
        sort_order: 1
      };
    } else {
      // Categoria desconhecida, usar genéricos
      product1 = {
        name: `Produto ${categoryName} 1`,
        description: `Produto especial da categoria ${categoryName}`,
        price: 25.90,
        quantity: 'Porção',
        image: '/fotos/produtos/gyoza_dumplings_japa_c63a2d4f.jpg',
        sort_order: 0
      };
      product2 = {
        name: `Produto ${categoryName} 2`,
        description: `Outro produto especial da categoria ${categoryName}`,
        price: 29.90,
        quantity: 'Porção',
        image: '/fotos/produtos/edamame_soybeans_jap_7a726b98.jpg',
        sort_order: 1
      };
    }

    // Adicionar campos comuns
    product1.category_id = cat.id;
    product1.group_id = cat.group_id;
    product1.active = true;
    product1.available = true;

    product2.category_id = cat.id;
    product2.group_id = cat.group_id;
    product2.active = true;
    product2.available = true;

    products.push(product1, product2);
    console.log(`✅ ${categoryName} (${groupName}): ${product1.name}, ${product2.name}`);
  });

  // Inserir todos
  console.log(`\n📦 Inserindo ${products.length} produtos...`);
  const { data, error } = await supabase.from('items').insert(products).select();
  
  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log(`✅ ${data.length} produtos criados com sucesso!`);
  }
}

populate();
