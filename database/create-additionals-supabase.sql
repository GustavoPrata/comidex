-- Execute este SQL no SQL Editor do seu Dashboard do Supabase
-- Acesse: https://supabase.com/dashboard -> Seu projeto -> SQL Editor

-- Passo 1: Criar tabela de categorias de adicionais
CREATE TABLE IF NOT EXISTS additional_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#FF6B00',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Passo 2: Criar tabela de adicionais
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

-- Passo 3: Inserir categorias de exemplo
INSERT INTO additional_categories (name, color, sort_order) VALUES 
('Extras', '#FF6B00', 1),
('Substituições', '#4CAF50', 2),
('Acompanhamentos', '#2196F3', 3),
('Molhos', '#9C27B0', 4)
ON CONFLICT (name) DO NOTHING;

-- Passo 4: Inserir adicionais de exemplo
WITH cat_ids AS (
  SELECT 
    id,
    name
  FROM additional_categories
)
INSERT INTO additionals (name, description, price, additional_category_id, sort_order) VALUES
-- Extras
('Cream Cheese Extra', 'Porção adicional de cream cheese', 5.00, (SELECT id FROM cat_ids WHERE name = 'Extras'), 1),
('Salmão Extra', 'Porção adicional de salmão', 12.00, (SELECT id FROM cat_ids WHERE name = 'Extras'), 2),
('Shimeji Extra', 'Porção adicional de shimeji', 8.00, (SELECT id FROM cat_ids WHERE name = 'Extras'), 3),
('Gengibre Extra', 'Porção adicional de gengibre', 2.00, (SELECT id FROM cat_ids WHERE name = 'Extras'), 4),
('Wasabi Extra', 'Porção adicional de wasabi', 3.00, (SELECT id FROM cat_ids WHERE name = 'Extras'), 5),

-- Substituições
('Trocar por Salmão', 'Substituir proteína por salmão', 8.00, (SELECT id FROM cat_ids WHERE name = 'Substituições'), 1),
('Trocar por Atum', 'Substituir proteína por atum', 6.00, (SELECT id FROM cat_ids WHERE name = 'Substituições'), 2),
('Sem Cream Cheese', 'Remover cream cheese', 0.00, (SELECT id FROM cat_ids WHERE name = 'Substituições'), 3),
('Sem Cebolinha', 'Remover cebolinha', 0.00, (SELECT id FROM cat_ids WHERE name = 'Substituições'), 4),
('Sem Gergelim', 'Remover gergelim', 0.00, (SELECT id FROM cat_ids WHERE name = 'Substituições'), 5),

-- Acompanhamentos
('Gohan', 'Arroz japonês', 8.00, (SELECT id FROM cat_ids WHERE name = 'Acompanhamentos'), 1),
('Sunomono', 'Salada de pepino agridoce', 12.00, (SELECT id FROM cat_ids WHERE name = 'Acompanhamentos'), 2),
('Missoshiru', 'Sopa de missô', 10.00, (SELECT id FROM cat_ids WHERE name = 'Acompanhamentos'), 3),
('Edamame', 'Soja verde cozida', 15.00, (SELECT id FROM cat_ids WHERE name = 'Acompanhamentos'), 4),
('Gyoza', '5 unidades de guioza', 18.00, (SELECT id FROM cat_ids WHERE name = 'Acompanhamentos'), 5),

-- Molhos
('Molho Tarê', 'Molho doce tradicional', 2.00, (SELECT id FROM cat_ids WHERE name = 'Molhos'), 1),
('Molho Shoyu', 'Molho de soja', 0.00, (SELECT id FROM cat_ids WHERE name = 'Molhos'), 2),
('Molho Spicy Mayo', 'Maionese picante', 3.00, (SELECT id FROM cat_ids WHERE name = 'Molhos'), 3),
('Molho Ponzu', 'Molho cítrico japonês', 3.50, (SELECT id FROM cat_ids WHERE name = 'Molhos'), 4),
('Molho Teriyaki', 'Molho agridoce', 3.50, (SELECT id FROM cat_ids WHERE name = 'Molhos'), 5)
ON CONFLICT DO NOTHING;

-- Verificar se foi criado corretamente
SELECT 
  'Categorias criadas:' as info, 
  COUNT(*) as total 
FROM additional_categories
UNION ALL
SELECT 
  'Adicionais criados:' as info, 
  COUNT(*) as total 
FROM additionals;