# ComideX Restaurant System

## Visão Geral

Sistema de gestão para restaurante japonês com:
- **Painel Administrativo**: Gestão completa de cardápio, mesas, impressoras
- **Sistema POS**: Interface para garçons gerenciarem mesas e pedidos
- **APIs REST**: Backend completo para integração com app Android para tablets
- **Sistema de Impressão**: Gestão de filas e impressoras por setor

## Status: ✅ MVP IMPLEMENTADO COM DADOS REAIS

### Última Atualização: 27/10/2024 - 15:25
- **🎨 Categorias Com Placeholder Igual aos Produtos**
  - Categorias sem imagem mostram placeholder padrão
  - Consistência visual entre produtos e categorias
  - Placeholder em `/fotos/placeholder/placeholder.png`
  - Click ou drag & drop para adicionar foto

### Última Atualização: 27/10/2024 - 15:15
- **💾 Sistema de Upload de Imagens Otimizado**
  - Imagens só são salvas no disco ao confirmar (não durante edição)
  - Upload acontece apenas quando usuário clica "Salvar"
  - Produtos salvam em `/fotos/produtos/`
  - Categorias salvam em `/fotos/categorias/`
  - Evita criação de arquivos desnecessários

### Última Atualização: 26/10/2024 - 10:50
- **📸 Sistema de Fotos dos Produtos Completo**
  - **Clique na foto**: Adicionar quando não tem, visualizar quando já tem
  - **Drag & Drop**: Arraste imagens direto sobre a foto do produto
  - **Modal de visualização**: Editar, baixar ou fechar
  - **Feedback visual**: Hover e drag com destaque laranja
  - **Integração perfeita**: Funciona idêntico ao sistema de categorias

### Última Atualização: 25/10/2024 - 17:10
- **📸 Funcionalidade Drag & Drop para Adicionar Fotos**
  - Categorias sem foto: clique no placeholder abre modal para adicionar
  - Arrastar foto sobre placeholder abre modal de edição com imagem
  - Categorias com foto: clique abre o visualizador
  - Interface intuitiva com feedback visual ao arrastar
  - Processamento automático da imagem arrastada

### Última Atualização: 25/10/2024 - 17:00
- **🎨 Imagem Placeholder Abstrata para Categorias**
  - Gerada imagem abstrata com padrão geométrico (sem comida)
  - Design com laranja claro e detalhes escuros
  - Salva em `/fotos/categorias/placeholder-category.png`
  - Automaticamente usada em categorias sem imagem própria
  - Aplicada em todas as páginas: menu-structure, categories
  - Fallback automático com onError para imagens quebradas
  - Design abstrato em 16:9 com tons de laranja claro

### Última Atualização: 25/10/2024 - 15:30
- **✨ Botão de Melhoria de Foto no Editor de Imagem**
  - Adicionado botão "Melhorar Foto" com ícone Sparkles ao lado do botão "Centralizar"
  - Aplica filtros automáticos de melhoria: brilho (+10%), contraste (+15%), saturação (+20%)
  - Visualização em tempo real do efeito antes de aplicar
  - Toggle on/off para comparar foto original vs melhorada
  - Filtros aplicados tanto no preview quanto na imagem final salva

### Última Atualização: 25/10/2024 - 11:45
- **🔧 Correção Completa do Drag and Drop de Grupos**
  - Corrigido bug onde grupos não mudavam de posição ao serem arrastados
  - Implementado reload automático após atualização no banco de dados
  - Removido tipo "outros" que violava constraint do banco (apenas rodizio, a_la_carte, bebidas)
  - Ajustado cálculo de grupos filtrados dentro do callback para evitar referência circular
  - Sistema de reordenação funcionando perfeitamente em todas as situações
  - Simplificado label de filtro: "Filtrar por Grupo" → "Grupos"

### Última Atualização: 25/10/2024 - 10:30
- **🔧 Correção de Problemas de Carregamento (F5)**
  - Implementado sistema de retry com exponential backoff (3 tentativas)
  - Delay inicial de 100ms para garantir que Supabase está pronto
  - Todas as 8 páginas admin agora carregam de forma confiável
  - Páginas corrigidas:
    - /admin/menu-structure
    - /admin/items
    - /admin/categories  
    - /admin/tables (+ fix importação Switch)
    - /admin/printers
    - /admin/additionals
    - /admin/print-queue (com auto-refresh silencioso)
    - /admin/orders
  - Mensagens de erro apropriadas após falhas de retry
  - Interface nunca trava mostrando apenas loading infinito

