import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Product {
  id: number;
  name: string;
  group_name: string;
}

const imageDir = path.join(process.cwd(), 'attached_assets', 'product_images');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

function normalizeProductName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

function getProductType(name: string): string {
  const lower = name.toLowerCase();
  
  if (lower.includes('niguiri') || lower.includes('nigiri')) return 'niguiri';
  if (lower.includes('sashimi')) return 'sashimi';
  if (lower.includes('temaki')) return 'temaki';
  if (lower.includes('uramaki')) return 'uramaki';
  if (lower.includes('acelgamaki')) return 'acelgamaki';
  if (lower.includes('shakemaki') || lower.includes('tekamaki') || lower.includes('kappamaki')) return 'maki';
  if (lower.includes('hot roll')) return 'hot_roll';
  if (lower.includes('harumaki')) return 'harumaki';
  if (lower.includes('joe')) return 'joe';
  if (lower.includes('carpaccio')) return 'carpaccio';
  if (lower.includes('ceviche')) return 'ceviche';
  if (lower.includes('tartar')) return 'tartar';
  if (lower.includes('chapa')) return 'chapa';
  if (lower.includes('guioza') || lower.includes('gyoza')) return 'guioza';
  if (lower.includes('pastel')) return 'pastel';
  if (lower.includes('tempura')) return 'tempura';
  if (lower.includes('batera')) return 'batera';
  if (lower.includes('maad')) return 'especial_maad';
  if (lower.includes('sunomono')) return 'sunomono';
  if (lower.includes('salada')) return 'salada';
  if (lower.includes('vinagrete')) return 'vinagrete';
  if (lower.includes('kibe')) return 'kibe';
  if (lower.includes('yakissoba')) return 'yakissoba';
  if (lower.includes('gohan')) return 'gohan';
  if (lower.includes('missoshiro') || lower.includes('misoshiro')) return 'missoshiro';
  if (lower.includes('ishigo')) return 'ishigo';
  if (lower.includes('roru')) return 'roru';
  if (lower.includes('banana fry')) return 'banana_fry';
  if (lower.includes('nachos')) return 'nachos_sorvete';
  if (lower.includes('porção batata')) return 'batata_frita';
  if (lower.includes('porção frango')) return 'frango_empanado';
  if (lower.includes('porção tilápia') || lower.includes('porção tilapia')) return 'tilapia_empanada';
  if (lower.includes('prato frango')) return 'prato_frango';
  if (lower.includes('prato tilápia') || lower.includes('prato tilapia')) return 'prato_tilapia';
  if (lower.includes('polvo no gelo')) return 'polvo_gelo';
  if (lower.includes('lula')) return 'lula';
  
  return 'outros';
}

function getIngredient(name: string): string {
  const lower = name.toLowerCase();
  
  if (lower.includes('salmão') || lower.includes('salmao') || lower.includes('shake')) return 'salmao';
  if (lower.includes('atum')) return 'atum';
  if (lower.includes('camarão') || lower.includes('camarao') || lower.includes('ebi')) return 'camarao';
  if (lower.includes('polvo')) return 'polvo';
  if (lower.includes('peixe prego') || lower.includes('limão') || lower.includes('limao')) return 'peixe_branco';
  if (lower.includes('tilápia') || lower.includes('tilapia')) return 'tilapia';
  if (lower.includes('california')) return 'california';
  if (lower.includes('filadélfia') || lower.includes('filadelfia') || lower.includes('philadelphia')) return 'philadelphia';
  if (lower.includes('shimeji')) return 'shimeji';
  if (lower.includes('shitake')) return 'shitake';
  if (lower.includes('legumes')) return 'legumes';
  if (lower.includes('queijo')) return 'queijo';
  if (lower.includes('bacalhau')) return 'bacalhau';
  if (lower.includes('skin')) return 'skin';
  if (lower.includes('doce')) return 'doce';
  if (lower.includes('nutella')) return 'nutella';
  if (lower.includes('doce de leite')) return 'doce_leite';
  if (lower.includes('romeu e julieta')) return 'goiabada';
  if (lower.includes('framboesa')) return 'framboesa';
  if (lower.includes('sugar')) return 'acucar';
  if (lower.includes('couve')) return 'couve';
  if (lower.includes('doritos')) return 'doritos';
  if (lower.includes('frango')) return 'frango';
  if (lower.includes('carne') || lower.includes('bovina')) return 'carne';
  if (lower.includes('suína') || lower.includes('suina')) return 'porco';
  if (lower.includes('banana')) return 'banana';
  
  return '';
}

