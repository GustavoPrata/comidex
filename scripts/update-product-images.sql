-- Script para atualizar os produtos com os caminhos das imagens baixadas
-- Gerado automaticamente baseado nos 101 produtos únicos

-- Sashimi
UPDATE products SET image_url = '/stock_images/salmon_sashimi_fresh_6298ee3b.jpg' WHERE name = 'Sashimi Salmão';
UPDATE products SET image_url = '/stock_images/tuna_sashimi_fresh_s_60e9be55.jpg' WHERE name = 'Sashimi Atum';
UPDATE products SET image_url = '/stock_images/white_fish_sashimi_l_34a8beb9.jpg' WHERE name = 'Sashimi Peixe Branco';
UPDATE products SET image_url = '/stock_images/octopus_on_ice_raw_f_b7b94cd9.jpg' WHERE name = 'Sashimi Polvo';
UPDATE products SET image_url = '/stock_images/squid_with_salmon_ja_c35784c1.jpg' WHERE name = 'Sashimi Lula c/ Salmão';
UPDATE products SET image_url = '/stock_images/tilapia_sashimi_whit_0e8d9d29.jpg' WHERE name = 'Sashimi Tilápia';

-- Niguiri
UPDATE products SET image_url = '/stock_images/salmon_nigiri_sushi__c20c63b6.jpg' WHERE name = 'Niguiri Salmão';
UPDATE products SET image_url = '/stock_images/tuna_nigiri_sushi_ra_c8ca3709.jpg' WHERE name = 'Niguiri Atum';
UPDATE products SET image_url = '/stock_images/shrimp_nigiri_sushi__2098d944.jpg' WHERE name = 'Niguiri Camarão';
UPDATE products SET image_url = '/stock_images/octopus_nigiri_sushi_65d5da48.jpg' WHERE name = 'Niguiri Polvo';
UPDATE products SET image_url = '/stock_images/blowtorch_salmon_nig_c19d3055.jpg' WHERE name = 'Niguiri Salmão Especial';
UPDATE products SET image_url = '/stock_images/fried_salmon_nigiri__173d8ce1.jpg' WHERE name = 'Niguiri Salmão Frito c/ Folha de Ouro';

-- California Roll
UPDATE products SET image_url = '/stock_images/california_roll_drag_16c6a0c7.jpg' WHERE name = 'California Roll';
UPDATE products SET image_url = '/stock_images/doritos_crust_sushi__88c0c6dd.jpg' WHERE name = 'California Roll c/ Doritos';

-- Philadelphia
UPDATE products SET image_url = '/stock_images/philadelphia_roll_cr_a6e59c29.jpg' WHERE name = 'Philadelphia';
UPDATE products SET image_url = '/stock_images/fried_philadelphia_r_547deb66.jpg' WHERE name = 'Philadelphia Frito';

-- Hot Roll
UPDATE products SET image_url = '/stock_images/fried_shrimp_hot_rol_cda17c5e.jpg' WHERE name = 'Hot Roll Camarão';
UPDATE products SET image_url = '/stock_images/fried_mushroom_hot_r_a89c97a3.jpg' WHERE name = 'Hot Roll Shimeji';
UPDATE products SET image_url = '/stock_images/shrimp_salmon_hot_ro_2526622b.jpg' WHERE name = 'Hot Roll Camarão + Salmão';

-- Temaki
UPDATE products SET image_url = '/stock_images/california_hand_roll_0bfa86bf.jpg' WHERE name = 'Temaki California';
UPDATE products SET image_url = '/stock_images/shrimp_temaki_hand_r_5ee0549d.jpg' WHERE name = 'Temaki Camarão';
UPDATE products SET image_url = '/stock_images/tuna_temaki_hand_rol_51d06d58.jpg' WHERE name = 'Temaki Atum';
UPDATE products SET image_url = '/stock_images/hot_roll_temaki_frie_e408f5a9.jpg' WHERE name = 'Temaki Hot';
UPDATE products SET image_url = '/stock_images/fried_salmon_temaki__af00b895.jpg' WHERE name = 'Temaki Salmão Frito';

