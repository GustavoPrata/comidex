-- Populate Supabase Database with Complete Menu Structure
-- This script creates all groups, categories, items, and bridge table relationships

-- ============================================
-- 1. CREATE GROUPS 2 AND 3
-- ============================================
INSERT INTO groups (id, name, type, active) VALUES
  (2, 'Rodízio Tradicional', 'rodizio_tradicional', true),
  (3, 'À la Carte', 'a_la_carte', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  active = EXCLUDED.active;

-- ============================================
-- 2. CREATE ALL 30 UNIQUE CATEGORIES FOR GROUP 1
-- ============================================
INSERT INTO categories (name, group_id, sort_order, active, image_url) VALUES
  -- ENTRADAS
  ('Entradas', 1, 1, true, '/images/categories/entradas.jpg'),
  -- SUSHI CATEGORIES
  ('Sashimi', 1, 2, true, '/images/categories/sashimi.jpg'),
  ('Carpaccio', 1, 3, true, '/images/categories/carpaccio.jpg'),
  ('Niguiri', 1, 4, true, '/images/categories/niguiri.jpg'),
  ('Uramaki', 1, 5, true, '/images/categories/uramaki.jpg'),
  ('Acelgamaki', 1, 6, true, '/images/categories/acelgamaki.jpg'),
  ('Temaki', 1, 7, true, '/images/categories/temaki.jpg'),
  ('Joe', 1, 8, true, '/images/categories/joe.jpg'),
  ('Na Chapa', 1, 9, true, '/images/categories/nachapa.jpg'),
  ('Hot Roll', 1, 10, true, '/images/categories/hotroll.jpg'),
  ('Harumaki', 1, 11, true, '/images/categories/harumaki.jpg'),
  ('Hossomaki', 1, 12, true, '/images/categories/hossomaki.jpg'),
  ('Pastel', 1, 13, true, '/images/categories/pastel.jpg'),
  -- ESPECIALIDADES
  ('Especialidades MAAD', 1, 14, true, '/images/categories/maad.jpg'),
  ('Roll Especial', 1, 15, true, '/images/categories/roll-especial.jpg'),
  ('Lula', 1, 16, true, '/images/categories/lula.jpg'),
  ('Polvo', 1, 17, true, '/images/categories/polvo.jpg'),
  -- CHINESA
  ('Chinesa', 1, 18, true, '/images/categories/chinesa.jpg'),
  ('Yakissoba', 1, 19, true, '/images/categories/yakissoba.jpg'),
  -- PRATOS
  ('Poke', 1, 20, true, '/images/categories/poke.jpg'),
  ('Tempura', 1, 21, true, '/images/categories/tempura.jpg'),
  ('Katsu', 1, 22, true, '/images/categories/katsu.jpg'),
  ('Teppanyaki', 1, 23, true, '/images/categories/teppanyaki.jpg'),
  ('Especiais', 1, 24, true, '/images/categories/especiais.jpg'),
  -- BEBIDAS
  ('Bebidas', 1, 25, true, '/images/categories/bebidas.jpg'),
  ('Drinks', 1, 26, true, '/images/categories/drinks.jpg'),
  ('Sake', 1, 27, true, '/images/categories/sake.jpg'),
  -- SOBREMESAS
  ('Sobremesa', 1, 28, true, '/images/categories/sobremesa.jpg'),
  ('Kids', 1, 29, true, '/images/categories/kids.jpg'),
  ('Combo', 1, 30, true, '/images/categories/combo.jpg')
ON CONFLICT (name, group_id) DO NOTHING;

-- ============================================
-- 3. CREATE ALL 126 UNIQUE ITEMS FOR GROUP 1
-- ============================================

-- Entradas (8 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Entradas' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Ceviche', 'Peixe branco marinado no limão com cebola roxa'),
  ('Salada da Casa', 'Mix de folhas verdes, tomate cereja, pepino'),
  ('Sunomono', 'Salada japonesa de pepino agridoce'),
  ('Carpaccio Entrada', 'Finas fatias de salmão com molho cítrico'),
  ('Guioza', 'Pastel oriental grelhado ou frito'),
  ('Shimeji', 'Cogumelo shimeji na manteiga'),
  ('Vinagrete de Camarão', 'Vinagrete especial com camarão'),
  ('Ceviche Especial', 'Ceviche premium com frutos do mar')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Sashimi (8 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Sashimi' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Sashimi Salmão', 'Fatias de salmão fresco'),
  ('Sashimi Atum', 'Fatias de atum fresco'),
  ('Sashimi Peixe Branco', 'Fatias de peixe branco'),
  ('Sashimi Tilápia', 'Fatias de tilápia fresca'),
  ('Sashimi Polvo', 'Fatias de polvo'),
  ('Sashimi Camarão', 'Fatias de camarão'),
  ('Sashimi Barriga Salmão', 'Barriga de salmão grelhada'),
  ('Sashimi Misto', 'Mix de sashimis variados')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Carpaccio (8 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Carpaccio' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Carpaccio Salmão', 'Finas fatias de salmão com azeite e limão'),
  ('Carpaccio Atum', 'Finas fatias de atum com azeite e limão'),
  ('Carpaccio Peixe Branco', 'Finas fatias de peixe branco'),
  ('Carpaccio Salmão Trufado', 'Salmão com azeite trufado'),
  ('Carpaccio Polvo Trufado', 'Polvo com azeite trufado'),
  ('Carpaccio Camarão Trufado', 'Camarão com azeite trufado'),
  ('Carpaccio Misto', 'Mix de carpaccios'),
  ('Carpaccio Misto Trufado', 'Mix de carpaccios trufados')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Niguiri (12 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Niguiri' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Niguiri Salmão', 'Fatia de salmão sobre arroz'),
  ('Niguiri Atum', 'Fatia de atum sobre arroz'),
  ('Niguiri Peixe Branco', 'Fatia de peixe branco sobre arroz'),
  ('Niguiri Tilápia', 'Fatia de tilápia sobre arroz'),
  ('Niguiri Skin', 'Pele de salmão crocante sobre arroz'),
  ('Niguiri Camarão', 'Camarão sobre arroz'),
  ('Niguiri Polvo', 'Polvo sobre arroz'),
  ('Niguiri Salmão Grelhado', 'Salmão grelhado sobre arroz'),
  ('Niguiri Salmão Especial', 'Salmão especial com cobertura'),
  ('Niguiri Salmão Fry', 'Salmão empanado sobre arroz'),
  ('Niguiri Salmão Fry Ouro', 'Salmão empanado especial dourado'),
  ('Niguiri Kani', 'Kani sobre arroz')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Uramaki (15 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Uramaki' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Uramaki Salmão', 'Arroz por fora, salmão e cream cheese'),
  ('Uramaki Atum', 'Arroz por fora, atum e cream cheese'),
  ('Uramaki Califórnia', 'Arroz por fora, kani, pepino e manga'),
  ('Uramaki Camarão', 'Arroz por fora, camarão e cream cheese'),
  ('Uramaki Salmão Grelhado', 'Salmão grelhado, cream cheese'),
  ('Uramaki Filadélfia', 'Salmão, cream cheese, cebolinha'),
  ('Uramaki Skin', 'Pele de salmão crocante, cream cheese'),
  ('Uramaki Doritos', 'Doritos, cream cheese, salmão'),
  ('Uramaki Morango', 'Morango, cream cheese, salmão'),
  ('Uramaki Salmão Fry', 'Salmão empanado, cream cheese'),
  ('Uramaki Salmão Fry Ouro', 'Salmão empanado dourado especial'),
  ('Uramaki Camarão Fry', 'Camarão empanado, cream cheese'),
  ('Uramaki Camarão Fry Ouro', 'Camarão empanado dourado especial'),
  ('Uramaki Salmão Mel', 'Salmão com mel e cream cheese'),
  ('Uramaki Salmão Mel Fry', 'Salmão empanado com mel')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Acelgamaki (3 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Acelgamaki' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Acelgamaki Salmão', 'Enrolado em acelga com salmão'),
  ('Acelgamaki Atum', 'Enrolado em acelga com atum'),
  ('Acelgamaki Salmão Fry', 'Enrolado em acelga, salmão empanado')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Temaki (6 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Temaki' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Temaki Salmão', 'Cone de alga com salmão e cream cheese'),
  ('Temaki Atum', 'Cone de alga com atum e cream cheese'),
  ('Temaki Califórnia', 'Cone de alga com kani, manga, pepino'),
  ('Temaki Filadélfia', 'Cone de alga com salmão, cream cheese, cebolinha'),
  ('Temaki Skin Fry', 'Pele de salmão crocante empanada'),
  ('Temaki Hot Roll', 'Salmão empanado com cream cheese')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Joe (8 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Joe' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Joe Salmão', 'Salmão enrolado e grelhado'),
  ('Joe Atum', 'Atum enrolado e grelhado'),
  ('Joe Geleia Framboesa', 'Salmão com geleia de framboesa'),
  ('Joe Sugar', 'Salmão com açúcar cristal'),
  ('Joe Couve Fry', 'Salmão com couve crocante'),
  ('Joe Shimeji', 'Salmão com shimeji grelhado'),
  ('Joe Camarão', 'Camarão enrolado e grelhado'),
  ('Joe California', 'Kani enrolado e grelhado')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Na Chapa (8 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Na Chapa' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Chapa Salmão', 'Salmão grelhado na chapa'),
  ('Chapa Atum', 'Atum grelhado na chapa'),
  ('Chapa Shimeji', 'Shimeji grelhado na chapa'),
  ('Chapa Shitake', 'Shitake grelhado na chapa'),
  ('Chapa Mista', 'Mix de cogumelos na chapa'),
  ('Chapa Polvo', 'Polvo grelhado na chapa'),
  ('Chapa Camarão', 'Camarão grelhado na chapa'),
  ('Chapa Peixe Branco', 'Peixe branco grelhado na chapa')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Hot Roll (6 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Hot Roll' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Hot Roll Salmão', 'Salmão empanado com cream cheese'),
  ('Hot Roll Atum', 'Atum empanado com cream cheese'),
  ('Hot Roll Shimeji', 'Shimeji empanado, cream cheese'),
  ('Hot Roll Filadelfia', 'Salmão, cream cheese empanado'),
  ('Hot Roll Doritos', 'Doritos, salmão, cream cheese'),
  ('Hot Roll Camarão', 'Camarão empanado com cream cheese')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Harumaki (4 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Harumaki' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Harumaki Queijo', 'Massa crocante com queijo'),
  ('Harumaki Legumes', 'Massa crocante com legumes'),
  ('Harumaki Salmão', 'Massa crocante com salmão'),
  ('Harumaki Camarão', 'Massa crocante com camarão')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Hossomaki (4 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Hossomaki' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Hossomaki Salmão', 'Rolo fino de salmão'),
  ('Hossomaki Atum', 'Rolo fino de atum'),
  ('Hossomaki Pepino', 'Rolo fino de pepino'),
  ('Hossomaki Kanikama', 'Rolo fino de kanikama')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Pastel (4 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Pastel' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Pastel Queijo', 'Pastel frito recheado com queijo'),
  ('Pastel Salmão', 'Pastel frito recheado com salmão'),
  ('Pastel Camarão', 'Pastel frito recheado com camarão'),
  ('Pastel Bacalhau', 'Pastel frito recheado com bacalhau')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Especialidades MAAD (6 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Especialidades MAAD' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Salmão MAAD', 'Criação especial do chef com salmão'),
  ('Camarão MAAD', 'Criação especial do chef com camarão'),
  ('Atum MAAD', 'Criação especial do chef com atum'),
  ('Kaka MAAD', 'Criação especial do chef mista'),
  ('Ebi Hot Shake MAAD', 'Camarão especial apimentado'),
  ('Dubai MAAD', 'Combinado premium especial')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Roll Especial (4 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Roll Especial' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Roru Salmão', 'Roll especial de salmão'),
  ('Roru Atum', 'Roll especial de atum'),
  ('Roru Doritos', 'Roll especial com doritos'),
  ('Roru Tomato', 'Roll especial com tomate seco')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Lula (2 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Lula' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Lula Empanada', 'Anéis de lula empanados'),
  ('Lula Com Salmão', 'Lula recheada com salmão')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Polvo (2 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Polvo' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Polvo no gelo', 'Polvo servido sobre gelo'),
  ('Polvo Vinagrete', 'Polvo com vinagrete especial')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Chinesa (3 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Chinesa' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Frango Xadrez', 'Frango com legumes ao molho agridoce'),
  ('Carne Brócolis', 'Carne com brócolis ao molho especial'),
  ('Porco Agridoce', 'Lombo suíno ao molho agridoce')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Yakissoba (3 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Yakissoba' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Yakissoba Tradicional', 'Macarrão com legumes e proteína'),
  ('Yakissoba Frutos do Mar', 'Macarrão com frutos do mar'),
  ('Yakissoba Vegetariano', 'Macarrão com vegetais')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Poke (3 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Poke' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Poke Salmão', 'Bowl com salmão, arroz, vegetais'),
  ('Poke Atum', 'Bowl com atum, arroz, vegetais'),
  ('Poke Mix', 'Bowl com mix de peixes, arroz, vegetais')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Tempura (3 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Tempura' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Tempura Camarão', 'Camarão em massa leve e crocante'),
  ('Tempura Legumes', 'Legumes em massa leve e crocante'),
  ('Tempura Mix', 'Mix de tempurá de camarão e legumes')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Katsu (2 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Katsu' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Tonkatsu', 'Lombo suíno empanado'),
  ('Chicken Katsu', 'Frango empanado estilo japonês')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Teppanyaki (3 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Teppanyaki' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Salmão Teppan', 'Salmão grelhado no teppan'),
  ('Camarão Na Chapa', 'Camarão grelhado no teppan'),
  ('Atum Na Chapa', 'Atum grelhado no teppan')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Especiais (3 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Especiais' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Salmão Especial', 'Prato especial de salmão do chef'),
  ('Combinado Especial', 'Seleção especial do chef'),
  ('Omakase', 'Experiência gastronômica do chef')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Sobremesa (6 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Sobremesa' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Abacaxi Flambado', 'Abacaxi caramelizado no açúcar'),
  ('Banana Flambada', 'Banana caramelizada com canela'),
  ('Banana com Chocolate', 'Banana com calda de chocolate'),
  ('Morango com Chocolate', 'Morangos frescos com chocolate'),
  ('Doce de Leite', 'Sobremesa de doce de leite'),
  ('Nutella Roll', 'Roll doce com nutella')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- Kids (3 items)
INSERT INTO items (name, description, price, category_id, group_id, active, available, image_url)
SELECT 
  name, description, 0 as price,
  (SELECT id FROM categories WHERE name = 'Kids' AND group_id = 1 LIMIT 1),
  1, true, true, '/images/products/' || LOWER(REPLACE(name, ' ', '-')) || '.jpg'
FROM (VALUES
  ('Kids Temaki', 'Mini temaki de salmão'),
  ('Kids Salmão', 'Bolinhos de salmão empanados'),
  ('Kids Kanikama', 'Bolinhos de kanikama')
) AS items(name, description)
ON CONFLICT (name, category_id) DO NOTHING;

-- ============================================
-- 4. CONFIGURAR GROUP_CATEGORIES (link all categories to all groups)
-- ============================================
INSERT INTO group_categories (group_id, category_id, sort_order, is_available)
SELECT 
  g.id as group_id,
  c.id as category_id,
  c.sort_order,
  true
FROM groups g
CROSS JOIN categories c
WHERE g.id IN (1,2,3) AND c.group_id = 1
ON CONFLICT (group_id, category_id) DO NOTHING;

-- ============================================
-- 5. CONFIGURAR GROUP_ITEM_SETTINGS
-- ============================================

-- Premium Products List (excluded from Traditional)
WITH premium_products AS (
  SELECT ARRAY[
    'Vinagrete de Camarão', 'Ceviche Especial',
    'Sashimi Polvo', 'Sashimi Camarão',
    'Carpaccio Salmão Trufado', 'Carpaccio Polvo Trufado', 'Carpaccio Camarão Trufado', 'Carpaccio Misto Trufado',
    'Niguiri Camarão', 'Niguiri Polvo', 'Niguiri Salmão Especial', 'Niguiri Salmão Fry Ouro',
    'Uramaki Camarão', 'Uramaki Salmão Fry Ouro', 'Uramaki Camarão Fry', 'Uramaki Camarão Fry Ouro', 'Uramaki Salmão Mel Fry',
    'Acelgamaki Salmão Fry',
    'Joe Camarão', 'Joe California',
    'Chapa Mista', 'Chapa Polvo', 'Chapa Camarão',
    'Hot Roll Camarão',
    'Harumaki Camarão',
    'Pastel Camarão', 'Pastel Bacalhau',
    'Salmão MAAD', 'Camarão MAAD', 'Atum MAAD', 'Kaka MAAD', 'Ebi Hot Shake MAAD', 'Dubai MAAD',
    'Lula Com Salmão', 'Polvo no gelo', 'Yakissoba Frutos do Mar', 'Tempura Camarão', 'Roru Tomato',
    'Camarão Na Chapa', 'Atum Na Chapa', 'Salmão Especial'
  ] AS premium_names
)
-- Rodízio Tradicional (group 2) - apenas produtos não-premium
INSERT INTO group_item_settings (group_id, item_id, is_available, sort_order)
SELECT 
  2 as group_id,
  i.id,
  true,
  0
FROM items i
WHERE i.group_id = 1
  AND i.name NOT IN (SELECT unnest(premium_names) FROM premium_products)
ON CONFLICT (group_id, item_id) DO NOTHING;

-- À la Carte (group 3) - todos os produtos com preços
INSERT INTO group_item_settings (group_id, item_id, price_override, is_available, sort_order)
SELECT 
  3 as group_id,
  i.id,
  CASE 
    -- Define prices based on category and product name
    WHEN c.name = 'Entradas' THEN 
      CASE 
        WHEN i.name LIKE '%Especial%' THEN 28.90
        WHEN i.name LIKE '%Vinagrete%' THEN 24.90
        ELSE 18.90 + (RANDOM() * 6)
      END
    WHEN c.name = 'Sashimi' THEN
      CASE
        WHEN i.name LIKE '%Polvo%' THEN 42.90
        WHEN i.name LIKE '%Camarão%' THEN 39.90
        WHEN i.name LIKE '%Atum%' THEN 38.90
        WHEN i.name LIKE '%Salmão%' THEN 34.90
        ELSE 28.90 + (RANDOM() * 10)
      END
    WHEN c.name = 'Carpaccio' THEN 45.90 + (RANDOM() * 10)
    WHEN c.name = 'Niguiri' THEN
      CASE
        WHEN i.name LIKE '%Camarão%' OR i.name LIKE '%Polvo%' THEN 22.90
        WHEN i.name LIKE '%Especial%' OR i.name LIKE '%Ouro%' THEN 24.90
        ELSE 16.90 + (RANDOM() * 6)
      END
    WHEN c.name = 'Uramaki' THEN
      CASE
        WHEN i.name LIKE '%Camarão%' THEN 38.90
        WHEN i.name LIKE '%Ouro%' OR i.name LIKE '%Mel%' THEN 42.90
        ELSE 28.90 + (RANDOM() * 10)
      END
    WHEN c.name = 'Temaki' THEN
      CASE
        WHEN i.name LIKE '%Camarão%' THEN 26.90
        ELSE 19.90 + (RANDOM() * 6)
      END
    WHEN c.name = 'Joe' THEN
      CASE
        WHEN i.name LIKE '%Camarão%' THEN 34.90
        ELSE 24.90 + (RANDOM() * 8)
      END
    WHEN c.name = 'Na Chapa' THEN
      CASE
        WHEN i.name LIKE '%Camarão%' OR i.name LIKE '%Polvo%' THEN 48.90
        WHEN i.name LIKE '%Mista%' THEN 42.90
        ELSE 32.90 + (RANDOM() * 10)
      END
    WHEN c.name = 'Hot Roll' THEN
      CASE
        WHEN i.name LIKE '%Camarão%' THEN 36.90
        ELSE 26.90 + (RANDOM() * 8)
      END
    WHEN c.name = 'Sobremesa' THEN
      CASE
        WHEN i.name LIKE '%Nutella%' THEN 22.90
        WHEN i.name LIKE '%Flambad%' THEN 19.90
        ELSE 14.90 + (RANDOM() * 8)
      END
    WHEN c.name = 'Kids' THEN
      CASE
        WHEN i.name LIKE '%Prato%' THEN 24.90
        WHEN i.name LIKE '%Porção%' THEN 18.90
        ELSE 14.90 + (RANDOM() * 6)
      END
    WHEN c.name = 'Especialidades MAAD' THEN 59.90 + (RANDOM() * 20)
    WHEN c.name = 'Roll Especial' THEN 44.90 + (RANDOM() * 10)
    WHEN c.name = 'Lula' THEN 38.90 + (RANDOM() * 10)
    WHEN c.name = 'Polvo' THEN 52.90 + (RANDOM() * 10)
    WHEN c.name = 'Chinesa' THEN 36.90 + (RANDOM() * 10)
    WHEN c.name = 'Yakissoba' THEN 42.90 + (RANDOM() * 10)
    WHEN c.name = 'Poke' THEN 38.90 + (RANDOM() * 10)
    WHEN c.name = 'Tempura' THEN 45.90 + (RANDOM() * 10)
    WHEN c.name = 'Katsu' THEN 42.90 + (RANDOM() * 10)
    WHEN c.name = 'Teppanyaki' THEN 54.90 + (RANDOM() * 15)
    WHEN c.name = 'Especiais' THEN 69.90 + (RANDOM() * 20)
    ELSE 25.90 + (RANDOM() * 10)
  END::NUMERIC(10,2),
  true,
  0
FROM items i
JOIN categories c ON i.category_id = c.id
WHERE i.group_id = 1
ON CONFLICT (group_id, item_id) DO NOTHING;