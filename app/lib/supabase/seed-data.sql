-- Seed data for ComideX Restaurant System
-- This file contains essential data to get started

-- Insert Groups
INSERT INTO groups (id, name, description, price, type, active, sort_order, icon_id) VALUES
(1, 'Premium', 'Itens inclusos no rodízio premium', 189.00, 'rodizio', true, 2, NULL),
(4, 'Tradicional', 'Itens inclusos no rodízio tradicional', 129.00, 'rodizio', true, 1, NULL),
(5, 'À la Carte', 'Itens vendidos separadamente', NULL, 'a_la_carte', true, 3, NULL),
(16, 'Bebidas', NULL, NULL, 'bebidas', true, 4, NULL),
(17, 'Bebidas Alcoólicas', NULL, NULL, 'bebidas', true, 5, NULL),
(18, 'Vinhos', NULL, NULL, 'bebidas', true, 6, NULL)
ON CONFLICT (id) DO NOTHING;

-- Insert Icons
INSERT INTO icons (id, name, slug, file_path, category, active, sort_order) VALUES
(38, 'Tradicional', 'tradicional', 'icons/tradicional.svg', 'general', true, 1),
(40, 'Premium', 'premium', 'icons/premium.svg', 'general', true, 0),
(53, 'A la carte', 'a-la-carte', 'icons/a-la-carte.svg', 'general', true, 2),
(54, 'Vinhos', 'vinhos', 'icons/vinhos.svg', 'drinks', true, 3),
(55, 'Bebidas', 'bebidas', 'icons/bebidas.svg', 'drinks', true, 4),
(56, 'Bebidas Alcoólicas', 'bebidas-alcoolicas', 'icons/bebidas-alcoolicas.svg', 'drinks', true, 5)
ON CONFLICT (id) DO NOTHING;

-- Update groups with icon_id
UPDATE groups SET icon_id = 40 WHERE id = 1;
UPDATE groups SET icon_id = 38 WHERE id = 4;
UPDATE groups SET icon_id = 53 WHERE id = 5;
UPDATE groups SET icon_id = 55 WHERE id = 16;
UPDATE groups SET icon_id = 56 WHERE id = 17;
UPDATE groups SET icon_id = 54 WHERE id = 18;

-- Insert Categories for Premium Group
INSERT INTO categories (id, name, description, active, sort_order, group_id) VALUES
(77, 'Entradas', 'Aberturas frescas e saborosas para começar sua experiência', true, 1, 1),
(79, 'Sashimis', 'Fatias delicadas de peixes frescos, um clássico japonês', true, 2, 1),
(80, 'Carpaccios', 'Finas lâminas de peixe com toques cítricos e frescos', true, 3, 1),
(81, 'Niguiris', 'Bolinhos de arroz com peixes frescos, simples e elegantes', true, 4, 1),
(82, 'Uramakis', 'Rolos invertidos com recheios criativos e saborosos', true, 5, 1),
(83, 'Acelgamakis', 'Rolos especiais com ingredientes frescos e únicos', true, 6, 1),
(84, 'Hossomakis', 'Rolinhos tradicionais, pequenos e cheios de sabor', true, 7, 1),
(85, 'Temakis', 'Cones de alga recheados com sabores autênticos', true, 8, 1),
(86, 'Dyos', 'Duplas de sushi com combinações surpreendentes', true, 9, 1),
(87, 'Chapas', 'Pratos quentes grelhados com toque oriental', true, 10, 1),
(88, 'Hot Rolls', 'Rolos fritos, crocantes e irresistíveis', true, 11, 1),
(89, 'Harumakis', 'Rolinhos primavera com recheios leves e crocantes', true, 12, 1),
(90, 'Estilo Pasteis', 'Pasteis com inspiração japonesa, leves e saborosos', true, 13, 1),
(91, 'Especial MAAD', 'Criações exclusivas do chef, uma explosão de sabores', true, 14, 1),
(92, 'Outros', 'Opções variadas para todos os gostos', true, 15, 1),
(93, 'Sobremesas', 'Doces delicados para finalizar sua refeição', true, 16, 1),
(94, 'Kids', 'Pratos divertidos para os pequenos', true, 17, 1)
ON CONFLICT (id) DO NOTHING;

