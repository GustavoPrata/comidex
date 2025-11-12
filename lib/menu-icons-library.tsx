import { 
  // Ícones de comida e bebida principais
  Fish,
  Soup,
  Pizza,
  Sandwich,
  Beef,
  Coffee,
  Beer,
  Wine,
  Martini,
  GlassWater,
  Milk,
  
  // Ícones de sobremesa
  IceCream,
  Cake,
  Cookie,
  Candy,
  Cherry,
  
  // Ícones de serviço
  UtensilsCrossed,
  Utensils,
  ChefHat,
  HandPlatter,
  ConciergeBell,
  
  // Ícones especiais e premium
  Star,
  Crown,
  Award,
  Trophy,
  Diamond,
  Gem,
  Sparkles,
  Flame,
  Gift,
  PartyPopper,
  
  // Ícones de natureza e ingredientes
  Leaf,
  Wheat,
  Shell,
  Egg,
  Apple,
  Citrus,
  Carrot,
  
  // Ícones de cozinha
  CookingPot,
  Refrigerator,
  Microwave,
  
  // Ícones de serviço e entrega
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Package,
  Package2,
  
  // Ícones gerais úteis
  Heart,
  ThumbsUp,
  Users,
  Clock,
  Calendar,
  MapPin,
  Home,
  
  // Ícones de status
  Check,
  X,
  AlertCircle,
  Info,
  
  // Ícones de navegação
  ChevronRight,
  ChevronDown,
  Menu,
  Grid3x3,
  List,
  
  type LucideIcon
} from "lucide-react";

export type MenuIcon = LucideIcon;

export interface MenuIconOption {
  name: string;
  icon: MenuIcon;
  category: 'japanese' | 'drinks' | 'desserts' | 'special' | 'general' | 'service';
  keywords: string[];
}

