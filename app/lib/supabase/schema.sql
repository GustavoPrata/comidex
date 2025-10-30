-- ComideX Restaurant Database Schema for Supabase

-- Groups table (Rodizio types and categories)
CREATE TABLE IF NOT EXISTS groups (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  price DECIMAL(10,2),
  type VARCHAR(50) DEFAULT 'a_la_carte' CHECK (type IN ('rodizio', 'a_la_carte', 'bebidas')),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  icon_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Icons table
CREATE TABLE IF NOT EXISTS icons (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  file_path VARCHAR(255),
  category VARCHAR(255) DEFAULT 'general',
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  group_id BIGINT REFERENCES groups(id) ON DELETE SET NULL,
  image VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Additional Categories table
CREATE TABLE IF NOT EXISTS additional_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(255) DEFAULT '#6b7280',
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Additionals table
CREATE TABLE IF NOT EXISTS additionals (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(8,2) DEFAULT 0.00,
  active BOOLEAN DEFAULT true,
  additional_category_id BIGINT REFERENCES additional_categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Printers table
CREATE TABLE IF NOT EXISTS printers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ip_address VARCHAR(255),
  port VARCHAR(255) DEFAULT '9100',
  type VARCHAR(50) DEFAULT 'thermal' CHECK (type IN ('thermal', 'laser', 'inkjet', 'other')),
  is_main BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Items table (Products)
CREATE TABLE IF NOT EXISTS items (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity VARCHAR(255),
  price DECIMAL(10,2),
  image VARCHAR(255),
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  group_id BIGINT REFERENCES groups(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT true,
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  printer_id BIGINT REFERENCES printers(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Print Queue table
CREATE TABLE IF NOT EXISTS print_queue (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  source VARCHAR(255) NOT NULL,
  order_id BIGINT,
  item_id BIGINT REFERENCES items(id) ON DELETE SET NULL,
  printer_id BIGINT REFERENCES printers(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  content TEXT NOT NULL,
  metadata JSONB,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant Tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  number INTEGER NOT NULL UNIQUE,
  type VARCHAR(50) DEFAULT 'table' CHECK (type IN ('table', 'counter')),
  capacity INTEGER NOT NULL,
  attendant VARCHAR(255),
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS tablet_sessoes (
  id BIGSERIAL PRIMARY KEY,
  mesa_id BIGINT REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  tablet_id INTEGER,
  status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada', 'cancelada')),
  tipo_atendimento_id INTEGER,
  pessoas_total INTEGER DEFAULT 1,
  pessoas_adultos INTEGER DEFAULT 1,
  pessoas_criancas INTEGER DEFAULT 0,
  inicio_atendimento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fim_atendimento TIMESTAMP WITH TIME ZONE,
  tempo_decorrido INTEGER,
  valor_total DECIMAL(10,2) DEFAULT 0,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  valor_desconto DECIMAL(10,2) DEFAULT 0,
  taxa_servico DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS tablet_pedidos (
  id BIGSERIAL PRIMARY KEY,
  sessao_id BIGINT REFERENCES tablet_sessoes(id) ON DELETE CASCADE,
  numero VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'preparando', 'pronto', 'entregue', 'cancelado')),
  observacoes TEXT,
  valor_total DECIMAL(10,2) DEFAULT 0,
  tempo_preparo INTEGER,
  prioridade VARCHAR(50) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table
CREATE TABLE IF NOT EXISTS tablet_pedido_itens (
  id BIGSERIAL PRIMARY KEY,
  pedido_id BIGINT REFERENCES tablet_pedidos(id) ON DELETE CASCADE,
  item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10,2),
  preco_total DECIMAL(10,2),
  observacoes TEXT,
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'preparando', 'pronto', 'entregue', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Item Additionals relationship table
CREATE TABLE IF NOT EXISTS item_additionals (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT REFERENCES items(id) ON DELETE CASCADE,
  additional_id BIGINT REFERENCES additionals(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, additional_id)
);

-- Print Config table
CREATE TABLE IF NOT EXISTS print_config (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  config_type VARCHAR(50) NOT NULL,
  printer_id BIGINT REFERENCES printers(id) ON DELETE CASCADE,
  template TEXT,
  settings JSONB,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_group ON items(group_id);
CREATE INDEX IF NOT EXISTS idx_categories_group ON categories(group_id);
CREATE INDEX IF NOT EXISTS idx_additionals_category ON additionals(additional_category_id);
CREATE INDEX IF NOT EXISTS idx_print_queue_status ON print_queue(status);
CREATE INDEX IF NOT EXISTS idx_print_queue_printer ON print_queue(printer_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_mesa ON tablet_sessoes(mesa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_sessao ON tablet_pedidos(sessao_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON tablet_pedido_itens(pedido_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_icons_updated_at BEFORE UPDATE ON icons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_additional_categories_updated_at BEFORE UPDATE ON additional_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_additionals_updated_at BEFORE UPDATE ON additionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_printers_updated_at BEFORE UPDATE ON printers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_print_queue_updated_at BEFORE UPDATE ON print_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_restaurant_tables_updated_at BEFORE UPDATE ON restaurant_tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tablet_sessoes_updated_at BEFORE UPDATE ON tablet_sessoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tablet_pedidos_updated_at BEFORE UPDATE ON tablet_pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tablet_pedido_itens_updated_at BEFORE UPDATE ON tablet_pedido_itens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_print_config_updated_at BEFORE UPDATE ON print_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();