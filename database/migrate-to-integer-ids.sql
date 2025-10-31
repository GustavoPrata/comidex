-- ====================================
-- MIGRAÇÃO COMPLETA: UUID -> INTEGER IDs
-- ====================================
-- ATENÇÃO: Este script irá DELETAR TODOS OS DADOS e recriar as tabelas
-- Use apenas em desenvolvimento/local

-- 1. Remover todas as tabelas existentes (na ordem correta de dependências)
DROP TABLE IF EXISTS order_item_additionals CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS print_queue CASCADE;
DROP TABLE IF EXISTS additionals CASCADE;
DROP TABLE IF EXISTS additional_categories CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS groups CASCADE;
DROP TABLE IF EXISTS printers CASCADE;
DROP TABLE IF EXISTS restaurant_tables CASCADE;

-- 2. Criar tabelas com IDs INTEGER e AUTO_INCREMENT

-- Grupos
CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    type VARCHAR(50) NOT NULL CHECK (type IN ('rodizio', 'a_la_carte', 'bebidas')),
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorias
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    group_id INTEGER REFERENCES groups(id) ON DELETE SET NULL,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorias de Adicionais
CREATE TABLE additional_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionais
CREATE TABLE additionals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    active BOOLEAN DEFAULT true,
    additional_category_id INTEGER REFERENCES additional_categories(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Impressoras
CREATE TABLE printers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    port VARCHAR(10) DEFAULT '9100',
    type VARCHAR(50) NOT NULL CHECK (type IN ('thermal', 'laser', 'inkjet', 'other')),
    is_main BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    settings JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Itens/Produtos
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity VARCHAR(50),
    price DECIMAL(10, 2),
    image TEXT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT true,
    available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    printer_id INTEGER REFERENCES printers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mesas
CREATE TABLE restaurant_tables (
    id SERIAL PRIMARY KEY,
    number VARCHAR(20) NOT NULL,
    capacity INTEGER DEFAULT 4,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
    active BOOLEAN DEFAULT true,
    location VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pedidos
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL,
    table_id INTEGER REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled')),
    payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'card', 'pix', 'mixed')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('dine_in', 'takeout', 'delivery')),
    subtotal DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Itens do Pedido
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionais do Item do Pedido
CREATE TABLE order_item_additionals (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    additional_id INTEGER NOT NULL REFERENCES additionals(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pagamentos
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'card', 'pix')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    reference_number VARCHAR(100),
    notes TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fila de Impressão
CREATE TABLE print_queue (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    printer_id INTEGER NOT NULL REFERENCES printers(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    content TEXT NOT NULL,
    metadata JSONB,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar índices para melhor performance
CREATE INDEX idx_categories_group ON categories(group_id);
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_items_group ON items(group_id);
CREATE INDEX idx_additionals_category ON additionals(additional_category_id);
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_item ON order_items(item_id);
CREATE INDEX idx_order_item_additionals_order_item ON order_item_additionals(order_item_id);
CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_print_queue_order ON print_queue(order_id);
CREATE INDEX idx_print_queue_printer ON print_queue(printer_id);

-- 4. Inserir dados de exemplo
-- Grupos
INSERT INTO groups (name, price, type, active, sort_order) VALUES
('Rodízio Premium', 89.90, 'rodizio', true, 1),
('À la Carte', NULL, 'a_la_carte', true, 2),
('Bebidas', NULL, 'bebidas', true, 3);

-- Categorias
INSERT INTO categories (name, description, active, sort_order, group_id) VALUES
('Entradas', 'Pratos de entrada', true, 1, 2),
('Pratos Quentes', 'Pratos principais quentes', true, 2, 2),
('Sobremesas', 'Doces e sobremesas', true, 3, 2),
('Refrigerantes', 'Refrigerantes e águas', true, 1, 3),
('Sucos', 'Sucos naturais', true, 2, 3);

-- Categorias de Adicionais
INSERT INTO additional_categories (name, sort_order, active) VALUES
('Molhos', 1, true),
('Extras', 2, true),
('Complementos', 3, true);

-- Adicionais
INSERT INTO additionals (name, price, active, additional_category_id, sort_order) VALUES
('Molho Shoyu', 0.00, true, 1, 1),
('Molho Tarê', 2.50, true, 1, 2),
('Wasabi', 3.00, true, 1, 3),
('Gengibre', 0.00, true, 2, 1),
('Cream Cheese Extra', 5.00, true, 2, 2),
('Salmão Extra', 8.00, true, 2, 3),
('Hashi', 0.00, true, 3, 1),
('Guardanapo Extra', 0.00, true, 3, 2);

-- Mesas
INSERT INTO restaurant_tables (number, capacity, status, active, location) VALUES
('1', 4, 'available', true, 'Salão Principal'),
('2', 4, 'available', true, 'Salão Principal'),
('3', 6, 'available', true, 'Salão Principal'),
('4', 2, 'available', true, 'Varanda'),
('5', 8, 'available', true, 'Área VIP');

-- Mensagem de sucesso
SELECT 'Migração concluída com sucesso! Todas as tabelas agora usam IDs numéricos simples.' AS status;