-- Uramaki
UPDATE products SET image_url = '/stock_images/salmon_uramaki_insid_0de0e9ab.jpg' WHERE name = 'Uramaki Salmão';
UPDATE products SET image_url = '/stock_images/tuna_uramaki_inside__4bf41dda.jpg' WHERE name = 'Uramaki Atum';
UPDATE products SET image_url = '/stock_images/shrimp_uramaki_insid_ae8f0a38.jpg' WHERE name = 'Uramaki Camarão';
UPDATE products SET image_url = '/stock_images/fried_salmon_uramaki_a1ca3f5a.jpg' WHERE name = 'Uramaki Salmão Frito';

-- Maki
UPDATE products SET image_url = '/stock_images/salmon_maki_roll_sim_6698611a.jpg' WHERE name = 'Maki Salmão';
UPDATE products SET image_url = '/stock_images/tuna_maki_roll_simpl_1eb8f921.jpg' WHERE name = 'Maki Atum';
UPDATE products SET image_url = '/stock_images/cucumber_roll_kappa__65e060ee.jpg' WHERE name = 'Maki Pepino';

-- Acelga (Maki com vegetais)
UPDATE products SET image_url = '/stock_images/salmon_acelga_maki_r_90086583.jpg' WHERE name = 'Acelga Salmão';
UPDATE products SET image_url = '/stock_images/tuna_acelga_maki_rol_edd4b281.jpg' WHERE name = 'Acelga Atum';
UPDATE products SET image_url = '/stock_images/fried_salmon_acelga__df367920.jpg' WHERE name = 'Acelga Salmão Frito';

-- Especiais
UPDATE products SET image_url = '/stock_images/premium_salmon_sushi_991c082d.jpg' WHERE name = 'Especial Salmão';
UPDATE products SET image_url = '/stock_images/premium_tuna_sushi_s_3c423a25.jpg' WHERE name = 'Especial Atum';
UPDATE products SET image_url = '/stock_images/premium_shrimp_sushi_47dc31cb.jpg' WHERE name = 'Especial Camarão';
UPDATE products SET image_url = '/stock_images/premium_special_sush_4f7e52da.jpg' WHERE name = 'Especial Premium';

-- Harumaki (Spring Roll)
UPDATE products SET image_url = '/stock_images/vegetable_spring_rol_4469ae85.jpg' WHERE name = 'Harumaki Legumes';
UPDATE products SET image_url = '/stock_images/cheese_spring_roll_h_c432fa38.jpg' WHERE name = 'Harumaki Queijo';
UPDATE products SET image_url = '/stock_images/spring_roll_guava_ch_b3ea38b7.jpg' WHERE name = 'Harumaki Goiaba c/ Queijo';

-- Gyoza
UPDATE products SET image_url = '/stock_images/pork_gyoza_dumpling__f93c05e1.jpg' WHERE name = 'Guioza';

-- Carpaccio
UPDATE products SET image_url = '/stock_images/carpaccio_thin_slice_8762a30a.jpg' WHERE name = 'Carpaccio';
UPDATE products SET image_url = '/stock_images/shrimp_carpaccio_tru_c57bc8c2.jpg' WHERE name = 'Carpaccio Camarão';
UPDATE products SET image_url = '/stock_images/octopus_carpaccio_tr_d9cdea14.jpg' WHERE name = 'Carpaccio Polvo';
UPDATE products SET image_url = '/stock_images/mixed_seafood_carpac_ccea8179.jpg' WHERE name = 'Carpaccio Misto';

-- Ceviche
UPDATE products SET image_url = '/stock_images/ceviche_fresh_seafoo_123ccef6.jpg' WHERE name = 'Ceviche';
UPDATE products SET image_url = '/stock_images/special_ceviche_prem_67d36e48.jpg' WHERE name = 'Ceviche Especial';

-- Teppanyaki (Grelhados)
UPDATE products SET image_url = '/stock_images/grilled_salmon_teppa_dfaf67be.jpg' WHERE name = 'Teppan Salmão';
UPDATE products SET image_url = '/stock_images/grilled_shrimp_teppa_205e2a00.jpg' WHERE name = 'Teppan Camarão';
UPDATE products SET image_url = '/stock_images/grilled_octopus_tepp_211a1617.jpg' WHERE name = 'Teppan Polvo';
UPDATE products SET image_url = '/stock_images/grilled_mushroom_tep_c3dda0a1.jpg' WHERE name = 'Teppan Shimeji';
UPDATE products SET image_url = '/stock_images/grilled_shiitake_mus_e10e3b54.jpg' WHERE name = 'Teppan Shiitake';
UPDATE products SET image_url = '/stock_images/mixed_grilled_seafoo_b9d00249.jpg' WHERE name = 'Teppan Frutos do Mar';

