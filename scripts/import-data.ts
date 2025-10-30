import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// Mapear IDs antigos para novos
const groupIdMap = new Map<number, number>();
const categoryIdMap = new Map<number, number>();

async function clearDatabase() {
  console.log('🗑️  Limpando banco de dados...');
  
  // Deletar em ordem reversa de dependências
  const { error: itemsError } = await supabase
    .from('items')
    .delete()
    .neq('id', 0);
  
  if (itemsError) console.error('Erro ao deletar items:', itemsError);
  
  const { error: categoriesError } = await supabase
    .from('categories')
    .delete()
    .neq('id', 0);
    
  if (categoriesError) console.error('Erro ao deletar categories:', categoriesError);
  
  const { error: groupsError } = await supabase
    .from('groups')
    .delete()
    .neq('id', 0);
    
  if (groupsError) console.error('Erro ao deletar groups:', groupsError);
  
  console.log('✅ Banco de dados limpo!');
}

async function insertGroups() {
  console.log('📁 Inserindo grupos...');
  
  const groups = [
    { old_id: 4, name: 'Premium', description: 'Itens inclusos no rodízio premium', price: 189.00, type: 'rodizio', active: true, sort_order: 2 },
    { old_id: 1, name: 'Tradicional', description: 'Itens inclusos no rodízio tradicional', price: 129.00, type: 'rodizio', active: true, sort_order: 1 },
    { old_id: 5, name: 'À la Carte', description: 'Itens vendidos separadamente', price: null, type: 'a_la_carte', active: true, sort_order: 3 },
    { old_id: null, name: 'Bebidas', description: null, price: null, type: 'bebidas', active: true, sort_order: 4 },
    { old_id: null, name: 'Bebidas Alcoólicas', description: null, price: null, type: 'bebidas', active: true, sort_order: 5 },
    { old_id: null, name: 'Vinhos', description: null, price: null, type: 'bebidas', active: true, sort_order: 6 }
  ];
  
  for (const group of groups) {
    const { data, error } = await supabase
      .from('groups')
      .insert({
        name: group.name,
        description: group.description,
        price: group.price,
        type: group.type as 'rodizio' | 'a_la_carte' | 'bebidas',
        active: group.active,
        sort_order: group.sort_order
      })
      .select()
      .single();
      
    if (error) {
      console.error(`Erro ao inserir grupo ${group.name}:`, error);
    } else if (data && group.old_id) {
      groupIdMap.set(group.old_id, data.id);
      console.log(`✅ Grupo ${group.name} inserido (ID: ${data.id})`);
    }
  }
}

