-- Create Session and Order tables for Mobile API
-- These tables are needed for the tablet/mobile ordering system

-- Sessions table
CREATE TABLE IF NOT EXISTS tablet_sessoes (
  id BIGSERIAL PRIMARY KEY,
  mesa_id BIGINT REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  tipo VARCHAR(50) DEFAULT 'rodizio' CHECK (tipo IN ('rodizio', 'a_la_carte')),
  status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'finalizada', 'cancelada')),
  inicio_atendimento TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  fim_atendimento TIMESTAMP WITH TIME ZONE,
  valor_total DECIMAL(10,2) DEFAULT 0.00,
  valor_pago DECIMAL(10,2) DEFAULT 0.00,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS tablet_pedidos (
  id BIGSERIAL PRIMARY KEY,
  sessao_id BIGINT REFERENCES tablet_sessoes(id) ON DELETE CASCADE,
  mesa_id BIGINT REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  numero_pedido INTEGER,
  tipo VARCHAR(50) DEFAULT 'rodizio' CHECK (tipo IN ('rodizio', 'a_la_carte')),
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'preparando', 'pronto', 'entregue', 'cancelado')),
  valor_total DECIMAL(10,2) DEFAULT 0.00,
  observacoes TEXT,
  impresso BOOLEAN DEFAULT false,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessoes_mesa ON tablet_sessoes(mesa_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_status ON tablet_sessoes(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_sessao ON tablet_pedidos(sessao_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON tablet_pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON tablet_pedido_itens(pedido_id);

-- Enable RLS (Row Level Security)
ALTER TABLE tablet_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tablet_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tablet_pedido_itens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for anonymous access (for mobile app)
-- Allow read access
CREATE POLICY "Allow anonymous read sessions" ON tablet_sessoes
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read orders" ON tablet_pedidos
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read order items" ON tablet_pedido_itens
  FOR SELECT USING (true);

-- Allow insert/update for anonymous users
CREATE POLICY "Allow anonymous insert sessions" ON tablet_sessoes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update sessions" ON tablet_sessoes
  FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous insert orders" ON tablet_pedidos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update orders" ON tablet_pedidos
  FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous insert order items" ON tablet_pedido_itens
  FOR INSERT WITH CHECK (true);

-- Update timestamp triggers
CREATE TRIGGER update_tablet_sessoes_updated_at BEFORE UPDATE ON tablet_sessoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tablet_pedidos_updated_at BEFORE UPDATE ON tablet_pedidos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tablet_pedido_itens_updated_at BEFORE UPDATE ON tablet_pedido_itens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();