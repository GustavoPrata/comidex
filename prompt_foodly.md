# **PROMPT COMPLETO: SISTEMA DE GESTÃO DE RESTAURANTE JAPONÊS - MAAD RESTAURANT (REACT/NEXT.JS)**

## **VISÃO GERAL DO SISTEMA**

Crie um sistema completo de gestão de restaurante japonês (sushi/rodízio) em **Next.js 15 (App Router)** com **React**, **TypeScript** e **Tailwind CSS** com as seguintes características principais:

- **Painel Administrativo Web** para gestão completa do cardápio, mesas, impressoras e configurações
- **Sistema POS (Point of Sale)** para atendimento e pedidos
- **API REST completa** via Next.js API Routes para integração com tablets nas mesas
- **Sistema de Tablet** para clientes fazerem pedidos diretamente
- **Gestão de Impressão** com fila de impressão e múltiplas impressoras
- **Sistema de Rodízio** com diferentes tipos de atendimento (Premium, Tradicional, À la Carte)
- **Real-time Updates** com Server-Sent Events ou WebSockets

---

## **STACK TECNOLÓGICA**

### **Frontend**
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (componentes)
- **Lucide React** (ícones)
- **React Hook Form** (formulários)
- **Zod** (validação)
- **SWR** ou **TanStack Query** (data fetching)
- **dnd-kit** (drag & drop)
- **Recharts** (gráficos)

### **Backend**
- **Next.js API Routes** (Server Actions e Route Handlers)
- **Supabase** (banco de dados PostgreSQL + Auth + Storage)
- **Prisma** (ORM - opcional, pode usar Supabase client direto)
- **Server-Sent Events** (atualizações em tempo real)

### **Infraestrutura**
- **Vercel** (deploy)
- **Supabase** (banco de dados e storage)
- **Vercel Blob** (alternativa para storage de imagens)

---

## **1. ESTRUTURA DO BANCO DE DADOS (SUPABASE/POSTGRESQL)**

### **1.1 Tabelas Principais de Cardápio**