function createImagePrompt(name: string): string {
  const type = getProductType(name);
  const ingredient = getIngredient(name);
  const lower = name.toLowerCase();
  
  const baseStyle = 'professional food photography, elegant presentation on black slate plate, dramatic lighting, restaurant quality, 16:9 aspect ratio, high detail';
  
  const prompts: Record<string, string> = {
    niguiri: `${ingredient} nigiri sushi, hand-pressed rice with fresh ${ingredient} fish on top, ${baseStyle}, minimalist japanese cuisine`,
    sashimi: `fresh ${ingredient} sashimi slices, thinly sliced raw fish arranged artistically, ${baseStyle}, garnished with daikon radish`,
    temaki: `${ingredient} temaki hand roll, nori cone filled with sushi rice and ${ingredient}, ${baseStyle}, vibrant ingredients visible`,
    uramaki: `${ingredient} uramaki inside-out roll, sushi rice on outside with sesame seeds, ${baseStyle}, perfectly sliced pieces`,
    maki: `${ingredient} maki roll sushi, traditional nori-wrapped roll, ${baseStyle}, clean cuts showing colorful filling`,
    hot_roll: `hot crispy ${ingredient} sushi roll, deep-fried tempura style, ${baseStyle}, golden crispy coating, steam rising`,
    harumaki: `crispy ${ingredient} spring roll, golden fried harumaki, ${baseStyle}, served with dipping sauce`,
    joe: `${ingredient} joy sushi, modern fusion sushi creation, ${baseStyle}, creative plating`,
    carpaccio: `${ingredient} carpaccio, paper-thin sliced raw fish with truffle oil, ${baseStyle}, premium presentation`,
    ceviche: `fresh ${ingredient} ceviche, citrus-marinated seafood with herbs, ${baseStyle}, served in elegant bowl`,
    tartar: `${ingredient} tartar, finely diced raw fish with seasonings, ${baseStyle}, tower presentation`,
    chapa: `grilled ${ingredient} teppanyaki style, hot plate cooking, ${baseStyle}, sizzling and aromatic`,
    guioza: `japanese gyoza dumplings, pan-fried potstickers with crispy bottom, ${baseStyle}, served with soy sauce`,
    pastel: `crispy brazilian-japanese fusion pastel filled with ${ingredient}, ${baseStyle}, golden fried pastry`,
    tempura: `light crispy ${ingredient} tempura, Japanese deep-fried batter, ${baseStyle}, delicate and airy`,
    batera: `pressed ${ingredient} sushi, Osaka-style battera, ${baseStyle}, rectangular shaped pressed sushi`,
    especial_maad: `premium ${ingredient} special roll, creative chef signature roll, ${baseStyle}, luxurious ingredients and presentation`,
    sunomono: `cucumber sunomono salad, refreshing Japanese vinegar salad, ${baseStyle}, light and crispy`,
    salada: `Japanese house salad, fresh mixed greens with ginger dressing, ${baseStyle}, colorful vegetables`,
    vinagrete: `shrimp vinaigrette, Brazilian-style shrimp salad, ${baseStyle}, fresh and vibrant`,
    kibe: `tuna kibe, Japanese-Brazilian fusion, deep-fried wheat and fish, ${baseStyle}, crispy golden exterior`,
    yakissoba: `Japanese yakisoba noodles stir-fry with ${ingredient}, ${baseStyle}, steaming noodles with vegetables`,
    gohan: `Japanese steamed rice gohan, perfectly cooked white rice in bowl, ${baseStyle}, simple elegance`,
    missoshiro: `traditional miso soup, hot Japanese soup with tofu and seaweed, ${baseStyle}, served in lacquer bowl`,
    ishigo: `ishigo sushi creation, artisanal Japanese dish, ${baseStyle}, artistic presentation`,
    roru: `tomato roru roll, fusion sushi with tomato, ${baseStyle}, fresh and colorful`,
    banana_fry: `fried banana dessert with ${ingredient} topping, crispy sweet tempura banana, ${baseStyle}, dessert plating`,
    nachos_sorvete: `nachos with ice cream dessert, fusion dessert with crispy nachos, ${baseStyle}, indulgent sweet dish`,
    batata_frita: `crispy golden french fries portion, perfectly fried potatoes, ${baseStyle}, restaurant-style serving`,
    frango_empanado: `crispy breaded chicken strips, Japanese-style chicken katsu, ${baseStyle}, golden and crunchy`,
    tilapia_empanada: `breaded tilapia fillet, crispy fried white fish, ${baseStyle}, served with lemon`,
    prato_frango: `grilled chicken with french fries plate, complete meal presentation, ${baseStyle}, generous portion`,
    prato_tilapia: `grilled tilapia with french fries plate, complete fish meal, ${baseStyle}, elegant plating`,
    polvo_gelo: `octopus on ice, fresh octopus sashimi served on ice bed, ${baseStyle}, premium seafood presentation`,
    lula: `squid with salmon, Japanese-style squid preparation, ${baseStyle}, tender and fresh seafood`
  };
  
  let prompt = prompts[type] || `Japanese ${name} dish, ${baseStyle}`;
  
  if (lower.includes('fry') && !lower.includes('banana')) {
    prompt = prompt.replace('professional food photography', 'professional food photography, crispy fried coating');
  }
  
  if (lower.includes('ouro') || lower.includes('gold')) {
    prompt += ', garnished with edible gold leaf, luxury presentation';
  }
  
  if (lower.includes('mel')) {
    prompt += ', drizzled with honey, sweet and savory';
  }
  
  if (lower.includes('trufado') || lower.includes('truffle')) {
    prompt += ', with truffle oil and shavings, premium gourmet';
  }
  
  return prompt;
}

