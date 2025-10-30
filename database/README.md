# Configuração do Banco de Dados Supabase

## Como configurar o banco de dados

### 1. Acesse o Supabase
Entre no seu projeto em https://app.supabase.com

### 2. Execute o Schema
1. Vá para **SQL Editor** no menu lateral
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `schema.sql`
4. Cole no editor SQL
5. Clique em **Run** para criar as tabelas

### 3. Adicione os dados iniciais
1. Ainda no **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `seed.sql`
4. Cole no editor SQL
5. Clique em **Run** para popular as tabelas

### 4. Configure o Storage (Opcional)
Para imagens dos produtos:
1. Vá para **Storage** no menu lateral
2. Crie os seguintes buckets:
   - `items-images` - Para fotos dos pratos
   - `category-images` - Para imagens das categorias
   - `icons` - Para ícones do sistema

### 5. Configure as Políticas RLS (Row Level Security)
Para permitir acesso às tabelas:

1. Vá para **Authentication > Policies**
2. Para cada tabela, crie políticas de:
   - SELECT (leitura) - Enable read access for all users
   - INSERT (criação) - Enable insert for authenticated users only
   - UPDATE (atualização) - Enable update for authenticated users only
   - DELETE (exclusão) - Enable delete for authenticated users only

Ou simplesmente desabilite RLS temporariamente para testes:
1. Vá para **Table Editor**
2. Clique em cada tabela
3. Desabilite **RLS** (não recomendado para produção)

## Estrutura das Tabelas

- **groups** - Grupos do cardápio (Rodízio Premium, Tradicional, À la Carte)
- **categories** - Categorias dos pratos (Sashimis, Hot Rolls, etc)
- **items** - Itens do cardápio
- **restaurant_tables** - Mesas do restaurante
- **table_sessions** - Sessões de atendimento
- **orders** - Pedidos
- **order_items** - Itens dos pedidos
- **printers** - Impressoras configuradas
- **printer_queue** - Fila de impressão

## Verificando se está funcionando

Após configurar, acesse:
- http://localhost:5000/admin - Painel administrativo
- http://localhost:5000/pos - Sistema POS

Os dados devem aparecer corretamente!