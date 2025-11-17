import { createClient } from '@supabase/supabase-js';
import { readdirSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Product {
  id: string;
  name: string;
  image_url: string | null;
}

// Mapeamento manual de produtos para imagens baseado nos nomes baixados
const imageMapping: Record<string, string> = {
  // Sashimi
  'Sashimi Salmão': 'salmon_sashimi_fresh_6298ee3b.jpg',
  'Sashimi Atum': 'tuna_sashimi_fresh_s_60e9be55.jpg',
  'Sashimi Peixe Branco': 'white_fish_sashimi_l_34a8beb9.jpg',
  'Sashimi Polvo': 'octopus_on_ice_raw_f_b7b94cd9.jpg',
  'Sashimi Lula c/ Salmão': 'squid_with_salmon_ja_c35784c1.jpg',
  'Sashimi Tilápia': 'tilapia_sashimi_whit_0e8d9d29.jpg',
  
  // Niguiri
  'Niguiri Salmão': 'salmon_nigiri_sushi__c20c63b6.jpg',
  'Niguiri Atum': 'tuna_nigiri_sushi_ra_c8ca3709.jpg',
  'Niguiri Camarão': 'shrimp_nigiri_sushi__2098d944.jpg',
  'Niguiri Polvo': 'octopus_nigiri_sushi_65d5da48.jpg',
  'Niguiri Salmão Especial': 'blowtorch_salmon_nig_c19d3055.jpg',
  'Niguiri Salmão Frito c/ Folha de Ouro': 'fried_salmon_nigiri__173d8ce1.jpg',
  
  // California Roll
  'California Roll': 'california_roll_drag_16c6a0c7.jpg',
  'California Roll c/ Doritos': 'doritos_crust_sushi__88c0c6dd.jpg',
  
  // Philadelphia
  'Philadelphia': 'philadelphia_roll_cr_a6e59c29.jpg',
  'Philadelphia Frito': 'fried_philadelphia_r_547deb66.jpg',
  
  // Hot Roll
  'Hot Roll Camarão': 'fried_shrimp_hot_rol_cda17c5e.jpg',
  'Hot Roll Shimeji': 'fried_mushroom_hot_r_a89c97a3.jpg',
  'Hot Roll Camarão + Salmão': 'shrimp_salmon_hot_ro_2526622b.jpg',
  
  // Temaki
  'Temaki California': 'california_hand_roll_0bfa86bf.jpg',
  'Temaki Camarão': 'shrimp_temaki_hand_r_5ee0549d.jpg',
  'Temaki Atum': 'tuna_temaki_hand_rol_51d06d58.jpg',
  'Temaki Hot': 'hot_roll_temaki_frie_e408f5a9.jpg',
  'Temaki Salmão Frito': 'fried_salmon_temaki__af00b895.jpg',
  
  // Uramaki
  'Uramaki Salmão': 'salmon_uramaki_insid_0de0e9ab.jpg',
  'Uramaki Atum': 'tuna_uramaki_inside__4bf41dda.jpg',
  'Uramaki Camarão': 'shrimp_uramaki_insid_ae8f0a38.jpg',
  'Uramaki Salmão Frito': 'fried_salmon_uramaki_a1ca3f5a.jpg',
  
  // Maki
  'Maki Salmão': 'salmon_maki_roll_sim_6698611a.jpg',
  'Maki Atum': 'tuna_maki_roll_simpl_1eb8f921.jpg',
  'Maki Pepino': 'cucumber_roll_kappa__65e060ee.jpg',
  
  // Acelga (Maki com vegetais)
  'Acelga Salmão': 'salmon_acelga_maki_r_90086583.jpg',
  'Acelga Atum': 'tuna_acelga_maki_rol_edd4b281.jpg',
  'Acelga Salmão Frito': 'fried_salmon_acelga__df367920.jpg',
  
  // Especiais
  'Especial Salmão': 'premium_salmon_sushi_991c082d.jpg',
  'Especial Atum': 'premium_tuna_sushi_s_3c423a25.jpg',
  'Especial Camarão': 'premium_shrimp_sushi_47dc31cb.jpg',
  'Especial Premium': 'premium_special_sush_4f7e52da.jpg',
  
  // Harumaki (Spring Roll)
  'Harumaki Legumes': 'vegetable_spring_rol_4469ae85.jpg',
  'Harumaki Queijo': 'cheese_spring_roll_h_c432fa38.jpg',
  'Harumaki Goiaba c/ Queijo': 'spring_roll_guava_ch_b3ea38b7.jpg',
  
  // Gyoza
  'Guioza': 'pork_gyoza_dumpling__f93c05e1.jpg',
  
  // Carpaccio
  'Carpaccio': 'carpaccio_thin_slice_8762a30a.jpg',
  'Carpaccio Camarão': 'shrimp_carpaccio_tru_c57bc8c2.jpg',
  'Carpaccio Polvo': 'octopus_carpaccio_tr_d9cdea14.jpg',
  'Carpaccio Misto': 'mixed_seafood_carpac_ccea8179.jpg',
  
  // Ceviche
  'Ceviche': 'ceviche_fresh_seafoo_123ccef6.jpg',
  'Ceviche Especial': 'special_ceviche_prem_67d36e48.jpg',
  
  // Teppanyaki (Grelhados)
  'Teppan Salmão': 'grilled_salmon_teppa_dfaf67be.jpg',
  'Teppan Camarão': 'grilled_shrimp_teppa_205e2a00.jpg',
  'Teppan Polvo': 'grilled_octopus_tepp_211a1617.jpg',
  'Teppan Shimeji': 'grilled_mushroom_tep_c3dda0a1.jpg',
  'Teppan Shiitake': 'grilled_shiitake_mus_e10e3b54.jpg',
  'Teppan Frutos do Mar': 'mixed_grilled_seafoo_b9d00249.jpg',
  
  // Tempurá
  'Tempurá Camarão': 'shrimp_tempura_light_60f83a49.jpg',
  'Tempurá Legumes': 'vegetable_tempura_li_a6e6e442.jpg',
  
  // Yakisoba
  'Yakisoba Frango': 'chicken_yakisoba_noo_68ea47df.jpg',
  'Yakisoba Frutos do Mar': 'seafood_yakisoba_noo_c0aaf06d.jpg',
  
  // Pastel
  'Pastel Camarão': 'shrimp_pastel_fried__1585c143.jpg',
  'Pastel Bacalhau': 'codfish_pastel_fried_ce31af6f.jpg',
  
  // Edamame
  'Edamame': 'edamame_soybeans_jap_7a726b98.jpg',
  
  // Sobremesas/Fusion
  'Hot Doce': 'sweet_dessert_sushi__22101638.jpg',
  'Hot Geleia': 'raspberry_jam_sushi__785f19eb.jpg',
  'Hot Couve': 'fried_kale_sushi_rol_923651e6.jpg',
  'Hot Açúcar': 'sugar_dessert_sushi__3cf37dc1.jpg',
  'Joe Shimeji': 'mushroom_joe_sushi_s_a12eece7.jpg',
  'Joy Camarão': 'shrimp_joy_sushi_fus_7e6cc111.jpg',
  
  // Outros especiais
  'Ishigo': 'ishigo_japanese_arti_1c28d648.jpg',
  'Hot Mel': 'fried_honey_salmon_r_1a4cfb2b.jpg',
  'Hot Camarão c/ Folha de Ouro': 'fried_shrimp_roll_go_f8e6a8c1.jpg',
  'Hot Salmão c/ Folha de Ouro': 'fried_salmon_roll_go_1b863205.jpg',
  'Skin Salmão': 'crispy_salmon_skin_r_c4c0c282.jpg',
  'Battera Salmão': 'pressed_salmon_sushi_64afa604.jpg',
  'Battera Atum': 'pressed_tuna_sushi_b_acdf8d67.jpg',
  'Tomate': 'tomato_sushi_roll_fu_fd817d50.jpg',
  
  // Pratos
  'Chicken Tradicional': 'breaded_chicken_stri_5299630f.jpg',
  'Peixe Tradicional': 'breaded_fish_fillet__2681f714.jpg',
  'Chicken Premium': 'chicken_plate_with_f_13755217.jpg',
  'Peixe Premium': 'fish_plate_tilapia_w_0f1f8621.jpg',
};

async function mapImagesToProducts() {
  console.log('🔍 Buscando produtos do banco de dados...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, image_url')
    .in('name', Object.keys(imageMapping));

  if (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    return;
  }

  if (!products || products.length === 0) {
    console.error('❌ Nenhum produto encontrado');
    return;
  }

  console.log(`📦 Encontrados ${products.length} produtos`);
  console.log('🖼️  Mapeando imagens...\n');

  const updates: string[] = [];
  let matched = 0;
  let notMatched = 0;

  for (const product of products as Product[]) {
    const imageName = imageMapping[product.name];
    
    if (imageName) {
      const imagePath = `/stock_images/${imageName}`;
      updates.push(`UPDATE products SET image_url = '${imagePath}' WHERE id = '${product.id}';`);
      console.log(`✅ ${product.name} → ${imageName}`);
      matched++;
    } else {
      console.log(`❌ ${product.name} → SEM IMAGEM`);
      notMatched++;
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Mapeados: ${matched}`);
  console.log(`   ❌ Não mapeados: ${notMatched}`);
  console.log(`\n📝 Script SQL gerado:\n`);
  console.log(updates.join('\n'));

  // Salvar script SQL
  const fs = require('fs');
  fs.writeFileSync('scripts/update-product-images.sql', updates.join('\n'));
  console.log('\n💾 Script salvo em scripts/update-product-images.sql');
}

mapImagesToProducts();