async function main() {
  console.log('🍣 Gerando imagens para produtos do Rodízio...\n');
  
  const { data: products, error } = await supabase
    .from('items')
    .select(`
      id,
      name,
      groups!inner(name)
    `)
    .or('groups.name.ilike.%rodizio%,groups.name.ilike.%tradicional%,groups.name.ilike.%premium%')
    .order('name');
  
  if (error) {
    console.error('Erro ao buscar produtos:', error);
    return;
  }
  
  if (!products || products.length === 0) {
    console.log('Nenhum produto encontrado.');
    return;
  }
  
  const uniqueProducts = new Map<string, Product>();
  
  products.forEach((p: any) => {
    const normalized = normalizeProductName(p.name);
    const groupName = p.groups.name;
    
    if (!uniqueProducts.has(normalized)) {
      uniqueProducts.set(normalized, {
        id: p.id,
        name: p.name,
        group_name: groupName
      });
    }
  });
  
  console.log(`📊 Total de produtos únicos: ${uniqueProducts.size}\n`);
  
  const prompts: Array<{name: string, prompt: string, filename: string}> = [];
  
  for (const [normalized, product] of uniqueProducts.entries()) {
    const prompt = createImagePrompt(product.name);
    const filename = `${normalized}.jpg`;
    
    prompts.push({
      name: product.name,
      prompt: prompt,
      filename: filename
    });
  }
  
  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'product-image-prompts.json'),
    JSON.stringify(prompts, null, 2)
  );
  
  console.log('✅ Prompts salvos em scripts/product-image-prompts.json');
  console.log(`\n📝 Total de ${prompts.length} prompts criados para imagens únicas`);
  console.log('\n🎨 Exemplos de prompts gerados:\n');
  
  prompts.slice(0, 5).forEach(p => {
    console.log(`📸 ${p.name}`);
    console.log(`   Arquivo: ${p.filename}`);
    console.log(`   Prompt: ${p.prompt.substring(0, 100)}...`);
    console.log('');
  });
}

main().catch(console.error);