### Última Atualização: 25/10/2024 - 09:30
- **🎨 Melhorias de Ícones e Badges nas Páginas Admin**
  - Ícones adicionados em badges de contagem:
    - 🛍️ ShoppingBag para contagem de produtos 
    - 📁 FolderOpen para contagem de categorias
  - Terminologia consistente: "produto/produtos" em vez de "item/itens"
  - Implementado em:
    - /admin/menu-structure: Ícones em badges de grupos e categorias
    - /admin/items: Ícones em badges de totais e contagens por categoria
  - Design visual mais intuitivo com ícones representativos

### Última Atualização: 25/10/2024 - 08:30
- **🔧 Correção COMPLETA de Interface Travando em TODAS as Páginas Admin**
  - Corrigido problema de travamento ao clicar editar e depois cancelar
  - Reset completo de estado implementado nos botões "Cancelar" de todos os modais
  - Páginas corrigidas:
    - ✓ /admin/menu-structure (Grupos e Categorias)
    - ✓ /admin/items (Produtos)
    - ✓ /admin/categories (Categorias)
    - ✓ /admin/tables (Mesas)
    - ✓ /admin/additionals (Adicionais)
    - ✓ /admin/printers (Impressoras)
    - ✓ /admin/print-queue (Fila de Impressão)
    - ✓ /admin/orders (Pedidos)
  - Botões "Cancelar" agora resetam completamente:
    - Estado do modal (fecha)
    - Item em edição (limpa)
    - Dados do formulário (reseta)
    - Estado de salvamento (reseta)
  - Interface permanece 100% responsiva após qualquer operação de modal

### Última Atualização: 24/10/2024 - 18:15
- **🔧 Remoção do Sistema de Ícones**
  - Sistema de ícones removido completamente por solicitação do usuário
  - Removida coluna `icon_id` da tabela `groups` no banco de dados
  - Removidos componentes IconSelector e todas referências a ícones
  - Removida API endpoint `/api/icons`
  - Removidos arquivos e diretórios relacionados a ícones
  - Sistema funcionando perfeitamente sem ícones
  - Feature será reimplementada no futuro

### Última Atualização: 24/10/2024 - 16:00
- **🔧 Correção de Out of Memory**
  - Resolvido erro de memória aumentando limite heap do Node.js para 4GB
  - Criado script `dev.sh` para desenvolvimento com memória otimizada
  - Adicionado `server/node-options.js` para configuração automática de memória
  - Aplicação rodando estável sem crashes de memória

### Última Atualização: 24/10/2024 - 15:00
- **📊 Banco de dados expandido com duplicação de itens**
  - 6 grupos: Premium (R$189), Tradicional (R$129), À la Carte, Bebidas, Bebidas Alcoólicas, Vinhos
  - Tradicional: 9 categorias e 9 itens
  - Premium: 6 categorias e **15 itens** (6 originais + 9 duplicados do Tradicional)
  - Filtros de categoria funcionando corretamente com comparação de strings
  - Sidebar com auto-expansão de submenus quando em páginas filhas
- Sistema Next.js 15 com App Router funcionando
- Interfaces admin e POS implementadas
- **CRUD completo** para Itens, Categorias e Mesas (criar, editar, listar, excluir)
- APIs REST completas para integração mobile
- Sistema de impressão com gestão de filas
- Interface tablet removida (será app Android separado)
- Sistema de fallback inteligente (funciona sem banco configurado)
- **Sistema de temas dark/light** corrigido (dark como padrão, sem flash)
- **Paleta de cores minimalista**: apenas preto, laranja e branco
- **Console Prompt System** integrado com servidor TypeScript na porta 3456
- **Página inicial redesenhada**: Design minimalista com imagens geradas por IA
- **Interface simplificada**: Apenas 2 cards principais (Admin e POS) com navegação direta
- **Script de importação**: `scripts/import-data.ts` para popular banco com dados do `tudo.txt`