-- Insert Categories for Traditional Group
INSERT INTO categories (id, name, description, active, sort_order, group_id) VALUES
(18, 'Entradas', 'Aberturas frescas e saborosas para começar sua experiência', true, 1, 4),
(60, 'Sashimis', 'Fatias delicadas de peixes frescos, um clássico japonês', true, 2, 4),
(61, 'Carpaccios', 'Finas lâminas de peixe com toques cítricos e frescos', true, 4, 4),
(62, 'Niguiris', 'Bolinhos de arroz com peixes frescos, simples e elegantes', true, 3, 4),
(63, 'Uramakis', 'Rolos invertidos com recheios criativos e saborosos', true, 5, 4),
(65, 'Acelgamakis', 'Rolos especiais com ingredientes frescos e únicos', true, 6, 4),
(66, 'Hossomakis', 'Rolinhos tradicionais, pequenos e cheios de sabor', true, 7, 4),
(67, 'Temakis', 'Cones de alga recheados com sabores autênticos', true, 8, 4),
(68, 'Dyos', 'Duplas de sushi com combinações surpreendentes', true, 9, 4),
(69, 'Chapas', 'Pratos quentes grelhados com toque oriental', true, 10, 4),
(70, 'Hot Rolls', 'Rolos fritos, crocantes e irresistíveis', true, 11, 4),
(71, 'Harumakis', 'Rolinhos primavera com recheios leves e crocantes', true, 12, 4),
(72, 'Estilo Pasteis', 'Pasteis com inspiração japonesa, leves e saborosos', true, 13, 4),
(73, 'Especial MAAD', 'Criações exclusivas do chef, uma explosão de sabores', true, 14, 4),
(74, 'Outros', 'Opções variadas para todos os gostos', true, 15, 4),
(75, 'Sobremesas', 'Doces delicados para finalizar sua refeição', true, 16, 4),
(76, 'Kids', 'Pratos divertidos para os pequenos', true, 17, 4)
ON CONFLICT (id) DO NOTHING;

-- Insert Additional Categories
INSERT INTO additional_categories (id, name, description, color, sort_order, active) VALUES
(12, 'Refrigerante', NULL, '#0055ff', 2, true),
(21, 'Vodka', NULL, '#57ff0f', 1, true),
(22, 'Teste', NULL, '#6b7280', 3, true)
ON CONFLICT (id) DO NOTHING;

-- Insert Additionals
INSERT INTO additionals (id, name, description, price, active, additional_category_id, sort_order) VALUES
(7, 'Gelo', 'Para refrescar', 0.00, true, 12, 1),
(12, 'Limão', 'Frescancia pura', 0.00, true, 12, 3),
(13, 'Copo Adicional', 'Peça um copo novo', 0.00, true, 12, 2),
(14, 'Smirnoff', 'Vodka Smirnoff', 3.00, true, 21, 2),
(15, 'Absolut', 'Vodka Absolut', 5.00, true, 21, 3),
(16, 'Ciroc', 'Vodka Ciroc', 10.00, true, 21, 1)
ON CONFLICT (id) DO NOTHING;

-- Insert Printers
INSERT INTO printers (id, name, ip_address, port, type, is_main, active, description, sort_order) VALUES
(1, 'Caixa', '127.0.0.1', '9100', 'thermal', true, true, NULL, 1),
(2, 'Bar', '192.168.1.101', '9100', 'thermal', false, true, NULL, 2),
(3, 'Sushi', '192.168.1.102', '9100', 'thermal', false, true, NULL, 3),
(13, 'Cozinha', '192.168.1.100', '9100', 'thermal', false, true, NULL, 0)
ON CONFLICT (id) DO NOTHING;

