-- Dados iniciais para ComideX Restaurant

-- Grupos
INSERT INTO groups (name, description, price, type, active, sort_order) VALUES
('Rodízio Premium', 'Cardápio completo com pratos especiais', 189.00, 'rodizio', true, 1),
('Rodízio Tradicional', 'Cardápio tradicional', 129.00, 'rodizio', true, 2),
('À la Carte', 'Pedidos individuais', NULL, 'a_la_carte', true, 3),
('Bebidas', 'Bebidas e drinks', NULL, 'bebidas', true, 4);

-- Categorias (assumindo que os grupos foram criados com IDs específicos)
INSERT INTO categories (name, description, active, sort_order, group_id) VALUES
('Entradas', 'Pratos de entrada', true, 1, (SELECT id FROM groups WHERE name = 'Rodízio Premium')),
('Sashimis', 'Peixes crus fatiados', true, 2, (SELECT id FROM groups WHERE name = 'Rodízio Premium')),
('Niguiris', 'Bolinhos de arroz com peixe', true, 3, (SELECT id FROM groups WHERE name = 'Rodízio Premium')),
('Uramakis', 'Rolos invertidos', true, 4, (SELECT id FROM groups WHERE name = 'Rodízio Premium')),
('Hot Rolls', 'Rolos empanados e fritos', true, 5, (SELECT id FROM groups WHERE name = 'Rodízio Premium')),
('Temakis', 'Cones de alga com recheio', true, 6, (SELECT id FROM groups WHERE name = 'À la Carte')),
('Bebidas', 'Refrigerantes e sucos', true, 7, (SELECT id FROM groups WHERE name = 'Bebidas')),
('Sobremesas', 'Doces e sobremesas', true, 8, (SELECT id FROM groups WHERE name = 'À la Carte'));

