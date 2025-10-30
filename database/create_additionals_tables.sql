-- Criar tabelas de adicionais no banco de dados

-- Categorias de adicionais
CREATE TABLE IF NOT EXISTS additional_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#FF6B00',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionais (extras, substituições, etc)
CREATE TABLE IF NOT EXISTS additionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  additional_category_id UUID REFERENCES additional_categories(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir algumas categorias de exemplo
INSERT INTO additional_categories (name, color, sort_order) VALUES 
('Extras', '#FF6B00', 1),
('Substituições', '#4CAF50', 2),
('Acompanhamentos', '#2196F3', 3),
('Molhos', '#9C27B0', 4)
ON CONFLICT DO NOTHING;

-- Inserir alguns adicionais de exemplo
INSERT INTO additionals (name, description, price, additional_category_id, active, sort_order) VALUES
-- Extras
((SELECT id FROM additional_categories WHERE name = 'Extras' LIMIT 1), 'Cream Cheese Extra', 'Porção adicional de cream cheese', 5.00, (SELECT id FROM additional_categories WHERE name = 'Extras'), true, 1),
((SELECT id FROM additional_categories WHERE name = 'Extras' LIMIT 1), 'Salmão Extra', 'Porção adicional de salmão', 12.00, (SELECT id FROM additional_categories WHERE name = 'Extras'), true, 2),
((SELECT id FROM additional_categories WHERE name = 'Extras' LIMIT 1), 'Shimeji Extra', 'Porção adicional de shimeji', 8.00, (SELECT id FROM additional_categories WHERE name = 'Extras'), true, 3),

-- Substituições
((SELECT id FROM additional_categories WHERE name = 'Substituições' LIMIT 1), 'Trocar por Salmão', 'Substituir proteína por salmão', 8.00, (SELECT id FROM additional_categories WHERE name = 'Substituições'), true, 1),
((SELECT id FROM additional_categories WHERE name = 'Substituições' LIMIT 1), 'Trocar por Atum', 'Substituir proteína por atum', 6.00, (SELECT id FROM additional_categories WHERE name = 'Substituições'), true, 2),
((SELECT id FROM additional_categories WHERE name = 'Substituições' LIMIT 1), 'Sem Cream Cheese', 'Remover cream cheese do prato', 0.00, (SELECT id FROM additional_categories WHERE name = 'Substituições'), true, 3),

-- Acompanhamentos
((SELECT id FROM additional_categories WHERE name = 'Acompanhamentos' LIMIT 1), 'Gohan (Arroz Japonês)', 'Porção de arroz japonês', 8.00, (SELECT id FROM additional_categories WHERE name = 'Acompanhamentos'), true, 1),
((SELECT id FROM additional_categories WHERE name = 'Acompanhamentos' LIMIT 1), 'Sunomono', 'Salada de pepino agridoce', 12.00, (SELECT id FROM additional_categories WHERE name = 'Acompanhamentos'), true, 2),
((SELECT id FROM additional_categories WHERE name = 'Acompanhamentos' LIMIT 1), 'Missoshiru', 'Sopa de missô', 10.00, (SELECT id FROM additional_categories WHERE name = 'Acompanhamentos'), true, 3),

-- Molhos
((SELECT id FROM additional_categories WHERE name = 'Molhos' LIMIT 1), 'Molho Tarê', 'Molho doce tradicional', 2.00, (SELECT id FROM additional_categories WHERE name = 'Molhos'), true, 1),
((SELECT id FROM additional_categories WHERE name = 'Molhos' LIMIT 1), 'Molho Shoyu', 'Molho de soja', 0.00, (SELECT id FROM additional_categories WHERE name = 'Molhos'), true, 2),
((SELECT id FROM additional_categories WHERE name = 'Molhos' LIMIT 1), 'Molho Spicy Mayo', 'Maionese picante', 3.00, (SELECT id FROM additional_categories WHERE name = 'Molhos'), true, 3)
ON CONFLICT DO NOTHING;