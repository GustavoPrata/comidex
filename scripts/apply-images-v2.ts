import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlqvqrgjqowervexcosv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTE5NDUsImV4cCI6MjA3NjY4Nzk0NX0.MAZpzWMLZ8_fw4eiHAp3S6D3d6v18rDewMyX4-QMCBc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mapeamento corrigido com nomes exatos do banco
const imageMapping: Record<string, string> = {
  // Sashimi
  'Sashimi Salmão': '/stock_images/salmon_sashimi_fresh_6298ee3b.jpg',
  'Sashimi Atum': '/stock_images/tuna_sashimi_fresh_s_60e9be55.jpg',
  'Sashimi Peixe Prego/Limão': '/stock_images/white_fish_sashimi_l_34a8beb9.jpg',
  'Sashimi Polvo': '/stock_images/octopus_on_ice_raw_f_b7b94cd9.jpg',
  'Lula Com Salmão': '/stock_images/squid_with_salmon_ja_c35784c1.jpg',
  'Sashimi Tilápia': '/stock_images/tilapia_sashimi_whit_0e8d9d29.jpg',
  'Polvo no gelo': '/stock_images/octopus_on_ice_raw_f_b7b94cd9.jpg',
  
  // Niguiri
  'Niguiri Salmão': '/stock_images/salmon_nigiri_sushi__c20c63b6.jpg',
  'Niguiri Atum': '/stock_images/tuna_nigiri_sushi_ra_c8ca3709.jpg',
  'Niguiri Camarão': '/stock_images/shrimp_nigiri_sushi__2098d944.jpg',
  'Niguiri Polvo': '/stock_images/octopus_nigiri_sushi_65d5da48.jpg',
  'Niguiri Salmão Especial': '/stock_images/blowtorch_salmon_nig_c19d3055.jpg',
  'Niguiri Salmão Fry Ouro': '/stock_images/fried_salmon_nigiri__173d8ce1.jpg',
  
  // Uramaki California & Philadelphia
  'Uramaki California': '/stock_images/california_roll_drag_16c6a0c7.jpg',
  'Hot Roll Doritos': '/stock_images/doritos_crust_sushi__88c0c6dd.jpg',
  'Uramaki Filadélfia': '/stock_images/philadelphia_roll_cr_a6e59c29.jpg',
  'Uramaki Filadélfia Fry': '/stock_images/fried_philadelphia_r_547deb66.jpg',
  'Hot Roll Filadelfia': '/stock_images/fried_philadelphia_r_547deb66.jpg',
  'Harumaki Filadelfia': '/stock_images/philadelphia_roll_cr_a6e59c29.jpg',
  
  // Hot Roll
  'Hot Roll Camarão': '/stock_images/fried_shrimp_hot_rol_cda17c5e.jpg',
  'Hot Roll Shimeji': '/stock_images/fried_mushroom_hot_r_a89c97a3.jpg',
  'Ebi Hot Shake MAAD': '/stock_images/shrimp_salmon_hot_ro_2526622b.jpg',
  
  // Temaki
  'Temaki California': '/stock_images/california_hand_roll_0bfa86bf.jpg',
  'Temaki Camarão': '/stock_images/shrimp_temaki_hand_r_5ee0549d.jpg',
  'Temaki Atum': '/stock_images/tuna_temaki_hand_rol_51d06d58.jpg',
  'Temaki Hot Roll': '/stock_images/hot_roll_temaki_frie_e408f5a9.jpg',
  'Temaki Salmão Fry': '/stock_images/fried_salmon_temaki__af00b895.jpg',
  'Temaki Salmão': '/stock_images/california_hand_roll_0bfa86bf.jpg',
  
  // Uramaki
  'Uramaki Salmão': '/stock_images/salmon_uramaki_insid_0de0e9ab.jpg',
  'Uramaki Atum': '/stock_images/tuna_uramaki_inside__4bf41dda.jpg',
  'Uramaki Camarão': '/stock_images/shrimp_uramaki_insid_ae8f0a38.jpg',
  'Uramaki Salmão Fry': '/stock_images/fried_salmon_uramaki_a1ca3f5a.jpg',
  'Uramaki Salmão Fry Ouro': '/stock_images/fried_salmon_roll_go_1b863205.jpg',
  'Uramaki Camarão Fry Ouro': '/stock_images/fried_shrimp_roll_go_f8e6a8c1.jpg',
  'Uramaki Salmão Mel Fry': '/stock_images/fried_honey_salmon_r_1a4cfb2b.jpg',
  
  // Maki
  'Shakemaki': '/stock_images/salmon_maki_roll_sim_6698611a.jpg',
  'Tekamaki': '/stock_images/tuna_maki_roll_simpl_1eb8f921.jpg',
  'Kappamaki': '/stock_images/cucumber_roll_kappa__65e060ee.jpg',
  
  // Acelgamaki (Acelga)
  'Acelgamaki Salmão': '/stock_images/salmon_acelga_maki_r_90086583.jpg',
  'Acelgamaki Atum': '/stock_images/tuna_acelga_maki_rol_edd4b281.jpg',
  'Acelgamaki Salmão Fry': '/stock_images/fried_salmon_acelga__df367920.jpg',
  
  // Especiais MAAD
  'Salmão MAAD': '/stock_images/premium_salmon_sushi_991c082d.jpg',
  'Atum MAAD': '/stock_images/premium_tuna_sushi_s_3c423a25.jpg',
  'Camarão MAAD': '/stock_images/premium_shrimp_sushi_47dc31cb.jpg',
  'Dubai MAAD': '/stock_images/premium_special_sush_4f7e52da.jpg',
  'Kaka MAAD': '/stock_images/premium_special_sush_4f7e52da.jpg',
  'Fire MAAD': '/stock_images/flaming_sushi_roll_t_c6dc942f.jpg',
  
  // Harumaki (Spring Roll)
  'Harumaki Legumes': '/stock_images/vegetable_spring_rol_4469ae85.jpg',
  'Harumaki Queijo': '/stock_images/cheese_spring_roll_h_c432fa38.jpg',
  'Harumaki Romeu e Julieta': '/stock_images/spring_roll_guava_ch_b3ea38b7.jpg',
  
  // Gyoza/Guioza
  'Guioza Bovina': '/stock_images/pork_gyoza_dumpling__f93c05e1.jpg',
  'Guioza Suína': '/stock_images/pork_gyoza_dumpling__f93c05e1.jpg',
  
  // Carpaccio
  'Carpaccio Salmão Trufado': '/stock_images/carpaccio_thin_slice_8762a30a.jpg',
  'Carpaccio Camarão Trufado': '/stock_images/shrimp_carpaccio_tru_c57bc8c2.jpg',
  'Carpaccio Polvo Trufado': '/stock_images/octopus_carpaccio_tr_d9cdea14.jpg',
  'Carpaccio Misto Trufado': '/stock_images/mixed_seafood_carpac_ccea8179.jpg',
  
  // Ceviche
  'Ceviche': '/stock_images/ceviche_fresh_seafoo_123ccef6.jpg',
  'Ceviche Especial': '/stock_images/special_ceviche_prem_67d36e48.jpg',
  
  // Chapa (Teppanyaki/Grelhados)
  'Chapa Salmão': '/stock_images/grilled_salmon_teppa_dfaf67be.jpg',
  'Chapa Camarão': '/stock_images/grilled_shrimp_teppa_205e2a00.jpg',
  'Chapa Polvo': '/stock_images/grilled_octopus_tepp_211a1617.jpg',
  'Chapa Shimeji': '/stock_images/grilled_mushroom_tep_c3dda0a1.jpg',
  'Chapa Shitake': '/stock_images/grilled_shiitake_mus_e10e3b54.jpg',
  'Chapa Mista': '/stock_images/mixed_grilled_seafoo_b9d00249.jpg',
  
  // Tempura
  'Tempura Camarão': '/stock_images/shrimp_tempura_light_60f83a49.jpg',
  'Tempura Legumes': '/stock_images/vegetable_tempura_li_a6e6e442.jpg',
  
  // Yakisoba
  'Yakissoba Frango': '/stock_images/chicken_yakisoba_noo_68ea47df.jpg',
  'Yakissoba Frutos do Mar': '/stock_images/seafood_yakisoba_noo_c0aaf06d.jpg',
  'Yakissoba Carne': '/stock_images/seafood_yakisoba_noo_c0aaf06d.jpg',
  
  // Pastel
  'Pastel Camarão': '/stock_images/shrimp_pastel_fried__1585c143.jpg',
  'Pastel Bacalhau': '/stock_images/codfish_pastel_fried_ce31af6f.jpg',
  'Pastel Salmão': '/stock_images/shrimp_pastel_fried__1585c143.jpg',
  
  // Edamame
  'Edamame': '/stock_images/edamame_soybeans_jap_7a726b98.jpg',
  
  // Joe (Sobremesas/Fusion)
  'Hot Roll Doce': '/stock_images/sweet_dessert_sushi__22101638.jpg',
  'Joe Geleia Framboesa': '/stock_images/raspberry_jam_sushi__785f19eb.jpg',
  'Joe Couve Fry': '/stock_images/fried_kale_sushi_rol_923651e6.jpg',
  'Joe Sugar': '/stock_images/sugar_dessert_sushi__3cf37dc1.jpg',
  'Joe Shimeji': '/stock_images/mushroom_joe_sushi_s_a12eece7.jpg',
  'Joe Camarão': '/stock_images/shrimp_joy_sushi_fus_7e6cc111.jpg',
  'Joe Salmão': '/stock_images/premium_salmon_sushi_991c082d.jpg',
  
  // Outros especiais
  'Ishigo': '/stock_images/ishigo_japanese_arti_1c28d648.jpg',
  'Temaki Skin Fry': '/stock_images/crispy_salmon_skin_r_c4c0c282.jpg',
  'Hot Roll Salmão': '/stock_images/fried_salmon_uramaki_a1ca3f5a.jpg',
  'Batera Salmão': '/stock_images/pressed_salmon_sushi_64afa604.jpg',
  'Batera Atum': '/stock_images/pressed_tuna_sushi_b_acdf8d67.jpg',
  'Roru Tomato': '/stock_images/tomato_sushi_roll_fu_fd817d50.jpg',
  
  // Kibe (pode usar imagens de Gyoza ou Harumaki)
  'Kibe Atum': '/stock_images/pork_gyoza_dumpling__f93c05e1.jpg',
  
  // Banana Fry (sobremesas)
  'Banana Fry Doce De Leite': '/stock_images/sweet_dessert_sushi__22101638.jpg',
  'Banana Fry Nutella': '/stock_images/sweet_dessert_sushi__22101638.jpg',
  
  // Pratos
  'Porção Frango Empanado': '/stock_images/breaded_chicken_stri_5299630f.jpg',
  'Porção Tilápia Empanada': '/stock_images/breaded_fish_fillet__2681f714.jpg',
  'Prato Frango com Fritas': '/stock_images/chicken_plate_with_f_13755217.jpg',
  'Prato Tilápia com Fritas': '/stock_images/fish_plate_tilapia_w_0f1f8621.jpg',
};

