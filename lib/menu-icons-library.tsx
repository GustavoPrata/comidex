import { 
  // Bebidas
  Coffee, 
  Beer, 
  Wine, 
  Martini,
  GlassWater,
  Milk,
  
  // Comida Japonesa
  Fish,
  Soup,
  
  // Pratos e Refeições
  Utensils,
  UtensilsCrossed,
  Pizza,
  Sandwich,
  Beef,
  
  // Sobremesas
  IceCream,
  Cake,
  Cookie,
  Candy,
  Cherry,
  
  // Frutas
  Apple,
  Banana,
  Grape,
  Citrus,
  
  // Cozinha e Preparo
  ChefHat,
  CookingPot,
  Refrigerator,
  Microwave,
  
  // Especiais e Premium
  Star,
  Crown,
  Award,
  Trophy,
  Gem,
  Diamond,
  Sparkles,
  Zap,
  
  // Categorias Gerais
  Package,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  
  // Tempo e Serviço
  Clock,
  Timer,
  AlarmClock,
  CalendarDays,
  
  // Natureza e Orgânicos
  Leaf,
  Flower,
  TreePine,
  Wheat,
  
  // Outros
  Heart,
  Flame,
  Snowflake,
  Sun,
  Moon,
  Cloud,
  Droplet,
  ThermometerSun,
  
  // Mais específicos
  Salad,
  Egg,
  Croissant,
  Popcorn,
  Carrot,
  
  // Ícones de serviço
  HandPlatter,
  ConciergeBell,
  
  // Mais ícones diversos
  Drumstick,
  Ham,
  Shell,
  
  // Ícones de navegação e interface
  Home,
  Menu,
  Grid3x3,
  LayoutGrid,
  
  // Ícones adicionais úteis
  CircleDollarSign,
  DollarSign,
  Percent,
  Tag,
  Tags,
  Gift,
  Sparkle,
  Ticket,
  TicketCheck,
  PartyPopper,
  
  // Mais bebidas e comida
  CupSoda,
  Soup as SoupIcon,
  
  // Ícones de status
  Check,
  X,
  AlertCircle,
  Info,
  
  // Ícones de ação
  Plus,
  Minus,
  Edit,
  Trash,
  Copy,
  Download,
  Upload,
  Share,
  
  // Ícones de navegação
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  
  // Ícones de layout
  List,
  Grid2x2,
  
  // Ícones temáticos
  Sunrise,
  Sunset,
  MoonStar,
  CloudRain,
  CloudSnow,
  Waves,
  Mountain,
  Trees,
  
  // Ícones de comida extras
  CakeSlice,
  
  // Ícones de cozinha extras
  FlameKindling,
  
  type LucideIcon
} from "lucide-react";

export type MenuIcon = LucideIcon;

export interface MenuIconOption {
  name: string;
  icon: MenuIcon;
  category: 'japanese' | 'drinks' | 'desserts' | 'special' | 'general' | 'fruits' | 'cooking' | 'service' | 'nature' | 'status' | 'action';
  keywords: string[];
}

