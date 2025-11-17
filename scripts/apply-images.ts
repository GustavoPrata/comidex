import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Use the same pattern as other scripts
const SUPABASE_URL = 'https://wlqvqrgjqowervexcosv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTE5NDUsImV4cCI6MjA3NjY4Nzk0NX0.MAZpzWMLZ8_fw4eiHAp3S6D3d6v18rDewMyX4-QMCBc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mapeamento direto: nome do produto -> caminho da imagem
const imageMapping: Record<string, string> = {
  // Sashimi
  'Sashimi Salmão': '/stock_images/salmon_sashimi_fresh_6298ee3b.jpg',
  'Sashimi Atum': '/stock_images/tuna_sashimi_fresh_s_60e9be55.jpg',
  'Sashimi Peixe Branco': '/stock_images/white_fish_sashimi_l_34a8beb9.jpg',
  'Sashimi Polvo': '/stock_images/octopus_on_ice_raw_f_b7b94cd9.jpg',
  'Sashimi Lula c/ Salmão': '/stock_images/squid_with_salmon_ja_c35784c1.jpg',
  'Sashimi Tilápia': '/stock_images/tilapia_sashimi_whit_0e8d9d29.jpg',
  
  // Niguiri
  'Niguiri Salmão': '/stock_images/salmon_nigiri_sushi__c20c63b6.jpg',
  'Niguiri Atum': '/stock_images/tuna_nigiri_sushi_ra_c8ca3709.jpg',
  'Niguiri Camarão': '/stock_images/shrimp_nigiri_sushi__2098d944.jpg',
  'Niguiri Polvo': '/stock_images/octopus_nigiri_sushi_65d5da48.jpg',
  'Niguiri Salmão Especial': '/stock_images/blowtorch_salmon_nig_c19d3055.jpg',
  'Niguiri Salmão Frito c/ Folha de Ouro': '/stock_images/fried_salmon_nigiri__173d8ce1.jpg',
  
  // California Roll
  'California Roll': '/stock_images/california_roll_drag_16c6a0c7.jpg',
  'California Roll c/ Doritos': '/stock_images/doritos_crust_sushi__88c0c6dd.jpg',
  
  // Philadelphia
  'Philadelphia': '/stock_images/philadelphia_roll_cr_a6e59c29.jpg',
  'Philadelphia Frito': '/stock_images/fried_philadelphia_r_547deb66.jpg',
  
  // Hot Roll
  'Hot Roll Camarão': '/stock_images/fried_shrimp_hot_rol_cda17c5e.jpg',
  'Hot Roll Shimeji': '/stock_images/fried_mushroom_hot_r_a89c97a3.jpg',
  'Hot Roll Camarão + Salmão': '/stock_images/shrimp_salmon_hot_ro_2526622b.jpg',
  
  // Temaki
  'Temaki California': '/stock_images/california_hand_roll_0bfa86bf.jpg',
  'Temaki Camarão': '/stock_images/shrimp_temaki_hand_r_5ee0549d.jpg',
  'Temaki Atum': '/stock_images/tuna_temaki_hand_rol_51d06d58.jpg',
  'Temaki Hot': '/stock_images/hot_roll_temaki_frie_e408f5a9.jpg',
  'Temaki Salmão Frito': '/stock_images/fried_salmon_temaki__af00b895.jpg',
  
  // Uramaki
  'Uramaki Salmão': '/stock_images/salmon_uramaki_insid_0de0e9ab.jpg',
  'Uramaki Atum': '/stock_images/tuna_uramaki_inside__4bf41dda.jpg',
  'Uramaki Camarão': '/stock_images/shrimp_uramaki_insid_ae8f0a38.jpg',
  'Uramaki Salmão Frito': '/stock_images/fried_salmon_uramaki_a1ca3f5a.jpg',
  
  // Maki
  'Maki Salmão': '/stock_images/salmon_maki_roll_sim_6698611a.jpg',
  'Maki Atum': '/stock_images/tuna_maki_roll_simpl_1eb8f921.jpg',
  'Maki Pepino': '/stock_images/cucumber_roll_kappa__65e060ee.jpg',
  
  // Acelga (Maki com vegetais)
  'Acelga Salmão': '/stock_images/salmon_acelga_maki_r_90086583.jpg',
  'Acelga Atum': '/stock_images/tuna_acelga_maki_rol_edd4b281.jpg',
  'Acelga Salmão Frito': '/stock_images/fried_salmon_acelga__df367920.jpg',
  
  // Especiais
  'Especial Salmão': '/stock_images/premium_salmon_sushi_991c082d.jpg',
  'Especial Atum': '/stock_images/premium_tuna_sushi_s_3c423a25.jpg',
  'Especial Camarão': '/stock_images/premium_shrimp_sushi_47dc31cb.jpg',
  'Especial Premium': '/stock_images/premium_special_sush_4f7e52da.jpg',
  
  // Harumaki (Spring Roll)
  'Harumaki Legumes': '/stock_images/vegetable_spring_rol_4469ae85.jpg',
  'Harumaki Queijo': '/stock_images/cheese_spring_roll_h_c432fa38.jpg',
  'Harumaki Goiaba c/ Queijo': '/stock_images/spring_roll_guava_ch_b3ea38b7.jpg',
  
  // Gyoza
  'Guioza': '/stock_images/pork_gyoza_dumpling__f93c05e1.jpg',
  
  // Carpaccio
  'Carpaccio': '/stock_images/carpaccio_thin_slice_8762a30a.jpg',
  'Carpaccio Camarão': '/stock_images/shrimp_carpaccio_tru_c57bc8c2.jpg',
  'Carpaccio Polvo': '/stock_images/octopus_carpaccio_tr_d9cdea14.jpg',
  'Carpaccio Misto': '/stock_images/mixed_seafood_carpac_ccea8179.jpg',
  
  // Ceviche
  'Ceviche': '/stock_images/ceviche_fresh_seafoo_123ccef6.jpg',
  'Ceviche Especial': '/stock_images/special_ceviche_prem_67d36e48.jpg',
  
  // Teppanyaki (Grelhados)
  'Teppan Salmão': '/stock_images/grilled_salmon_teppa_dfaf67be.jpg',
  'Teppan Camarão': '/stock_images/grilled_shrimp_teppa_205e2a00.jpg',
  'Teppan Polvo': '/stock_images/grilled_octopus_tepp_211a1617.jpg',
  'Teppan Shimeji': '/stock_images/grilled_mushroom_tep_c3dda0a1.jpg',
  'Teppan Shiitake': '/stock_images/grilled_shiitake_mus_e10e3b54.jpg',
  'Teppan Frutos do Mar': '/stock_images/mixed_grilled_seafoo_b9d00249.jpg',
  
  // Tempurá
  'Tempurá Camarão': '/stock_images/shrimp_tempura_light_60f83a49.jpg',
  'Tempurá Legumes': '/stock_images/vegetable_tempura_li_a6e6e442.jpg',
  
  // Yakisoba
  'Yakisoba Frango': '/stock_images/chicken_yakisoba_noo_68ea47df.jpg',
  'Yakisoba Frutos do Mar': '/stock_images/seafood_yakisoba_noo_c0aaf06d.jpg',
  
  // Pastel
  'Pastel Camarão': '/stock_images/shrimp_pastel_fried__1585c143.jpg',
  'Pastel Bacalhau': '/stock_images/codfish_pastel_fried_ce31af6f.jpg',
  
  // Edamame
  'Edamame': '/stock_images/edamame_soybeans_jap_7a726b98.jpg',
  
  // Sobremesas/Fusion
  'Hot Doce': '/stock_images/sweet_dessert_sushi__22101638.jpg',
  'Hot Geleia': '/stock_images/raspberry_jam_sushi__785f19eb.jpg',
  'Hot Couve': '/stock_images/fried_kale_sushi_rol_923651e6.jpg',
  'Hot Açúcar': '/stock_images/sugar_dessert_sushi__3cf37dc1.jpg',
  'Joe Shimeji': '/stock_images/mushroom_joe_sushi_s_a12eece7.jpg',
  'Joy Camarão': '/stock_images/shrimp_joy_sushi_fus_7e6cc111.jpg',
  
  // Outros especiais
  'Ishigo': '/stock_images/ishigo_japanese_arti_1c28d648.jpg',
  'Hot Mel': '/stock_images/fried_honey_salmon_r_1a4cfb2b.jpg',
  'Hot Camarão c/ Folha de Ouro': '/stock_images/fried_shrimp_roll_go_f8e6a8c1.jpg',
  'Hot Salmão c/ Folha de Ouro': '/stock_images/fried_salmon_roll_go_1b863205.jpg',
  'Skin Salmão': '/stock_images/crispy_salmon_skin_r_c4c0c282.jpg',
  'Battera Salmão': '/stock_images/pressed_salmon_sushi_64afa604.jpg',
  'Battera Atum': '/stock_images/pressed_tuna_sushi_b_acdf8d67.jpg',
  'Tomate': '/stock_images/tomato_sushi_roll_fu_fd817d50.jpg',
  
  // Pratos
  'Chicken Tradicional': '/stock_images/breaded_chicken_stri_5299630f.jpg',
  'Peixe Tradicional': '/stock_images/breaded_fish_fillet__2681f714.jpg',
  'Chicken Premium': '/stock_images/chicken_plate_with_f_13755217.jpg',
  'Peixe Premium': '/stock_images/fish_plate_tilapia_w_0f1f8621.jpg',
};

async function applyImages() {
  console.log('🎨 Iniciando atualização de imagens dos produtos...\n');
  
  let updated = 0;
  let errors = 0;
  let notFound = 0;

  for (const [productName, imagePath] of Object.entries(imageMapping)) {
    try {
      const { data, error } = await supabase
        .from('items')
        .update({ image: imagePath })
        .eq('name', productName)
        .select();

      if (error) {
        console.error(`❌ Erro ao atualizar "${productName}":`, error.message);
        errors++;
      } else if (!data || data.length === 0) {
        console.log(`⚠️  Produto não encontrado: "${productName}"`);
        notFound++;
      } else {
        console.log(`✅ ${productName} → ${imagePath}`);
        updated++;
      }
    } catch (err) {
      console.error(`❌ Exceção ao atualizar "${productName}":`, err);
      errors++;
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Atualizados: ${updated}`);
  console.log(`   ⚠️  Não encontrados: ${notFound}`);
  console.log(`   ❌ Erros: ${errors}`);
  console.log(`\n🎉 Processo concluído!`);
}

applyImages();
