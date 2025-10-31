-- SCRIPT PARA CONVERTER TODAS AS TABELAS PARA IDs INTEIROS SIMPLES
-- Executa no banco Supabase para usar IDs numéricos (1, 2, 3, 4...)

-- Desabilitar triggers temporariamente
ALTER TABLE IF EXISTS items DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS categories DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS groups DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS additionals DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS additional_categories DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS restaurant_tables DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS orders DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS order_items DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS order_item_additionals DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS payments DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS printers DISABLE TRIGGER ALL;
ALTER TABLE IF EXISTS print_queue DISABLE TRIGGER ALL;

-- Dropar tabelas existentes (cascata para remover dependências)
DROP TABLE IF EXISTS order_item_additionals CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS print_queue CASCADE;
DROP TABLE IF EXISTS additionals CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS additional_categories CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS restaurant_tables CASCADE;
DROP TABLE IF EXISTS printers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Criar tabela groups com ID inteiro
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('rodizio', 'a_la_carte', 'bebidas')) DEFAULT 'a_la_carte',
  price DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela categories com ID inteiro
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_id INTEGER REFERENCES groups(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela items com ID inteiro
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  image TEXT,
  quantity VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela additional_categories com ID inteiro
CREATE TABLE additional_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela additionals com ID inteiro
CREATE TABLE additionals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) DEFAULT 0,
  additional_category_id INTEGER REFERENCES additional_categories(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela restaurant_tables com ID inteiro
CREATE TABLE restaurant_tables (
  id SERIAL PRIMARY KEY,
  number VARCHAR(10) NOT NULL UNIQUE,
  capacity INTEGER DEFAULT 4,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  active BOOLEAN DEFAULT true,
  location VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela orders com ID inteiro
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(20) NOT NULL,
  table_id INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'paid', 'cancelled')),
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela order_items com ID inteiro
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES items(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela order_item_additionals com ID inteiro
CREATE TABLE order_item_additionals (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
  additional_id INTEGER REFERENCES additionals(id) ON DELETE SET NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela payments com ID inteiro
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(20) CHECK (method IN ('cash', 'credit', 'debit', 'pix')),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela printers com ID inteiro
CREATE TABLE printers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  port INTEGER DEFAULT 9100,
  type VARCHAR(20) CHECK (type IN ('kitchen', 'bar', 'cashier')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela print_queue com ID inteiro
CREATE TABLE print_queue (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  printer_id INTEGER REFERENCES printers(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  printed_at TIMESTAMP
);

-- Criar tabela users (mantida compatível)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados de exemplo para demonstrar IDs numéricos
INSERT INTO groups (name, description, type, price, active, sort_order) VALUES
('Rodízio Premium', 'Rodízio completo com todos os pratos', 'rodizio', 189.00, true, 1),
('À la Carte', 'Pedidos individuais do cardápio', 'a_la_carte', NULL, true, 2),
('Bebidas', 'Bebidas diversas', 'bebidas', NULL, true, 3);

INSERT INTO categories (name, description, group_id, active, sort_order) VALUES
('Entradas', 'Pratos de entrada', 2, true, 1),
('Pratos Quentes', 'Pratos quentes especiais', 2, true, 2),
('Sobremesas', 'Sobremesas deliciosas', 2, true, 3),
('Refrigerantes', 'Refrigerantes diversos', 3, true, 1),
('Sucos', 'Sucos naturais', 3, true, 2);

INSERT INTO additional_categories (name, sort_order) VALUES
('Molhos', 1),
('Extras', 2);

INSERT INTO additionals (name, price, additional_category_id, active, sort_order) VALUES
('Shoyu', 0.00, 1, true, 1),
('Tarê', 0.00, 1, true, 2),
('Wasabi', 2.00, 1, true, 3),
('Gengibre', 0.00, 1, true, 4),
('Cream Cheese Extra', 5.00, 2, true, 1),
('Salmão Extra', 8.00, 2, true, 2),
('Hashi Descartável', 1.00, 2, true, 3),
('Embalagem Especial', 3.00, 2, true, 4);

-- Criar índices para melhor performance
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_group ON items(group_id);
CREATE INDEX idx_categories_group ON categories(group_id);
CREATE INDEX idx_additionals_category ON additionals(additional_category_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_item ON order_items(item_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON restaurant_tables
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Mensagem de conclusão
DO $$
BEGIN
  RAISE NOTICE '✅ Conversão concluída! Todas as tabelas agora usam IDs inteiros simples (1, 2, 3...)';
  RAISE NOTICE 'Grupos criados com IDs: 1, 2, 3';
  RAISE NOTICE 'Categorias criadas com IDs: 1, 2, 3, 4, 5';
  RAISE NOTICE 'Adicionais criados com IDs: 1, 2, 3, 4, 5, 6, 7, 8';
END $$;