## Stack Tecnológico

### Frontend Web
- **Next.js 15**: Framework React com App Router
- **React 19**: Biblioteca de UI
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utility-first
- **shadcn/ui**: Componentes de interface
- **SWR**: Data fetching e cache

### Backend
- **Next.js API Routes**: APIs REST
- **Supabase**: PostgreSQL e autenticação
- **TypeScript**: Tipagem do backend

## Estrutura do Projeto

```
├── app/
│   ├── admin/              # Painel administrativo
│   │   ├── items/          # Gestão de itens do cardápio
│   │   ├── categories/     # Gestão de categorias
│   │   ├── printers/       # Gestão de impressoras
│   │   └── tables/         # Gestão de mesas
│   ├── pos/                # Sistema POS para garçons
│   └── api/                # APIs REST
│       ├── items/          # CRUD de itens
│       ├── orders/         # Gestão de pedidos
│       ├── tables/         # Gestão de mesas
│       ├── sessions/       # Sessões de atendimento
│       └── printers/       # Sistema de impressão
├── lib/
│   ├── supabase/          # Cliente Supabase
│   ├── api/               # Hooks de API
│   └── services/          # Serviços (impressão, etc)
├── components/
│   ├── admin/             # Componentes administrativos
│   └── ui/                # Componentes shadcn/ui
└── types/                 # Tipagens TypeScript
```

## Funcionalidades Implementadas

### 📊 Painel Administrativo
- Dashboard com estatísticas em tempo real
- **CRUD completo de itens do cardápio**
  - Lista, criar novo, editar, excluir
  - Upload de imagens, categorização, preços
- **Gestão de categorias**
  - Lista, criar nova, editar, excluir
  - Ordenação e ativação/desativação
- **Controle de mesas**
  - Lista, criar nova, editar, excluir
  - Tipos (mesa/balcão), capacidade, status
- Configuração de impressoras

### 🍽️ Sistema POS
- Visualização em grid de todas as mesas
- Status em tempo real
- Abertura e fechamento de sessões
- Gestão de pedidos por mesa
- Cálculo automático de valores

### 🔌 APIs REST para App Mobile
- `/api/items` - Gestão de itens do menu
- `/api/orders` - Criação e gestão de pedidos
- `/api/tables` - Status das mesas
- `/api/sessions` - Sessões de atendimento
- `/api/printer-queue` - Sistema de impressão

### 🖨️ Sistema de Impressão
- Gestão de múltiplas impressoras
- Filas por setor (cozinha, bar, caixa)
- Status online/offline
- Formatação automática de comandas

## Configuração Necessária

### 1. Variáveis de Ambiente
Crie um arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service
```

### 2. Banco de Dados Supabase
Configure as tabelas seguindo o esquema em `types/database.ts`

## Como Usar

1. **Iniciar Sistema**
   ```bash
   npm run dev
   ```
   Acesso: `http://localhost:5000`

2. **Painel Admin**: `/admin`
3. **Sistema POS**: `/pos`

## Integração com App Mobile Android

O aplicativo Android para tablets deve consumir as APIs REST:

```javascript
// Exemplo de integração
const API_URL = 'http://seu-servidor:5000';

// Buscar itens do menu
fetch(`${API_URL}/api/items`)
  .then(res => res.json())
  .then(items => console.log(items));

// Criar pedido
fetch(`${API_URL}/api/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'xxx',
    items: [...]
  })
});
```

## Modelos de Atendimento

- **Rodízio Premium**: R$ 189,00
- **Rodízio Tradicional**: R$ 129,00
- **À la Carte**: Preços individuais

## Próximos Passos

### Prioritários
- [ ] Configurar Supabase com dados reais
- [ ] Implementar autenticação nas APIs
- [ ] Desenvolver app Android para tablets

### Melhorias Futuras
- [ ] WebSocket para real-time
- [ ] Dashboard analytics
- [ ] Relatórios gerenciais
- [ ] Integração pagamento online
- [ ] Sistema de avaliações

## Observações Técnicas

- Sistema usa Next.js 15 com App Router
- APIs REST prontas para integração mobile
- Mock data disponível para demonstração
- Aguardando configuração do Supabase