async function insertCategories() {
  console.log('📂 Inserindo categorias...');
  
  // Categorias do Premium (Group ID: 4)
  const premiumCategories = [
    { old_id: 77, name: 'Entradas', description: 'Aberturas frescas e saborosas para começar sua experiência', sort_order: 1 },
    { old_id: 78, name: 'Sashimis', description: 'Fatias delicadas de peixes frescos, um clássico japonês', sort_order: 2 },
    { old_id: 79, name: 'Carpaccios', description: 'Finas lâminas de peixe com toques cítricos e frescos', sort_order: 4 },
    { old_id: 80, name: 'Niguiris', description: 'Bolinhos de arroz com peixes frescos, simples e elegantes', sort_order: 3 },
    { old_id: 81, name: 'Uramakis', description: 'Rolos invertidos com recheios criativos e saborosos', sort_order: 5 },
    { old_id: 82, name: 'Acelgamakis', description: 'Rolos especiais com ingredientes frescos e únicos', sort_order: 6 },
    { old_id: 83, name: 'Hossomakis', description: 'Rolinhos tradicionais, pequenos e cheios de sabor', sort_order: 7 },
    { old_id: 84, name: 'Temakis', description: 'Cones de alga recheados com sabores autênticos', sort_order: 8 },
    { old_id: 85, name: 'Dyos', description: 'Duplas de sushi com combinações surpreendentes', sort_order: 9 },
    { old_id: 86, name: 'Chapas', description: 'Pratos quentes grelhados com toque oriental', sort_order: 10 },
    { old_id: 87, name: 'Hot Rolls', description: 'Rolos fritos, crocantes e irresistíveis', sort_order: 11 },
    { old_id: 88, name: 'Harumakis', description: 'Rolinhos primavera com recheios leves e crocantes', sort_order: 12 },
    { old_id: 89, name: 'Estilo Pasteis', description: 'Pasteis com inspiração japonesa, leves e saborosos', sort_order: 13 },
    { old_id: 90, name: 'Especial MAAD', description: 'Criações exclusivas do chef, uma explosão de sabores', sort_order: 14 },
    { old_id: 91, name: 'Outros', description: 'Opções variadas para todos os gostos', sort_order: 15 },
    { old_id: 92, name: 'Sobremesas', description: 'Doces delicados para finalizar sua refeição', sort_order: 16 },
    { old_id: 93, name: 'Kids', description: 'Pratos divertidos para os pequenos', sort_order: 17 }
  ];
  
  // Inserir categorias do Premium
  const premiumGroupId = groupIdMap.get(4);
  if (premiumGroupId) {
    for (const cat of premiumCategories) {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: cat.name,
          description: cat.description,
          group_id: premiumGroupId,
          active: true,
          sort_order: cat.sort_order
        })
        .select()
        .single();
        
      if (error) {
        console.error(`Erro ao inserir categoria ${cat.name}:`, error);
      } else if (data && cat.old_id) {
        categoryIdMap.set(cat.old_id, data.id);
        console.log(`✅ Categoria ${cat.name} inserida (ID: ${data.id})`);
      }
    }
  }
  
  // Inserir as mesmas categorias para o Tradicional (Group ID: 1)
  const tradicionalGroupId = groupIdMap.get(1);
  if (tradicionalGroupId) {
    for (const cat of premiumCategories) {
      await supabase
        .from('categories')
        .insert({
          name: cat.name,
          description: cat.description,
          group_id: tradicionalGroupId,
          active: true,
          sort_order: cat.sort_order
        });
    }
  }
  
  // Inserir as mesmas categorias para À la Carte (Group ID: 5)
  const aLaCarteGroupId = groupIdMap.get(5);
  if (aLaCarteGroupId) {
    for (const cat of premiumCategories) {
      await supabase
        .from('categories')
        .insert({
          name: cat.name,
          description: cat.description,
          group_id: aLaCarteGroupId,
          active: true,
          sort_order: cat.sort_order
        });
    }
  }
}

