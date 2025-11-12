import { 
  // Ícones de comida japonesa
  Fish,
  Soup,
  CircleDot,
  Triangle,
  Square,
  Circle,
  Waves,
  Shell,
  Egg,
  Flame,
  
  // Ícones de comida geral
  Pizza,
  Sandwich,
  Beef,
  Salad,
  Wheat,
  Carrot,
  Apple,
  Cherry,
  Grape,
  Citrus,
  Banana,
  
  // Ícones de bebida
  Coffee,
  Beer,
  Wine,
  Martini,
  GlassWater,
  Milk,
  CupSoda,
  Droplet,
  Droplets,
  
  // Ícones de sobremesa
  IceCream,
  Cake,
  Cookie,
  Candy,
  Donut,
  CakeSlice,
  Croissant,
  
  // Ícones de serviço e cozinha
  UtensilsCrossed,
  Utensils,
  ChefHat,
  CookingPot,
  Refrigerator,
  Microwave,
  HandPlatter,
  ConciergeBell,
  Package,
  Package2,
  
  // Ícones especiais e premium
  Star,
  Crown,
  Award,
  Trophy,
  Diamond,
  Gem,
  Sparkles,
  Sparkle,
  Gift,
  PartyPopper,
  Ticket,
  Heart,
  ThumbsUp,
  Medal,
  Zap,
  FlameKindling,
  
  // Ícones de natureza
  Leaf,
  Flower,
  Flower2,
  TreePine,
  Trees,
  Mountain,
  Sun,
  Moon,
  Cloud,
  Snowflake,
  
  // Ícones de serviço e entrega
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Car,
  Bike,
  MapPin,
  Home,
  Building,
  Building2,
  
  // Ícones gerais úteis
  Users,
  User,
  UserCheck,
  Clock,
  Calendar,
  Timer,
  AlarmClock,
  Watch,
  Phone,
  MessageSquare,
  
  // Ícones de status e navegação
  Check,
  CheckCircle,
  X,
  XCircle,
  AlertCircle,
  Info,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  Menu,
  Grid3x3,
  List,
  LayoutGrid,
  
  // Mais ícones úteis
  Percent,
  DollarSign,
  Tag,
  Tags,
  Bookmark,
  Bell,
  BellRing,
  Flag,
  Target,
  TrendingUp,
  BarChart,
  PieChart,
  Receipt,
  FileText,
  Clipboard,
  
  type LucideIcon
} from "lucide-react";

export type MenuIcon = LucideIcon;

export interface MenuIconOption {
  name: string;
  icon: MenuIcon;
  category: 'japanese' | 'drinks' | 'desserts' | 'special' | 'general' | 'service' | 'nature' | 'status';
  keywords: string[];
}

