import { createClient } from '@supabase/supabase-js';

// Detectar configuração do Supabase
const env1 = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const env2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabaseUrl: string = '';
let supabaseKey: string = '';

// Auto-detectar qual é URL e qual é Key
if (env1.startsWith('https://') && env1.includes('.supabase.')) {
  supabaseUrl = env1;
  supabaseKey = env2;
} else if (env2.startsWith('https://') && env2.includes('.supabase.')) {
  supabaseUrl = env2;
  supabaseKey = env1;
} else if (env1.startsWith('eyJ')) {
  supabaseKey = env1;
  supabaseUrl = env2;
} else if (env2.startsWith('eyJ')) {
  supabaseKey = env2;
  supabaseUrl = env1;
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis Supabase não configuradas!');
  console.log('ENV1:', env1.substring(0, 30));
  console.log('ENV2:', env2.substring(0, 30));
  process.exit(1);
}

console.log('✅ Conectando ao Supabase...');
console.log('URL:', supabaseUrl.substring(0, 40) + '...');
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

const categoriesData: Record<string, { description: string; image: string }> = {
  'Entradas': { description: 'Comece sua experiência com nossas deliciosas entradas tradicionais japonesas', image: 'https://images.pexels.com/photos/8753496/pexels-photo-8753496.jpeg' },
  'Sashimis': { description: 'Peixes frescos cortados em fatias finas, servidos crus com elegância', image: 'https://images.pexels.com/photos/13831896/pexels-photo-13831896.jpeg' },
  'Niguiris': { description: 'Bolinhos de arroz cobertos com peixe fresco ou frutos do mar', image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg' },
  'Uramakis': { description: 'Rolinhos de arroz virado com recheios variados e coloridos', image: 'https://images.pexels.com/photos/6897370/pexels-photo-6897370.jpeg' },
  'Hossomakis': { description: 'Rolinhos finos tradicionais com alga nori por fora', image: 'https://images.pexels.com/photos/6869558/pexels-photo-6869558.jpeg' },
  'Hot Rolls': { description: 'Rolinhos empanados e fritos, crocantes por fora e macios por dentro', image: 'https://images.pexels.com/photos/6133302/pexels-photo-6133302.jpeg' },
  'Temakis': { description: 'Cones de alga nori recheados na hora, frescos e crocantes', image: 'https://images.pexels.com/photos/4057755/pexels-photo-4057755.jpeg' },
  'Carpaccios': { description: 'Peixes nobres finamente fatiados com molhos especiais', image: 'https://images.pexels.com/photos/14737/pexels-photo.jpg' },
  'Sobremesas': { description: 'Doces tradicionais japoneses para finalizar sua refeição', image: 'https://images.pexels.com/photos/3914752/pexels-photo-3914752.jpeg' },
  'Entradas Premium': { description: 'Entradas gourmet com ingredientes premium e apresentação sofisticada', image: 'https://images.pexels.com/photos/17171141/pexels-photo-17171141.jpeg' },
  'Sashimis Especiais': { description: 'Sashimis especiais com cortes premium e peixes nobres importados', image: 'https://images.pexels.com/photos/6649237/pexels-photo-6649237.jpeg' },
  'Niguiris Especiais': { description: 'Niguiris especiais com ingredientes premium e finalização gourmet', image: 'https://images.pexels.com/photos/7363668/pexels-photo-7363668.jpeg' },
  'Combinados': { description: 'Bandejas especiais com variedade de sushis e sashimis premium', image: 'https://images.pexels.com/photos/10107102/pexels-photo-10107102.jpeg' },
  'Pratos Quentes': { description: 'Pratos quentes tradicionais japoneses preparados com excelência', image: 'https://images.pexels.com/photos/6275159/pexels-photo-6275159.jpeg' },
  'Sobremesas Premium': { description: 'Sobremesas sofisticadas com apresentação premium', image: 'https://images.pexels.com/photos/7011019/pexels-photo-7011019.jpeg' },
};

async function populateData() {
  console.log('🚀 Iniciando população de dados no Supabase...\n');

  // Buscar categorias e grupos existentes
  console.log('📋 Buscando categorias e grupos...');
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: groups } = await supabase.from('groups').select('*');
  
  if (!categories || !groups) {
    console.error('❌ Erro ao buscar dados');
    return;
  }
  
  console.log(`✅ ${categories.length} categorias e ${groups.length} grupos encontrados\n`);

  // Atualizar categorias
  console.log('📝 Atualizando categorias...');
  for (const cat of categories) {
    const data = categoriesData[cat.name];
    if (data) {
      const { error } = await supabase
        .from('categories')
        .update({ description: data.description, image: data.image })
        .eq('id', cat.id);
      
      if (!error) {
        console.log(`✅ ${cat.name} atualizada`);
      }
    }
  }

  // Deletar produtos existentes
  console.log('\n🗑️  Deletando produtos existentes...');
  await supabase.from('items').delete().not('id', 'is', null);
  console.log('✅ Produtos deletados');

  // Mapear categorias por nome para pegar IDs
  const catMap: Record<string, any> = {};
  categories.forEach(cat => { catMap[cat.name] = cat; });

  const grpMap: Record<string, any> = {};
  groups.forEach(grp => { grpMap[grp.name] = grp; });

  // Produtos para inserir
  const products: any[] = [];

  // Categoria: Entradas
  if (catMap['Entradas']) {
    products.push(
      { name: 'Gyoza', description: 'Deliciosos pastéis japoneses recheados com carne de porco e vegetais, fritos até ficarem crocantes', price: 18.90, category_id: catMap['Entradas'].id, group_id: catMap['Entradas'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/6249520/pexels-photo-6249520.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Edamame', description: 'Vagens de soja cozidas no vapor e temperadas com sal marinho', price: 14.90, category_id: catMap['Entradas'].id, group_id: catMap['Entradas'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/7363473/pexels-photo-7363473.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Sashimis
  if (catMap['Sashimis']) {
    products.push(
      { name: 'Sashimi de Salmão', description: 'Fatias frescas de salmão rosado servido com wasabi e molho shoyu', price: 38.90, category_id: catMap['Sashimis'].id, group_id: catMap['Sashimis'].group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/8844878/pexels-photo-8844878.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Sashimi de Atum', description: 'Atum vermelho fresco cortado em fatias perfeitas', price: 42.90, category_id: catMap['Sashimis'].id, group_id: catMap['Sashimis'].group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/13831896/pexels-photo-13831896.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Niguiris
  if (catMap['Niguiris']) {
    products.push(
      { name: 'Niguiri de Salmão', description: 'Bolinho de arroz coberto com salmão fresco', price: 9.90, category_id: catMap['Niguiris'].id, group_id: catMap['Niguiris'].group_id, quantity: '2 peças', image: 'https://images.pexels.com/photos/7363665/pexels-photo-7363665.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Niguiri de Camarão', description: 'Bolinho de arroz tradicional com camarão cozido', price: 10.90, category_id: catMap['Niguiris'].id, group_id: catMap['Niguiris'].group_id, quantity: '2 peças', image: 'https://images.pexels.com/photos/6249527/pexels-photo-6249527.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Uramakis
  if (catMap['Uramakis']) {
    products.push(
      { name: 'California Roll', description: 'Rolinho clássico com kani, abacate e pepino coberto com gergelim', price: 32.90, category_id: catMap['Uramakis'].id, group_id: catMap['Uramakis'].group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/6897370/pexels-photo-6897370.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Rainbow Roll', description: 'Uramaki especial coberto com fatias de salmão, atum e peixe branco', price: 45.90, category_id: catMap['Uramakis'].id, group_id: catMap['Uramakis'].group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/5409020/pexels-photo-5409020.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Hossomakis
  if (catMap['Hossomakis']) {
    products.push(
      { name: 'Kappa Maki', description: 'Rolinho tradicional de pepino refrescante', price: 18.90, category_id: catMap['Hossomakis'].id, group_id: catMap['Hossomakis'].group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/6869558/pexels-photo-6869558.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Tekka Maki', description: 'Rolinho fino recheado com atum fresco', price: 24.90, category_id: catMap['Hossomakis'].id, group_id: catMap['Hossomakis'].group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/8844891/pexels-photo-8844891.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Hot Rolls
  if (catMap['Hot Rolls']) {
    products.push(
      { name: 'Hot Roll Salmão', description: 'Rolinho de salmão empanado e frito, coberto com cream cheese', price: 36.90, category_id: catMap['Hot Rolls'].id, group_id: catMap['Hot Rolls'].group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/6133302/pexels-photo-6133302.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Hot Roll Especial', description: 'Rolinho crocante recheado com camarão, cream cheese e cebolinha', price: 38.90, category_id: catMap['Hot Rolls'].id, group_id: catMap['Hot Rolls'].group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/7363425/pexels-photo-7363425.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Temakis
  if (catMap['Temakis']) {
    products.push(
      { name: 'Temaki de Salmão', description: 'Cone crocante recheado com salmão, arroz e vegetais frescos', price: 22.90, category_id: catMap['Temakis'].id, group_id: catMap['Temakis'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/4057755/pexels-photo-4057755.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Temaki Spicy Tuna', description: 'Cone com atum picante, maionese especial e cebolinha', price: 24.90, category_id: catMap['Temakis'].id, group_id: catMap['Temakis'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/6897371/pexels-photo-6897371.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Carpaccios
  if (catMap['Carpaccios']) {
    products.push(
      { name: 'Carpaccio de Salmão', description: 'Finas fatias de salmão com molho especial de alcaparras e limão', price: 45.90, category_id: catMap['Carpaccios'].id, group_id: catMap['Carpaccios'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/14737/pexels-photo.jpg', active: true, available: true, sort_order: 0 },
      { name: 'Carpaccio de Atum', description: 'Atum nobre finamente fatiado com molho ponzu e cebolinha', price: 48.90, category_id: catMap['Carpaccios'].id, group_id: catMap['Carpaccios'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/6607388/pexels-photo-6607388.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Sobremesas
  if (catMap['Sobremesas']) {
    const catSob = categories.find(c => c.name === 'Sobremesas' && c.group_id === grpMap['Tradicional']?.id);
    if (catSob) {
      products.push(
        { name: 'Mochi Ice Cream', description: 'Sorvete envolto em massa de arroz macia, sabores variados', price: 16.90, category_id: catSob.id, group_id: catSob.group_id, quantity: '3 peças', image: 'https://images.pexels.com/photos/3914752/pexels-photo-3914752.jpeg', active: true, available: true, sort_order: 0 },
        { name: 'Cheesecake de Matcha', description: 'Delicioso cheesecake de chá verde japonês com base crocante', price: 18.90, category_id: catSob.id, group_id: catSob.group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/6880219/pexels-photo-6880219.jpeg', active: true, available: true, sort_order: 1 }
      );
    }
  }

  // Categoria: Entradas Premium
  if (catMap['Entradas Premium']) {
    products.push(
      { name: 'Tempura Premium', description: 'Camarões jumbo e vegetais nobres empanados em massa especial leve e crocante', price: 52.90, category_id: catMap['Entradas Premium'].id, group_id: catMap['Entradas Premium'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/8753496/pexels-photo-8753496.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Tartar de Atum Premium', description: 'Atum nobre picado com molho especial, abacate e caviar', price: 58.90, category_id: catMap['Entradas Premium'].id, group_id: catMap['Entradas Premium'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/17171141/pexels-photo-17171141.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Sashimis Especiais
  if (catMap['Sashimis Especiais']) {
    products.push(
      { name: 'Sashimi de Toro', description: 'Barriga de atum gordo, a parte mais nobre do peixe, extremamente macia', price: 78.90, category_id: catMap['Sashimis Especiais'].id, group_id: catMap['Sashimis Especiais'].group_id, quantity: '6 peças', image: 'https://images.pexels.com/photos/6649237/pexels-photo-6649237.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Sashimi de Hamachi', description: 'Yellowtail premium importado com textura amanteigada e sabor delicado', price: 68.90, category_id: catMap['Sashimis Especiais'].id, group_id: catMap['Sashimis Especiais'].group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/8844878/pexels-photo-8844878.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Niguiris Especiais
  if (catMap['Niguiris Especiais']) {
    products.push(
      { name: 'Niguiri de Wagyu', description: 'Arroz coberto com finas fatias de wagyu A5 levemente maçaricado', price: 24.90, category_id: catMap['Niguiris Especiais'].id, group_id: catMap['Niguiris Especiais'].group_id, quantity: '2 peças', image: 'https://images.pexels.com/photos/7363668/pexels-photo-7363668.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Niguiri com Trufa', description: 'Niguiri de salmão premium com lâminas de trufa negra e azeite trufado', price: 22.90, category_id: catMap['Niguiris Especiais'].id, group_id: catMap['Niguiris Especiais'].group_id, quantity: '2 peças', image: 'https://images.pexels.com/photos/7363665/pexels-photo-7363665.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Combinados
  if (catMap['Combinados']) {
    products.push(
      { name: 'Combinado Premium', description: 'Seleção especial com 24 peças: sashimis, niguiris e uramakis premium', price: 145.90, category_id: catMap['Combinados'].id, group_id: catMap['Combinados'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/10107102/pexels-photo-10107102.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Barco Especial', description: 'Grande variedade de 40 peças com os melhores sushis e sashimis da casa', price: 198.90, category_id: catMap['Combinados'].id, group_id: catMap['Combinados'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/6897370/pexels-photo-6897370.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Pratos Quentes
  if (catMap['Pratos Quentes']) {
    products.push(
      { name: 'Yakisoba Premium', description: 'Macarrão salteado com frutos do mar nobres e vegetais frescos', price: 56.90, category_id: catMap['Pratos Quentes'].id, group_id: catMap['Pratos Quentes'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/6275159/pexels-photo-6275159.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Salmão Teriyaki', description: 'Filé de salmão grelhado com molho teriyaki caseiro e gergelim torrado', price: 62.90, category_id: catMap['Pratos Quentes'].id, group_id: catMap['Pratos Quentes'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/5409020/pexels-photo-5409020.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Categoria: Sobremesas Premium
  if (catMap['Sobremesas Premium']) {
    products.push(
      { name: 'Mousse de Chocolate Belga', description: 'Mousse aerado de chocolate premium com raspas de ouro comestível', price: 28.90, category_id: catMap['Sobremesas Premium'].id, group_id: catMap['Sobremesas Premium'].group_id, quantity: 'Porção', image: 'https://images.pexels.com/photos/7011019/pexels-photo-7011019.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Mochi Premium', description: 'Mochis artesanais recheados com sorvete de frutas exóticas', price: 24.90, category_id: catMap['Sobremesas Premium'].id, group_id: catMap['Sobremesas Premium'].group_id, quantity: '4 peças', image: 'https://images.pexels.com/photos/3914752/pexels-photo-3914752.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Inserir produtos restantes (categorias duplicadas do grupo Premium)
  const premiumSashimis = categories.filter(c => c.name === 'Sashimis' && c.group_id === grpMap['Premium']?.id);
  if (premiumSashimis.length > 0) {
    const cat = premiumSashimis[0];
    products.push(
      { name: 'Sashimi Misto Premium', description: 'Combinação de 5 tipos de peixes nobres frescos do dia', price: 72.90, category_id: cat.id, group_id: cat.group_id, quantity: '12 peças', image: 'https://images.pexels.com/photos/8844878/pexels-photo-8844878.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Sashimi de Salmão Selecionado', description: 'Cortes especiais de salmão norueguês premium', price: 58.90, category_id: cat.id, group_id: cat.group_id, quantity: '10 peças', image: 'https://images.pexels.com/photos/13831896/pexels-photo-13831896.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  const premiumNiguiris = categories.filter(c => c.name === 'Niguiris' && c.group_id === grpMap['Premium']?.id);
  if (premiumNiguiris.length > 0) {
    const cat = premiumNiguiris[0];
    products.push(
      { name: 'Niguiri de Vieira', description: 'Vieira fresca levemente selada com maçarico e finalizada com ponzu', price: 18.90, category_id: cat.id, group_id: cat.group_id, quantity: '2 peças', image: 'https://images.pexels.com/photos/7363665/pexels-photo-7363665.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Niguiri de Polvo', description: 'Polvo macio cozido na perfeição sobre arroz temperado', price: 16.90, category_id: cat.id, group_id: cat.group_id, quantity: '2 peças', image: 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  const premiumUramakis = categories.filter(c => c.name === 'Uramakis' && c.group_id === grpMap['Premium']?.id);
  if (premiumUramakis.length > 0) {
    const cat = premiumUramakis[0];
    products.push(
      { name: 'Dragon Roll Premium', description: 'Uramaki com camarão tempura coberto com abacate fatiado e molho especial', price: 54.90, category_id: cat.id, group_id: cat.group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/6897370/pexels-photo-6897370.jpeg', active: true, available: true, sort_order: 0 },
      { name: 'Philadelphia Premium', description: 'Uramaki com salmão defumado, cream cheese Philadelphia e pepino', price: 48.90, category_id: cat.id, group_id: cat.group_id, quantity: '8 peças', image: 'https://images.pexels.com/photos/5409020/pexels-photo-5409020.jpeg', active: true, available: true, sort_order: 1 }
    );
  }

  // Inserir todos os produtos
  console.log('\n📦 Inserindo produtos...');
  const { data: insertedProducts, error: insertError } = await supabase
    .from('items')
    .insert(products)
    .select();

  if (insertError) {
    console.error('❌ Erro ao inserir produtos:', insertError);
  } else {
    console.log(`✅ ${insertedProducts.length} produtos inseridos com sucesso!`);
  }

  console.log('\n✨ População concluída!');
}

populateData().catch(console.error);