// Biblioteca curada e focada de ícones para restaurante japonês
export const menuIconLibrary: MenuIconOption[] = [
  // Ícones principais para categorias japonesas (10 ícones)
  { name: 'Sushi', icon: Fish, category: 'japanese', keywords: ['sushi', 'sashimi', 'peixe', 'japonês', 'nigiri', 'maki'] },
  { name: 'Ramen', icon: Soup, category: 'japanese', keywords: ['ramen', 'lamen', 'udon', 'soba', 'macarrão', 'sopa'] },
  { name: 'Temaki', icon: Pizza, category: 'japanese', keywords: ['temaki', 'cone', 'hand roll', 'japonês'] },
  { name: 'Combinado', icon: UtensilsCrossed, category: 'japanese', keywords: ['combinado', 'combo', 'misto', 'variado', 'prato'] },
  { name: 'Yakisoba', icon: Wheat, category: 'japanese', keywords: ['yakisoba', 'yakimeshi', 'frito', 'teppan'] },
  { name: 'Frutos do Mar', icon: Shell, category: 'japanese', keywords: ['camarão', 'polvo', 'lula', 'ostra', 'marisco'] },
  { name: 'Carne', icon: Beef, category: 'japanese', keywords: ['carne', 'bife', 'teppan', 'grelhado', 'teriyaki'] },
  { name: 'Tempura', icon: Egg, category: 'japanese', keywords: ['tempura', 'frito', 'empanado', 'hot', 'karaage'] },
  { name: 'Chef Special', icon: ChefHat, category: 'japanese', keywords: ['omakase', 'chef', 'especial', 'exclusivo'] },
  { name: 'Bento', icon: Package, category: 'japanese', keywords: ['bento', 'box', 'marmita', 'combo'] },
  
  // Bebidas (8 ícones)
  { name: 'Sake', icon: Wine, category: 'drinks', keywords: ['sake', 'vinho', 'japonês', 'bebida', 'álcool'] },
  { name: 'Cerveja', icon: Beer, category: 'drinks', keywords: ['cerveja', 'beer', 'chopp', 'asahi', 'kirin'] },
  { name: 'Coquetel', icon: Martini, category: 'drinks', keywords: ['drink', 'coquetel', 'caipirinha', 'cocktail'] },
  { name: 'Refrigerante', icon: Milk, category: 'drinks', keywords: ['refrigerante', 'soda', 'coca', 'guaraná', 'suco'] },
  { name: 'Água', icon: GlassWater, category: 'drinks', keywords: ['água', 'water', 'mineral', 'com gás'] },
  { name: 'Café', icon: Coffee, category: 'drinks', keywords: ['café', 'chá', 'matcha', 'verde', 'quente'] },
  { name: 'Drink Premium', icon: Diamond, category: 'drinks', keywords: ['premium', 'especial', 'whisky', 'importado'] },
  { name: 'Bebida Gelada', icon: IceCream, category: 'drinks', keywords: ['gelado', 'frozen', 'shake', 'smoothie'] },
  
  // Sobremesas (5 ícones)
  { name: 'Sorvete', icon: IceCream, category: 'desserts', keywords: ['sorvete', 'gelato', 'açaí', 'frozen'] },
  { name: 'Doce', icon: Candy, category: 'desserts', keywords: ['doce', 'mochi', 'dorayaki', 'japonês'] },
  { name: 'Bolo', icon: Cake, category: 'desserts', keywords: ['bolo', 'torta', 'cheesecake', 'sobremesa'] },
  { name: 'Biscoito', icon: Cookie, category: 'desserts', keywords: ['biscoito', 'cookie', 'petit', 'gateau'] },
  { name: 'Fruta', icon: Cherry, category: 'desserts', keywords: ['fruta', 'salada', 'frutas', 'natural'] },
  
  // Especiais e Promoções (8 ícones)
  { name: 'Premium', icon: Crown, category: 'special', keywords: ['premium', 'especial', 'vip', 'exclusivo'] },
  { name: 'Rodízio', icon: Star, category: 'special', keywords: ['rodízio', 'festival', 'all you can eat', 'livre'] },
  { name: 'Promoção', icon: Gift, category: 'special', keywords: ['promoção', 'desconto', 'oferta', 'combo'] },
  { name: 'Picante', icon: Flame, category: 'special', keywords: ['picante', 'hot', 'spicy', 'apimentado'] },
  { name: 'Favorito', icon: Heart, category: 'special', keywords: ['favorito', 'popular', 'mais pedido', 'top'] },
  { name: 'Novidade', icon: Sparkles, category: 'special', keywords: ['novo', 'novidade', 'lançamento', 'new'] },
  { name: 'Festa', icon: PartyPopper, category: 'special', keywords: ['festa', 'evento', 'celebração', 'aniversário'] },
  { name: 'Campeão', icon: Trophy, category: 'special', keywords: ['melhor', 'campeão', 'top', 'premiado'] },
  
  // Geral e Serviços (9 ícones)
  { name: 'Vegetariano', icon: Leaf, category: 'general', keywords: ['vegetariano', 'vegano', 'salada', 'verde'] },
  { name: 'Entrada', icon: Citrus, category: 'general', keywords: ['entrada', 'aperitivo', 'petisco', 'porção'] },
  { name: 'Sanduíche', icon: Sandwich, category: 'general', keywords: ['sanduíche', 'lanche', 'burger', 'wrap'] },
  { name: 'Talheres', icon: Utensils, category: 'general', keywords: ['prato', 'refeição', 'comida', 'principal'] },
  { name: 'Delivery', icon: Truck, category: 'service', keywords: ['entrega', 'delivery', 'moto', 'ifood'] },
  { name: 'Mesa', icon: Store, category: 'service', keywords: ['mesa', 'restaurante', 'local', 'salão'] },
  { name: 'Pedido', icon: ShoppingCart, category: 'service', keywords: ['pedido', 'carrinho', 'compra', 'order'] },
  { name: 'Embalagem', icon: Package2, category: 'service', keywords: ['viagem', 'embalagem', 'para levar', 'takeaway'] },
  { name: 'Serviço', icon: ConciergeBell, category: 'service', keywords: ['serviço', 'atendimento', 'garçom', 'mesa'] }
];

// Função helper para obter ícones por categoria
export function getIconsByCategory(category: MenuIconOption['category']): MenuIconOption[] {
  return menuIconLibrary.filter(icon => icon.category === category);
}

// Ícones padrão sugeridos para grupos comuns
export const defaultGroupIcons = {
  rodizio: 'Rodízio',
  premium: 'Premium',
  tradicional: 'Sushi',
  bebidas: 'Bebida',
  sobremesas: 'Sorvete',
  entradas: 'Entrada',
  pratos: 'Talheres',
  especiais: 'Chef Special'
};

// Função helper para obter um ícone por nome
export function getIconByName(name: string): MenuIcon | undefined {
  const iconOption = menuIconLibrary.find(icon => icon.name === name);
  return iconOption?.icon;
}