// Biblioteca expandida e melhorada de ícones para restaurante japonês
export const menuIconLibrary: MenuIconOption[] = [
  // CATEGORIA JAPONESA - Pratos principais (20 ícones)
  { name: 'Peixe Cru', icon: Fish, category: 'japanese', keywords: ['sushi', 'sashimi', 'peixe', 'cru', 'fresco'] },
  { name: 'Sopa Quente', icon: Soup, category: 'japanese', keywords: ['ramen', 'lamen', 'udon', 'soba', 'missô'] },
  { name: 'Roll Circular', icon: CircleDot, category: 'japanese', keywords: ['maki', 'uramaki', 'roll', 'california'] },
  { name: 'Cone Temaki', icon: Triangle, category: 'japanese', keywords: ['temaki', 'cone', 'hand roll'] },
  { name: 'Quadrado Sashimi', icon: Square, category: 'japanese', keywords: ['sashimi', 'corte', 'fatia'] },
  { name: 'Círculo Simples', icon: Circle, category: 'japanese', keywords: ['hossomaki', 'simples', 'pepino', 'kappa'] },
  { name: 'Ondas do Mar', icon: Waves, category: 'japanese', keywords: ['frutos', 'mar', 'marisco', 'oceano'] },
  { name: 'Concha Marisco', icon: Shell, category: 'japanese', keywords: ['ostra', 'vieira', 'marisco', 'concha'] },
  { name: 'Ovo Tamago', icon: Egg, category: 'japanese', keywords: ['tamago', 'ovo', 'omelete', 'tamagoyaki'] },
  { name: 'Fogo Picante', icon: Flame, category: 'japanese', keywords: ['hot', 'picante', 'spicy', 'quente'] },
  { name: 'Chamas Hot Roll', icon: FlameKindling, category: 'japanese', keywords: ['hot roll', 'frito', 'empanado'] },
  { name: 'Pauzinhos Hashi', icon: UtensilsCrossed, category: 'japanese', keywords: ['hashi', 'pauzinhos', 'chopsticks'] },
  { name: 'Talheres Mesa', icon: Utensils, category: 'japanese', keywords: ['combinado', 'prato', 'refeição'] },
  { name: 'Chef Omakase', icon: ChefHat, category: 'japanese', keywords: ['omakase', 'chef', 'especial', 'exclusivo'] },
  { name: 'Panela Quente', icon: CookingPot, category: 'japanese', keywords: ['sukiyaki', 'shabu', 'nabe', 'panela'] },
  { name: 'Trigo Yakisoba', icon: Wheat, category: 'japanese', keywords: ['yakisoba', 'macarrão', 'massa', 'noodles'] },
  { name: 'Caixa Bento', icon: Package, category: 'japanese', keywords: ['bento', 'box', 'marmita', 'obento'] },
  { name: 'Embalagem Especial', icon: Package2, category: 'japanese', keywords: ['combo', 'especial', 'festival'] },
  { name: 'Carne Grelhada', icon: Beef, category: 'japanese', keywords: ['teriyaki', 'teppan', 'carne', 'grelhado'] },
  { name: 'Salada Verde', icon: Salad, category: 'japanese', keywords: ['sunomono', 'salada', 'vegetal', 'verde'] },
  
  // BEBIDAS (15 ícones)
  { name: 'Café Quente', icon: Coffee, category: 'drinks', keywords: ['café', 'chá', 'matcha', 'quente'] },
  { name: 'Cerveja Gelada', icon: Beer, category: 'drinks', keywords: ['cerveja', 'chopp', 'asahi', 'kirin'] },
  { name: 'Vinho Sake', icon: Wine, category: 'drinks', keywords: ['sake', 'vinho', 'nihonshu', 'japonês'] },
  { name: 'Coquetel Drink', icon: Martini, category: 'drinks', keywords: ['drink', 'coquetel', 'caipirinha', 'cocktail'] },
  { name: 'Água Mineral', icon: GlassWater, category: 'drinks', keywords: ['água', 'mineral', 'com gás', 'sem gás'] },
  { name: 'Leite Calpis', icon: Milk, category: 'drinks', keywords: ['leite', 'calpis', 'lácteo', 'shake'] },
  { name: 'Refrigerante', icon: CupSoda, category: 'drinks', keywords: ['refrigerante', 'soda', 'coca', 'guaraná'] },
  { name: 'Gota Suco', icon: Droplet, category: 'drinks', keywords: ['suco', 'natural', 'líquido', 'bebida'] },
  { name: 'Gotas Ramune', icon: Droplets, category: 'drinks', keywords: ['ramune', 'bebida', 'japonesa', 'gasosa'] },
  { name: 'Sorvete Frozen', icon: IceCream, category: 'drinks', keywords: ['frozen', 'gelado', 'smoothie', 'shake'] },
  { name: 'Bebida Premium', icon: Diamond, category: 'drinks', keywords: ['premium', 'whisky', 'importado', 'especial'] },
  { name: 'Drink Especial', icon: Sparkle, category: 'drinks', keywords: ['especial', 'drink', 'exclusivo'] },
  { name: 'Suco Natural', icon: Apple, category: 'drinks', keywords: ['suco', 'natural', 'fruta', 'polpa'] },
  { name: 'Citrus Limão', icon: Citrus, category: 'drinks', keywords: ['limão', 'laranja', 'cítrico', 'vitamina'] },
  { name: 'Energético', icon: Zap, category: 'drinks', keywords: ['energy', 'energético', 'red bull', 'monster'] },
  
  // SOBREMESAS (12 ícones)
  { name: 'Sorvete', icon: IceCream, category: 'desserts', keywords: ['sorvete', 'gelato', 'açaí', 'frozen'] },
  { name: 'Bolo Inteiro', icon: Cake, category: 'desserts', keywords: ['bolo', 'aniversário', 'torta', 'cake'] },
  { name: 'Fatia Bolo', icon: CakeSlice, category: 'desserts', keywords: ['fatia', 'pedaço', 'slice', 'porção'] },
  { name: 'Biscoito', icon: Cookie, category: 'desserts', keywords: ['cookie', 'biscoito', 'bolacha', 'petit'] },
  { name: 'Doce Candy', icon: Candy, category: 'desserts', keywords: ['doce', 'candy', 'bala', 'mochi'] },
  { name: 'Donut Rosquinha', icon: Donut, category: 'desserts', keywords: ['donut', 'rosquinha', 'donuts', 'açúcar'] },
  { name: 'Croissant', icon: Croissant, category: 'desserts', keywords: ['croissant', 'pão doce', 'folhado'] },
  { name: 'Cereja Fruta', icon: Cherry, category: 'desserts', keywords: ['cereja', 'fruta', 'cherry', 'topping'] },
  { name: 'Uva', icon: Grape, category: 'desserts', keywords: ['uva', 'grape', 'fruta', 'cacho'] },
  { name: 'Banana', icon: Banana, category: 'desserts', keywords: ['banana', 'fruta', 'banoffee', 'split'] },
  { name: 'Maçã Verde', icon: Apple, category: 'desserts', keywords: ['maçã', 'apple', 'verde', 'fruta'] },
  { name: 'Laranja', icon: Citrus, category: 'desserts', keywords: ['laranja', 'citrus', 'vitamina', 'suco'] },
  
  // ESPECIAIS E PROMOÇÕES (19 ícones - incluindo rodízios específicos)
  { name: 'Rodízio Tradicional', icon: Utensils, category: 'special', keywords: ['rodízio', 'tradicional', 'clássico', 'normal'] },
  { name: 'Rodízio Premium', icon: Crown, category: 'special', keywords: ['rodízio', 'premium', 'vip', 'completo', 'top'] },
  { name: 'À la Carte', icon: Clipboard, category: 'special', keywords: ['carte', 'menu', 'escolha', 'individual', 'avulso'] },
  { name: 'Rodízio', icon: LayoutGrid, category: 'special', keywords: ['rodízio', 'festival', 'livre', 'buffet', 'all you can eat'] },
  { name: 'Estrela Top', icon: Star, category: 'special', keywords: ['estrela', 'favorito', 'top', 'melhor'] },
  { name: 'Coroa Premium', icon: Crown, category: 'special', keywords: ['premium', 'vip', 'exclusivo', 'royal'] },
  { name: 'Prêmio', icon: Award, category: 'special', keywords: ['prêmio', 'award', 'certificado', 'qualidade'] },
  { name: 'Troféu Campeão', icon: Trophy, category: 'special', keywords: ['campeão', 'troféu', 'primeiro', 'vencedor'] },
  { name: 'Diamante Luxo', icon: Diamond, category: 'special', keywords: ['diamante', 'luxo', 'premium', 'caro'] },
  { name: 'Gema Especial', icon: Gem, category: 'special', keywords: ['gema', 'joia', 'especial', 'raro'] },
  { name: 'Brilhos Novo', icon: Sparkles, category: 'special', keywords: ['novo', 'novidade', 'lançamento', 'new'] },
  { name: 'Presente Brinde', icon: Gift, category: 'special', keywords: ['presente', 'brinde', 'gift', 'grátis'] },
  { name: 'Festa Party', icon: PartyPopper, category: 'special', keywords: ['festa', 'party', 'celebração', 'evento'] },
  { name: 'Cupom Ticket', icon: Ticket, category: 'special', keywords: ['cupom', 'ticket', 'voucher', 'desconto'] },
  { name: 'Coração Love', icon: Heart, category: 'special', keywords: ['amor', 'favorito', 'love', 'like'] },
  { name: 'Polegar Like', icon: ThumbsUp, category: 'special', keywords: ['like', 'bom', 'aprovado', 'positivo'] },
  { name: 'Medalha Bronze', icon: Medal, category: 'special', keywords: ['medalha', 'bronze', 'prata', 'ouro'] },
  { name: 'Raio Rápido', icon: Zap, category: 'special', keywords: ['rápido', 'flash', 'express', 'fast'] },
  { name: 'Rodízio Festival', icon: Sparkle, category: 'special', keywords: ['rodízio', 'festival', 'livre', 'all'] },
  
  // GERAL E OUTROS (15 ícones)
  { name: 'Pizza', icon: Pizza, category: 'general', keywords: ['pizza', 'italiano', 'mussarela', 'calabresa'] },
  { name: 'Sanduíche', icon: Sandwich, category: 'general', keywords: ['sanduíche', 'hambúrguer', 'burger', 'lanche'] },
  { name: 'Folha Vegetal', icon: Leaf, category: 'general', keywords: ['vegetariano', 'vegano', 'folha', 'verde'] },
  { name: 'Cenoura', icon: Carrot, category: 'general', keywords: ['legume', 'cenoura', 'vegetal', 'raiz'] },
  { name: 'Porcentagem', icon: Percent, category: 'general', keywords: ['desconto', 'promoção', 'off', 'percentual'] },
  { name: 'Dinheiro', icon: DollarSign, category: 'general', keywords: ['preço', 'valor', 'dinheiro', 'pagamento'] },
  { name: 'Etiqueta', icon: Tag, category: 'general', keywords: ['tag', 'etiqueta', 'categoria', 'label'] },
  { name: 'Etiquetas', icon: Tags, category: 'general', keywords: ['tags', 'categorias', 'múltiplas', 'labels'] },
  { name: 'Marcador', icon: Bookmark, category: 'general', keywords: ['favorito', 'salvo', 'marcado', 'bookmark'] },
  { name: 'Sino Alerta', icon: Bell, category: 'general', keywords: ['notificação', 'aviso', 'alerta', 'sino'] },
  { name: 'Sino Tocando', icon: BellRing, category: 'general', keywords: ['chamando', 'urgente', 'atenção', 'ring'] },
  { name: 'Bandeira', icon: Flag, category: 'general', keywords: ['destaque', 'bandeira', 'importante', 'flag'] },
  { name: 'Alvo Target', icon: Target, category: 'general', keywords: ['objetivo', 'meta', 'alvo', 'foco'] },
  { name: 'Gráfico Alta', icon: TrendingUp, category: 'general', keywords: ['crescimento', 'alta', 'sucesso', 'trending'] },
  { name: 'Recibo Nota', icon: Receipt, category: 'general', keywords: ['nota', 'recibo', 'conta', 'fiscal'] },
  
  // SERVIÇOS (12 ícones)
  { name: 'Sacola Compras', icon: ShoppingBag, category: 'service', keywords: ['sacola', 'compra', 'bag', 'pedido'] },
  { name: 'Carrinho', icon: ShoppingCart, category: 'service', keywords: ['carrinho', 'cart', 'compras', 'pedidos'] },
  { name: 'Loja Store', icon: Store, category: 'service', keywords: ['loja', 'restaurante', 'estabelecimento', 'local'] },
  { name: 'Caminhão Entrega', icon: Truck, category: 'service', keywords: ['entrega', 'delivery', 'caminhão', 'envio'] },
  { name: 'Carro', icon: Car, category: 'service', keywords: ['drive', 'carro', 'auto', 'veículo'] },
  { name: 'Bicicleta', icon: Bike, category: 'service', keywords: ['bike', 'bicicleta', 'ecológico', 'rápido'] },
  { name: 'Localização', icon: MapPin, category: 'service', keywords: ['local', 'endereço', 'mapa', 'ponto'] },
  { name: 'Casa Home', icon: Home, category: 'service', keywords: ['casa', 'home', 'residência', 'entrega'] },
  { name: 'Prédio', icon: Building, category: 'service', keywords: ['empresa', 'prédio', 'comercial', 'business'] },
  { name: 'Hotel', icon: Building2, category: 'service', keywords: ['hotel', 'hospedagem', 'turista', 'hóspede'] },
  { name: 'Bandeja Garçom', icon: HandPlatter, category: 'service', keywords: ['garçom', 'serviço', 'bandeja', 'mesa'] },
  { name: 'Sineta Chamar', icon: ConciergeBell, category: 'service', keywords: ['chamar', 'garçom', 'sino', 'serviço'] },
  
  // NATUREZA E DECORAÇÃO (10 ícones)
  { name: 'Flor Sakura', icon: Flower, category: 'nature', keywords: ['sakura', 'flor', 'cerejeira', 'primavera'] },
  { name: 'Flor Lotus', icon: Flower2, category: 'nature', keywords: ['lotus', 'flor', 'zen', 'budismo'] },
  { name: 'Pinheiro', icon: TreePine, category: 'nature', keywords: ['pinheiro', 'árvore', 'bonsai', 'pine'] },
  { name: 'Bamboo', icon: Trees, category: 'nature', keywords: ['bamboo', 'bambu', 'árvores', 'floresta'] },
  { name: 'Montanha Fuji', icon: Mountain, category: 'nature', keywords: ['fuji', 'montanha', 'monte', 'japão'] },
  { name: 'Sol Dia', icon: Sun, category: 'nature', keywords: ['sol', 'dia', 'manhã', 'quente'] },
  { name: 'Lua Noite', icon: Moon, category: 'nature', keywords: ['lua', 'noite', 'escuro', 'moon'] },
  { name: 'Nuvem', icon: Cloud, category: 'nature', keywords: ['nuvem', 'cloud', 'tempo', 'clima'] },
  { name: 'Neve Inverno', icon: Snowflake, category: 'nature', keywords: ['neve', 'inverno', 'frio', 'gelado'] },
  { name: 'Ondas Mar', icon: Waves, category: 'nature', keywords: ['ondas', 'mar', 'oceano', 'praia'] }
];

// Função helper para obter ícones por categoria
export function getIconsByCategory(category: MenuIconOption['category']): MenuIconOption[] {
  return menuIconLibrary.filter(icon => icon.category === category);
}

// Ícones padrão sugeridos para grupos comuns
export const defaultGroupIcons = {
  rodizio: 'Rodízio',
  rodizio_tradicional: 'Rodízio Tradicional',
  rodizio_premium: 'Rodízio Premium',
  a_la_carte: 'À la Carte',
  premium: 'Coroa Premium',
  tradicional: 'Rodízio Tradicional',
  bebidas: 'Cerveja Gelada',
  sobremesas: 'Sorvete',
  entradas: 'Cone Temaki',
  pratos: 'Talheres Mesa',
  especiais: 'Chef Omakase'
};

// Função helper para obter um ícone por nome
export function getIconByName(name: string): MenuIcon | undefined {
  const iconOption = menuIconLibrary.find(icon => icon.name === name);
  return iconOption?.icon;
}