#### **groups** (Grupos do Menu)
\`\`\`sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  type VARCHAR(50) CHECK (type IN ('rodizio', 'a_la_carte', 'bebidas')),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  icon_id UUID REFERENCES icons(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Tipos**: Rodízio Premium (R$ 189), Rodízio Tradicional (R$ 129), À la Carte, Bebidas, Bebidas Alcoólicas, Vinhos

#### **icons** (Ícones para Grupos)
\`\`\`sql
CREATE TABLE icons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  file_path TEXT,
  svg_content TEXT,
  category VARCHAR(100),
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

Armazena SVGs para representar visualmente os grupos (pode armazenar o SVG como string ou URL do Supabase Storage)

#### **categories** (Categorias de Itens)
\`\`\`sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Exemplos**: Entradas, Sashimis, Carpaccios, Niguiris, Uramakis, Acelgamakis, Hossomakis, Temakis, Dyos, Chapas, Hot Rolls, Harumakis, Estilo Pasteis, Especial MAAD, Sobremesas, Kids

#### **items** (Itens do Cardápio)
\`\`\`sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity VARCHAR(100),
  price DECIMAL(10, 2),
  image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  printer_id UUID REFERENCES printers(id),
  active BOOLEAN DEFAULT true,
  available BOOLEAN DEFAULT true,
  spicy BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Lógica de Preço**: Se o item pertence a um grupo tipo 'rodizio', o preço pode ser NULL (incluso no rodízio). Se for 'a_la_carte' ou 'bebidas', tem preço individual.

#### **additional_categories** (Categorias de Adicionais)
\`\`\`sql
CREATE TABLE additional_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Exemplos**: Refrigerante, Vodka, Gelo, Limão

#### **additionals** (Adicionais/Extras)
\`\`\`sql
CREATE TABLE additionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  additional_category_id UUID REFERENCES additional_categories(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Exemplos**: Gelo (R$ 0), Limão (R$ 0), Smirnoff (R$ 3), Absolut (R$ 5), Ciroc (R$ 10)

#### **item_additionals** (Relação Muitos-para-Muitos)
\`\`\`sql
CREATE TABLE item_additionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  additional_id UUID REFERENCES additionals(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(item_id, additional_id)
);
\`\`\`

### **1.2 Tabelas de Mesas e Atendimento**

#### **restaurant_tables** (Mesas e Balcões)
\`\`\`sql
CREATE TABLE restaurant_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  number INTEGER NOT NULL,
  type VARCHAR(50) CHECK (type IN ('table', 'counter')),
  capacity INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Exemplos**: Mesa 1 (4 pessoas), Mesa VIP 1 (6 pessoas), Balcão 1

#### **table_sessions** (Sessões de Atendimento)
\`\`\`sql
CREATE TABLE table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  attendance_type VARCHAR(255) NOT NULL,
  number_of_people INTEGER NOT NULL,
  customer_name VARCHAR(255),
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  opened_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  status VARCHAR(50) CHECK (status IN ('active', 'closed')) DEFAULT 'active',
  time_limit INTEGER,
  payment_method VARCHAR(100),
  final_total DECIMAL(10, 2),
  notes TEXT,
  closing_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Lógica**: Quando uma mesa é aberta, cria-se uma sessão. O `total_price` é calculado como `unit_price * number_of_people`. O `final_total` é `total_price + soma dos pedidos extras`.

#### **attendance_types** (Tipos de Atendimento)
\`\`\`sql
CREATE TABLE attendance_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_id UUID REFERENCES groups(id),
  price DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Exemplos**: 
- Rodízio Premium (R$ 189) - acesso ao grupo Premium
- Rodízio Tradicional (R$ 129) - acesso ao grupo Tradicional
- À la Carte (R$ 0) - pedidos individuais

### **1.3 Tabelas de Pedidos**

#### **orders** (Pedidos)
\`\`\`sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES table_sessions(id) ON DELETE CASCADE,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')) DEFAULT 'pending',
  priority VARCHAR(50) CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  notes TEXT,
  estimated_time INTEGER,
  estimated_delivery TIMESTAMP,
  added_by VARCHAR(50) CHECK (added_by IN ('customer', 'waiter')) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **order_items** (Itens do Pedido)
\`\`\`sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  additionals_price DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  status VARCHAR(50) CHECK (status IN ('pending', 'preparing', 'ready', 'delivered', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **order_item_additionals** (Adicionais do Item no Pedido)
\`\`\`sql
CREATE TABLE order_item_additionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  additional_id UUID REFERENCES additionals(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### **1.4 Tabelas de Interações e Solicitações**

#### **service_types** (Tipos de Serviço)
\`\`\`sql
CREATE TABLE service_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  color VARCHAR(50),
  active BOOLEAN DEFAULT true,
  printer_id UUID REFERENCES printers(id),
  priority VARCHAR(50) CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  estimated_time INTEGER,
  notification_sound VARCHAR(255),
  default_message TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

**Exemplos**: Chamar Garçom, Solicitar Conta, Pedir Água, Pedir Hashi

#### **table_interactions** (Interações/Chamadas)
\`\`\`sql
CREATE TABLE table_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES table_sessions(id) ON DELETE CASCADE,
  table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  message TEXT,
  status VARCHAR(50) CHECK (status IN ('pending', 'attended')) DEFAULT 'pending',
  priority VARCHAR(50) CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT NOW(),
  attended_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### **1.5 Tabelas de Impressão**

#### **printers** (Impressoras)
\`\`\`sql
CREATE TABLE printers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'thermal',
  connection_type VARCHAR(50) CHECK (connection_type IN ('network', 'usb')),
  ip_address VARCHAR(50),
  port INTEGER,
  mac_address VARCHAR(50),
  location VARCHAR(255),
  active BOOLEAN DEFAULT true,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **print_queue** (Fila de Impressão)
\`\`\`sql
CREATE TABLE print_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  printer_id UUID REFERENCES printers(id),
  type VARCHAR(100),
  source VARCHAR(100),
  order_id UUID REFERENCES orders(id),
  item_id UUID REFERENCES items(id),
  content TEXT,
  status VARCHAR(50) CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  priority VARCHAR(50) CHECK (priority IN ('low', 'normal', 'high')) DEFAULT 'normal',
  scheduled_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### **1.6 Tabelas de Configuração do Tablet**

#### **tablet_config** (Configurações Gerais)
\`\`\`sql
CREATE TABLE tablet_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name VARCHAR(255) NOT NULL,
  system_active BOOLEAN DEFAULT true,
  allow_orders BOOLEAN DEFAULT true,
  update_interval INTEGER DEFAULT 30,
  inactivity_timeout INTEGER DEFAULT 300,
  primary_color VARCHAR(50),
  secondary_color VARCHAR(50),
  theme VARCHAR(50) CHECK (theme IN ('light', 'dark')) DEFAULT 'light',
  service_fee DECIMAL(5, 2) DEFAULT 0,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **tablet_devices** (Dispositivos Tablet)
\`\`\`sql
CREATE TABLE tablet_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  identifier VARCHAR(255) UNIQUE NOT NULL,
  table_id UUID REFERENCES restaurant_tables(id),
  status VARCHAR(50) CHECK (status IN ('online', 'offline')) DEFAULT 'offline',
  ip_address VARCHAR(50),
  mac_address VARCHAR(50),
  last_activity TIMESTAMP,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### **reviews** (Avaliações)
\`\`\`sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES table_sessions(id) ON DELETE CASCADE,
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  service_rating INTEGER CHECK (service_rating BETWEEN 1 AND 5),
  food_rating INTEGER CHECK (food_rating BETWEEN 1 AND 5),
  ambiance_rating INTEGER CHECK (ambiance_rating BETWEEN 1 AND 5),
  comments TEXT,
  would_recommend BOOLEAN,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### **1.7 Triggers e Functions (PostgreSQL)**

#### **Trigger: Atualizar valor total da sessão**
\`\`\`sql
CREATE OR REPLACE FUNCTION update_session_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE table_sessions
  SET final_total = total_price + (
    SELECT COALESCE(SUM(total), 0)
    FROM orders
    WHERE session_id = NEW.session_id
  )
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_session_after_order
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_session_total();
\`\`\`

#### **View: Dashboard Statistics**
\`\`\`sql
CREATE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM table_sessions WHERE status = 'active') as active_tables,
  (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
  (SELECT COALESCE(SUM(final_total), 0) FROM table_sessions WHERE DATE(opened_at) = CURRENT_DATE) as today_revenue,
  (SELECT COUNT(*) FROM table_sessions WHERE DATE(opened_at) = CURRENT_DATE) as today_sessions;
\`\`\`

---

## **2. ESTRUTURA DE PASTAS DO PROJETO NEXT.JS**

\`\`\`
maad-restaurant/
├── app/
│   ├── (admin)/                    # Grupo de rotas admin
│   │   ├── layout.tsx              # Layout do admin
│   │   ├── page.tsx                # Dashboard admin
│   │   ├── items/
│   │   │   ├── page.tsx            # Lista de itens
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Criar item
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx    # Editar item
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── groups/
│   │   │   └── page.tsx
│   │   ├── additionals/
│   │   │   └── page.tsx
│   │   ├── tables/
│   │   │   └── page.tsx
│   │   ├── printers/
│   │   │   └── page.tsx
│   │   ├── print-queue/
│   │   │   └── page.tsx
│   │   └── tablet-config/
│   │       └── page.tsx
│   ├── (pos)/                      # Grupo de rotas POS
│   │   ├── layout.tsx
│   │   └── page.tsx                # Sistema POS
│   ├── (tablet)/                   # Grupo de rotas Tablet
│   │   ├── layout.tsx
│   │   ├── [tableId]/
│   │   │   ├── page.tsx            # Menu do tablet
│   │   │   ├── cart/
│   │   │   │   └── page.tsx        # Carrinho
│   │   │   └── orders/
│   │   │       └── page.tsx        # Pedidos da mesa
│   │   └── qr/
│   │       └── [tableId]/
│   │           └── page.tsx        # Página de QR Code
│   ├── api/
│   │   ├── config/
│   │   │   ├── branding/
│   │   │   │   └── route.ts
│   │   │   ├── general/
│   │   │   │   └── route.ts
│   │   │   └── service-types/
│   │   │       └── route.ts
│   │   ├── menu/
│   │   │   ├── groups/
│   │   │   │   └── route.ts
│   │   │   ├── categories/
│   │   │   │   └── route.ts
│   │   │   └── items/
│   │   │       ├── route.ts
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   ├── tables/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts
│   │   │   │   └── status/
│   │   │   │       └── route.ts
│   │   │   ├── open/
│   │   │   │   └── route.ts
│   │   │   └── close/
│   │   │       └── route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── status/
│   │   │           └── route.ts
│   │   ├── interactions/
│   │   │   ├── route.ts
│   │   │   ├── [id]/
│   │   │   │   └── attend/
│   │   │   │       └── route.ts
│   │   │   └── pending/
│   │   │       └── route.ts
│   │   ├── reports/
│   │   │   ├── sales-today/
│   │   │   │   └── route.ts
│   │   │   └── popular-items/
│   │   │       └── route.ts
│   │   ├── waiter/
│   │   │   └── dashboard/
│   │   │       └── route.ts
│   │   └── reviews/
│   │       ├── route.ts
│   │       └── stats/
│   │           └── route.ts
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Home page
│   └── globals.css                 # Estilos globais
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── admin/
│   │   ├── item-card.tsx
│   │   ├── item-form.tsx
│   │   ├── category-list.tsx
│   │   ├── group-sidebar.tsx
│   │   ├── drag-drop-list.tsx
│   │   └── image-library-modal.tsx
│   ├── pos/
│   │   ├── pos-layout.tsx
│   │   ├── order-panel.tsx
│   │   └── table-selector.tsx
│   ├── tablet/
│   │   ├── menu-grid.tsx
│   │   ├── item-modal.tsx
│   │   ├── cart-drawer.tsx
│   │   ├── service-buttons.tsx
│   │   └── order-status.tsx
│   └── shared/
│       ├── navbar.tsx
│       ├── sidebar.tsx
│       ├── loading-spinner.tsx
│       └── error-boundary.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Cliente Supabase (browser)
│   │   ├── server.ts               # Cliente Supabase (server)
│   │   └── middleware.ts           # Middleware Supabase
│   ├── utils.ts                    # Funções utilitárias
│   ├── validations.ts              # Schemas Zod
│   └── constants.ts                # Constantes
├── hooks/
│   ├── use-items.ts
│   ├── use-orders.ts
│   ├── use-tables.ts
│   └── use-realtime.ts
├── types/
│   ├── database.ts                 # Tipos do banco de dados
│   ├── api.ts                      # Tipos das APIs
│   └── index.ts
├── services/
│   ├── printer-service.ts
│   ├── order-service.ts
│   └── notification-service.ts
├── public/
│   ├── icons/
│   └── images/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
\`\`\`

---

## **3. CONFIGURAÇÃO INICIAL**

### **3.1 Criar Projeto Next.js**
\`\`\`bash
npx create-next-app@latest maad-restaurant --typescript --tailwind --app --use-npm
cd maad-restaurant
\`\`\`

### **3.2 Instalar Dependências**
\`\`\`bash
# shadcn/ui
npx shadcn@latest init

# Componentes shadcn/ui necessários
npx shadcn@latest add button card dialog form input select table tabs dropdown-menu badge avatar sheet toast

# Outras dependências
npm install @supabase/supabase-js @supabase/ssr
npm install react-hook-form @hookform/resolvers zod
npm install swr
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install lucide-react
npm install recharts
npm install date-fns
npm install qrcode.react
npm install react-hot-toast
\`\`\`

### **3.3 Configurar Supabase**

1. Criar projeto no Supabase
2. Executar SQL para criar todas as tabelas (seção 1)
3. Configurar Storage Bucket para imagens:
   - Bucket: `items-images`
   - Bucket: `category-images`
   - Bucket: `icons`
   - Políticas: Public read, authenticated write

4. Criar arquivo `.env.local`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### **3.4 Configurar Cliente Supabase**

**lib/supabase/client.ts** (Client-side)
\`\`\`typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
\`\`\`

**lib/supabase/server.ts** (Server-side)
\`\`\`typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
\`\`\`

---

## **4. TIPOS TYPESCRIPT**

### **4.1 Database Types (types/database.ts)**
\`\`\`typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          type: 'rodizio' | 'a_la_carte' | 'bebidas'
          active: boolean
          sort_order: number
          icon_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          active: boolean
          sort_order: number
          group_id: string
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      items: {
        Row: {
          id: string
          name: string
          description: string | null
          quantity: string | null
          price: number | null
          image: string | null
          category_id: string
          group_id: string
          printer_id: string | null
          active: boolean
          available: boolean
          spicy: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['items']['Insert']>
      }
      restaurant_tables: {
        Row: {
          id: string
          name: string
          number: number
          type: 'table' | 'counter'
          capacity: number
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['restaurant_tables']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['restaurant_tables']['Insert']>
      }
      table_sessions: {
        Row: {
          id: string
          table_id: string
          attendance_type: string
          number_of_people: number
          customer_name: string | null
          unit_price: number
          total_price: number
          opened_at: string
          closed_at: string | null
          status: 'active' | 'closed'
          time_limit: number | null
          payment_method: string | null
          final_total: number | null
          notes: string | null
          closing_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['table_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['table_sessions']['Insert']>
      }
      orders: {
        Row: {
          id: string
          session_id: string
          total: number
          status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          notes: string | null
          estimated_time: number | null
          estimated_delivery: string | null
          added_by: 'customer' | 'waiter'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      // ... adicionar outros tipos conforme necessário
    }
    Views: {
      dashboard_stats: {
        Row: {
          active_tables: number
          pending_orders: number
          today_revenue: number
          today_sessions: number
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}

// Helper types
export type Group = Database['public']['Tables']['groups']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type RestaurantTable = Database['public']['Tables']['restaurant_tables']['Row']
export type TableSession = Database['public']['Tables']['table_sessions']['Row']
export type Order = Database['public']['Tables']['orders']['Row']

// Extended types with relations
export type ItemWithRelations = Item & {
  category: Category
  group: Group
  additionals: Additional[]
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    item: Item
    additionals: OrderItemAdditional[]
  })[]
}
\`\`\`

---

## **5. SCHEMAS DE VALIDAÇÃO (ZOD)**

### **5.1 lib/validations.ts**
\`\`\`typescript
import { z } from 'zod'

export const itemSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  quantity: z.string().optional(),
  price: z.number().min(0).nullable(),
  image: z.string().optional(),
  category_id: z.string().uuid('Categoria inválida'),
  group_id: z.string().uuid('Grupo inválido'),
  printer_id: z.string().uuid().nullable(),
  active: z.boolean().default(true),
  available: z.boolean().default(true),
  spicy: z.boolean().default(false),
  sort_order: z.number().default(0),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  group_id: z.string().uuid('Grupo inválido'),
  image: z.string().optional(),
  active: z.boolean().default(true),
  sort_order: z.number().default(0),
})

export const groupSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  price: z.number().min(0).nullable(),
  type: z.enum(['rodizio', 'a_la_carte', 'bebidas']),
  icon_id: z.string().uuid().nullable(),
  active: z.boolean().default(true),
  sort_order: z.number().default(0),
})

export const openTableSchema = z.object({
  table_id: z.string().uuid('Mesa inválida'),
  attendance_type: z.string().min(1, 'Tipo de atendimento obrigatório'),
  number_of_people: z.number().min(1, 'Número de pessoas deve ser maior que 0'),
  customer_name: z.string().optional(),
  notes: z.string().optional(),
})

export const createOrderSchema = z.object({
  session_id: z.string().uuid('Sessão inválida'),
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.number().min(1),
    notes: z.string().optional(),
    additionals: z.array(z.string().uuid()).optional(),
  })).min(1, 'Adicione pelo menos um item'),
  notes: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
})

export const createInteractionSchema = z.object({
  table_id: z.string().uuid('Mesa inválida'),
  type: z.string().min(1, 'Tipo de interação obrigatório'),
  message: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
})

export const reviewSchema = z.object({
  session_id: z.string().uuid('Sessão inválida'),
  overall_rating: z.number().min(1).max(5),
  service_rating: z.number().min(1).max(5),
  food_rating: z.number().min(1).max(5),
  ambiance_rating: z.number().min(1).max(5),
  comments: z.string().optional(),
  would_recommend: z.boolean(),
  email: z.string().email().optional(),
})
\`\`\`

---

## **6. API ROUTES (NEXT.JS)**

### **6.1 Menu API**

**app/api/menu/groups/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: groups, error } = await supabase
    .from('groups')
    .select(`
      *,
      icon:icons(*)
    `)
    .eq('active', true)
    .order('sort_order')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(groups)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('groups')
    .insert(body)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
\`\`\`

**app/api/menu/items/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const categoryId = searchParams.get('category_id')
  const groupId = searchParams.get('group_id')
  const spicy = searchParams.get('spicy')
  const search = searchParams.get('search')
  
  let query = supabase
    .from('items')
    .select(`
      *,
      category:categories(*),
      group:groups(*),
      additionals:item_additionals(
        sort_order,
        additional:additionals(*)
      )
    `)
    .eq('active', true)
    .eq('available', true)
    .order('sort_order')
  
  if (categoryId) query = query.eq('category_id', categoryId)
  if (groupId) query = query.eq('group_id', groupId)
  if (spicy === 'true') query = query.eq('spicy', true)
  if (search) query = query.ilike('name', `%${search}%`)
  
  const { data: items, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(items)
}
\`\`\`

**app/api/menu/items/[id]/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  const { data: item, error } = await supabase
    .from('items')
    .select(`
      *,
      category:categories(*),
      group:groups(*),
      additionals:item_additionals(
        sort_order,
        additional:additionals(
          *,
          category:additional_categories(*)
        )
      )
    `)
    .eq('id', params.id)
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
  
  return NextResponse.json(item)
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('items')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', params.id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
\`\`\`

### **6.2 Tables API**

**app/api/tables/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: tables, error } = await supabase
    .from('restaurant_tables')
    .select(`
      *,
      current_session:table_sessions!inner(
        id,
        status,
        opened_at,
        number_of_people,
        customer_name
      )
    `)
    .eq('active', true)
    .eq('table_sessions.status', 'active')
    .order('sort_order')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(tables)
}
\`\`\`

**app/api/tables/open/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openTableSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  // Validar dados
  const validation = openTableSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors },
      { status: 400 }
    )
  }
  
  const { table_id, attendance_type, number_of_people, customer_name, notes } = validation.data
  
  // Buscar tipo de atendimento para obter preço
  const { data: attendanceTypeData } = await supabase
    .from('attendance_types')
    .select('price')
    .eq('name', attendance_type)
    .single()
  
  const unit_price = attendanceTypeData?.price || 0
  const total_price = unit_price * number_of_people
  
  // Criar sessão
  const { data: session, error } = await supabase
    .from('table_sessions')
    .insert({
      table_id,
      attendance_type,
      number_of_people,
      customer_name,
      unit_price,
      total_price,
      notes,
      status: 'active',
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(session)
}
\`\`\`

**app/api/tables/close/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { session_id, payment_method, closing_notes } = await request.json()
  
  // Buscar sessão com total de pedidos
  const { data: session } = await supabase
    .from('table_sessions')
    .select(`
      *,
      orders(total)
    `)
    .eq('id', session_id)
    .single()
  
  if (!session) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
  }
  
  // Calcular total final
  const ordersTotal = session.orders.reduce((sum: number, order: any) => sum + order.total, 0)
  const final_total = session.total_price + ordersTotal
  
  // Fechar sessão
  const { data, error } = await supabase
    .from('table_sessions')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
      payment_method,
      final_total,
      closing_notes,
    })
    .eq('id', session_id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
\`\`\`

### **6.3 Orders API**

**app/api/orders/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOrderSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  // Validar dados
  const validation = createOrderSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors },
      { status: 400 }
    )
  }
  
  const { session_id, items, notes, priority } = validation.data
  
  // Buscar sessão para verificar tipo de atendimento
  const { data: session } = await supabase
    .from('table_sessions')
    .select('attendance_type')
    .eq('id', session_id)
    .single()
  
  if (!session) {
    return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 })
  }
  
  // Calcular total do pedido
  let orderTotal = 0
  const orderItemsData = []
  
  for (const itemData of items) {
    // Buscar item
    const { data: item } = await supabase
      .from('items')
      .select('*, group:groups(type)')
      .eq('id', itemData.id)
      .single()
    
    if (!item) continue
    
    // Calcular preço baseado no tipo de atendimento
    let unitPrice = 0
    if (session.attendance_type === 'À la Carte') {
      unitPrice = item.price || 0
    } else {
      // No rodízio, só cobra se não estiver incluso
      if (item.group.type !== 'rodizio') {
        unitPrice = item.price || 0
      }
    }
    
    // Calcular preço dos adicionais
    let additionalsPrice = 0
    if (itemData.additionals && itemData.additionals.length > 0) {
      const { data: additionals } = await supabase
        .from('additionals')
        .select('price')
        .in('id', itemData.additionals)
      
      additionalsPrice = additionals?.reduce((sum, add) => sum + add.price, 0) || 0
    }
    
    const totalPrice = (unitPrice + additionalsPrice) * itemData.quantity
    orderTotal += totalPrice
    
    orderItemsData.push({
      item_id: item.id,
      quantity: itemData.quantity,
      unit_price: unitPrice,
      additionals_price: additionalsPrice,
      total_price: totalPrice,
      notes: itemData.notes,
      additionals: itemData.additionals || [],
    })
  }
  
  // Criar pedido
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      session_id,
      total: orderTotal,
      notes,
      priority,
      status: 'pending',
    })
    .select()
    .single()
  
  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }
  
  // Criar itens do pedido
  for (const itemData of orderItemsData) {
    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        ...itemData,
      })
      .select()
      .single()
    
    if (itemError) continue
    
    // Criar adicionais do item
    if (itemData.additionals.length > 0) {
      const { data: additionals } = await supabase
        .from('additionals')
        .select('*')
        .in('id', itemData.additionals)
      
      for (const additional of additionals || []) {
        await supabase
          .from('order_item_additionals')
          .insert({
            order_item_id: orderItem.id,
            additional_id: additional.id,
            quantity: 1,
            price: additional.price,
          })
      }
    }
  }
  
  // Adicionar à fila de impressão
  await supabase
    .from('print_queue')
    .insert({
      order_id: order.id,
      type: 'kitchen_order',
      status: 'pending',
      priority: priority === 'urgent' ? 'high' : 'normal',
    })
  
  return NextResponse.json(order)
}
\`\`\`

**app/api/orders/[id]/status/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const { status } = await request.json()
  
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', params.id)
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
\`\`\`

### **6.4 Interactions API**

**app/api/interactions/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createInteractionSchema } from '@/lib/validations'

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const validation = createInteractionSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors },
      { status: 400 }
    )
  }
  
  const { table_id, type, message, priority } = validation.data
  
  // Buscar sessão ativa da mesa
  const { data: session } = await supabase
    .from('table_sessions')
    .select('id')
    .eq('table_id', table_id)
    .eq('status', 'active')
    .single()
  
  if (!session) {
    return NextResponse.json({ error: 'Mesa não possui sessão ativa' }, { status: 400 })
  }
  
  const { data, error } = await supabase
    .from('table_interactions')
    .insert({
      session_id: session.id,
      table_id,
      type,
      message,
      priority,
      status: 'pending',
    })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
\`\`\`

**app/api/interactions/pending/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('table_interactions')
    .select(`
      *,
      table:restaurant_tables(*),
      session:table_sessions(*)
    `)
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at')
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
\`\`\`

### **6.5 Reports API**

**app/api/reports/sales-today/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  
  // Total de vendas
  const { data: sessions } = await supabase
    .from('table_sessions')
    .select('final_total, opened_at')
    .gte('opened_at', `${today}T00:00:00`)
    .lte('opened_at', `${today}T23:59:59`)
  
  const totalRevenue = sessions?.reduce((sum, s) => sum + (s.final_total || 0), 0) || 0
  const totalSessions = sessions?.length || 0
  const averageTicket = totalSessions > 0 ? totalRevenue / totalSessions : 0
  
  // Vendas por hora
  const salesByHour = sessions?.reduce((acc: any, session) => {
    const hour = new Date(session.opened_at).getHours()
    acc[hour] = (acc[hour] || 0) + (session.final_total || 0)
    return acc
  }, {})
  
  return NextResponse.json({
    total_revenue: totalRevenue,
    total_sessions: totalSessions,
    average_ticket: averageTicket,
    sales_by_hour: salesByHour,
  })
}
\`\`\`

**app/api/reports/popular-items/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('order_items')
    .select(`
      item_id,
      quantity,
      item:items(name, image)
    `)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Agrupar por item e somar quantidades
  const itemsMap = data.reduce((acc: any, orderItem) => {
    const itemId = orderItem.item_id
    if (!acc[itemId]) {
      acc[itemId] = {
        item_id: itemId,
        name: orderItem.item.name,
        image: orderItem.item.image,
        total_quantity: 0,
      }
    }
    acc[itemId].total_quantity += orderItem.quantity
    return acc
  }, {})
  
  // Converter para array e ordenar
  const popularItems = Object.values(itemsMap)
    .sort((a: any, b: any) => b.total_quantity - a.total_quantity)
    .slice(0, 10)
  
  return NextResponse.json(popularItems)
}
\`\`\`

### **6.6 Waiter Dashboard API**

**app/api/waiter/dashboard/route.ts**
\`\`\`typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  // Mesas ativas
  const { data: activeTables } = await supabase
    .from('table_sessions')
    .select(`
      *,
      table:restaurant_tables(*)
    `)
    .eq('status', 'active')
  
  // Pedidos pendentes
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select(`
      *,
      session:table_sessions(
        table:restaurant_tables(*)
      )
    `)
    .in('status', ['pending', 'preparing'])
    .order('priority', { ascending: false })
    .order('created_at')
  
  // Interações pendentes
  const { data: pendingInteractions } = await supabase
    .from('table_interactions')
    .select(`
      *,
      table:restaurant_tables(*)
    `)
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at')
  
  // Estatísticas do dia
  const { data: stats } = await supabase
    .from('dashboard_stats')
    .select('*')
    .single()
  
  return NextResponse.json({
    active_tables: activeTables,
    pending_orders: pendingOrders,
    pending_interactions: pendingInteractions,
    stats,
  })
}
\`\`\`

---

## **7. COMPONENTES REACT**

### **7.1 Admin - Item Card**

**components/admin/item-card.tsx**
\`\`\`typescript
'use client'

import { Item } from '@/types/database'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Copy, Trash2, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'

interface ItemCardProps {
  item: Item & { category: any; group: any }
  onEdit: (item: Item) => void
  onDuplicate: (item: Item) => void
  onDelete: (item: Item) => void
  onToggleActive: (item: Item) => void
}

export function ItemCard({ item, onEdit, onDuplicate, onDelete, onToggleActive }: ItemCardProps) {
  const formattedPrice = item.price === null || item.price === 0 
    ? 'Rodízio' 
    : `R$ ${item.price.toFixed(2).replace('.', ',')}`
  
  return (
    <Card className={!item.active ? 'opacity-50' : ''}>
      <CardContent className="p-4">
        {item.image && (
          <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
            <Image
              src={item.image || "/placeholder.svg"}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <div className="flex gap-1">
              {item.spicy && <Badge variant="destructive">Picante</Badge>}
              {!item.active && <Badge variant="secondary">Inativo</Badge>}
              {!item.available && <Badge variant="outline">Indisponível</Badge>}
            </div>
          </div>
          
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.quantity}</span>
            <span className="font-semibold text-lg">{formattedPrice}</span>
          </div>
          
          <div className="flex gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{item.category.name}</Badge>
            <Badge variant="outline">{item.group.name}</Badge>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(item)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDuplicate(item)}>
          <Copy className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onToggleActive(item)}>
          {item.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(item)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
\`\`\`

### **7.2 Admin - Item Form**

**components/admin/item-form.tsx**
\`\`\`typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { itemSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'

interface ItemFormProps {
  item?: any
  groups: any[]
  categories: any[]
  printers: any[]
  onSuccess: () => void
  onCancel: () => void
}

export function ItemForm({ item, groups, categories, printers, onSuccess, onCancel }: ItemFormProps) {
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()
  
  const form = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: item || {
      name: '',
      description: '',
      quantity: '',
      price: null,
      image: '',
      category_id: '',
      group_id: '',
      printer_id: null,
      active: true,
      available: true,
      spicy: false,
      sort_order: 0,
    },
  })
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `items/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('items-images')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      const { data: { publicUrl } } = supabase.storage
        .from('items-images')
        .getPublicUrl(filePath)
      
      form.setValue('image', publicUrl)
      toast.success('Imagem enviada com sucesso!')
    } catch (error) {
      toast.error('Erro ao enviar imagem')
    } finally {
      setUploading(false)
    }
  }
  
  const onSubmit = async (data: any) => {
    try {
      if (item) {
        // Atualizar
        const { error } = await supabase
          .from('items')
          .update(data)
          .eq('id', item.id)
        
        if (error) throw error
        toast.success('Item atualizado com sucesso!')
      } else {
        // Criar
        const { error } = await supabase
          .from('items')
          .insert(data)
        
        if (error) throw error
        toast.success('Item criado com sucesso!')
      }
      
      onSuccess()
    } catch (error) {
      toast.error('Erro ao salvar item')
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Ex: 8 unidades" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="group_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grupo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um grupo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </FormControl>
              {field.value && (
                <img src={field.value || "/placeholder.svg"} alt="Preview" className="w-32 h-32 object-cover rounded" />
              )}
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Ativo</FormLabel>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="available"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Disponível</FormLabel>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="spicy"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Picante</FormLabel>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {item ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
\`\`\`

### **7.3 Tablet - Menu Grid**

**components/tablet/menu-grid.tsx**
\`\`\`typescript
'use client'

import { Item } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Flame } from 'lucide-react'
import Image from 'next/image'

interface MenuGridProps {
  items: Item[]
  onItemClick: (item: Item) => void
}

export function MenuGrid({ items, onItemClick }: MenuGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onItemClick(item)}
        >
          <CardContent className="p-0">
            {item.image && (
              <div className="relative w-full h-48">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
                {item.spicy && (
                  <Badge className="absolute top-2 right-2" variant="destructive">
                    <Flame className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            )}
            
            <div className="p-4 space-y-2">
              <h3 className="font-semibold line-clamp-2">{item.name}</h3>
              
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{item.quantity}</span>
                <span className="font-semibold">
                  {item.price === null || item.price === 0
                    ? 'Rodízio'
                    : `R$ ${item.price.toFixed(2).replace('.', ',')}`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
\`\`\`

### **7.4 Tablet - Item Modal**

**components/tablet/item-modal.tsx**
\`\`\`typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Minus, Plus, Flame } from 'lucide-react'
import Image from 'next/image'

interface ItemModalProps {
  item: any
  open: boolean
  onClose: () => void
  onAddToCart: (item: any, quantity: number, additionals: string[], notes: string) => void
}

export function ItemModal({ item, open, onClose, onAddToCart }: ItemModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedAdditionals, setSelectedAdditionals] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  
  if (!item) return null
  
  const handleAddToCart = () => {
    onAddToCart(item, quantity, selectedAdditionals, notes)
    setQuantity(1)
    setSelectedAdditionals([])
    setNotes('')
    onClose()
  }
  
  const toggleAdditional = (additionalId: string) => {
    setSelectedAdditionals((prev) =>
      prev.includes(additionalId)
        ? prev.filter((id) => id !== additionalId)
        : [...prev, additionalId]
    )
  }
  
  const calculateTotal = () => {
    let total = item.price || 0
    
    if (item.additionals) {
      const additionalsTotal = item.additionals
        .filter((a: any) => selectedAdditionals.includes(a.additional.id))
        .reduce((sum: number, a: any) => sum + a.additional.price, 0)
      total += additionalsTotal
    }
    
    return total * quantity
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.name}
            {item.spicy && (
              <Badge variant="destructive">
                <Flame className="h-3 w-3 mr-1" />
                Picante
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {item.image && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          {item.description && (
            <p className="text-muted-foreground">{item.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.quantity}</span>
            <span className="text-2xl font-bold">
              {item.price === null || item.price === 0
                ? 'Incluso no Rodízio'
                : `R$ ${item.price.toFixed(2).replace('.', ',')}`}
            </span>
          </div>
          
          {item.additionals && item.additionals.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Adicionais</h3>
              <div className="space-y-2">
                {item.additionals.map((a: any) => (
                  <div key={a.additional.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedAdditionals.includes(a.additional.id)}
                        onCheckedChange={() => toggleAdditional(a.additional.id)}
                      />
                      <span>{a.additional.name}</span>
                    </div>
                    <span className="text-sm">
                      {a.additional.price === 0
                        ? 'Grátis'
                        : `+ R$ ${a.additional.price.toFixed(2).replace('.', ',')}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="font-semibold">Observações</h3>
            <Textarea
              placeholder="Ex: Sem cebola, bem passado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">
                R$ {calculateTotal().toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAddToCart}>
            Adicionar ao Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
\`\`\`

---

## **8. PÁGINAS PRINCIPAIS**

### **8.1 Home Page**

**app/page.tsx**
\`\`\`typescript
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, ShoppingCart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">MAAD Restaurant</h1>
          <p className="text-xl text-muted-foreground">Sistema de Gestão de Restaurante</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/admin">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>Painel Administrativo</CardTitle>
                <CardDescription>
                  Gerencie cardápio, mesas, pedidos e configurações
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Acessar Painel</Button>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/pos">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle>Sistema POS</CardTitle>
                <CardDescription>
                  Atendimento e gestão de pedidos em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Acessar POS</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
\`\`\`

### **8.2 Admin - Items Page**

**app/(admin)/items/page.tsx**
\`\`\`typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ItemCard } from '@/components/admin/item-card'
import { ItemForm } from '@/components/admin/item-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function ItemsPage() {
  const [items, setItems] = useState([])
  const [groups, setGroups] = useState([])
  const [categories, setCategories] = useState([])
  const [printers, setPrinters] = useState([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const supabase = createClient()
  
  useEffect(() => {
    loadData()
  }, [selectedGroup, selectedCategory, search])
  
  const loadData = async () => {
    // Carregar grupos
    const { data: groupsData } = await supabase
      .from('groups')
      .select('*')
      .eq('active', true)
      .order('sort_order')
    setGroups(groupsData || [])
    
    // Carregar categorias
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order')
    setCategories(categoriesData || [])
    
    // Carregar impressoras
    const { data: printersData } = await supabase
      .from('printers')
      .select('*')
      .eq('active', true)
    setPrinters(printersData || [])
    
    // Carregar itens com filtros
    let query = supabase
      .from('items')
      .select(`
        *,
        category:categories(*),
        group:groups(*)
      `)
      .order('sort_order')
    
    if (selectedGroup) query = query.eq('group_id', selectedGroup)
    if (selectedCategory) query = query.eq('category_id', selectedCategory)
    if (search) query = query.ilike('name', `%${search}%`)
    
    const { data: itemsData } = await query
    setItems(itemsData || [])
  }
  
  const handleDuplicate = async (item: any) => {
    const { error } = await supabase
      .from('items')
      .insert({
        ...item,
        id: undefined,
        name: `${item.name} (Cópia)`,
        created_at: undefined,
        updated_at: undefined,
      })
    
    if (error) {
      toast.error('Erro ao duplicar item')
    } else {
      toast.success('Item duplicado com sucesso!')
      loadData()
    }
  }
  
  const handleDelete = async (item: any) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return
    
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', item.id)
    
    if (error) {
      toast.error('Erro ao excluir item')
    } else {
      toast.success('Item excluído com sucesso!')
      loadData()
    }
  }
  
  const handleToggleActive = async (item: any) => {
    const { error } = await supabase
      .from('items')
      .update({ active: !item.active })
      .eq('id', item.id)
    
    if (error) {
      toast.error('Erro ao atualizar item')
    } else {
      toast.success('Item atualizado com sucesso!')
      loadData()
    }
  }
  
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Itens do Cardápio</h1>
        <Button onClick={() => { setEditingItem(null); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar itens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedGroup || ''}
          onChange={(e) => setSelectedGroup(e.target.value || null)}
          className="border rounded-md px-3"
        >
          <option value="">Todos os grupos</option>
          {groups.map((group: any) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
        
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="border rounded-md px-3"
        >
          <option value="">Todas as categorias</option>
          {categories.map((category: any) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item: any) => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={(item) => { setEditingItem(item); setShowForm(true); }}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        ))}
      </div>
      
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          </DialogHeader>
          <ItemForm
            item={editingItem}
            groups={groups}
            categories={categories}
            printers={printers}
            onSuccess={() => { setShowForm(false); loadData(); }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
\`\`\`

### **8.3 Tablet - Menu Page**

**app/(tablet)/[tableId]/page.tsx**
\`\`\`typescript
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { MenuGrid } from '@/components/tablet/menu-grid'
import { ItemModal } from '@/components/tablet/item-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, Bell, User } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function TabletMenuPage() {
  const params = useParams()
  const tableId = params.tableId as string
  const [groups, setGroups] = useState([])
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [cart, setCart] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()
  
  useEffect(() => {
    loadSession()
    loadGroups()
  }, [])
  
  useEffect(() => {
    if (selectedGroup) {
      loadCategories(selectedGroup)
    }
  }, [selectedGroup])
  
  useEffect(() => {
    if (selectedCategory) {
      loadItems(selectedCategory)
    }
  }, [selectedCategory])
  
  const loadSession = async () => {
    const { data } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('table_id', tableId)
      .eq('status', 'active')
      .single()
    
    setSession(data)
  }
  
  const loadGroups = async () => {
    const { data } = await supabase
      .from('groups')
      .select('*, icon:icons(*)')
      .eq('active', true)
      .order('sort_order')
    
    setGroups(data || [])
    if (data && data.length > 0) {
      setSelectedGroup(data[0].id)
    }
  }
  
  const loadCategories = async (groupId: string) => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('group_id', groupId)
      .eq('active', true)
      .order('sort_order')
    
    setCategories(data || [])
    if (data && data.length > 0) {
      setSelectedCategory(data[0].id)
    }
  }
  
  const loadItems = async (categoryId: string) => {
    const { data } = await supabase
      .from('items')
      .select(`
        *,
        additionals:item_additionals(
          sort_order,
          additional:additionals(*)
        )
      `)
      .eq('category_id', categoryId)
      .eq('active', true)
      .eq('available', true)
      .order('sort_order')
    
    setItems(data || [])
  }
  
  const handleAddToCart = (item: any, quantity: number, additionals: string[], notes: string) => {
    setCart([...cart, { item, quantity, additionals, notes }])
    toast.success('Item adicionado ao carrinho!')
  }
  
  const handleCheckout = async () => {
    if (!session) {
      toast.error('Mesa não possui sessão ativa')
      return
    }
    
    if (cart.length === 0) {
      toast.error('Carrinho vazio')
      return
    }
    
    const orderData = {
      session_id: session.id,
      items: cart.map((cartItem) => ({
        id: cartItem.item.id,
        quantity: cartItem.quantity,
        additionals: cartItem.additionals,
        notes: cartItem.notes,
      })),
      priority: 'normal',
    }
    
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    })
    
    if (response.ok) {
      toast.success('Pedido enviado com sucesso!')
      setCart([])
    } else {
      toast.error('Erro ao enviar pedido')
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">MAAD Restaurant</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <Tabs value={selectedGroup || ''} onValueChange={setSelectedGroup}>
          <TabsList className="mb-6">
            {groups.map((group: any) => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {groups.map((group: any) => (
            <TabsContent key={group.id} value={group.id}>
              <Tabs value={selectedCategory || ''} onValueChange={setSelectedCategory}>
                <TabsList className="mb-6">
                  {categories.map((category: any) => (
                    <TabsTrigger key={category.id} value={category.id}>
                      {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map((category: any) => (
                  <TabsContent key={category.id} value={category.id}>
                    <MenuGrid
                      items={items}
                      onItemClick={setSelectedItem}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      </main>
      
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{cart.length} itens no carrinho</p>
            </div>
            <Button size="lg" onClick={handleCheckout}>
              Enviar Pedido
            </Button>
          </div>
        </div>
      )}
      
      <ItemModal
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}
\`\`\`

---

## **9. FUNCIONALIDADES AVANÇADAS**

### **9.1 Real-time Updates com Supabase**

**hooks/use-realtime.ts**
\`\`\`typescript
'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeOrders(onUpdate: (payload: any) => void) {
  const supabase = createClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          onUpdate(payload)
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [onUpdate])
}

export function useRealtimeInteractions(onUpdate: (payload: any) => void) {
  const supabase = createClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('interactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'table_interactions',
        },
        (payload) => {
          onUpdate(payload)
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [onUpdate])
}
\`\`\`

### **9.2 Drag & Drop com dnd-kit**

**components/admin/drag-drop-list.tsx**
\`\`\`typescript
'use client'

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {children}
    </div>
  )
}

interface DragDropListProps {
  items: any[]
  onReorder: (items: any[]) => void
  renderItem: (item: any) => React.ReactNode
}

export function DragDropList({ items, onReorder, renderItem }: DragDropListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      
      const newItems = arrayMove(items, oldIndex, newIndex)
      onReorder(newItems)
    }
  }
  
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
\`\`\`

### **9.3 QR Code Generator**

**app/(tablet)/qr/[tableId]/page.tsx**
\`\`\`typescript
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function QRCodePage({ params }: { params: { tableId: string } }) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/tablet/${params.tableId}`
  
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Mesa {params.tableId}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <QRCodeSVG value={url} size={256} />
          <p className="text-center text-sm text-muted-foreground">
            Escaneie o QR Code para acessar o cardápio
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

---

## **10. DEPLOY E PRODUÇÃO**

### **10.1 Deploy na Vercel**
\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
\`\`\`

### **10.2 Variáveis de Ambiente na Vercel**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### **10.3 Configurações de Produção**

**next.config.js**
\`\`\`javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig
\`\`\`

---

## **11. MELHORIAS FUTURAS**

### **11.1 Autenticação**
- Implementar Supabase Auth para admin e garçons
- Roles e permissões (admin, garçom, cozinha)
- Histórico de ações por usuário

### **11.2 PWA (Progressive Web App)**
- Adicionar service worker
- Funcionalidade offline
- Instalável em dispositivos móveis

### **11.3 Notificações Push**
- Web Push API para notificações
- Alertas para novos pedidos
- Alertas para interações

### **11.4 Analytics e Relatórios**
- Dashboard com gráficos (Recharts)
- Relatórios de vendas por período
- Análise de itens mais vendidos
- Exportar relatórios em PDF

### **11.5 Integração com Pagamentos**
- Stripe ou Mercado Pago
- Pagamento via PIX
- Split de conta

---

## **12. COMANDOS ÚTEIS**

\`\`\`bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Start produção
npm start

# Lint
npm run lint

# Adicionar componente shadcn
npx shadcn@latest add [component-name]

# Gerar tipos do Supabase
npx supabase gen types typescript --project-id [project-id] > types/database.ts
\`\`\`

---

Este prompt completo descreve TODO o sistema de gestão de restaurante japonês usando **React/Next.js**, incluindo estrutura de banco de dados, tipos TypeScript, API Routes, componentes, páginas, hooks, e funcionalidades avançadas. Use este prompt para construir o sistema do zero!