async function insertItems() {
  console.log('🍱 Inserindo items...');
  
  const tradicionalGroupId = groupIdMap.get(1);
  
  // Pegar a categoria Entradas do grupo Tradicional
  const { data: entradas } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Entradas')
    .eq('group_id', tradicionalGroupId)
    .single();
  
  const { data: sashimis } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Sashimis')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: carpaccios } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Carpaccios')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: niguiris } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Niguiris')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: uramakis } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Uramakis')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: acelgamakis } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Acelgamakis')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: hossomakis } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Hossomakis')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: temakis } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Temakis')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: dyos } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Dyos')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: chapas } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Chapas')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: hotRolls } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Hot Rolls')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: harumakis } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Harumakis')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: pasteis } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Estilo Pasteis')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: especial } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Especial MAAD')
    .eq('group_id', tradicionalGroupId)
    .single();
    
  const { data: outros } = await supabase
    .from('categories')
    .select('id')
    .eq('name', 'Outros')
    .eq('group_id', tradicionalGroupId)
    .single();
  
  // Items de Entradas
  if (entradas?.id) {
    const entradasItems = [
      { name: 'Salada da Casa', description: 'Vinagrete de camarão, sunomono, gengibre, ceviche e nachos de salmão', sort_order: 1 },
      { name: 'Sunomono', description: 'Finas fatias de pepino japonês curtidas no molho agridoce', sort_order: 2 },
      { name: 'Vinagrete de Camarão', description: 'Camarões marinados com legumes frescos em um vinagrete cítrico e aromático', sort_order: 3 },
      { name: 'Ceviche', description: 'Peixe, curtidos no molho de laranja, limão, pimenta-dedo-de-moça, salsinha, cebola roxa, molho de pimenta e azeite extra virgem', sort_order: 4 },
      { name: 'Ceviche Especial', description: 'Peixe, curtidos no molho de laranja, limão, pimenta-dedo-de-moça, salsinha, cebola roxa, molho de pimenta e azeite extra virgem', sort_order: 5 },
      { name: 'Tartar', description: 'Salmão finamente picado com molho especial, marinado na cebola roxa.', sort_order: 6 }
    ];
    
    for (const item of entradasItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: entradas.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Sashimis
  if (sashimis?.id) {
    const sashimisItems = [
      { name: 'Sashimi Salmão', description: 'Fatias frescas de salmão, perfeitas para os amantes de peixe cru', sort_order: 1 },
      { name: 'Sashimi Atum', description: 'Fatias delicadas de atum, com sabor intenso e textura suave', sort_order: 2 },
      { name: 'Sashimi Peixe Prego/Limão', description: 'Fatias de peixe prego com um toque refrescante de limão', sort_order: 3 },
      { name: 'Sashimi Tilápia', description: 'Fatias leves e frescas de tilápia, com sabor suave', sort_order: 4 },
      { name: 'Sashimi Polvo', description: 'Fatias finas de polvo, com textura única e sabor marcante', sort_order: 5 }
    ];
    
    for (const item of sashimisItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: sashimis.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Carpaccios
  if (carpaccios?.id) {
    const carpacciosItems = [
      { name: 'Carpaccio Salmão Trufado', description: 'Finas lâminas de salmão com toque sofisticado de trufas', sort_order: 1 },
      { name: 'Carpaccio Polvo Trufado', description: 'Lâminas de polvo com aroma refinado de trufas', sort_order: 2 },
      { name: 'Carpaccio Camarão Trufado', description: 'Camarões em fatias finas com toque especial de trufas', sort_order: 3 },
      { name: 'Carpaccio Misto Trufado', description: 'Combinação de peixes e frutos do mar com sabor trufado', sort_order: 4 }
    ];
    
    for (const item of carpacciosItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: carpaccios.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Niguiris
  if (niguiris?.id) {
    const niguirisItems = [
      { name: 'Niguiri Salmão', description: 'Bolinho de arroz com fatia fresca de salmão', sort_order: 1 },
      { name: 'Niguiri Salmão Especial', description: 'Salmão selecionado sobre arroz, com toque especial do chef', sort_order: 2 },
      { name: 'Niguiri Atum', description: 'Bolinho de arroz com atum fresco e sabor marcante', sort_order: 3 },
      { name: 'Niguiri Polvo', description: 'Arroz coberto com fatia de polvo, textura única', sort_order: 4 },
      { name: 'Niguiri Camarão', description: 'Camarão selecionado sobre bolinho de arroz', sort_order: 5 },
      { name: 'Niguiri Salmão Fry Ouro', description: 'Salmão frito com toque dourado sobre arroz', sort_order: 6 }
    ];
    
    for (const item of niguirisItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: niguiris.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Uramakis
  if (uramakis?.id) {
    const uramakisItems = [
      { name: 'Uramaki Salmão', description: 'Rolo invertido com salmão fresco e recheio cremoso', sort_order: 1 },
      { name: 'Uramaki Atum', description: 'Rolo com atum fresco e toque de molho especial', sort_order: 2 },
      { name: 'Uramaki Camarão', description: 'Rolo invertido com camarão suculento e molho delicado', sort_order: 3 },
      { name: 'Uramaki Filadelfia', description: 'Rolo com salmão e cream cheese, cremoso e suave', sort_order: 4 },
      { name: 'Uramaki California', description: 'Rolo com kani, pepino e manga, refrescante', sort_order: 5 }
    ];
    
    for (const item of uramakisItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: uramakis.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Acelgamakis
  if (acelgamakis?.id) {
    const acelgamakisItems = [
      { name: 'Acelgamaki Salmão', description: 'Rolo especial com salmão, coberto com fatias delicadas', sort_order: 1 },
      { name: 'Acelgamaki Atum', description: 'Rolo com atum, coberto com molho especial', sort_order: 2 },
      { name: 'Acelgamaki Especial', description: 'Combinação única com toque do chef', sort_order: 3 }
    ];
    
    for (const item of acelgamakisItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: acelgamakis.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Hossomakis
  if (hossomakis?.id) {
    const hossomakisItems = [
      { name: 'Hossomaki Salmão', description: 'Rolinho tradicional com salmão fresco', sort_order: 1 },
      { name: 'Hossomaki Atum', description: 'Rolinho com atum, simples e saboroso', sort_order: 2 },
      { name: 'Hossomaki Kani', description: 'Rolinho com kani, leve e delicado', sort_order: 3 },
      { name: 'Hossomaki Pepino', description: 'Rolinho de pepino, refrescante', sort_order: 4 }
    ];
    
    for (const item of hossomakisItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: hossomakis.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Temakis
  if (temakis?.id) {
    const temakisItems = [
      { name: 'Temaki Salmão', description: 'Cone de alga com salmão fresco e arroz', sort_order: 1 },
      { name: 'Temaki Atum', description: 'Cone de alga com atum fresco e molho especial', sort_order: 3 },
      { name: 'Temaki Camarão', description: 'Cone de alga com camarão suculento e recheio leve', sort_order: 4 },
      { name: 'Temaki California', description: 'Cone de alga com kani, pepino e manga, bem refrescante', sort_order: 5 },
      { name: 'Temaki Skin Fry', description: 'Cone de alga com pele de salmão frita, crocante e única', sort_order: 6 },
      { name: 'Temaki Hot Roll', description: 'Cone de alga com rolo frito, quente e irresistível', sort_order: 7 }
    ];
    
    for (const item of temakisItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: temakis.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Dyos
  if (dyos?.id) {
    const dyosItems = [
      { name: 'Joe Salmão', description: 'Dupla de sushi com salmão fresco e molho delicado', sort_order: 1 },
      { name: 'Joe Camarão', description: 'Dupla de sushi com camarão e toque especial do chef', sort_order: 2 },
      { name: 'Joe Geleia Framboesa', description: 'Dupla de sushi com geleia de framboesa, doce e única', sort_order: 3 },
      { name: 'Joe Sugar', description: 'Dupla de sushi com toque açucarado e criativo', sort_order: 4 },
      { name: 'Joe Couve Fry', description: 'Dupla de sushi com couve frita, crocante e original', sort_order: 5 },
      { name: 'Joe Shimeji', description: 'Dupla de sushi com shimeji, saboroso e delicado', sort_order: 6 }
    ];
    
    for (const item of dyosItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: dyos.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Chapas
  if (chapas?.id) {
    const chapasItems = [
      { name: 'Chapa Shimeji', description: 'Cogumelos shimeji grelhados com molho oriental', sort_order: 1 },
      { name: 'Chapa Shitake', description: 'Cogumelos shitake grelhados com toque asiático', sort_order: 2 },
      { name: 'Chapa Mista', description: 'Mix de frutos do mar grelhados com molho especial', sort_order: 3 },
      { name: 'Chapa Polvo', description: 'Polvo grelhado com temperos orientais, suculento', sort_order: 4 },
      { name: 'Chapa Salmão', description: 'Salmão grelhado com molho leve e aromático', sort_order: 5 },
      { name: 'Chapa Camarão', description: 'Camarões grelhados com toque oriental, irresistíveis', sort_order: 6 }
    ];
    
    for (const item of chapasItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: chapas.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Hot Rolls
  if (hotRolls?.id) {
    const hotRollsItems = [
      { name: 'Hot Roll Salmão', description: 'Rolo frito com salmão, crocante e delicioso', sort_order: 1 },
      { name: 'Hot Roll Camarão', description: 'Rolo frito com camarão, quente e saboroso', sort_order: 2 },
      { name: 'Hot Roll Shimeji', description: 'Rolo frito com shimeji, leve e crocante', sort_order: 3 },
      { name: 'Hot Roll Filadelfia', description: 'Rolo frito com salmão e cream cheese, irresistível', sort_order: 4 },
      { name: 'Hot Roll Doritos', description: 'Rolo frito com toque crocante de Doritos', sort_order: 5 }
    ];
    
    for (const item of hotRollsItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: hotRolls.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Harumakis
  if (harumakis?.id) {
    const harumakisItems = [
      { name: 'Harumaki Queijo', description: 'Rolinho primavera com recheio cremoso de queijo', sort_order: 1 },
      { name: 'Harumaki Legumes', description: 'Rolinho primavera com legumes frescos e crocantes', sort_order: 2 },
      { name: 'Harumaki Filadelfia', description: 'Rolinho primavera com salmão e cream cheese', sort_order: 3 }
    ];
    
    for (const item of harumakisItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: harumakis.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Pasteis
  if (pasteis?.id) {
    const pasteisItems = [
      { name: 'Pastel Salmão', description: 'Pastel crocante com recheio de salmão fresco', sort_order: 1 },
      { name: 'Pastel Camarão', description: 'Pastel com camarão suculento e temperos orientais', sort_order: 2 },
      { name: 'Pastel Bacalhau', description: 'Pastel com recheio de bacalhau, rico e saboroso', sort_order: 3 },
      { name: 'Guioza Suína', description: 'Pastelzinho japonês com recheio suculento de carne suína', sort_order: 4 },
      { name: 'Guioza Bovina', description: 'Pastelzinho japonês com recheio de carne bovina', sort_order: 5 }
    ];
    
    for (const item of pasteisItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: pasteis.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Especial MAAD
  if (especial?.id) {
    const especialItems = [
      { name: 'Salmão MAAD', description: 'Criação exclusiva com salmão, cheia de sabor', sort_order: 1 },
      { name: 'Camarão MAAD', description: 'Criação única com camarão, surpreendente e deliciosa', sort_order: 2 },
      { name: 'Atum MAAD', description: 'Criação especial com atum, rica em sabores', sort_order: 3 },
      { name: 'Kaka MAAD', description: 'Combinação exclusiva do chef, única e inesquecível', sort_order: 4 },
      { name: 'Ebi Hot Shake MAAD', description: 'Criação quente com camarão, vibrante e saborosa', sort_order: 5 },
      { name: 'Dubai MAAD', description: 'Criação premium com toque exótico e sofisticado', sort_order: 6 },
      { name: 'Fire MAAD', description: 'Criação ousada com toque quente e sabor marcante', sort_order: 7 }
    ];
    
    for (const item of especialItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: especial.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  // Items de Outros
  if (outros?.id) {
    const outrosItems = [
      { name: 'Batera Salmão', description: 'Sushi prensado com salmão fresco e molho especial', sort_order: 1 },
      { name: 'Batera Atum', description: 'Sushi prensado com atum, rico e saboroso', sort_order: 2 },
      { name: 'Lula Com Salmão', description: 'Combinação de lula e salmão, fresca e harmoniosa', sort_order: 3 },
      { name: 'Polvo no gelo', description: 'Polvo servido gelado com toque refrescante', sort_order: 4 },
      { name: 'Yakissoba Carne', description: 'Macarrão frito com carne e legumes, ao molho oriental', sort_order: 5 },
      { name: 'Yakissoba Frango', description: 'Macarrão frito com frango e legumes, saboroso', sort_order: 6 },
      { name: 'Yakissoba Frutos do Mar', description: 'Macarrão frito com frutos do mar, rico e suculento', sort_order: 7 },
      { name: 'Kibe Atum', description: 'Kibe com recheio de atum, crocante e original', sort_order: 8 },
      { name: 'Tempura Legumes', description: 'Legumes fritos em massa leve, crocantes e saborosos', sort_order: 9 },
      { name: 'Tempura Camarão', description: 'Camarões fritos em tempura, leves e crocantes', sort_order: 10 },
      { name: 'Roru Tomato', description: 'Rolo especial com toque de tomate, fresco e único', sort_order: 11 },
      { name: 'Missoshiro', description: 'Sopa tradicional japonesa com missô e tofu', sort_order: 12 }
    ];
    
    for (const item of outrosItems) {
      await supabase.from('items').insert({
        ...item,
        category_id: outros.id,
        group_id: tradicionalGroupId,
        active: true,
        available: true,
      });
    }
  }
  
  console.log('✅ Items inseridos com sucesso!');
}

async function main() {
  try {
    console.log('🚀 Iniciando importação de dados...\n');
    
    await clearDatabase();
    await insertGroups();
    await insertCategories();
    await insertItems();
    
    console.log('\n✨ Importação concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na importação:', error);
  }
}

main();