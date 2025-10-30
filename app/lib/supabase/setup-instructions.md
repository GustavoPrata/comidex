# Instruções para Configurar o Banco de Dados no Supabase

## 1. Criar as Tabelas

Execute o conteúdo do arquivo `app/lib/supabase/schema.sql` no SQL Editor do Supabase:

1. Acesse seu projeto no Supabase
2. Vá para SQL Editor
3. Cole o conteúdo de `schema.sql`
4. Execute o script

## 2. Importar Dados Iniciais

Execute o conteúdo do arquivo `app/lib/supabase/seed-data.sql` no SQL Editor:

1. No SQL Editor
2. Cole o conteúdo de `seed-data.sql`
3. Execute o script

## 3. Configurar Permissões (RLS)

Execute este script para configurar as permissões básicas:

```sql
-- Desabilitar RLS temporariamente para desenvolvimento
-- ATENÇÃO: Em produção, configure RLS adequadamente!

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE additional_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE additionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE tablet_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tablet_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tablet_pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_additionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_config ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública (temporário)
CREATE POLICY "Allow public read" ON groups FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON groups FOR ALL USING (true);

CREATE POLICY "Allow public read" ON icons FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON icons FOR ALL USING (true);

CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON categories FOR ALL USING (true);

CREATE POLICY "Allow public read" ON additional_categories FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON additional_categories FOR ALL USING (true);

CREATE POLICY "Allow public read" ON additionals FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON additionals FOR ALL USING (true);

CREATE POLICY "Allow public read" ON printers FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON printers FOR ALL USING (true);

CREATE POLICY "Allow public read" ON items FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON items FOR ALL USING (true);

CREATE POLICY "Allow public read" ON print_queue FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON print_queue FOR ALL USING (true);

CREATE POLICY "Allow public read" ON restaurant_tables FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON restaurant_tables FOR ALL USING (true);

CREATE POLICY "Allow public read" ON tablet_sessoes FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON tablet_sessoes FOR ALL USING (true);

CREATE POLICY "Allow public read" ON tablet_pedidos FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON tablet_pedidos FOR ALL USING (true);

CREATE POLICY "Allow public read" ON tablet_pedido_itens FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON tablet_pedido_itens FOR ALL USING (true);

CREATE POLICY "Allow public read" ON item_additionals FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON item_additionals FOR ALL USING (true);

CREATE POLICY "Allow public read" ON print_config FOR SELECT USING (true);
CREATE POLICY "Allow public write" ON print_config FOR ALL USING (true);
```

## 4. Verificar Conexão

Teste a conexão acessando: http://localhost:5000/admin/items

As tabelas já estarão prontas para uso com o CRUD completo!

## Tabelas Criadas

- **groups** - Grupos (Rodízio Premium, Tradicional, À la Carte)
- **icons** - Ícones das categorias
- **categories** - Categorias dos produtos
- **additional_categories** - Categorias de adicionais
- **additionals** - Adicionais dos produtos
- **printers** - Impressoras
- **items** - Produtos do cardápio
- **print_queue** - Fila de impressão
- **restaurant_tables** - Mesas do restaurante
- **tablet_sessoes** - Sessões de atendimento
- **tablet_pedidos** - Pedidos
- **tablet_pedido_itens** - Itens dos pedidos
- **print_config** - Configurações de impressão