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
  
  // Mais ícones para expandir biblioteca japonesa
  CircleEllipsis,
  Disc,
  Bean,
  Package2,
  Triangle,
  Square,
  Circle,
  Octagon,
  CircleOff,
  Grip,
  Flower2,
  Droplets,
  Slice,
  Donut,
  Grid2x2Check,
  FileCode,
  FilePlus,
  Footprints,
  FormInput,
  Frame,
  Gauge,
  GitBranch,
  GitCommit,
  GitCompare,
  GitFork,
  GitMerge,
  GitPullRequest,
  Globe,
  Grab,
  Hammer,
  HardDrive,
  Heading,
  Hexagon,
  Highlighter,
  History,
  Hourglass,
  Inbox,
  Indent,
  Italic,
  Key,
  Keyboard,
  Landmark,
  Laptop,
  Layers,
  LayoutDashboard,
  Library,
  Lightbulb,
  Link,
  ListOrdered,
  Loader,
  Lock,
  LogIn,
  LogOut,
  Map,
  MapPin,
  Maximize,
  Medal,
  MessageCircle,
  MessageSquare,
  Mic,
  Minimize,
  Monitor,
  Move,
  Music,
  Navigation,
  Network,
  Notebook,
  Option,
  Palette,
  Paperclip,
  Pause,
  PauseCircle,
  Pen,
  PenTool,
  Phone,
  PieChart,
  Pin,
  Plane,
  Play,
  PlayCircle,
  Plug,
  PlusCircle,
  Pocket,
  Podcast,
  Pointer,
  Power,
  Printer,
  QrCode,
  Quote,
  Radio,
  Receipt,
  RectangleHorizontal,
  RectangleVertical,
  Recycle,
  Redo,
  RefreshCcw,
  RefreshCw,
  Repeat,
  Reply,
  Rewind,
  Rocket,
  RotateCw,
  Rss,
  Ruler,
  Save,
  Scale,
  Scan,
  Scissors,
  ScreenShare,
  Search,
  Send,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Ship,
  Shirt,
  ShoppingBagIcon,
  Shuffle,
  Sidebar,
  Signal,
  Smartphone,
  Smile,
  Sparkle as SparkleIcon,
  Speaker,
  Stamp,
  StopCircle,
  TabletIcon,
  Target,
  Terminal,
  Thermometer,
  ThumbsUp,
  ToggleLeft,
  ToggleRight,
  Trash2,
  TrendingUp,
  TriangleRight,
  Tv,
  Type,
  Umbrella,
  Undo,
  Unlock,
  UserCheck,
  UserPlus,
  UserX,
  Video,
  Volume,
  Volume2,
  VolumeX,
  Wallet,
  Watch,
  Wifi,
  Wind,
  ZoomIn,
  ZoomOut,
  
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
  // Comida Japonesa e Asiática - Pratos Principais
  { name: 'Sushi', icon: Fish, category: 'japanese', keywords: ['sushi', 'peixe', 'japonês', 'niguiri'] },
  { name: 'Sashimi', icon: Square, category: 'japanese', keywords: ['sashimi', 'peixe', 'cru', 'fresco'] },
  { name: 'Temaki', icon: Triangle, category: 'japanese', keywords: ['temaki', 'cone', 'sushi', 'hand roll'] },
  { name: 'Uramaki', icon: Circle, category: 'japanese', keywords: ['uramaki', 'california', 'roll', 'invertido'] },
  { name: 'Hot Roll', icon: Flame, category: 'japanese', keywords: ['hot', 'quente', 'frito', 'empanado'] },
  { name: 'Maki', icon: Circle, category: 'japanese', keywords: ['maki', 'roll', 'alga', 'nori'] },
  { name: 'Hossomaki', icon: CircleOff, category: 'japanese', keywords: ['hossomaki', 'fino', 'simples', 'pepino'] },
  { name: 'Futomaki', icon: Disc, category: 'japanese', keywords: ['futomaki', 'grosso', 'grande', 'colorido'] },
  { name: 'Gunkan', icon: Octagon, category: 'japanese', keywords: ['gunkan', 'navio', 'ovas', 'uni'] },
  { name: 'Chirashi', icon: Salad, category: 'japanese', keywords: ['chirashi', 'tigela', 'misto', 'bowl'] },
  { name: 'Ramen', icon: Soup, category: 'japanese', keywords: ['ramen', 'lamen', 'sopa', 'macarrão'] },
  { name: 'Udon', icon: Wheat, category: 'japanese', keywords: ['udon', 'macarrão', 'grosso', 'quente'] },
  { name: 'Soba', icon: Grip, category: 'japanese', keywords: ['soba', 'macarrão', 'frio', 'sarraceno'] },
  { name: 'Yakisoba', icon: Grid3x3, category: 'japanese', keywords: ['yakisoba', 'frito', 'macarrão', 'legumes'] },
  { name: 'Tempura', icon: CircleEllipsis, category: 'japanese', keywords: ['tempura', 'frito', 'camarão', 'vegetal'] },
  { name: 'Gyoza', icon: Pizza, category: 'japanese', keywords: ['gyoza', 'dumpling', 'pastel', 'vapor'] },
  { name: 'Tonkatsu', icon: Ham, category: 'japanese', keywords: ['tonkatsu', 'porco', 'empanado', 'panko'] },
  { name: 'Karaage', icon: Drumstick, category: 'japanese', keywords: ['karaage', 'frango', 'frito', 'crocante'] },
  { name: 'Teriyaki', icon: Beef, category: 'japanese', keywords: ['teriyaki', 'molho', 'grelhado', 'doce'] },
  { name: 'Yakitori', icon: Slice, category: 'japanese', keywords: ['yakitori', 'espeto', 'frango', 'grelhado'] },
  { name: 'Katsudon', icon: Egg, category: 'japanese', keywords: ['katsudon', 'bowl', 'tonkatsu', 'ovo'] },
  { name: 'Oyakodon', icon: Package2, category: 'japanese', keywords: ['oyakodon', 'frango', 'ovo', 'arroz'] },
  { name: 'Tendon', icon: Shell, category: 'japanese', keywords: ['tendon', 'tempura', 'arroz', 'bowl'] },
  { name: 'Onigiri', icon: Triangle, category: 'japanese', keywords: ['onigiri', 'bolinho', 'arroz', 'alga'] },
  { name: 'Takoyaki', icon: CircleEllipsis, category: 'japanese', keywords: ['takoyaki', 'polvo', 'bolinho', 'molho'] },
  { name: 'Okonomiyaki', icon: Disc, category: 'japanese', keywords: ['okonomiyaki', 'panqueca', 'japonesa', 'osaka'] },
  { name: 'Donburi', icon: Package, category: 'japanese', keywords: ['donburi', 'bowl', 'arroz', 'tigela'] },
  { name: 'Bento', icon: Package2, category: 'japanese', keywords: ['bento', 'marmita', 'caixa', 'completo'] },
  { name: 'Sukiyaki', icon: CookingPot, category: 'japanese', keywords: ['sukiyaki', 'panela', 'carne', 'inverno'] },
  { name: 'Shabu Shabu', icon: Waves, category: 'japanese', keywords: ['shabu', 'fondue', 'japonês', 'caldo'] },
  { name: 'Teppanyaki', icon: Grid3x3, category: 'japanese', keywords: ['teppan', 'chapa', 'grelhado', 'show'] },
  { name: 'Robatayaki', icon: Flame, category: 'japanese', keywords: ['robata', 'carvão', 'grelha', 'tradicional'] },
  { name: 'Kushiyaki', icon: Slice, category: 'japanese', keywords: ['kushi', 'espeto', 'yakitori', 'grelhado'] },
  { name: 'Oden', icon: CookingPot, category: 'japanese', keywords: ['oden', 'cozido', 'inverno', 'konbini'] },
  { name: 'Chawanmushi', icon: Egg, category: 'japanese', keywords: ['chawanmushi', 'ovo', 'vapor', 'custard'] },
  { name: 'Nikuman', icon: Package, category: 'japanese', keywords: ['nikuman', 'pão', 'vapor', 'recheado'] },
  { name: 'Hashi', icon: UtensilsCrossed, category: 'japanese', keywords: ['hashi', 'pauzinhos', 'chopsticks', 'talher'] },
  
  // Peixes e Frutos do Mar
  { name: 'Atum', icon: Fish, category: 'japanese', keywords: ['atum', 'maguro', 'tuna', 'vermelho'] },
  { name: 'Salmão', icon: Fish, category: 'japanese', keywords: ['salmão', 'sake', 'salmon', 'laranja'] },
  { name: 'Hamachi', icon: Fish, category: 'japanese', keywords: ['hamachi', 'yellowtail', 'olhete', 'peixe'] },
  { name: 'Tai', icon: Fish, category: 'japanese', keywords: ['tai', 'pargo', 'snapper', 'branco'] },
  { name: 'Unagi', icon: Fish, category: 'japanese', keywords: ['unagi', 'enguia', 'eel', 'grelhado'] },
  { name: 'Anago', icon: Fish, category: 'japanese', keywords: ['anago', 'congro', 'enguia', 'mar'] },
  { name: 'Kohada', icon: Fish, category: 'japanese', keywords: ['kohada', 'arenque', 'sardinha', 'prata'] },
  { name: 'Saba', icon: Fish, category: 'japanese', keywords: ['saba', 'cavalinha', 'mackerel', 'azul'] },
  { name: 'Kani', icon: Shell, category: 'japanese', keywords: ['kani', 'caranguejo', 'crab', 'marisco'] },
  { name: 'Ebi', icon: Shell, category: 'japanese', keywords: ['ebi', 'camarão', 'shrimp', 'tempura'] },
  { name: 'Tako', icon: Octagon, category: 'japanese', keywords: ['tako', 'polvo', 'octopus', 'tentáculo'] },
  { name: 'Ika', icon: Square, category: 'japanese', keywords: ['ika', 'lula', 'squid', 'calamar'] },
  { name: 'Hotate', icon: Shell, category: 'japanese', keywords: ['hotate', 'vieira', 'scallop', 'marisco'] },
  { name: 'Ikura', icon: CircleOff, category: 'japanese', keywords: ['ikura', 'ovas', 'salmão', 'caviar'] },
  { name: 'Uni', icon: Star, category: 'japanese', keywords: ['uni', 'ouriço', 'sea urchin', 'delicacy'] },
  { name: 'Tobiko', icon: Grip, category: 'japanese', keywords: ['tobiko', 'ovas', 'peixe voador', 'colorido'] },
  { name: 'Masago', icon: Grip, category: 'japanese', keywords: ['masago', 'ovas', 'capelim', 'laranja'] },
  { name: 'Fugu', icon: Fish, category: 'japanese', keywords: ['fugu', 'baiacu', 'pufferfish', 'especial'] },
  
  // Vegetais e Acompanhamentos
  { name: 'Wasabi', icon: Zap, category: 'japanese', keywords: ['wasabi', 'raiz', 'forte', 'picante'] },
  { name: 'Gari', icon: Carrot, category: 'japanese', keywords: ['gengibre', 'gari', 'conserva', 'rosa'] },
  { name: 'Nori', icon: FileCode, category: 'japanese', keywords: ['nori', 'alga', 'folha', 'seaweed'] },
  { name: 'Wakame', icon: Leaf, category: 'japanese', keywords: ['wakame', 'alga', 'salada', 'verde'] },
  { name: 'Konbu', icon: Waves, category: 'japanese', keywords: ['konbu', 'kelp', 'dashi', 'alga'] },
  { name: 'Hijiki', icon: TreePine, category: 'japanese', keywords: ['hijiki', 'alga', 'preta', 'mineral'] },
  { name: 'Daikon', icon: Carrot, category: 'japanese', keywords: ['daikon', 'nabo', 'rabanete', 'branco'] },
  { name: 'Shiitake', icon: TreePine, category: 'japanese', keywords: ['shiitake', 'cogumelo', 'mushroom', 'umami'] },
  { name: 'Enoki', icon: Trees, category: 'japanese', keywords: ['enoki', 'cogumelo', 'fino', 'branco'] },
  { name: 'Shimeji', icon: TreePine, category: 'japanese', keywords: ['shimeji', 'cogumelo', 'cluster', 'marrom'] },
  { name: 'Edamame', icon: Bean, category: 'japanese', keywords: ['edamame', 'soja', 'vagem', 'aperitivo'] },
  { name: 'Tofu', icon: Package, category: 'japanese', keywords: ['tofu', 'queijo', 'soja', 'vegano'] },
  { name: 'Abura-age', icon: Package2, category: 'japanese', keywords: ['abura', 'tofu', 'frito', 'inari'] },
  { name: 'Gobo', icon: TreePine, category: 'japanese', keywords: ['gobo', 'bardana', 'raiz', 'fibra'] },
  { name: 'Renkon', icon: Flower2, category: 'japanese', keywords: ['renkon', 'lótus', 'raiz', 'crocante'] },
  { name: 'Kabocha', icon: Circle, category: 'japanese', keywords: ['kabocha', 'abóbora', 'japonesa', 'doce'] },
  { name: 'Natto', icon: Grip, category: 'japanese', keywords: ['natto', 'soja', 'fermentado', 'pegajoso'] },
  { name: 'Takuan', icon: Square, category: 'japanese', keywords: ['takuan', 'daikon', 'conserva', 'amarelo'] },
  { name: 'Umeboshi', icon: Cherry, category: 'japanese', keywords: ['umeboshi', 'ameixa', 'conserva', 'azedo'] },
  { name: 'Myoga', icon: Flower, category: 'japanese', keywords: ['myoga', 'gengibre', 'botão', 'aromático'] },
  { name: 'Shiso', icon: Leaf, category: 'japanese', keywords: ['shiso', 'perilla', 'folha', 'aromático'] },
  { name: 'Mitsuba', icon: Leaf, category: 'japanese', keywords: ['mitsuba', 'salsa', 'japonesa', 'erva'] },
  
  // Molhos e Temperos
  { name: 'Shoyu', icon: Droplet, category: 'japanese', keywords: ['shoyu', 'soja', 'molho', 'soy sauce'] },
  { name: 'Miso', icon: Package, category: 'japanese', keywords: ['miso', 'pasta', 'soja', 'fermentado'] },
  { name: 'Mirin', icon: Wine, category: 'japanese', keywords: ['mirin', 'vinho', 'arroz', 'doce'] },
  { name: 'Ponzu', icon: Droplets, category: 'japanese', keywords: ['ponzu', 'cítrico', 'shoyu', 'molho'] },
  { name: 'Tare', icon: Droplet, category: 'japanese', keywords: ['tare', 'molho', 'base', 'teriyaki'] },
  { name: 'Dashi', icon: Soup, category: 'japanese', keywords: ['dashi', 'caldo', 'base', 'umami'] },
  { name: 'Mentsuyu', icon: Droplets, category: 'japanese', keywords: ['mentsuyu', 'molho', 'macarrão', 'base'] },
  { name: 'Karashi', icon: Flame, category: 'japanese', keywords: ['karashi', 'mostarda', 'japonesa', 'picante'] },
  { name: 'Rayu', icon: Flame, category: 'japanese', keywords: ['rayu', 'óleo', 'pimenta', 'chili'] },
  { name: 'Shichimi', icon: Flame, category: 'japanese', keywords: ['shichimi', 'togarashi', 'pimenta', 'sete'] },
  { name: 'Furikake', icon: Sparkles, category: 'japanese', keywords: ['furikake', 'tempero', 'arroz', 'topping'] },
  { name: 'Yuzu Kosho', icon: Zap, category: 'japanese', keywords: ['yuzu', 'kosho', 'pimenta', 'cítrico'] },
  { name: 'Sesame', icon: Circle, category: 'japanese', keywords: ['gergelim', 'sesame', 'semente', 'goma'] },
  
  // Doces e Sobremesas
  { name: 'Mochi', icon: Cookie, category: 'japanese', keywords: ['mochi', 'doce', 'arroz', 'glutinoso'] },
  { name: 'Dorayaki', icon: Sandwich, category: 'japanese', keywords: ['dorayaki', 'panqueca', 'anko', 'doce'] },
  { name: 'Taiyaki', icon: Fish, category: 'japanese', keywords: ['taiyaki', 'peixe', 'doce', 'waffle'] },
  { name: 'Dango', icon: CircleEllipsis, category: 'japanese', keywords: ['dango', 'espeto', 'doce', 'mochi'] },
  { name: 'Daifuku', icon: Cookie, category: 'japanese', keywords: ['daifuku', 'mochi', 'recheado', 'doce'] },
  { name: 'Yokan', icon: Square, category: 'japanese', keywords: ['yokan', 'gelatina', 'feijão', 'doce'] },
  { name: 'Anmitsu', icon: Salad, category: 'japanese', keywords: ['anmitsu', 'sobremesa', 'frutas', 'agar'] },
  { name: 'Kakigori', icon: IceCream, category: 'japanese', keywords: ['kakigori', 'raspadinha', 'gelo', 'verão'] },
  { name: 'Matcha Ice', icon: IceCream, category: 'japanese', keywords: ['matcha', 'sorvete', 'verde', 'chá'] },
  { name: 'Anpan', icon: Donut, category: 'japanese', keywords: ['anpan', 'pão', 'doce', 'feijão'] },
  { name: 'Melonpan', icon: Cookie, category: 'japanese', keywords: ['melonpan', 'pão', 'doce', 'melão'] },
  { name: 'Castella', icon: Cake, category: 'japanese', keywords: ['castella', 'bolo', 'esponja', 'português'] },
  { name: 'Monaka', icon: Diamond, category: 'japanese', keywords: ['monaka', 'wafer', 'doce', 'recheado'] },
  
  // Bebidas
  { name: 'Sake', icon: Wine, category: 'japanese', keywords: ['sake', 'nihonshu', 'arroz', 'álcool'] },
  { name: 'Shochu', icon: Wine, category: 'japanese', keywords: ['shochu', 'destilado', 'batata', 'álcool'] },
  { name: 'Umeshu', icon: Cherry, category: 'japanese', keywords: ['umeshu', 'ameixa', 'licor', 'doce'] },
  { name: 'Chuhai', icon: CupSoda, category: 'japanese', keywords: ['chuhai', 'coquetel', 'lata', 'álcool'] },
  { name: 'Matcha', icon: Leaf, category: 'japanese', keywords: ['matcha', 'chá', 'verde', 'pó'] },
  { name: 'Sencha', icon: Leaf, category: 'japanese', keywords: ['sencha', 'chá', 'verde', 'folha'] },
  { name: 'Genmaicha', icon: Coffee, category: 'japanese', keywords: ['genmaicha', 'chá', 'arroz', 'torrado'] },
  { name: 'Hojicha', icon: Coffee, category: 'japanese', keywords: ['hojicha', 'chá', 'torrado', 'marrom'] },
  { name: 'Mugicha', icon: Coffee, category: 'japanese', keywords: ['mugicha', 'chá', 'cevada', 'gelado'] },
  { name: 'Ramune', icon: Milk, category: 'japanese', keywords: ['ramune', 'refrigerante', 'bolinha', 'verão'] },
  { name: 'Calpis', icon: GlassWater, category: 'japanese', keywords: ['calpis', 'calpico', 'lácteo', 'doce'] },
  { name: 'Amazake', icon: Milk, category: 'japanese', keywords: ['amazake', 'doce', 'arroz', 'fermentado'] },
  
  // Conceitos e Experiências
  { name: 'Omakase', icon: ChefHat, category: 'japanese', keywords: ['omakase', 'chef', 'escolha', 'surpresa'] },
  { name: 'Kaiseki', icon: Crown, category: 'japanese', keywords: ['kaiseki', 'alta', 'gastronomia', 'estação'] },
  { name: 'Izakaya', icon: Store, category: 'japanese', keywords: ['izakaya', 'bar', 'japonês', 'petisco'] },
  { name: 'Premium', icon: Diamond, category: 'japanese', keywords: ['premium', 'especial', 'top', 'melhor'] },
  { name: 'Festival', icon: PartyPopper, category: 'japanese', keywords: ['matsuri', 'festival', 'celebração', 'evento'] },
  { name: 'Wagyu', icon: Award, category: 'japanese', keywords: ['wagyu', 'carne', 'premium', 'marmorizada'] },
  
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
  { name: 'Lua', icon: MoonStar, category: 'service', keywords: ['noite', 'night', 'jantar', 'late'] },
  
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