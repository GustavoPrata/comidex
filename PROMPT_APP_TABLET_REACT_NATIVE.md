# Prompt Completo - App Tablet ComideX (React Native/Expo)

## Contexto
Crie um aplicativo completo de autoatendimento para tablet usando React Native com Expo, similar ao Goomer, para o restaurante japonês ComideX. O app deve permitir que clientes façam pedidos diretamente no tablet, com interface intuitiva, modo kiosk, e integração total com as APIs do sistema principal.

## Requisitos Técnicos

### Stack
- React Native com Expo
- TypeScript
- React Navigation (navegação)
- Axios (requisições HTTP)
- AsyncStorage (persistência local)
- React Native Reanimated (animações)
- React Native Gesture Handler (gestos)
- Expo Secure Store (senhas)
- Expo Keep Awake (tela sempre ligada)
- React Native Fast Image (otimização de imagens)

## Estrutura do App

### 1. Telas Principais

#### Tela Inicial (SplashScreen)
- Logo animado do ComideX
- Verificação de conexão com API
- Carregamento de configurações
- Transição suave para tela de boas-vindas

#### Tela de Boas-Vindas
- Mensagem "Bem-vindo ao ComideX"
- Input para número da mesa (se configurado como obrigatório)
- Seleção de modo: Rodízio ou À La Carte
- Botão de bloqueio no canto (discreto)
- Design minimalista com cores: preto (#030712), laranja (#FF6B00) e branco

#### Tela Principal de Pedidos
**Layout em 2 colunas (70/30):**

**Coluna Esquerda (30%):**
- Informações da mesa no topo
- Lista de categorias com ícones
- Categoria "Bebidas" especial
- Indicador visual de categoria selecionada
- Scroll suave entre categorias

**Coluna Direita (70%):**
- Grid de produtos (3 colunas)
- Cards com imagem 16:9
- Nome, descrição e preço
- Animação ao adicionar ao carrinho
- Indicador visual de itens no carrinho
- Scroll infinito otimizado

#### Modal/Drawer do Carrinho
- Slide da direita
- Lista de itens com controle de quantidade
- Campo de observação por item
- Cálculo automático de totais
- Botões: "Enviar Tudo" e "Enviar Item por Item"
- Animações de adição/remoção
- Feedback visual de ações

#### Tela de Histórico
- Lista de pedidos realizados
- Total gasto na sessão
- Status de cada pedido
- Possibilidade de repetir pedido

#### Tela de Bloqueio
- Teclado numérico customizado
- Input de senha mascarado
- Animação de erro para senha incorreta
- Impossível sair sem senha correta

#### Tela de Ociosidade
- Tela escura com logo pulsante
- Mensagem "Toque para continuar"
- Ativação após tempo configurável
- Economia de bateria

### 2. Componentes Principais

```typescript
// ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onAdd: () => void;
  isInCart: boolean;
}

// CategoryButton.tsx
interface CategoryButtonProps {
  category: Category;
  isSelected: boolean;
  onPress: () => void;
}

// CartItem.tsx
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onUpdateObservation: (text: string) => void;
  onRemove: () => void;
}

// NumericKeyboard.tsx
interface NumericKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
}
```

### 3. Serviços e APIs

```typescript
// api.service.ts
const API_BASE_URL = 'https://[seu-dominio-replit].repl.co/api/mobile';

class ApiService {
  // Configurações
  async getConfig(): Promise<AppConfig>;
  
  // Categorias
  async getCategories(): Promise<Category[]>;
  
  // Produtos
  async getProducts(filters?: ProductFilters): Promise<Product[]>;
  
  // Pedidos
  async createOrder(data: OrderData): Promise<Order>;
  async getOrders(filters?: OrderFilters): Promise<Order[]>;
  
  // Sessão
  async getSession(tableNumber: number): Promise<Session>;
  async createSession(tableNumber: number): Promise<Session>;
}
```

### 4. Estado Global (Context API)

```typescript
// AppContext.tsx
interface AppState {
  config: AppConfig;
  tableNumber: number | null;
  mode: 'rodizio' | 'carte' | null;
  categories: Category[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  session: Session | null;
  isLocked: boolean;
  isIdle: boolean;
}

// CartContext.tsx
interface CartState {
  items: CartItem[];
  total: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateObservation: (productId: number, text: string) => void;
  clearCart: () => void;
  sendOrder: (sendAll: boolean) => Promise<void>;
}
```

### 5. Funcionalidades Essenciais

#### Sistema de Pedidos
```typescript
interface Order {
  table_number: number;
  mode: 'rodizio' | 'carte';
  items: OrderItem[];
  device_id: string; // Expo Device UUID
}

interface OrderItem {
  product_id: number;
  quantity: number;
  price: string;
  observation?: string;
}
```

#### Modo Kiosk
- Usar `expo-keep-awake` para manter tela ligada
- Desabilitar gestos do sistema
- Bloquear botões físicos quando possível
- Senha configurável via API
- Modo tela cheia

#### Sistema de Ociosidade
- Timer configurável (padrão 60 segundos)
- Reset ao tocar na tela
- Tela escura para economia
- Animação suave de transição

#### Persistência Local
```typescript
// AsyncStorage keys
const STORAGE_KEYS = {
  TABLE_NUMBER: '@ComideX:tableNumber',
  CART: '@ComideX:cart',
  SESSION: '@ComideX:session',
  DEVICE_ID: '@ComideX:deviceId',
  ORDERS_CACHE: '@ComideX:ordersCache'
};
```

### 6. Integrações com APIs

#### Endpoints necessários no backend:

```typescript
// GET /api/mobile/config
// Retorna configurações do app

// GET /api/mobile/categories
// Lista categorias ativas

// GET /api/mobile/products?category_id=1&mode=rodizio
// Lista produtos filtrados

// POST /api/mobile/order
// Cria novo pedido
{
  table_number: 5,
  mode: "rodizio",
  items: [...],
  device_id: "uuid"
}

// GET /api/mobile/session?table_number=5
// Obtém sessão ativa da mesa

// POST /api/mobile/session
// Cria nova sessão
{
  table_number: 5
}
```

### 7. Design e UX

#### Paleta de Cores
- Primária: #FF6B00 (Laranja)
- Secundária: #1F2937 (Cinza escuro)
- Background: #030712 (Preto)
- Texto: #FFFFFF (Branco)
- Sucesso: #10B981
- Erro: #EF4444

#### Tipografia
- Títulos: System Bold, 24-32px
- Subtítulos: System Semibold, 18-20px
- Corpo: System Regular, 16px
- Botões: System Semibold, 18px

#### Animações
- Transições suaves (300ms)
- Feedback tátil em botões
- Loading states com skeleton
- Pull to refresh onde aplicável

#### Responsividade
- Otimizado para tablets 10"
- Suporte landscape e portrait
- Touch targets mínimo 44x44
- Espaçamento adequado

### 8. Segurança

- Validação de inputs
- Sanitização de dados
- HTTPS obrigatório
- Device ID único
- Rate limiting local
- Timeout de sessão

### 9. Performance

- Lazy loading de imagens
- Virtualização de listas grandes
- Cache de produtos e categorias
- Debounce em pesquisas
- Memoização de componentes
- Otimização de re-renders

### 10. Configurações Expo

```json
// app.json
{
  "expo": {
    "name": "ComideX Tablet",
    "slug": "comidex-tablet",
    "version": "1.0.0",
    "orientation": "landscape",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#030712"
    },
    "ios": {
      "supportsTablet": true,
      "requireFullScreen": true,
      "bundleIdentifier": "com.comidex.tablet"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FF6B00"
      },
      "package": "com.comidex.tablet"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### 11. Scripts de Instalação

```bash
# Criar projeto
npx create-expo-app ComidexTablet --template expo-template-blank-typescript

# Instalar dependências
npm install @react-navigation/native @react-navigation/stack @react-navigation/drawer
npm install react-native-screens react-native-safe-area-context
npm install react-native-gesture-handler react-native-reanimated
npm install axios react-native-fast-image
npm install @react-native-async-storage/async-storage
npm install expo-keep-awake expo-device expo-secure-store
npm install react-native-toast-message
npm install react-native-skeleton-content
```

### 12. Estrutura de Pastas

```
ComidexTablet/
├── src/
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── CategoryButton.tsx
│   │   ├── CartItem.tsx
│   │   ├── NumericKeyboard.tsx
│   │   └── LoadingScreen.tsx
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── MainScreen.tsx
│   │   ├── CartScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── LockScreen.tsx
│   │   └── IdleScreen.tsx
│   ├── services/
│   │   ├── api.service.ts
│   │   ├── storage.service.ts
│   │   └── print.service.ts
│   ├── contexts/
│   │   ├── AppContext.tsx
│   │   └── CartContext.tsx
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── formatters.ts
│   └── types/
│       └── index.ts
├── assets/
├── App.tsx
├── app.json
├── babel.config.js
├── tsconfig.json
└── package.json
```

## Configuração da API Base

Altere a URL da API no arquivo `src/services/api.service.ts`:

```typescript
const API_BASE_URL = 'https://[SEU-PROJETO-REPLIT].repl.co/api/mobile';
```

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar no Expo Go
npx expo start

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios
```

## Observações Importantes

1. **Modo Kiosk Android:** Configure o app como "Device Owner" ou use apps de kiosk de terceiros
2. **Modo Kiosk iOS:** Use o "Guided Access" ou "Single App Mode" via MDM
3. **Tela Sempre Ligada:** expo-keep-awake mantém a tela ligada
4. **Orientação:** Configurado para landscape por padrão
5. **Cache:** Implementar cache inteligente para modo offline parcial
6. **Segurança:** Senha de bloqueio deve ser forte e configurável
7. **Performance:** Testar com 100+ produtos para garantir fluidez

## Fluxo de Pedido Completo

1. Cliente seleciona mesa (se obrigatório)
2. Escolhe entre Rodízio ou À La Carte
3. Navega pelas categorias
4. Adiciona produtos ao carrinho
5. Revisa pedido no carrinho
6. Adiciona observações se necessário
7. Envia pedido (total ou parcial)
8. Pedido é enviado para API
9. API cria ordem e envia para impressoras
10. Cliente recebe confirmação visual
11. Pode continuar pedindo ou ver histórico

## Integração com Sistema Principal

As APIs já estão preparadas no sistema principal em:
- `/api/mobile/config` - Configurações
- `/api/mobile/categories` - Categorias
- `/api/mobile/products` - Produtos
- `/api/mobile/order` - Pedidos
- `/api/mobile/session` - Sessões

Todas as APIs retornam JSON com estrutura:
```json
{
  "success": true,
  "data": {...},
  "message": "Mensagem opcional"
}
```

## Deploy

1. Configure EAS Build no Expo
2. Gere builds para Android/iOS
3. Instale APK/IPA nos tablets
4. Configure modo kiosk no dispositivo
5. Aponte para URL da API do Replit
6. Teste integração completa

Este prompt contém todas as especificações necessárias para criar o app completo no outro projeto Replit com React Native/Expo.

https://84ea5393-3b41-40f9-8bf8-65a1810f577b-00-364t60vf8hwby.riker.replit.dev/