async function applyImages() {
  console.log('🎨 Iniciando atualização de imagens dos produtos (v2)...\n');
  
  let updated = 0;
  let errors = 0;
  let notFound = 0;
  let skipped = 0;

  // Buscar todos os itens primeiro
  const { data: allItems, error: fetchError } = await supabase
    .from('items')
    .select('id, name, image');

  if (fetchError) {
    console.error('❌ Erro ao buscar itens:', fetchError);
    return;
  }

  console.log(`📦 Total de itens no banco: ${allItems?.length || 0}\n`);

  for (const item of allItems || []) {
    const imagePath = imageMapping[item.name];
    
    if (!imagePath) {
      // Não temos imagem para este produto
      skipped++;
      continue;
    }

    // Só atualizar se não tiver imagem ou se a imagem atual não for uma das novas
    if (item.image && item.image.startsWith('/stock_images/')) {
      console.log(`⏭️  Pulando "${item.name}" (já tem imagem)`);
      continue;
    }

    try {
      const { error } = await supabase
        .from('items')
        .update({ image: imagePath })
        .eq('id', item.id);

      if (error) {
        console.error(`❌ Erro ao atualizar "${item.name}":`, error.message);
        errors++;
      } else {
        console.log(`✅ ${item.name} → ${imagePath}`);
        updated++;
      }
    } catch (err) {
      console.error(`❌ Exceção ao atualizar "${item.name}":`, err);
      errors++;
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Atualizados: ${updated}`);
  console.log(`   ⏭️  Pulados (sem mapeamento): ${skipped}`);
  console.log(`   ❌ Erros: ${errors}`);
  console.log(`\n🎉 Processo concluído!`);
}

applyImages();