-- Itens do cardápio
-- Entradas
('Gyoza', 'Pastel japonês com recheio de carne suína', '6 unidades', NULL, 
  (SELECT id FROM categories WHERE name = 'Entradas'), 
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 1),
('Sunomono', 'Salada de pepino agridoce', 'Porção', NULL,
  (SELECT id FROM categories WHERE name = 'Entradas'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 2),
('Harumaki', 'Rolinho primavera com legumes', '4 unidades', NULL,
  (SELECT id FROM categories WHERE name = 'Entradas'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 3);

-- Sashimis
('Sashimi de Salmão', 'Fatias de salmão fresco', '10 fatias', NULL,
  (SELECT id FROM categories WHERE name = 'Sashimis'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 1),
('Sashimi de Atum', 'Fatias de atum fresco', '10 fatias', NULL,
  (SELECT id FROM categories WHERE name = 'Sashimis'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 2),
('Sashimi de Peixe Branco', 'Fatias de peixe branco', '10 fatias', NULL,
  (SELECT id FROM categories WHERE name = 'Sashimis'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, false, false, 3);

-- Niguiris
('Niguiri de Salmão', 'Arroz com salmão', '2 unidades', NULL,
  (SELECT id FROM categories WHERE name = 'Niguiris'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 1),
('Niguiri de Atum', 'Arroz com atum', '2 unidades', NULL,
  (SELECT id FROM categories WHERE name = 'Niguiris'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 2),
('Niguiri de Camarão', 'Arroz com camarão', '2 unidades', NULL,
  (SELECT id FROM categories WHERE name = 'Niguiris'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 3);

-- Uramakis
('Uramaki Califórnia', 'Kani, pepino, manga e cream cheese', '8 peças', NULL,
  (SELECT id FROM categories WHERE name = 'Uramakis'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 1),
('Uramaki Philadelphia', 'Salmão e cream cheese', '8 peças', NULL,
  (SELECT id FROM categories WHERE name = 'Uramakis'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 2),
('Uramaki Especial ComideX', 'Salmão flambado com molho especial', '10 peças', NULL,
  (SELECT id FROM categories WHERE name = 'Uramakis'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, true, 3);

-- Hot Rolls
('Hot Philadelphia', 'Salmão, cream cheese, empanado e frito', '10 peças', NULL,
  (SELECT id FROM categories WHERE name = 'Hot Rolls'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, true, 1),
('Hot Banana', 'Banana, doce de leite, empanado', '8 peças', NULL,
  (SELECT id FROM categories WHERE name = 'Hot Rolls'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, false, 2),
('Hot Especial', 'Atum, cream cheese, empanado com doritos', '10 peças', NULL,
  (SELECT id FROM categories WHERE name = 'Hot Rolls'),
  (SELECT id FROM groups WHERE name = 'Rodízio Premium'), true, true, true, 3);

-- Temakis (À la carte)
('Temaki de Salmão', 'Cone com salmão e cream cheese', '1 unidade', 28.90,
  (SELECT id FROM categories WHERE name = 'Temakis'),
  (SELECT id FROM groups WHERE name = 'À la Carte'), true, true, false, 1),
('Temaki de Atum', 'Cone com atum picante', '1 unidade', 32.90,
  (SELECT id FROM categories WHERE name = 'Temakis'),
  (SELECT id FROM groups WHERE name = 'À la Carte'), true, true, true, 2),
('Temaki Califórnia', 'Cone com kani e manga', '1 unidade', 26.90,
  (SELECT id FROM categories WHERE name = 'Temakis'),
  (SELECT id FROM groups WHERE name = 'À la Carte'), true, true, false, 3);

-- Bebidas
('Coca-Cola', 'Lata 350ml', '350ml', 8.00,
  (SELECT id FROM categories WHERE name = 'Bebidas'),
  (SELECT id FROM groups WHERE name = 'Bebidas'), true, true, false, 1),
('Água Mineral', 'Garrafa 500ml', '500ml', 5.00,
  (SELECT id FROM categories WHERE name = 'Bebidas'),
  (SELECT id FROM groups WHERE name = 'Bebidas'), true, true, false, 2),
('Suco Natural', 'Laranja ou Limão', '300ml', 12.00,
  (SELECT id FROM categories WHERE name = 'Bebidas'),
  (SELECT id FROM groups WHERE name = 'Bebidas'), true, true, false, 3),
('Sake', 'Dose tradicional', '50ml', 18.00,
  (SELECT id FROM categories WHERE name = 'Bebidas'),
  (SELECT id FROM groups WHERE name = 'Bebidas'), true, true, false, 4);

-- Sobremesas
('Petit Gateau', 'Bolinho de chocolate com sorvete', '1 unidade', 22.00,
  (SELECT id FROM categories WHERE name = 'Sobremesas'),
  (SELECT id FROM groups WHERE name = 'À la Carte'), true, true, false, 1),
('Tempurá de Sorvete', 'Sorvete empanado e frito', '1 unidade', 24.00,
  (SELECT id FROM categories WHERE name = 'Sobremesas'),
  (SELECT id FROM groups WHERE name = 'À la Carte'), true, true, false, 2),
('Dorayaki', 'Panqueca japonesa com doce de feijão', '1 unidade', 15.00,
  (SELECT id FROM categories WHERE name = 'Sobremesas'),
  (SELECT id FROM groups WHERE name = 'À la Carte'), true, true, false, 3);

-- Mesas
INSERT INTO restaurant_tables (name, number, type, capacity, active, sort_order) VALUES
('Mesa 1', 1, 'table', 4, true, 1),
('Mesa 2', 2, 'table', 4, true, 2),
('Mesa 3', 3, 'table', 6, true, 3),
('Mesa 4', 4, 'table', 2, true, 4),
('Mesa 5', 5, 'table', 4, true, 5),
('Mesa 6', 6, 'table', 8, true, 6),
('Mesa 7', 7, 'table', 4, true, 7),
('Mesa 8', 8, 'table', 6, true, 8),
('Mesa 9', 9, 'table', 4, true, 9),
('Mesa 10', 10, 'table', 4, true, 10),
('Mesa VIP 1', 11, 'table', 10, true, 11),
('Mesa VIP 2', 12, 'table', 10, true, 12),
('Balcão 1', 13, 'counter', 1, true, 13),
('Balcão 2', 14, 'counter', 1, true, 14),
('Balcão 3', 15, 'counter', 1, true, 15);

-- Impressoras
INSERT INTO printers (name, location, type, ip_address, port, active) VALUES
('Cozinha Principal', 'Cozinha', 'kitchen', '192.168.1.100', 9100, true),
('Bar', 'Bar', 'bar', '192.168.1.101', 9100, true),
('Caixa', 'Recepção', 'cashier', '192.168.1.102', 9100, true),
('Backup', 'Escritório', 'backup', '192.168.1.103', 9100, false);