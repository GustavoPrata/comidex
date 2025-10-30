-- Execute este SQL no SQL Editor do Dashboard do Supabase
-- ATENÇÃO: Este script vai APAGAR todos os adicionais existentes e criar apenas os 2 da foto

-- Passo 1: Limpar todos os adicionais existentes
DELETE FROM additionals;
DELETE FROM additional_categories;

-- Passo 2: Criar apenas a categoria Refrigerante
INSERT INTO additional_categories (name, color, sort_order) VALUES 
('Refrigerante', '#2196F3', 1);

-- Passo 3: Inserir apenas os 2 adicionais da foto
INSERT INTO additionals (name, description, price, additional_category_id, sort_order) 
SELECT 
  name,
  description, 
  price,
  (SELECT id FROM additional_categories WHERE name = 'Refrigerante'),
  sort_order
FROM (VALUES
  ('Gelo', 'Para refrescar', 0.00, 1),
  ('Limão', 'Frescaria pura', 0.00, 2)
) AS items(name, description, price, sort_order);

-- Verificar o resultado
SELECT 
  a.name as "Adicional",
  a.description as "Descrição",
  CASE 
    WHEN a.price = 0 THEN 'Grátis'
    ELSE CONCAT('R$ ', a.price)
  END as "Preço",
  ac.name as "Categoria"
FROM additionals a
JOIN additional_categories ac ON a.additional_category_id = ac.id
ORDER BY a.sort_order;