-- Insert Restaurant Tables
INSERT INTO restaurant_tables (id, name, number, type, capacity, active) VALUES
(1, 'Mesa 1', 1, 'table', 4, true),
(2, 'Mesa 2', 2, 'table', 4, true),
(3, 'Mesa 3', 3, 'table', 4, true),
(4, 'Mesa 4', 4, 'table', 4, true),
(5, 'Mesa 5', 5, 'table', 4, true),
(6, 'Mesa 6', 6, 'table', 4, true),
(7, 'Mesa 7', 7, 'table', 4, true),
(8, 'Mesa 8', 8, 'table', 4, true),
(9, 'Mesa 9', 9, 'table', 4, true),
(10, 'Mesa 10', 10, 'table', 4, true),
(11, 'Mesa 11', 11, 'table', 4, true),
(12, 'Mesa 12', 12, 'table', 4, true),
(13, 'Mesa 13', 13, 'table', 4, true),
(14, 'Mesa 14', 14, 'table', 4, true),
(15, 'Mesa 15', 15, 'table', 4, true),
(18, 'Balcão 101', 101, 'counter', 1, true),
(19, 'Balcão 102', 102, 'counter', 1, true),
(20, 'Balcão 103', 103, 'counter', 1, true),
(21, 'Balcão 104', 104, 'counter', 1, true),
(22, 'Balcão 105', 105, 'counter', 1, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample items (just a few for each category)
-- Entradas Premium
('Salada da Casa', 'Vinagrete de camarão, sunomono, gengibre, ceviche e nachos de salmão', 77, 1, true, true, false, 1),
('Sunomono', 'Finas fatias de pepino japonês curtidas no molho agridoce', 77, 1, true, true, false, 2),
('Vinagrete de Camarão', 'Camarões marinados com legumes frescos em um vinagrete cítrico e aromático', 77, 1, true, true, false, 3),
('Ceviche', 'Peixe, curtidos no molho de laranja, limão, pimenta-dedo-de-moça, salsinha, cebola roxa', 77, 1, true, true, false, 4),
('Tartar', 'Salmão finamente picado com molho especial, marinado na cebola roxa', 77, 1, true, true, false, 5),

-- Sashimis Premium
('Sashimi Salmão', 'Fatias frescas de salmão, perfeitas para os amantes de peixe cru', 79, 1, true, true, false, 1),
('Sashimi Atum', 'Fatias delicadas de atum, com sabor intenso e textura suave', 79, 1, true, true, false, 2),
('Sashimi Peixe Prego/Limão', 'Fatias de peixe prego com um toque refrescante de limão', 79, 1, true, true, false, 3),
('Sashimi Tilápia', 'Fatias leves e frescas de tilápia, com sabor suave', 79, 1, true, true, false, 4),
('Sashimi Polvo', 'Fatias finas de polvo, com textura única e sabor marcante', 79, 1, true, true, false, 5),

-- Niguiris Premium
('Niguiri Salmão', 'Bolinho de arroz com fatia fresca de salmão', 81, 1, true, true, false, 1),
('Niguiri Salmão Especial', 'Salmão selecionado sobre arroz, com toque especial do chef', 81, 1, true, true, false, 2),
('Niguiri Atum', 'Bolinho de arroz com atum fresco e sabor marcante', 81, 1, true, true, false, 3),
('Niguiri Polvo', 'Arroz coberto com fatia de polvo, textura única', 81, 1, true, true, false, 4),
('Niguiri Camarão', 'Camarão selecionado sobre bolinho de arroz', 81, 1, true, true, false, 5),

-- Uramakis Premium  
('Uramaki Salmão', 'Rolo invertido com salmão fresco e recheio cremoso', 82, 1, true, true, false, 1),
('Uramaki Atum', 'Rolo com atum fresco e toque de molho especial', 82, 1, true, true, false, 2),
('Uramaki Camarão', 'Rolo invertido com camarão suculento e molho delicado', 82, 1, true, true, false, 3),
('Uramaki California', 'Rolo com kani, pepino e manga, refrescante e leve', 82, 1, true, true, false, 4),
('Uramaki Filadélfia', 'Rolo com salmão, cream cheese e toque de cebolinha', 82, 1, true, true, false, 5),

-- Hot Rolls Premium
('Hot Roll Salmão', 'Rolo frito com salmão, crocante e delicioso', 88, 1, true, true, false, 1),
('Hot Roll Camarão', 'Rolo frito com camarão, quente e saboroso', 88, 1, true, true, false, 2),
('Hot Roll Shimeji', 'Rolo frito com shimeji, leve e crocante', 88, 1, true, true, false, 3),
('Hot Roll Filadelfia', 'Rolo frito com salmão e cream cheese, irresistível', 88, 1, true, true, false, 4),
('Hot Roll Doritos', 'Rolo frito com toque crocante de Doritos', 88, 1, true, true, false, 5),

-- Entradas Tradicional
('Salada da Casa', 'Vinagrete de camarão, sunomono, gengibre, ceviche e nachos de salmão', 18, 4, true, true, false, 1),
('Sunomono', 'Finas fatias de pepino japonês curtidas no molho agridoce', 18, 4, true, true, false, 2),
('Ceviche', 'Peixe, curtidos no molho de laranja, limão, pimenta-dedo-de-moça', 18, 4, true, true, false, 3),
('Tartar', 'Salmão finamente picado com molho especial, marinado na cebola roxa', 18, 4, true, true, false, 4),

-- Sashimis Tradicional
('Sashimi Salmão', 'Fatias frescas de salmão, perfeitas para os amantes de peixe cru', 60, 4, true, true, false, 1),
('Sashimi Atum', 'Fatias delicadas de atum, com sabor intenso e textura suave', 60, 4, true, true, false, 2),
('Sashimi Peixe Prego/Limão', 'Fatias de peixe prego com um toque refrescante de limão', 60, 4, true, true, false, 3),
('Sashimi Tilápia', 'Fatias leves e frescas de tilápia, com sabor suave', 60, 4, true, true, false, 4);

-- Reset sequence counters to continue from max id
SELECT setval('groups_id_seq', COALESCE((SELECT MAX(id) FROM groups), 1));
SELECT setval('icons_id_seq', COALESCE((SELECT MAX(id) FROM icons), 1));
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));
SELECT setval('additional_categories_id_seq', COALESCE((SELECT MAX(id) FROM additional_categories), 1));
SELECT setval('additionals_id_seq', COALESCE((SELECT MAX(id) FROM additionals), 1));
SELECT setval('printers_id_seq', COALESCE((SELECT MAX(id) FROM printers), 1));
SELECT setval('items_id_seq', COALESCE((SELECT MAX(id) FROM items), 1));
SELECT setval('restaurant_tables_id_seq', COALESCE((SELECT MAX(id) FROM restaurant_tables), 1));