// Biblioteca completa de ícones organizados por categoria
export const menuIconLibrary: MenuIconOption[] = [
  // Comida Japonesa e Asiática
  { name: 'Peixe', icon: Fish, category: 'japanese', keywords: ['peixe', 'sushi', 'sashimi', 'japonês'] },
  { name: 'Sopa', icon: Soup, category: 'japanese', keywords: ['sopa', 'lámen', 'ramen', 'miso'] },
  { name: 'Pauzinhos', icon: UtensilsCrossed, category: 'japanese', keywords: ['hashi', 'pauzinhos', 'japonês', 'asiático'] },
  { name: 'Concha', icon: Shell, category: 'japanese', keywords: ['frutos do mar', 'marisco', 'ostra'] },
  
  // Bebidas
  { name: 'Café', icon: Coffee, category: 'drinks', keywords: ['café', 'expresso', 'cappuccino', 'latte'] },
  { name: 'Cerveja', icon: Beer, category: 'drinks', keywords: ['cerveja', 'chopp', 'beer', 'alcool'] },
  { name: 'Vinho', icon: Wine, category: 'drinks', keywords: ['vinho', 'tinto', 'branco', 'rosé'] },
  { name: 'Martini', icon: Martini, category: 'drinks', keywords: ['martini', 'coquetel', 'drink', 'cocktail'] },
  { name: 'Água', icon: GlassWater, category: 'drinks', keywords: ['água', 'water', 'bebida', 'hidratação'] },
  { name: 'Leite', icon: Milk, category: 'drinks', keywords: ['leite', 'milk', 'laticínio', 'dairy'] },
  { name: 'Refrigerante', icon: CupSoda, category: 'drinks', keywords: ['refrigerante', 'soda', 'coca', 'guaraná'] },
  { name: 'Gotas', icon: Droplet, category: 'drinks', keywords: ['suco', 'líquido', 'bebida', 'gota'] },
  
  // Sobremesas
  { name: 'Sorvete', icon: IceCream, category: 'desserts', keywords: ['sorvete', 'gelato', 'ice cream', 'sobremesa'] },
  { name: 'Bolo', icon: Cake, category: 'desserts', keywords: ['bolo', 'cake', 'aniversário', 'torta'] },
  { name: 'Fatia de Bolo', icon: CakeSlice, category: 'desserts', keywords: ['fatia', 'pedaço', 'bolo', 'torta'] },
  { name: 'Biscoito', icon: Cookie, category: 'desserts', keywords: ['biscoito', 'cookie', 'bolacha', 'doce'] },
  { name: 'Doce', icon: Candy, category: 'desserts', keywords: ['doce', 'bala', 'candy', 'açúcar'] },
  { name: 'Cereja', icon: Cherry, category: 'desserts', keywords: ['cereja', 'cherry', 'fruta', 'sobremesa'] },
  { name: 'Croissant', icon: Croissant, category: 'desserts', keywords: ['croissant', 'pão', 'francês', 'padaria'] },
  { name: 'Pipoca', icon: Popcorn, category: 'desserts', keywords: ['pipoca', 'popcorn', 'cinema', 'snack'] },
  
  // Pratos Principais
  { name: 'Talheres', icon: Utensils, category: 'general', keywords: ['talheres', 'restaurante', 'comida', 'refeição'] },
  { name: 'Pizza', icon: Pizza, category: 'general', keywords: ['pizza', 'italiana', 'fast food', 'delivery'] },
  { name: 'Sanduíche', icon: Sandwich, category: 'general', keywords: ['sanduíche', 'lanche', 'hambúrguer', 'sandwich'] },
  { name: 'Carne', icon: Beef, category: 'general', keywords: ['carne', 'bife', 'churrasco', 'beef'] },
  { name: 'Frango', icon: Drumstick, category: 'general', keywords: ['frango', 'galinha', 'aves', 'chicken'] },
  { name: 'Presunto', icon: Ham, category: 'general', keywords: ['presunto', 'ham', 'frios', 'carne'] },
  { name: 'Salada', icon: Salad, category: 'general', keywords: ['salada', 'vegetal', 'verde', 'saudável'] },
  { name: 'Ovo', icon: Egg, category: 'general', keywords: ['ovo', 'egg', 'café da manhã', 'proteína'] },
  
  // Frutas e Vegetais
  { name: 'Maçã', icon: Apple, category: 'fruits', keywords: ['maçã', 'apple', 'fruta', 'saudável'] },
  { name: 'Banana', icon: Banana, category: 'fruits', keywords: ['banana', 'fruta', 'potássio', 'tropical'] },
  { name: 'Uva', icon: Grape, category: 'fruits', keywords: ['uva', 'grape', 'vinho', 'fruta'] },
  { name: 'Cítrico', icon: Citrus, category: 'fruits', keywords: ['laranja', 'limão', 'citrus', 'vitamina c'] },
  { name: 'Cenoura', icon: Carrot, category: 'fruits', keywords: ['cenoura', 'carrot', 'vegetal', 'legume'] },
  { name: 'Folha', icon: Leaf, category: 'fruits', keywords: ['folha', 'vegetal', 'salada', 'verde'] },
  { name: 'Trigo', icon: Wheat, category: 'fruits', keywords: ['trigo', 'wheat', 'grão', 'cereal'] },
  
  // Especiais e Premium
  { name: 'Estrela', icon: Star, category: 'special', keywords: ['estrela', 'especial', 'premium', 'destaque'] },
  { name: 'Coroa', icon: Crown, category: 'special', keywords: ['coroa', 'premium', 'vip', 'rei'] },
  { name: 'Prêmio', icon: Award, category: 'special', keywords: ['prêmio', 'medalha', 'campeão', 'melhor'] },
  { name: 'Troféu', icon: Trophy, category: 'special', keywords: ['troféu', 'vitória', 'competição', 'primeiro'] },
  { name: 'Diamante', icon: Diamond, category: 'special', keywords: ['diamante', 'luxo', 'premium', 'exclusivo'] },
  { name: 'Gema', icon: Gem, category: 'special', keywords: ['gema', 'joia', 'precioso', 'valioso'] },
  { name: 'Brilho', icon: Sparkles, category: 'special', keywords: ['brilho', 'especial', 'novo', 'destaque'] },
  { name: 'Raio', icon: Zap, category: 'special', keywords: ['raio', 'rápido', 'flash', 'promoção'] },
  { name: 'Chama', icon: Flame, category: 'special', keywords: ['fogo', 'quente', 'picante', 'hot'] },
  { name: 'Fogo', icon: FlameKindling, category: 'special', keywords: ['fogo', 'churrasco', 'grill', 'quente'] },
  { name: 'Presente', icon: Gift, category: 'special', keywords: ['presente', 'gift', 'brinde', 'oferta'] },
  { name: 'Festa', icon: PartyPopper, category: 'special', keywords: ['festa', 'celebração', 'party', 'comemoração'] },
  { name: 'Ticket', icon: Ticket, category: 'special', keywords: ['ticket', 'cupom', 'voucher', 'desconto'] },
  { name: 'Coração', icon: Heart, category: 'special', keywords: ['amor', 'favorito', 'like', 'preferido'] },
  
  // Cozinha e Preparo
  { name: 'Chef', icon: ChefHat, category: 'cooking', keywords: ['chef', 'cozinheiro', 'cozinha', 'gastronomia'] },
  { name: 'Panela', icon: CookingPot, category: 'cooking', keywords: ['panela', 'cozinha', 'preparo', 'cooking'] },
  { name: 'Geladeira', icon: Refrigerator, category: 'cooking', keywords: ['geladeira', 'frio', 'conservar', 'refrigerar'] },
  { name: 'Microondas', icon: Microwave, category: 'cooking', keywords: ['microondas', 'aquecer', 'esquentar', 'rápido'] },
  { name: 'Termômetro', icon: ThermometerSun, category: 'cooking', keywords: ['temperatura', 'quente', 'frio', 'medir'] },
  
  // Serviço e Entrega
  { name: 'Bandeja', icon: HandPlatter, category: 'service', keywords: ['bandeja', 'servir', 'garçom', 'serviço'] },
  { name: 'Sineta', icon: ConciergeBell, category: 'service', keywords: ['sino', 'chamar', 'serviço', 'hotel'] },
  { name: 'Sacola', icon: ShoppingBag, category: 'service', keywords: ['sacola', 'compra', 'delivery', 'entrega'] },
  { name: 'Carrinho', icon: ShoppingCart, category: 'service', keywords: ['carrinho', 'compras', 'pedido', 'cart'] },
  { name: 'Loja', icon: Store, category: 'service', keywords: ['loja', 'restaurante', 'estabelecimento', 'local'] },
  { name: 'Caminhão', icon: Truck, category: 'service', keywords: ['entrega', 'delivery', 'transporte', 'envio'] },
  { name: 'Pacote', icon: Package, category: 'service', keywords: ['pacote', 'pedido', 'embalagem', 'box'] },
  
  // Tempo e Horário
  { name: 'Relógio', icon: Clock, category: 'service', keywords: ['horário', 'tempo', 'hora', 'relógio'] },
  { name: 'Timer', icon: Timer, category: 'service', keywords: ['timer', 'cronômetro', 'tempo', 'contagem'] },
  { name: 'Alarme', icon: AlarmClock, category: 'service', keywords: ['alarme', 'despertar', 'aviso', 'alerta'] },
  { name: 'Calendário', icon: CalendarDays, category: 'service', keywords: ['calendário', 'data', 'agenda', 'dia'] },
  { name: 'Nascer do Sol', icon: Sunrise, category: 'service', keywords: ['manhã', 'café', 'breakfast', 'amanhecer'] },
  { name: 'Pôr do Sol', icon: Sunset, category: 'service', keywords: ['tarde', 'jantar', 'dinner', 'entardecer'] },
  { name: 'Noite', icon: MoonStar, category: 'service', keywords: ['noite', 'night', 'jantar', 'late'] },
  
  // Natureza e Orgânicos
  { name: 'Flor', icon: Flower, category: 'nature', keywords: ['flor', 'natural', 'orgânico', 'jardim'] },
  { name: 'Pinheiro', icon: TreePine, category: 'nature', keywords: ['árvore', 'natural', 'ecológico', 'verde'] },
  { name: 'Árvores', icon: Trees, category: 'nature', keywords: ['floresta', 'natural', 'eco', 'sustentável'] },
  { name: 'Montanha', icon: Mountain, category: 'nature', keywords: ['montanha', 'natural', 'altitude', 'paisagem'] },
  { name: 'Ondas', icon: Waves, category: 'nature', keywords: ['mar', 'oceano', 'praia', 'seafood'] },
  { name: 'Sol', icon: Sun, category: 'nature', keywords: ['sol', 'verão', 'quente', 'tropical'] },
  { name: 'Lua', icon: Moon, category: 'nature', keywords: ['lua', 'noite', 'romântico', 'especial'] },
  { name: 'Nuvem', icon: Cloud, category: 'nature', keywords: ['nuvem', 'clima', 'weather', 'ambiente'] },
  { name: 'Chuva', icon: CloudRain, category: 'nature', keywords: ['chuva', 'inverno', 'frio', 'rain'] },
  { name: 'Neve', icon: CloudSnow, category: 'nature', keywords: ['neve', 'inverno', 'gelado', 'frio'] },
  { name: 'Floco de Neve', icon: Snowflake, category: 'nature', keywords: ['gelado', 'frozen', 'frio', 'inverno'] },
  
  // Promoções e Ofertas
  { name: 'Etiqueta', icon: Tag, category: 'special', keywords: ['preço', 'promoção', 'desconto', 'oferta'] },
  { name: 'Etiquetas', icon: Tags, category: 'special', keywords: ['preços', 'promoções', 'ofertas', 'descontos'] },
  { name: 'Porcentagem', icon: Percent, category: 'special', keywords: ['desconto', 'porcentagem', 'promoção', 'off'] },
  { name: 'Cifrão', icon: DollarSign, category: 'special', keywords: ['preço', 'valor', 'dinheiro', 'pagamento'] },
  { name: 'Cifrão Círculo', icon: CircleDollarSign, category: 'special', keywords: ['preço especial', 'valor', 'promoção', 'oferta'] },
  { name: 'Brilho Único', icon: Sparkle, category: 'special', keywords: ['novo', 'novidade', 'lançamento', 'especial'] },
  { name: 'Ticket Check', icon: TicketCheck, category: 'special', keywords: ['cupom usado', 'validado', 'confirmado', 'check'] },
  
  // Interface e Navegação
  { name: 'Menu', icon: Menu, category: 'general', keywords: ['menu', 'cardápio', 'lista', 'opções'] },
  { name: 'Casa', icon: Home, category: 'general', keywords: ['home', 'início', 'casa', 'principal'] },
  { name: 'Grade 3x3', icon: Grid3x3, category: 'general', keywords: ['grade', 'grid', 'categorias', 'layout'] },
  { name: 'Grade 2x2', icon: Grid2x2, category: 'general', keywords: ['grade', 'grid', 'layout', 'visualização'] },
  { name: 'Layout Grid', icon: LayoutGrid, category: 'general', keywords: ['layout', 'organização', 'grid', 'estrutura'] },
  { name: 'Lista', icon: List, category: 'general', keywords: ['lista', 'itens', 'menu', 'list'] },
];

