# 🍱 ComideX Restaurant Management System

Sistema completo de gestão para restaurante japonês com painel administrativo, sistema POS para garçons e APIs REST para integração com aplicativo mobile.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4)

## ✨ Funcionalidades

### 👨‍💼 Painel Administrativo
- Dashboard com métricas em tempo real
- Gestão completa do cardápio (itens, categorias, grupos)
- Controle de mesas e capacidade
- Configuração de impressoras por setor
- Sistema de preços (Rodízio Premium/Tradicional/À la Carte)

### 🍽️ Sistema POS (Point of Sale)
- Interface para garçons
- Visualização de status das mesas
- Abertura/fechamento de contas
- Gestão de pedidos
- Cálculo automático de valores

### 📱 APIs REST para App Mobile
- Endpoints completos para integração com tablet Android
- Autenticação e autorização (em desenvolvimento)
- Gestão de pedidos e mesas
- Sistema de notificações em tempo real

### 🖨️ Sistema de Impressão
- Múltiplas impressoras por setor
- Fila de impressão inteligente
- Comandas formatadas automaticamente
- Status online/offline em tempo real

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- Conta Supabase (para banco de dados)

### Instalação

1. Clone o repositório
```bash
git clone [url-do-repositorio]
cd maad-restaurant
```

2. Configure as variáveis de ambiente
```bash
cp .env.local.example .env.local
```

Edite `.env.local` com suas credenciais Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service
```

3. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5000`

## 📁 Estrutura do Projeto

```
maad-restaurant/
├── app/                    # Next.js App Router
│   ├── admin/             # Painel administrativo
│   ├── pos/               # Sistema POS
│   └── api/               # API Routes REST
├── components/            # Componentes React
│   ├── admin/            # Componentes admin
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilitários e serviços
│   ├── api/              # Hooks de API
│   ├── supabase/         # Cliente Supabase
│   └── services/         # Serviços (impressão, etc)
├── types/                 # TypeScript types
└── public/                # Assets estáticos
```

## 🗄️ Configuração do Banco de Dados

### Tabelas Principais
- `groups` - Grupos do cardápio (Rodízio, À la Carte, Bebidas)
- `categories` - Categorias (Sashimis, Hot Rolls, etc)
- `items` - Itens do cardápio
- `restaurant_tables` - Mesas do restaurante
- `table_sessions` - Sessões de atendimento
- `orders` - Pedidos
- `order_items` - Itens dos pedidos
- `printers` - Impressoras cadastradas
- `printer_queue` - Fila de impressão

### Storage Buckets
Configure no Supabase Storage:
- `items-images` - Imagens dos pratos
- `category-images` - Imagens das categorias
- `icons` - Ícones do sistema

## 🔌 APIs REST para Integração Mobile

### Endpoints de Dados
- `GET /api/items` - Listar itens do menu
- `GET /api/categories` - Listar categorias
- `GET /api/tables` - Status das mesas
- `POST /api/orders` - Criar novo pedido
- `GET /api/orders` - Listar pedidos

### Endpoints de Gestão
- `POST /api/sessions` - Abrir mesa
- `PATCH /api/sessions/[id]` - Fechar mesa
- `GET /api/printer-queue` - Verificar fila de impressão
- `POST /api/printers` - Enviar para impressão

### Exemplo de Requisição
```javascript
// Buscar itens do menu
const response = await fetch('http://localhost:5000/api/items', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  }
});
const items = await response.json();
```

## 💰 Modelos de Negócio

### Rodízio Premium - R$ 189,00
- Cardápio completo premium
- Pratos especiais inclusos
- Bebidas e sobremesas à parte

### Rodízio Tradicional - R$ 129,00
- Cardápio tradicional
- Pratos básicos inclusos
- Bebidas e sobremesas à parte

### À la Carte
- Pedidos individuais
- Preços por item
- Ideal para delivery

## 🛠️ Tecnologias Utilizadas

- **[Next.js 15](https://nextjs.org/)** - Framework React
- **[React 19](https://react.dev/)** - Biblioteca UI
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Estilização
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes
- **[Supabase](https://supabase.com/)** - Backend as a Service
- **[SWR](https://swr.vercel.app/)** - Data fetching

## 📱 Aplicativo Mobile (Android)

O sistema foi projetado para trabalhar com um aplicativo Android para tablets que se conecta via APIs REST. O app mobile deverá:

- Consumir as APIs REST do sistema
- Permitir que clientes façam pedidos
- Exibir menu por categorias
- Gerenciar carrinho de compras
- Enviar pedidos para a cozinha

## 📝 Roadmap

- [x] Interface administrativa
- [x] Sistema POS
- [x] APIs REST
- [x] Sistema de impressão
- [ ] Autenticação e autorização
- [ ] WebSocket para real-time
- [ ] Dashboard analytics
- [ ] Integração pagamento online
- [ ] Sistema de avaliações
- [ ] Gestão de estoque

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estes passos:

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Feito com ❤️ para revolucionar a gestão de restaurantes japoneses