-- Tempurá
UPDATE products SET image_url = '/stock_images/shrimp_tempura_light_60f83a49.jpg' WHERE name = 'Tempurá Camarão';
UPDATE products SET image_url = '/stock_images/vegetable_tempura_li_a6e6e442.jpg' WHERE name = 'Tempurá Legumes';

-- Yakisoba
UPDATE products SET image_url = '/stock_images/chicken_yakisoba_noo_68ea47df.jpg' WHERE name = 'Yakisoba Frango';
UPDATE products SET image_url = '/stock_images/seafood_yakisoba_noo_c0aaf06d.jpg' WHERE name = 'Yakisoba Frutos do Mar';

-- Pastel
UPDATE products SET image_url = '/stock_images/shrimp_pastel_fried__1585c143.jpg' WHERE name = 'Pastel Camarão';
UPDATE products SET image_url = '/stock_images/codfish_pastel_fried_ce31af6f.jpg' WHERE name = 'Pastel Bacalhau';

-- Edamame
UPDATE products SET image_url = '/stock_images/edamame_soybeans_jap_7a726b98.jpg' WHERE name = 'Edamame';

-- Sobremesas/Fusion
UPDATE products SET image_url = '/stock_images/sweet_dessert_sushi__22101638.jpg' WHERE name = 'Hot Doce';
UPDATE products SET image_url = '/stock_images/raspberry_jam_sushi__785f19eb.jpg' WHERE name = 'Hot Geleia';
UPDATE products SET image_url = '/stock_images/fried_kale_sushi_rol_923651e6.jpg' WHERE name = 'Hot Couve';
UPDATE products SET image_url = '/stock_images/sugar_dessert_sushi__3cf37dc1.jpg' WHERE name = 'Hot Açúcar';
UPDATE products SET image_url = '/stock_images/mushroom_joe_sushi_s_a12eece7.jpg' WHERE name = 'Joe Shimeji';
UPDATE products SET image_url = '/stock_images/shrimp_joy_sushi_fus_7e6cc111.jpg' WHERE name = 'Joy Camarão';

-- Outros especiais
UPDATE products SET image_url = '/stock_images/ishigo_japanese_arti_1c28d648.jpg' WHERE name = 'Ishigo';
UPDATE products SET image_url = '/stock_images/fried_honey_salmon_r_1a4cfb2b.jpg' WHERE name = 'Hot Mel';
UPDATE products SET image_url = '/stock_images/fried_shrimp_roll_go_f8e6a8c1.jpg' WHERE name = 'Hot Camarão c/ Folha de Ouro';
UPDATE products SET image_url = '/stock_images/fried_salmon_roll_go_1b863205.jpg' WHERE name = 'Hot Salmão c/ Folha de Ouro';
UPDATE products SET image_url = '/stock_images/crispy_salmon_skin_r_c4c0c282.jpg' WHERE name = 'Skin Salmão';
UPDATE products SET image_url = '/stock_images/pressed_salmon_sushi_64afa604.jpg' WHERE name = 'Battera Salmão';
UPDATE products SET image_url = '/stock_images/pressed_tuna_sushi_b_acdf8d67.jpg' WHERE name = 'Battera Atum';
UPDATE products SET image_url = '/stock_images/tomato_sushi_roll_fu_fd817d50.jpg' WHERE name = 'Tomate';

-- Pratos
UPDATE products SET image_url = '/stock_images/breaded_chicken_stri_5299630f.jpg' WHERE name = 'Chicken Tradicional';
UPDATE products SET image_url = '/stock_images/breaded_fish_fillet__2681f714.jpg' WHERE name = 'Peixe Tradicional';
UPDATE products SET image_url = '/stock_images/chicken_plate_with_f_13755217.jpg' WHERE name = 'Chicken Premium';
UPDATE products SET image_url = '/stock_images/fish_plate_tilapia_w_0f1f8621.jpg' WHERE name = 'Peixe Premium';