// Função helper para buscar ícone por palavra-chave
export function findIconByKeyword(keyword: string): MenuIconOption | undefined {
  const lowerKeyword = keyword.toLowerCase();
  return menuIconLibrary.find(icon => 
    icon.keywords.some(k => k.includes(lowerKeyword)) ||
    icon.name.toLowerCase().includes(lowerKeyword)
  );
}

// Função helper para obter ícones por categoria
export function getIconsByCategory(category: MenuIconOption['category']): MenuIconOption[] {
  return menuIconLibrary.filter(icon => icon.category === category);
}

// Função helper para obter ícone por nome exato
export function getIconByName(name: string): MenuIconOption | undefined {
  return menuIconLibrary.find(icon => icon.name === name);
}

// Ícones padrão recomendados para grupos comuns
export const defaultGroupIcons: Record<string, MenuIcon> = {
  // Rodízio
  'rodizio': Crown,
  'rodizio tradicional': Star,
  'rodizio premium': Diamond,
  
  // À la Carte
  'a la carte': Utensils,
  'à la carte': Utensils,
  
  // Bebidas
  'bebidas': Wine,
  'drinks': Coffee,
  'cerveja': Beer,
  'vinho': Wine,
  'cocktails': Martini,
  'sucos': GlassWater,
  'refrigerantes': CupSoda,
  
  // Comida Japonesa
  'sushi': Fish,
  'sashimi': Fish,
  'temaki': Shell,
  'niguiri': Fish,
  'hot roll': Flame,
  'combinados': UtensilsCrossed,
  'yakisoba': Soup,
  'lámen': Soup,
  'ramen': Soup,
  
  // Entradas
  'entradas': HandPlatter,
  'aperitivos': Salad,
  'petiscos': Popcorn,
  
  // Pratos Principais
  'pratos quentes': CookingPot,
  'pratos principais': Beef,
  'carnes': Beef,
  'aves': Drumstick,
  'peixes': Fish,
  'massas': Sandwich,
  'pizzas': Pizza,
  
  // Sobremesas
  'sobremesas': IceCream,
  'doces': Candy,
  'bolos': Cake,
  'tortas': CakeSlice,
  
  // Especiais
  'especiais': Star,
  'premium': Crown,
  'chef': ChefHat,
  'promoções': Zap,
  'ofertas': Tag,
  'combos': Gift,
  'festival': PartyPopper,
  
  // Vegetariano/Vegano
  'vegetariano': Leaf,
  'vegano': Leaf,
  'saladas': Salad,
  'orgânico': TreePine,
  
  // Café da Manhã
  'café da manhã': Sunrise,
  'breakfast': Coffee,
  
  // Almoço
  'almoço': Sun,
  'lunch': Utensils,
  
  // Jantar
  'jantar': MoonStar,
  'dinner': Wine,
  
  // Delivery
  'delivery': Truck,
  'para viagem': ShoppingBag,
  'takeaway': Package,
  
  // Geral
  'todos': Grid3x3,
  'menu': Menu,
  'favoritos': Heart,
};