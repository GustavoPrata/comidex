"use client";

// Funções utilitárias para cálculos decimais precisos
const toDecimal = (value: number): number => {
  return Math.round(value * 100) / 100;
};

const calculateItemTotal = (quantity: number, price: number): number => {
  return toDecimal(quantity * price);
};

const sumTotals = (values: number[]): number => {
  const sum = values.reduce((acc, val) => acc + val * 100, 0);
  return sum / 100;
};

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from 'react-dom';
import { createClient } from "@/lib/supabase/client";
import { getIconByName } from "@/lib/menu-icons-library";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Home,
  X,
  Check,
  ArrowLeft,
  CreditCard,
  DollarSign,
  Smartphone,
  User,
  Plus,
  Minus,
  Receipt,
  AlertCircle,
  RefreshCw,
  Search,
  Coffee,
  Pizza,
  Beef,
  Fish,
  Salad,
  IceCream,
  Wine,
  Beer,
  Package,
  TrendingUp,
  History,
  Printer,
  FileText,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Zap,
  Star,
  ShoppingBag,
  Calculator,
  Keyboard,
  UtensilsCrossed,
  Armchair,
  Soup,
  Send,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Gift,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import PaymentWorkspace from "@/app/components/PaymentWorkspace";
import PromocoesSection from "@/app/components/PromocoesSection";

const supabase = createClient();

// Types
interface Group {
  id: number;
  name: string;
  price: number | null;
  half_price: number | null;
  type: 'rodizio' | 'a_la_carte' | 'bebidas';
  active: boolean;
  sort_order: number;
  icon?: string | null;
}

interface Category {
  id: number;
  name: string;
  active: boolean;
  sort_order: number;
  group_id: number | null;
  icon?: string;
}

interface Item {
  id: number;
  name: string;
  description?: string | null;
  price: number | null;
  category_id: number;
  group_id: number;
  category?: Category;
  group?: Group;
  available: boolean;
  active: boolean;
  image?: string | null;
  icon?: string | null;
}

interface RestaurantTable {
  id: number;
  number: string;
  capacity: number;
  type: 'table' | 'counter';
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'closed';
  active: boolean;
  current_session?: TableSession;
}

interface TableSession {
  id: number;
  table_id: number;
  status: 'open' | 'closed';
  customer_count: number;
  opened_at: string;
  closed_at?: string | null;
  total: number;
  final_total?: number;
  notes?: string | null;
}

interface Order {
  id: number;
  order_number: string;
  table_id: number | null;
  session_id?: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded';
  payment_method: 'cash' | 'card' | 'pix' | 'mixed' | null;
  type: 'dine_in' | 'takeout' | 'delivery';
  subtotal: number;
  total: number;
  items: OrderItem[];
  created_at?: string;
}

interface OrderItem {
  id?: number;
  order_id?: number;
  item_id: number;
  item?: Item;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string | null;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  cancelledQuantity?: number;
  launched_at?: string; // Timestamp do momento do lançamento
  lineId?: string; // ID único da linha no carrinho
}

interface SalesStats {
  totalSales: number;
  totalOrders: number;
  averageTicket: number;
  topProducts: { name: string; quantity: number; total: number }[];
}

type Screen = 'tables' | 'session' | 'payment' | 'history';

// Category Icons Map
const categoryIcons: { [key: string]: any } = {
  'Bebidas': Beer,
  'Drinks': Beer,
  'Vinhos': Wine,
  'Sobremesas': IceCream,
  'Saladas': Salad,
  'Carnes': Beef,
  'Peixes': Fish,
  'Massas': Pizza,
  'Lanches': Coffee,
  'Entradas': Package
};

export default function POSPage() {
  // Estados principais
  const [screen, setScreen] = useState<Screen>('tables');
  const [loading, setLoading] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const [salesStats, setSalesStats] = useState<SalesStats>({
    totalSales: 0,
    totalOrders: 0,
    averageTicket: 0,
    topProducts: []
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Estado da mesa/sessão atual
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [currentSession, setCurrentSession] = useState<TableSession | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [serviceTaxPercentage, setServiceTaxPercentage] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'all' | 'delivered' | 'cancelled'>('all');
  
  // Estados do numpad e entrada
  const [inputValue, setInputValue] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [activeInput, setActiveInput] = useState<"code" | "quantity">("code");
  
  // Estados de diálogos
  const [openTableDialog, setOpenTableDialog] = useState(false);
  const [customerCount, setCustomerCount] = useState(1);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash');
  const [closeSessionDialog, setCloseSessionDialog] = useState(false);
  const [printDialog, setPrintDialog] = useState(false);
  const [transferTableDialog, setTransferTableDialog] = useState(false);
  const [targetTableNumber, setTargetTableNumber] = useState('');
  const [cancelTableDialog, setCancelTableDialog] = useState(false);
  const [confirmCloseTableDialog, setConfirmCloseTableDialog] = useState(false);
  
  // Estados do modal de cancelamento parcial
  const [cancelQuantityDialog, setCancelQuantityDialog] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<any>(null);
  const [cancelQuantity, setCancelQuantity] = useState(1);
  
  // Ref para o ScrollArea dos itens do carrinho
  const cartScrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState<'top' | 'middle' | 'bottom'>('top');
  const previousCartLengthRef = useRef(0);
  
  
  // Removidas funções de scroll automático - os itens mais recentes aparecem em cima
  
  // Atualizar horário a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada 60 segundos

    return () => clearInterval(timer);
  }, []);
  
  // Buscar a taxa de serviço do restaurante
  useEffect(() => {
    const fetchServiceTax = async () => {
      try {
        const response = await fetch('/api/restaurant');
        if (response.ok) {
          const data = await response.json();
          setServiceTaxPercentage(data.service_tax_percentage || 0);
        }
      } catch (error) {
        console.error('Erro ao buscar taxa de serviço:', error);
      }
    };
    fetchServiceTax();
  }, []);

  // Monitora posição do scroll para mostrar/ocultar botões (otimizado com requestAnimationFrame)
  useEffect(() => {
    const scrollContainer = cartScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollContainer) return;
    
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
          // Ajustado para ser mais preciso na detecção do final
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // Tolerância de 10px
          const isAtTop = scrollTop <= 5;
          
          if (isAtTop) {
            setScrollPosition('top');
          } else if (isAtBottom) {
            setScrollPosition('bottom');
          } else {
            setScrollPosition('middle');
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    
    // Verificar posição inicial
    setTimeout(handleScroll, 100);
    
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [cart.length]); // Adicionado cart.length para recalcular quando mudar
  
  
  // Estados do checkout completo
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [groupedItems, setGroupedItems] = useState<any[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'value'>('value');
  const [discountValue, setDiscountValue] = useState(0);
  const [splitCount, setSplitCount] = useState(1);
  const [payments, setPayments] = useState<any[]>([]);
  const [calculatorValue, setCalculatorValue] = useState('');
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [activePaymentInput, setActivePaymentInput] = useState<number | null>(null);
  
  // Estados para promoções
  const [appliedPromotions, setAppliedPromotions] = useState<any[]>([]);
  
  // Handler para quando uma promoção é ativada/desativada
  const handlePromotionToggle = (promotion: any, applied: boolean) => {
    console.log(`Promoção ${promotion.name} ${applied ? 'aplicada' : 'removida'}`);
  };
  
  // Função para agrupar itens do carrinho
  const groupCartItems = (items: any[]) => {
    const grouped = new Map();
    
    items.forEach(item => {
      // Incluir todos os itens, inclusive cancelados
      const key = `${item.item_id}_${item.unit_price}_${item.status}`;
      
      if (grouped.has(key)) {
        const existing = grouped.get(key);
        existing.quantity += item.quantity;
        existing.total_price = existing.quantity * existing.unit_price;
        // Manter o launched_at mais recente
        if (item.launched_at && (!existing.launched_at || new Date(item.launched_at) > new Date(existing.launched_at))) {
          existing.launched_at = item.launched_at;
        }
      } else {
        grouped.set(key, {
          item: item.item,
          unit_price: item.unit_price,
          quantity: item.quantity,
          total_price: item.quantity * item.unit_price,
          status: item.status, // Adicionar status para identificar cancelados
          launched_at: item.launched_at // Adicionar horário de lançamento
        });
      }
    });
    
    // Ordenar por launched_at, mais recentes primeiro
    return Array.from(grouped.values()).sort((a, b) => {
      if (!a.launched_at) return 1;
      if (!b.launched_at) return -1;
      return new Date(b.launched_at).getTime() - new Date(a.launched_at).getTime();
    });
  };
  
  // Atualizar groupedItems sempre que o carrinho mudar ou a mesa estiver fechada
  useEffect(() => {
    if (selectedTable?.status === 'closed' && cart.length > 0) {
      const grouped = groupCartItems(cart);
      setGroupedItems(grouped);
    }
  }, [cart, selectedTable?.status]);
  
  // Estado da aba ativa
  const [activeTab, setActiveTab] = useState<string>('cart');
  
  
  // Estados do modal de rodízio
  const [rodizioModal, setRodizioModal] = useState(false);
  const [selectedRodizioGroup, setSelectedRodizioGroup] = useState<any>(null);
  const [rodizioInteiro, setRodizioInteiro] = useState(0);
  const [rodizioMeio, setRodizioMeio] = useState(0);
  
  // Refs
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      loadTables();
      if (screen === 'history') loadTodayOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, [screen]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Atalhos globais
      if (e.key === 'F1') {
        e.preventDefault();
        setScreen('tables');
      } else if (e.key === 'F3' && cart.length > 0) {
        e.preventDefault();
        startCheckout();
      } else if (e.key === 'F4') {
        e.preventDefault();
        setPrintDialog(true);
      } else if (e.key === 'F5') {
        e.preventDefault();
        loadInitialData();
        toast.success('Dados atualizados');
      } else if (e.key === 'F9') {
        e.preventDefault();
        setScreen('history');
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setPaymentDialog(false);
        setPrintDialog(false);
        setOpenTableDialog(false);
        setCloseSessionDialog(false);
        setCheckoutDialog(false);
      }
      
      // Atalhos da sessão
      if (screen === 'session') {
        if (e.key === '+' && !e.ctrlKey) {
          e.preventDefault();
          setQuantity(prev => (parseInt(prev) + 1).toString());
        } else if (e.key === '-' && !e.ctrlKey) {
          e.preventDefault();
          setQuantity(prev => Math.max(1, parseInt(prev) - 1).toString());
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedTable, cart, screen]);

  // Focar no input quando voltar para sessão
  useEffect(() => {
    if (screen === 'session' && codeInputRef.current) {
      setTimeout(() => codeInputRef.current?.focus(), 100);
    }
  }, [screen]);

  // Função para carregar pedidos existentes de uma mesa
  const loadExistingOrderItems = async (tableId: string) => {
    try {
      console.log('Carregando pedidos existentes para mesa:', tableId);
      
      // Buscar pedidos não finalizados da mesa
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, order_number, status, total')
        .eq('table_id', tableId)
        .not('status', 'in', '(completed,cancelled)')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (ordersError) {
        if (ordersError.code !== 'PGRST116') { // Ignorar se não encontrar pedido
          console.error('Erro ao buscar pedidos:', ordersError);
        }
        return;
      }

      if (!orders) {
        console.log('Nenhum pedido aberto encontrado para a mesa');
        return;
      }

      console.log('Pedido encontrado:', orders);
      setCurrentOrder(orders);

      // Buscar itens do pedido - incluindo o status
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          items:item_id(
            id,
            name,
            price,
            category_id,
            group_id,
            description,
            image
          )
        `)
        .eq('order_id', orders.id)
        .order('created_at', { ascending: true });

      if (itemsError) {
        console.error('Erro ao buscar itens do pedido:', itemsError);
        toast.error('Erro ao carregar itens do pedido');
        return;
      }

      if (orderItems && orderItems.length > 0) {
        console.log(`Carregando ${orderItems.length} itens do pedido`);
        
        // Converter itens do banco para o formato do carrinho
        const cartItems: OrderItem[] = orderItems.map((orderItem: any) => {
          // Para rodízios (item_id null)
          if (!orderItem.item_id && orderItem.metadata) {
            const metadata = orderItem.metadata as any;
            return {
              id: metadata.id || Math.floor(Math.random() * -1000000),
              order_id: orders.id,
              item_id: metadata.id || Math.floor(Math.random() * -1000000),
              item: {
                id: metadata.id || Math.floor(Math.random() * -1000000),
                name: metadata.name || 'Rodízio',
                price: orderItem.unit_price || 0,
                group_id: metadata.group_id,
                category_id: metadata.category_id,
                description: metadata.description,
                icon: metadata.icon,
                image: metadata.image
              },
              quantity: orderItem.quantity || 1,
              unit_price: orderItem.unit_price || 0,
              total_price: (orderItem.unit_price || 0) * (orderItem.quantity || 1),
              notes: orderItem.observation || '',
              status: orderItem.status === 'cancelled' ? ('cancelled' as const) : ('delivered' as const), // Manter status do banco
              launched_at: orderItem.created_at // Usar created_at como horário de lançamento
            };
          }
          
          // Para itens normais
          const item = orderItem.items as any;
          return {
            id: orderItem.id,
            order_id: orders.id,
            item_id: orderItem.item_id || 0,
            item: item ? {
              id: item.id,
              name: item.name || `Item #${orderItem.item_id}`,
              price: item.price || orderItem.unit_price || 0,
              group_id: item.group_id,
              category_id: item.category_id,
              description: item.description,
              image: item.image
            } : {
              id: orderItem.item_id,
              name: `Item #${orderItem.item_id}`,
              price: orderItem.unit_price || 0
            },
            quantity: orderItem.quantity || 1,
            unit_price: orderItem.unit_price || 0,
            total_price: (orderItem.unit_price || 0) * (orderItem.quantity || 1),
            notes: orderItem.observation || '',
            status: orderItem.status === 'cancelled' ? ('cancelled' as const) : ('delivered' as const), // Manter status do banco
            launched_at: orderItem.created_at // Usar created_at como horário de lançamento
          };
        });
        
        setCart(cartItems);
        toast.success(`${cartItems.length} item(ns) carregado(s) do pedido #${orders.order_number}`);
      } else {
        console.log('Nenhum item encontrado no pedido');
        setCart([]); // Limpar carrinho se não há itens
      }
    } catch (error) {
      console.error('Erro ao carregar itens existentes:', error);
      toast.error('Erro ao carregar pedido existente');
    }
  };

  // Funções de carregamento
  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTables(), 
        loadGroups(),
        loadItems(), 
        loadCategories(),
        loadTodayOrders()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      const { data: tablesData, error } = await supabase
        .from('restaurant_tables')
        .select(`
          *,
          current_session:table_sessions!table_sessions_table_id_fkey(
            id,
            table_id,
            status,
            customer_count,
            opened_at,
            closed_at,
            total,
            final_total
          )
        `)
        .eq('active', true)
        .order('number');

      if (error) throw error;

      const processedTables = (tablesData || []).map((table: any) => ({
        ...table,
        current_session: table.current_session?.find((s: any) => s.status === 'open')
      }));

      // Ordenação numérica das mesas/balcões
      processedTables.sort((a: any, b: any) => {
        const numA = parseInt(a.number) || 0;
        const numB = parseInt(b.number) || 0;
        return numA - numB;
      });

      setTables(processedTables);
    } catch (error) {
      console.error('Erro ao carregar mesas:', error);
      toast.error('Erro ao carregar mesas');
    }
  };

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast.error('Erro ao carregar grupos');
    }
  };

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          category:categories(*),
          group:groups(*)
        `)
        .eq('active', true)
        .eq('available', true)
        .order('name');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadTodayOrders = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            item:items(*)
          )
        `)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTodayOrders(data || []);
      
      // Calcular estatísticas
      if (data) {
        const stats = calculateSalesStats(data);
        setSalesStats(stats);
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const calculateSalesStats = (orders: Order[]): SalesStats => {
    const completedOrders = orders.filter(o => o.payment_status === 'paid');
    const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = completedOrders.length;
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    
    // Calcular produtos mais vendidos
    const productMap = new Map<string, { quantity: number; total: number }>();
    
    completedOrders.forEach(order => {
      order.items?.forEach(item => {
        const name = item.item?.name || `Produto ${item.item_id}`;
        const existing = productMap.get(name) || { quantity: 0, total: 0 };
        productMap.set(name, {
          quantity: existing.quantity + item.quantity,
          total: existing.total + item.total_price
        });
      });
    });
    
    const topProducts = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    return {
      totalSales,
      totalOrders,
      averageTicket,
      topProducts
    };
  };

  const loadSessionDetails = async (tableId: number) => {
    try {
      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            item:items(*)
          )
        `)
        .eq('table_id', tableId)
        .eq('status', 'open') // Buscar apenas orders abertos
        .single();

      if (!error && orderData) {
        setCurrentOrder(orderData as any);
        
        // Transform order items to cart format
        const cartItems = orderData.items?.map((orderItem: any) => {
          // Handle rodízio items (no item_id)
          if (!orderItem.item_id) {
            // Extract rodízio metadata if available
            const metadata = orderItem.metadata || {};
            const rodizioItem = {
              id: orderItem.id, // Manter ID do banco para atualizações
              order_id: orderItem.order_id,
              item_id: -1 * Date.now() - Math.random() * 1000, // Generate negative ID for cart
              quantity: orderItem.quantity,
              unit_price: orderItem.unit_price,
              total_price: orderItem.total_price,
              status: orderItem.status === 'cancelled' ? 'cancelled' : 'delivered', // Preservar cancelamento ou marcar como lançado
              launched_at: orderItem.created_at,
              icon: metadata.icon || null, // Recover icon from metadata
              item: {
                name: metadata.name || orderItem.notes || 'Rodízio', // Get name from metadata or notes
                price: orderItem.unit_price,
                group: {
                  type: 'rodizio'
                }
              }
            };
            return rodizioItem;
          }
          
          // Handle regular items
          return {
            id: orderItem.id, // Manter ID do banco para atualizações
            order_id: orderItem.order_id,
            item_id: orderItem.item_id,
            quantity: orderItem.quantity,
            unit_price: orderItem.unit_price,
            total_price: orderItem.total_price,
            status: orderItem.status === 'cancelled' ? 'cancelled' : 'delivered', // Preservar cancelamento ou marcar como lançado
            launched_at: orderItem.created_at,
            item: orderItem.item
          };
        }) || [];
        
        setCart(cartItems);
        // Removido scroll automático - itens recentes ficam no topo
      } else {
        setCart([]);
        setCurrentOrder(null);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da sessão:', error);
      setCart([]);
      setCurrentOrder(null);
    }
  };

  // FUNÇÕES DE MESA/SESSÃO
  const handleSelectTable = async (table: RestaurantTable) => {
    console.log('Mesa selecionada:', table);
    setSelectedTable(table);
    setCustomerCount(1); // Reset para 1 ao selecionar nova mesa
    
    if (table.current_session) {
      setCurrentSession(table.current_session);
      await loadSessionDetails(table.id);
      
      // Carregar itens existentes do pedido
      await loadExistingOrderItems(table.id.toString());
      
      setScreen('session');
      // Garante que a mesa está selecionada na sessão
      console.log('Indo para sessão com mesa:', table.id);
    } else {
      setOpenTableDialog(true);
    }
  };

  const handleOpenTable = async () => {
    if (!selectedTable) return;
    
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from('table_sessions')
        .insert({
          table_id: selectedTable.id,
          status: 'open',
          customer_count: customerCount,
          opened_at: new Date().toISOString(),
          total: 0
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'occupied' })
        .eq('id', selectedTable.id);

      if (tableError) throw tableError;

      setCurrentSession(sessionData);
      setOpenTableDialog(false);
      setCart([]);
      setCurrentOrder(null); // Limpar order ao abrir nova mesa
      setScreen('session');
      toast.success(`Mesa ${selectedTable.number} aberta`);
      
      await loadTables();
    } catch (error: any) {
      console.error('Erro ao abrir mesa:', error);
      const errorMessage = error?.message || error?.details || 'Erro desconhecido ao abrir mesa';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função para cancelar todos os itens e limpar a mesa
  const handleCancelTable = async () => {
    if (!currentSession) {
      toast.error("Nenhuma sessão ativa encontrada");
      return;
    }
    
    // Prevenir operações duplicadas
    if (operationInProgress === 'cancel-table') {
      toast.warning("Operação já em andamento...");
      return;
    }
    
    setOperationInProgress('cancel-table');
    setLoading(true);
    try {
      // Buscar o pedido ativo da mesa
      const { data: activeOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('table_id', currentSession.table_id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'delivered'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (activeOrder) {
        // Cancelar todos os itens do pedido
        const { error: itemsError } = await supabase
          .from('order_items')
          .update({ status: 'cancelled' })
          .eq('order_id', activeOrder.id)
          .neq('status', 'cancelled');

        if (itemsError) {
          console.error('Erro ao cancelar itens:', itemsError);
          throw itemsError;
        }

        // Fechar o pedido
        const { error: orderError } = await supabase
          .from('orders')
          .update({ 
            status: 'cancelled',
            total: 0
          })
          .eq('id', activeOrder.id);

        if (orderError) {
          console.error('Erro ao cancelar pedido:', orderError);
          throw orderError;
        }
      }

      // Fechar a sessão
      const { error: sessionError } = await supabase
        .from('table_sessions')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString(),
          total: 0
        })
        .eq('id', currentSession.id);

      if (sessionError) {
        console.error('Erro ao fechar sessão:', sessionError);
        throw sessionError;
      }

      // Liberar a mesa
      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', currentSession.table_id);

      if (tableError) {
        console.error('Erro ao liberar mesa:', tableError);
        throw tableError;
      }

      toast.success("Mesa cancelada e limpa com sucesso!");
      
      // Resetar estado
      setCart([]);
      setCurrentSession(null);
      setCurrentOrder(null);
      setScreen('tables');
      setSelectedTable(null);
      
      // Recarregar mesas
      await loadTables();
    } catch (error: any) {
      console.error('Erro completo ao cancelar mesa:', error);
      toast.error(`Erro ao cancelar mesa: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
      setOperationInProgress(null);
    }
  };

  // Função para transferir mesa com tratamento robusto de erros
  const handleTransferTable = async () => {
    if (!currentSession || !targetTableNumber) {
      toast.error('Sessão ou mesa de destino não especificada');
      return;
    }
    
    // Prevenir operações duplicadas
    if (operationInProgress === 'transfer-table') {
      toast.warning("Transferência já em andamento...");
      return;
    }
    
    // Validar número da mesa
    const targetNum = parseInt(targetTableNumber);
    if (isNaN(targetNum) || targetNum <= 0) {
      toast.error('Número da mesa inválido');
      return;
    }
    
    setOperationInProgress('transfer-table');
    setLoading(true);
    
    // Salvar estado atual para rollback se necessário
    const originalSession = currentSession;
    const originalCart = [...cart];
    
    try {
      // Buscar a mesa de destino com timeout
      const { data: targetTable, error: targetError } = await Promise.race([
        supabase
          .from('restaurant_tables')
          .select('*')
          .eq('number', targetNum)
          .single(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout ao buscar mesa')), 5000)
        )
      ]) as any;

      if (targetError || !targetTable) {
        throw new Error(`Mesa ${targetTableNumber} não encontrada`);
      }

      // Verificar se a mesa destino está livre
      if (targetTable.status !== 'available') {
        throw new Error(`Mesa ${targetTableNumber} está ocupada`);
      }

      // Criar nova sessão para a mesa de destino
      const { data: newSession, error: newSessionError } = await supabase
        .from('table_sessions')
        .insert({
          table_id: targetTable.id,
          status: 'open',
          opened_at: new Date().toISOString(),
          customer_count: currentSession.customer_count || 1,
          total: 0
        })
        .select()
        .single();

      if (newSessionError || !newSession) {
        console.error('Erro ao criar nova sessão:', newSessionError);
        throw new Error('Falha ao criar nova sessão para a mesa de destino');
      }

      console.log('Nova sessão criada:', newSession.id);

      // Buscar o pedido ativo da mesa origem
      const { data: sourceOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('table_id', currentSession.table_id)
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'delivered'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sourceOrder) {
        // Criar novo pedido para a mesa destino
        const { data: targetOrder, error: newOrderError } = await supabase
          .from('orders')
          .insert({
            order_number: `ORDER-${Date.now()}`,
            table_id: targetTable.id,
            status: 'pending',
            total: 0
          })
          .select()
          .single();

        if (newOrderError || !targetOrder) {
          console.error('Erro ao criar novo pedido:', newOrderError);
          throw new Error('Falha ao criar novo pedido para a mesa de destino');
        }

        console.log('Novo pedido criado:', targetOrder.id);

        // Transferir todos os itens não cancelados para o novo pedido
        const { error: itemsError } = await supabase
          .from('order_items')
          .update({ order_id: targetOrder.id })
          .eq('order_id', sourceOrder.id)
          .neq('status', 'cancelled');

        if (itemsError) {
          console.error('Erro ao transferir itens:', itemsError);
          throw itemsError;
        }

        // Atualizar o total do novo pedido
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('quantity, unit_price')
          .eq('order_id', targetOrder.id)
          .neq('status', 'cancelled');

        // Usar cálculo com precisão decimal
        const newTotal = orderItems?.reduce((sum: number, item: any) => {
          const itemTotal = Math.round(item.quantity * item.unit_price * 100) / 100;
          return Math.round((sum + itemTotal) * 100) / 100;
        }, 0) || 0;

        const { error: totalError } = await supabase
          .from('orders')
          .update({ total: newTotal })
          .eq('id', targetOrder.id);

        if (totalError) throw totalError;

        // Atualizar total da nova sessão
        const { error: sessionTotalError } = await supabase
          .from('table_sessions')
          .update({ total: newTotal })
          .eq('id', newSession.id);

        if (sessionTotalError) throw sessionTotalError;

        // Fechar o pedido antigo
        const { error: closeOrderError } = await supabase
          .from('orders')
          .update({ 
            status: 'closed',
            total: 0
          })
          .eq('id', sourceOrder.id);

        if (closeOrderError) throw closeOrderError;
      }

      // Fechar a sessão antiga com verificação
      const { error: closeError } = await supabase
        .from('table_sessions')
        .update({ 
          status: 'closed',
          closed_at: new Date().toISOString(),
          total: 0
        })
        .eq('id', currentSession.id);

      if (closeError) {
        console.error('Erro ao fechar sessão antiga:', closeError);
        throw new Error('Falha ao fechar sessão original');
      }

      // Liberar mesa antiga
      const { error: oldTableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', currentSession.table_id);

      if (oldTableError) throw oldTableError;

      // Ocupar mesa nova
      const { error: newTableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'occupied' })
        .eq('id', targetTable.id);

      if (newTableError) throw newTableError;

      toast.success(`Mesa transferida para ${targetTableNumber} com sucesso!`);
      
      // Fechar o dialog e resetar
      setTransferTableDialog(false);
      setTargetTableNumber('');
      
      // Voltar para tela de mesas
      setCart([]);
      setCurrentSession(null);
      setCurrentOrder(null);
      setScreen('tables');
      setSelectedTable(null);
      
      // Recarregar mesas
      loadTables();
    } catch (error: any) {
      console.error('Erro ao transferir mesa:', error);
      toast.error(`Erro ao transferir mesa: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
      setOperationInProgress(null);
    }
  };

  // FUNÇÕES DO CARRINHO
  const handleNumpadClick = (value: string) => {
    if (activeInput === "code") {
      setInputValue(prev => prev + value);
    } else {
      setQuantity(prev => prev + value);
    }
  };

  const handleBackspace = () => {
    if (activeInput === "code") {
      setInputValue(prev => prev.slice(0, -1));
    } else {
      setQuantity(prev => prev.slice(0, -1) || "1");
    }
  };

  const handleClear = () => {
    if (activeInput === "code") {
      setInputValue("");
    } else {
      setQuantity("1");
    }
  };

  // Função para adicionar rodízio ao carrinho
  const handleAddRodizio = () => {
    if (!selectedRodizioGroup) return;
    
    const total = rodizioInteiro + rodizioMeio;
    if (total === 0) {
      toast.error("Adicione pelo menos 1 rodízio");
      return;
    }
    
    // Adiciona rodízio inteiro se houver
    if (rodizioInteiro > 0) {
      const rodizioItem: OrderItem = {
        item_id: -1 * Date.now(), // Usar número negativo para IDs temporários de rodízio
        quantity: rodizioInteiro,
        unit_price: selectedRodizioGroup.price || 0,
        total_price: (selectedRodizioGroup.price || 0) * rodizioInteiro,
        status: 'pending' as const,
        item: {
          id: -1 * Date.now(),
          name: selectedRodizioGroup.name,
          group_id: selectedRodizioGroup.id,
          price: selectedRodizioGroup.price || 0,
          active: true,
          available: true,
          category_id: 0,
          group: selectedRodizioGroup,
          icon: selectedRodizioGroup.icon
        }
      };
      setCart(prev => [...prev, rodizioItem]);
    }
    
    // Adiciona rodízio meio se houver
    if (rodizioMeio > 0) {
      const rodizioItem: OrderItem = {
        item_id: -2 * Date.now(), // Usar número negativo para IDs temporários de rodízio
        quantity: rodizioMeio,
        unit_price: selectedRodizioGroup.half_price || 0,
        total_price: (selectedRodizioGroup.half_price || 0) * rodizioMeio,
        status: 'pending' as const,
        item: {
          id: -2 * Date.now(),
          name: `${selectedRodizioGroup.name} (Meio)`,
          group_id: selectedRodizioGroup.id,
          price: selectedRodizioGroup.half_price || 0,
          active: true,
          available: true,
          category_id: 0,
          group: selectedRodizioGroup,
          icon: selectedRodizioGroup.icon
        }
      };
      setCart(prev => [...prev, rodizioItem]);
    }
    
    // Fecha o modal e vai para as categorias
    setRodizioModal(false);
    setSelectedGroup(selectedRodizioGroup.id);
    
    // Seleciona a primeira categoria
    const firstCategory = categories
      .filter(c => c.active && c.group_id === selectedRodizioGroup.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0];
    if (firstCategory) {
      setSelectedCategory(firstCategory.id);
    }
    
    toast.success("Rodízio adicionado com sucesso!");
  };

  const handleAddItem = (item?: Item) => {
    if (!item) {
      if (!inputValue) {
        toast.error("Digite o código do produto");
        return;
      }

      item = items.find(i => 
        i.id.toString() === inputValue || 
        i.name.toLowerCase().includes(inputValue.toLowerCase())
      );

      if (!item) {
        toast.error("Produto não encontrado");
        return;
      }
    }

    const qty = parseInt(quantity) || 1;
    
    // Verifica se o item é de um grupo rodízio
    const group = item.group_id ? groups.find(g => g.id === item.group_id) : null;
    const isRodizio = group?.type === 'rodizio';
    
    // Se for rodízio, verifica se já tem rodízio lançado
    if (isRodizio) {
      const hasRodizio = cart.some(cartItem => {
        // Verifica se é um rodízio (tem ID negativo) e se é do mesmo grupo
        const isRodizioItem = cartItem.item_id < 0;
        const isSameGroup = cartItem.item?.group_id === item.group_id;
        const hasRodizioInName = cartItem.item?.name?.includes(group?.name || '');
        return isRodizioItem && (isSameGroup || hasRodizioInName);
      });
      
      if (!hasRodizio) {
        // Se não tem rodízio, mostra o modal para adicionar primeiro
        toast.error(`É necessário lançar o rodízio ${group.name} primeiro!`);
        setSelectedRodizioGroup(group);
        setRodizioInteiro(1);
        setRodizioMeio(0);
        setRodizioModal(true);
        return;
      }
    }
    
    // Calcular preço - se for item de rodízio (e já tem rodízio lançado), é grátis
    let itemPrice = item.price || 0;
    
    if (isRodizio) {
      // Items de rodízio são sempre grátis (inclusos no rodízio)
      itemPrice = 0;
    }
    
    const newItem: OrderItem = {
      id: Date.now() + Math.random(), // ID único para cada linha do carrinho
      item_id: item.id,
      item: item,
      quantity: qty,
      unit_price: itemPrice,
      total_price: itemPrice * qty,
      status: 'pending' // Status inicial como "pending"
    };

    setCart(prev => {
      // Procurar apenas por itens PENDENTES (não lançados) para mesclar
      // Itens lançados (delivered/cancelled) NUNCA devem ser agrupados com novos
      const existing = prev.find(c => 
        c.item_id === item.id && (c.status === 'pending' || !c.status)
      );
      
      if (existing) {
        // Mesclar apenas com itens pendentes (não lançados)
        return prev.map(c => 
          c.id === existing.id 
            ? { 
                ...c, 
                quantity: c.quantity + qty, 
                total_price: c.unit_price * (c.quantity + qty) 
              }
            : c
        );
      } else {
        // Criar nova linha - itens lançados ficam separados
        return [...prev, newItem];
      }
    });

    // Mudar automaticamente para aba "Comanda" para mostrar o item adicionado
    setActiveTab('cart');

    // Feedback visual e sonoro com animação
    let message = item.name;
    if (isRodizio) {
      message = `${item.name} (Incluído no Rodízio)`;
    }
    
    // Criar um toast customizado com animação
    toast.success(
      <motion.div 
        initial={{ opacity: 0, scale: 0.5, x: -100 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex items-center gap-3"
      >
        <motion.div
          initial={{ rotate: -180 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ShoppingBag className="h-5 w-5 text-green-500" />
        </motion.div>
        <div>
          <div className="font-semibold">{message}</div>
          <div className="text-xs text-gray-400">Adicionado ao carrinho!</div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Check className="h-5 w-5 text-green-500" />
        </motion.div>
      </motion.div>,
      {
        duration: 3000,
        style: {
          background: 'linear-gradient(to right, #1f2937, #111827)',
          color: '#fff',
        }
      }
    );
    
    setInputValue("");
    setQuantity("1");
    setActiveInput("code");
    codeInputRef.current?.focus();
  };

  const handleUpdateQuantity = (cartLineId: number, delta: number) => {
    setCart(prev => {
      // Find the item to check current quantity
      const currentItem = prev.find(item => item.id === cartLineId);
      
      // If decreasing and quantity is 1
      if (currentItem && currentItem.quantity === 1 && delta === -1) {
        // Se o item não foi lançado, remove do carrinho
        if (currentItem.status === 'pending' || !currentItem.status) {
          toast.success("Item removido");
          return prev.filter(item => item.id !== cartLineId);
        }
        // Se o item foi lançado, marca como cancelado
        if (currentItem.status === 'delivered') {
          toast.error("Item marcado como cancelado");
          return prev.map(item => {
            if (item.id === cartLineId) {
              return {
                ...item,
                status: 'cancelled' as any
              };
            }
            return item;
          });
        }
        // Se já está cancelado, mantém como está
        return prev;
      }
      
      // Se está aumentando quantidade de item cancelado, restaura
      if (currentItem?.status === 'cancelled' && delta > 0) {
        toast.success("Item restaurado");
        return prev.map(item => {
          if (item.id === cartLineId) {
            return {
              ...item,
              status: 'delivered' as any,
              quantity: item.quantity + delta,
              total_price: item.unit_price * (item.quantity + delta),
              wasRestored: true // Flag para indicar que foi restaurado e precisa ser lançado
            } as any;
          }
          return item;
        });
      }
      
      // Otherwise, update the quantity
      return prev.map(item => {
        if (item.id === cartLineId) {
          const newQty = Math.max(1, item.quantity + delta);
          return {
            ...item,
            quantity: newQty,
            total_price: item.unit_price * newQty
          };
        }
        return item;
      });
    });
  };

  const handleRemoveItem = (cartLineId: number) => {
    const item = cart.find(i => i.id === cartLineId);
    if (!item) return;
    
    // Se o item não foi lançado (pending), remove do carrinho
    if (item.status === 'pending' || !item.status) {
      setCart(prev => prev.filter(item => item.id !== cartLineId));
      toast.success("Item removido");
      return;
    }
    
    // Se o item foi lançado, alterna entre delivered e cancelled
    if (item.status === 'delivered') {
      // Se tem apenas 1 unidade, cancela direto
      if (item.quantity === 1) {
        setCart(prev => prev.map(item => {
          if (item.id === cartLineId) {
            return {
              ...item,
              status: 'cancelled' as any,
              cancelledQuantity: 1,
              wasCancelled: true // Flag para indicar que foi cancelado e precisa ser lançado
            } as any;
          }
          return item;
        }));
        toast.error("Item cancelado");
      } else {
        // Se tem mais de 1 unidade, abre modal para escolher quantidade
        setItemToCancel(item);
        setCancelQuantity(1);
        setCancelQuantityDialog(true);
      }
    } else if (item.status === 'cancelled') {
      // Restaurar item cancelado
      setCart(prev => prev.map(item => {
        if (item.id === cartLineId) {
          const updated = { ...item };
          delete updated.cancelledQuantity;
          return {
            ...updated,
            status: 'delivered' as any,
            wasRestored: true // Flag para indicar que foi restaurado e precisa ser lançado
          } as any;
        }
        return item;
      }));
      toast.success("Item restaurado");
    }
  };
  
  const handleConfirmCancelQuantity = () => {
    if (!itemToCancel) return;
    
    setCart(prev => prev.map(item => {
      if (item.id === itemToCancel.id) {
        const cancelledQty = cancelQuantity;
        if (cancelledQty >= item.quantity) {
          // Cancela tudo
          return {
            ...item,
            status: 'cancelled' as any,
            cancelledQuantity: item.quantity,
            wasCancelled: true // Flag para indicar que foi cancelado e precisa ser lançado
          } as any;
        } else {
          // Cancela parcialmente
          return {
            ...item,
            cancelledQuantity: cancelledQty,
            wasCancelled: true // Flag para indicar cancelamento parcial pendente
          } as any;
        }
      }
      return item;
    }));
    
    toast.error(`${cancelQuantity} ${cancelQuantity === 1 ? 'item cancelado' : 'itens cancelados'}`);
    setCancelQuantityDialog(false);
    setItemToCancel(null);
  };

  const handleCancelOrder = () => {
    // Identifica itens que precisam ser cancelados (pendentes, restaurados ou cancelados)
    const itemsToCancelOrRevert = cart.filter(item => 
      item.status === 'pending' || 
      !item.status || 
      (item as any).wasRestored === true ||
      (item as any).wasCancelled === true
    );
    
    if (itemsToCancelOrRevert.length === 0) {
      toast.error("Não há alterações para cancelar.");
      return;
    }

    // Remove itens pendentes e reverte flags de itens modificados
    setCart(prev => prev
      .filter(item => item.status === 'delivered' || item.status === 'cancelled')
      .map(item => {
        const updated = { ...item };
        
        // Se o item foi restaurado, remove a flag wasRestored
        if ((updated as any).wasRestored) {
          delete (updated as any).wasRestored;
        }
        
        // Se o item foi cancelado, reverte para delivered e remove flags
        if ((updated as any).wasCancelled) {
          delete (updated as any).wasCancelled;
          delete (updated as any).cancelledQuantity;
          // Se estava totalmente cancelado, volta para delivered
          if (updated.status === 'cancelled') {
            return { ...updated, status: 'delivered' as any };
          }
        }
        
        return updated;
      })
    );
    
    toast.success("Alterações canceladas");
  };


  // Calcular total com desconto
  const calculateTotalWithDiscount = () => {
    const subtotal = calculateSubtotal(); // Usar subtotal em vez de total
    const serviceTax = calculateServiceTax();
    const totalWithTax = subtotal + serviceTax;
    
    // Aplicar desconto manual (do usuário)
    let manualDiscount = 0;
    if (discountType === 'percentage') {
      // Aplicar desconto no subtotal (antes da taxa)
      const discountAmount = subtotal * discountValue / 100;
      const subtotalAfterDiscount = subtotal - discountAmount;
      const serviceTaxAfterDiscount = serviceTaxPercentage > 0 ? (subtotalAfterDiscount * serviceTaxPercentage / 100) : 0;
      manualDiscount = discountAmount;
    } else {
      // Desconto fixo aplicado no total (após taxa)
      manualDiscount = discountValue;
    }
    
    // Calcular desconto das promoções aplicadas
    const promotionDiscount = appliedPromotions.reduce((total, promo) => total + promo.discount, 0);
    
    // Total com todos os descontos (manual + promoções)
    const totalWithAllDiscounts = totalWithTax - manualDiscount - promotionDiscount;
    return Math.max(0, totalWithAllDiscounts);
  };

  // Calcular valor restante a pagar
  const calculateRemaining = () => {
    const total = calculateTotalWithDiscount();
    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, total - paid);
  };

  // Calcular troco
  const calculateChange = () => {
    const total = calculateTotalWithDiscount();
    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    return Math.max(0, paid - total);
  };

  // Adicionar pagamento
  const addPayment = (payment: any) => {
    const remaining = calculateRemaining();
    if (remaining <= 0) {
      toast.error("Conta já está totalmente paga!");
      return;
    }
    
    const paymentAmount = Math.min(payment.amount, remaining);
    setPayments([...payments, {
      ...payment,
      amount: paymentAmount
    }]);
    
    if (calculateRemaining() - paymentAmount <= 0) {
      toast.success("Pagamento completo!");
    }
  };

  // Remover pagamento
  const removePayment = (paymentId: string) => {
    setPayments(payments.filter(p => p.id !== paymentId));
  };

  // Iniciar processo de fechar conta
  const startCheckout = () => {
    // Abrir modal de confirmação ao invés de ir direto para checkout
    setConfirmCloseTableDialog(true);
  };
  
  // Confirmar fechamento da conta
  const confirmCloseTable = async () => {
    if (!currentSession || !selectedTable) return;
    
    setLoading(true);
    try {
      // Calcular total da mesa
      const total = calculateTotal();
      
      // Atualizar status da mesa para 'closed'
      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'closed' })
        .eq('id', selectedTable.id);
      
      if (tableError) throw tableError;
      
      // Atualizar sessão para indicar que está fechada mas não encerrada
      const { error: sessionError } = await supabase
        .from('table_sessions')
        .update({
          final_total: total,
          notes: 'Conta fechada - aguardando pagamento'
        })
        .eq('id', currentSession.id);
      
      if (sessionError) throw sessionError;
      
      // Atualizar o status da mesa localmente IMEDIATAMENTE
      setSelectedTable((prev: any) => ({
        ...prev,
        status: 'closed'
      }));
      
      toast.success("Conta fechada com sucesso!");
      setConfirmCloseTableDialog(false);
      
      // Recarregar dados da mesa
      await loadSessionDetails(selectedTable.id);
      await loadTables();
      
    } catch (error: any) {
      console.error('Erro ao fechar conta:', error);
      toast.error(`Erro ao fechar conta: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Reabrir mesa fechada
  const reopenTable = async () => {
    if (!currentSession || !selectedTable) return;
    
    setLoading(true);
    try {
      // Voltar status da mesa para 'occupied'
      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'occupied' })
        .eq('id', selectedTable.id);
      
      if (tableError) throw tableError;
      
      // Limpar notas da sessão
      const { error: sessionError } = await supabase
        .from('table_sessions')
        .update({
          notes: null,
          final_total: null
        })
        .eq('id', currentSession.id);
      
      if (sessionError) throw sessionError;
      
      toast.success("Mesa reaberta com sucesso!");
      
      // Recarregar dados da mesa primeiro
      await loadSessionDetails(selectedTable.id);
      await loadTables();
      
      // Atualizar o status da mesa localmente DEPOIS de recarregar
      // Isso garante que a interface seja atualizada corretamente
      setSelectedTable((prev: any) => prev ? ({
        ...prev,
        status: 'occupied'
      }) : null);
      
    } catch (error: any) {
      console.error('Erro ao reabrir mesa:', error);
      toast.error(`Erro ao reabrir mesa: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Finalizar checkout e processar pagamento
  const finishCheckout = async () => {
    const remaining = calculateRemaining();
    if (remaining > 0) {
      toast.error(`Ainda faltam ${formatCurrency(remaining)} para pagar!`);
      return;
    }
    
    if (!selectedTable) {
      toast.error("Mesa não encontrada!");
      return;
    }
    
    setLoading(true);
    
    try {
      // Buscar pedido atual da mesa
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('table_id', selectedTable.id)
        .not('status', 'in', '(completed,cancelled)')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (orderError || !order) {
        throw new Error('Pedido não encontrado');
      }

      // Salvar pagamentos no banco
      for (const payment of payments) {
        await supabase
          .from('payments')
          .insert({
            order_id: order.id,
            amount: payment.amount,
            method: payment.method,
            status: 'completed'
          });
      }
      
      // Salvar desconto se houver
      if (discountValue > 0) {
        const discountAmount = discountType === 'percentage' 
          ? calculateSubtotal() * discountValue / 100 
          : discountValue;
          
        await supabase
          .from('discounts')
          .insert({
            order_id: order.id,
            type: discountType,
            value: discountValue,
            amount: discountAmount
          });
      }
      
      // Salvar divisão se houver
      if (splitCount > 1) {
        const amountPerPerson = calculateTotalWithDiscount() / splitCount;
        
        for (let i = 1; i <= splitCount; i++) {
          await supabase
            .from('payment_splits')
            .insert({
              order_id: order.id,
              person_number: i,
              amount: amountPerPerson
            });
        }
      }
      
      // Atualizar ordem
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_method: payments.length > 1 ? 'mixed' : payments[0].method,
          discount: discountValue > 0 ? (discountType === 'percentage' ? calculateSubtotal() * discountValue / 100 : discountValue) : 0,
          status: 'completed',
          completed_at: new Date().toISOString(),
          total: calculateTotalWithDiscount()
        })
        .eq('id', order.id);
      
      // Atualizar mesa para disponível
      await supabase
        .from('tables')
        .update({ 
          status: 'available',
          current_order_id: null
        })
        .eq('id', selectedTable.id);
      
      toast.success("Conta fechada com sucesso!");
      
      // Limpar tudo e voltar
      setCheckoutDialog(false);
      setPaymentDialog(false);
      setCart([]);
      setCurrentOrder(null);
      setCurrentSession(null);
      setSelectedTable(null);
      setScreen('tables');
      loadTables();
      
    } catch (error: any) {
      console.error('Erro ao fechar conta:', error);
      const errorMessage = error?.message || error?.error || 'Erro desconhecido ao processar pagamento';
      toast.error(`Erro ao processar pagamento: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };


  const handleLaunchOrder = async () => {
    // Filtrar itens por status
    const newItems = cart.filter(item => item.status === 'pending');
    const cancelledItems = cart.filter(item => item.status === 'cancelled' && item.id && !item.lineId);
    const restoredItems = cart.filter(item => 
      item.status === 'delivered' && 
      (item as any).wasRestored === true && 
      item.id && 
      item.order_id
    );
    const itemsWithCancelledFlag = cart.filter(item =>
      (item as any).wasCancelled === true
    );
    const itemsToUpdate = cart.filter(item => 
      (item.status === 'cancelled' || item.status === 'pending') && 
      item.id && 
      !item.lineId
    );
    
    // Se não há nada para processar (todos já lançados)
    if (newItems.length === 0 && cancelledItems.length === 0 && restoredItems.length === 0 && itemsToUpdate.length === 0 && itemsWithCancelledFlag.length === 0) {
      toast.error("Nenhuma alteração para lançar. Adicione novos itens ou modifique os existentes.");
      return;
    }

    if (!selectedTable?.id) {
      toast.error("Mesa não selecionada. Volte para a tela de mesas e selecione uma mesa.");
      console.error("Erro: selectedTable não está definida", selectedTable);
      return;
    }

    try {
      console.log('Lançando pedido para mesa:', selectedTable.id);

      // Processar itens cancelados que já foram lançados anteriormente
      const itemsToCancel = cart.filter(item => 
        (item.status === 'cancelled' || (item as any).wasCancelled === true) && 
        item.id && 
        item.order_id
      );

      if (itemsToCancel.length > 0) {
        console.log('Atualizando itens cancelados no banco:', itemsToCancel);
        
        for (const item of itemsToCancel) {
          // Se tem cancelamento parcial
          if ((item as any).cancelledQuantity && (item as any).cancelledQuantity < item.quantity) {
            // Atualizar quantidade cancelada no banco (cancelamento parcial)
            const { error: updateError } = await supabase
              .from('order_items')
              .update({ 
                cancelled_quantity: (item as any).cancelledQuantity
              })
              .eq('id', item.id);
            
            if (updateError) {
              console.error('Erro ao atualizar cancelamento parcial:', updateError);
              throw updateError;
            }
          } else {
            // Cancelamento total
            const { error: updateError } = await supabase
              .from('order_items')
              .update({ 
                status: 'cancelled'
                // Não zerar quantity aqui - manter o valor original para histórico
              })
              .eq('id', item.id);
            
            if (updateError) {
              console.error('Erro ao atualizar item cancelado:', updateError);
              throw updateError;
            }
          }
        }
        
        console.log('Itens cancelados atualizados com sucesso');
      }

      // Processar itens restaurados (que eram cancelados e foram restaurados)
      if (restoredItems.length > 0) {
        console.log('Atualizando itens restaurados no banco:', restoredItems);
        
        for (const item of restoredItems) {
          const { error: updateError } = await supabase
            .from('order_items')
            .update({ 
              status: 'pending' // Voltar para pending para ser entregue novamente
            })
            .eq('id', item.id);
          
          if (updateError) {
            console.error('Erro ao atualizar item restaurado:', updateError);
            throw updateError;
          }
        }
        
        console.log('Itens restaurados atualizados com sucesso');
      }

      // Adicionar apenas itens novos (não lançados) ao pedido
      let insertedItems = null;
      let orderId = currentOrder?.id; // Para usar depois no mapeamento do cart
      
      // Só inserir novos itens se houver algum
      if (newItems.length > 0) {
        console.log('Inserindo itens novos:', newItems);

        // Usar a API de orders que já integra com a fila de impressão
        const orderPayload = {
          session_id: currentSession?.id,
          total: calculateTotal(),
          items: newItems.map(item => ({
            item_id: item.item_id < 0 ? null : item.item_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            notes: item.notes,
            name: item.item?.name || 'Item',
            additionals_price: 0
          })),
          notes: '',
          priority: 'high',
          added_by: 'pos'
        };

        // Enviar para API que já integra com fila de impressão
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderPayload)
        });

        if (!response.ok) {
          const error = await response.json();
          console.error('Erro ao criar pedido:', error);
          throw new Error(error.error || 'Erro ao criar pedido');
        }

        const newOrder = await response.json();
        console.log('Pedido criado e adicionado à fila de impressão:', newOrder);
        
        // Atualizar orderId para usar no mapeamento
        orderId = newOrder.id;
        
        // Atualizar currentOrder se for um novo pedido
        if (!currentOrder || currentOrder.id !== newOrder.id) {
          setCurrentOrder(newOrder);
        }

        // Para compatibilidade, criar array de items como se viesse do Supabase
        insertedItems = newItems.map(item => ({
          ...item,
          order_id: newOrder.id,
          created_at: new Date().toISOString()
        }));
      }

      // Marcar apenas os itens recém-lançados como delivered e adicionar timestamp do banco
      setCart(cart.map(item => {
        // Se o item foi restaurado, limpar a flag wasRestored
        if ((item as any).wasRestored) {
          const { wasRestored, ...itemWithoutFlag } = item as any;
          return itemWithoutFlag;
        }
        
        // Se o item foi cancelado, limpar a flag wasCancelled
        if ((item as any).wasCancelled) {
          const { wasCancelled, ...itemWithoutFlag } = item as any;
          return itemWithoutFlag;
        }
        
        // Se o item estava nos newItems (foi lançado agora), marca como delivered
        const insertedItem = insertedItems?.find((inserted: any) => {
          // Para rodízios
          if (item.item_id < 0 && !inserted.item_id) {
            return inserted.metadata?.name === item.item?.name;
          }
          // Para itens normais
          return inserted.item_id === item.item_id;
        });
        
        if (insertedItem && newItems.some(newItem => 
          newItem.item_id === item.item_id && 
          newItem.quantity === item.quantity &&
          newItem.status === item.status
        )) {
          return {
            ...item,
            status: 'delivered' as const,
            order_id: orderId,
            launched_at: insertedItem.created_at // Usar created_at do banco
          };
        }
        // Mantém itens já lançados como estão
        return item;
      }));
      
      // Manter na aba do carrinho para continuar adicionando
      setActiveTab('cart');
      
      // Rolar automaticamente para mostrar os itens lançados
      setTimeout(() => {
        if (cartScrollRef.current) {
          const scrollElement = cartScrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
          }
        }
      }, 100);
      
      // Verificar se ainda há itens ativos na mesa após cancelamentos
      const activeItemsCount = cart.filter(item => 
        item.status !== 'cancelled'
      ).length;
      
      // Se todos os itens foram cancelados, atualizar mesa para disponível
      if (activeItemsCount === 0 && cart.length > 0) {
        console.log('Todos os itens foram cancelados, liberando mesa');
        
        // Atualizar status da mesa para disponível
        await supabase
          .from('restaurant_tables')
          .update({ status: 'available' })
          .eq('id', selectedTable.id);
          
        // Fechar o pedido
        await supabase
          .from('orders')
          .update({ 
            status: 'cancelled',
            total: 0
          })
          .eq('id', orderId);
        
        // Fechar a sessão se existir
        if (currentSession) {
          await supabase
            .from('table_sessions')
            .update({ 
              status: 'closed',
              closed_at: new Date().toISOString()
            })
            .eq('id', currentSession.id);
        }
        
        toast.success("Mesa liberada - todos os itens foram cancelados");
        // Voltar para a tela de mesas
        setTimeout(() => {
          setScreen('tables');
          setCart([]);
          setSelectedTable(null);
          setCurrentSession(null);
          loadTables(); // Recarregar lista de mesas
        }, 1500);
        
        return;
      }
      
      // Mensagem de sucesso apropriada
      let successMessage = "Pedido lançado!";
      if (itemsToCancel.length > 0 && newItems.length === 0) {
        successMessage = "Cancelamentos salvos com sucesso!";
      } else if (itemsToCancel.length > 0 && newItems.length > 0) {
        successMessage = "Pedido lançado e cancelamentos salvos!";
      }
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMessage} Você pode continuar adicionando itens.</span>
        </div>
      );
    } catch (error: any) {
      console.error('Erro ao lançar pedido:', error);
      toast.error(error.message || "Erro ao lançar pedido. Verifique o console para mais detalhes.");
    }
  };

  // Calcular subtotal (sem taxa de serviço)
  const calculateSubtotal = () => {
    return cart
      .filter(item => item.status !== 'cancelled')
      .reduce((sum, item) => {
        // Se tem quantidade cancelada parcialmente, calcula o valor das unidades ativas
        if (item.cancelledQuantity && item.cancelledQuantity > 0) {
          const activeQuantity = item.quantity - item.cancelledQuantity;
          return sum + (item.unit_price * activeQuantity);
        }
        return sum + item.total_price;
      }, 0);
  };

  // Calcular valor da taxa de serviço
  const calculateServiceTax = () => {
    const subtotal = calculateSubtotal();
    return serviceTaxPercentage > 0 ? (subtotal * serviceTaxPercentage / 100) : 0;
  };

  // Calcular total com taxa de serviço
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const serviceTax = calculateServiceTax();
    return subtotal + serviceTax;
  };

  const calculateNewItemsTotal = () => {
    return cart.filter(item => item.status !== 'delivered' && item.status !== 'cancelled')
      .reduce((sum, item) => sum + item.total_price, 0);
  };

  const calculateLaunchedTotal = () => {
    return cart.filter(item => item.status === 'delivered')
      .reduce((sum, item) => {
        const cancelledQty = item.cancelledQuantity || 0;
        const activeQty = item.quantity - cancelledQty;
        return sum + (item.unit_price * activeQty);
      }, 0);
  };

  const calculateCancelledTotal = () => {
    const fullyCancelled = cart.filter(item => item.status === 'cancelled')
      .reduce((sum, item) => sum + item.total_price, 0);
    
    const partiallyCancelled = cart.filter(item => item.status === 'delivered' && item.cancelledQuantity)
      .reduce((sum, item) => {
        return sum + (item.unit_price * (item.cancelledQuantity || 0));
      }, 0);
    
    return fullyCancelled + partiallyCancelled;
  };

  // Process printing for order items
  const processPrinting = async (orderId: number) => {
    try {
      // Get order items with their details
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          item:items (
            id,
            name,
            group_id,
            group:groups (
              id,
              name,
              type
            )
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;
      if (!orderItems) return;

      const itemsWithoutPrinter: any[] = [];
      const itemsToPrint: any[] = [];

      // Process each item
      for (const orderItem of orderItems) {
        // Skip items without item_id (rodízios)
        if (!orderItem.item_id || orderItem.item_id < 0) {
          continue;
        }
        
        // Skip rodízio items (they don't print)
        if (orderItem.item?.group?.type === 'rodizio') {
          continue;
        }

        // Check if item has a printer configured
        const { data: printerConfig } = await supabase
          .from('product_printers')
          .select('printer_id')
          .eq('product_id', orderItem.item_id)
          .single();

        if (!printerConfig || !printerConfig.printer_id) {
          // Item doesn't have a printer configured
          itemsWithoutPrinter.push({
            item_id: orderItem.item_id,
            item_name: orderItem.item?.name || `Item ${orderItem.item_id}`,
            order_id: orderId,
            quantity: orderItem.quantity
          });
        } else {
          // Item has a printer configured
          itemsToPrint.push({
            ...orderItem,
            printer_id: printerConfig.printer_id
          });
        }
      }

      // Create notifications for items without printer
      if (itemsWithoutPrinter.length > 0) {
        for (const item of itemsWithoutPrinter) {
          await supabase
            .from('notifications')
            .insert({
              message: `Produto "${item.item_name}" foi lançado sem impressora configurada`,
              type: 'printer_missing',
              item_id: item.item_id,
              item_name: item.item_name,
              metadata: {
                order_id: item.order_id,
                quantity: item.quantity,
                table: selectedTable?.number,
                timestamp: new Date().toISOString()
              }
            });
        }
      }

      // TODO: Process items with printer (send to print queue)
      // This will be implemented later with the print queue system
      if (itemsToPrint.length > 0) {
        // For now, just log what would be printed
        console.log('Items to print:', itemsToPrint);
      }

    } catch (error) {
      console.error('Error processing printing:', error);
      // Don't throw error to not block order saving
    }
  };

  // FUNÇÕES DE PEDIDO/PAGAMENTO
  // Função handleSaveOrder removida - agora só existe Lançar e Cancelar
  /*
  const handleSaveOrder = async () => {
    if (!currentSession || !selectedTable || cart.length === 0) {
      toast.error("Adicione itens ao pedido");
      return;
    }

    setLoading(true);
    try {
      const total = calculateTotal();
      
      if (currentOrder) {
        await supabase
          .from('order_items')
          .delete()
          .eq('order_id', currentOrder.id);

        const { error: orderError } = await supabase
          .from('orders')
          .update({
            total: total,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentOrder.id);

        if (orderError) throw orderError;

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            cart.map(item => ({
              order_id: currentOrder.id,
              item_id: item.item_id > 0 ? item.item_id : null, // Rodízios have negative IDs, save as null
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              status: item.status,
              notes: item.item_id < 0 ? item.item?.name || null : null, // Save rodízio name in notes
              metadata: item.item_id < 0 ? { 
                type: 'rodizio',
                icon: item.item?.icon || (item as any).icon || null,
                name: item.item?.name || null,
                group_id: item.item?.group_id || null,
                image: item.item?.image || null
              } : null // Save rodízio metadata
            }))
          );

        if (itemsError) throw itemsError;
        
        // Process printing after saving order
        await processPrinting(currentOrder.id);
      } else {
        const orderNumber = `${selectedTable.number}-${Date.now().toString().slice(-6)}`;
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            table_id: selectedTable.id,
            status: 'confirmed',
            total: total,
            notes: null
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            cart.map(item => ({
              order_id: orderData.id,
              item_id: item.item_id > 0 ? item.item_id : null, // Rodízios have negative IDs, save as null
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              status: item.status,
              notes: item.item_id < 0 ? item.item?.name || null : null, // Save rodízio name in notes
              metadata: item.item_id < 0 ? { 
                type: 'rodizio',
                icon: item.item?.icon || (item as any).icon || null,
                name: item.item?.name || null,
                group_id: item.item?.group_id || null,
                image: item.item?.image || null
              } : null // Save rodízio metadata
            }))
          );

        if (itemsError) throw itemsError;
        
        setCurrentOrder(orderData as any);
        
        // Process printing after saving order
        await processPrinting(orderData.id);
      }

      await supabase
        .from('table_sessions')
        .update({ 
          total,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);

      // Update cart items status to 'delivered' after saving (except for cancelled items)
      setCart(prevCart => prevCart.map(item => ({
        ...item,
        status: item.status === 'cancelled' ? 'cancelled' : 'delivered'
      })));
      
      toast.success("Pedido salvo com sucesso");
    } catch (error: any) {
      console.error('Erro ao salvar pedido:', error);
      console.error('Detalhes do erro:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        fullError: JSON.stringify(error, null, 2)
      });
      toast.error(`Erro ao salvar pedido: ${error?.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };
  */

  const handleCompletePayment = async () => {
    if (!currentOrder || !currentSession || !selectedTable) return;
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalDue = calculateTotalWithDiscount();
    
    if (totalPaid < totalDue - 0.01) {
      toast.error('Valor pago insuficiente');
      return;
    }
    
    setLoading(true);
    try {
      // Save all payments to database
      for (const payment of payments) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            order_id: currentOrder.id,
            amount: payment.amount,
            payment_method: payment.method,
            status: 'completed',
            paid_at: new Date().toISOString()
          });

        if (paymentError) throw paymentError;
      }

      // Update order status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          discount_type: discountType,
          discount_value: discountValue,
          final_total: totalDue,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentOrder.id);

      if (orderError) throw orderError;

      // Update session
      const { error: sessionError } = await supabase
        .from('table_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          final_total: totalDue
        })
        .eq('id', currentSession.id);

      if (sessionError) throw sessionError;

      // Update table status
      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', selectedTable.id);

      if (tableError) throw tableError;

      toast.success(
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Pagamento finalizado! Mesa liberada.</span>
        </div>
      );
      
      // Limpar tudo imediatamente e voltar para as mesas
      setCart([]);
      setCurrentOrder(null);
      setCurrentSession(null);
      setSelectedTable(null);
      setPayments([]);
      setDiscountValue(0);
      setDiscountType('percentage');
      setSplitCount(1);
      setScreen('tables');
      
      // Recarregar tabelas para mostrar o novo status
      await loadTables();
      await loadTodayOrders();
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      const errorMessage = error?.message || error?.error || 'Erro desconhecido';
      toast.error(`Erro ao processar pagamento: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!currentOrder || !currentSession || !selectedTable) return;
    
    setLoading(true);
    try {
      const total = calculateTotal();
      
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: currentOrder.id,
          amount: total,
          payment_method: paymentMethod,
          status: 'completed',
          paid_at: new Date().toISOString()
        });

      if (paymentError) throw paymentError;

      const { error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentOrder.id);

      if (orderError) throw orderError;

      const { error: sessionError } = await supabase
        .from('table_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          final_total: total
        })
        .eq('id', currentSession.id);

      if (sessionError) throw sessionError;

      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', selectedTable.id);

      if (tableError) throw tableError;

      toast.success(
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Pagamento confirmado! Mesa liberada.</span>
        </div>
      );
      
      setPaymentDialog(false);
      setCart([]);
      setCurrentOrder(null);
      setCurrentSession(null);
      setSelectedTable(null);
      setScreen('tables');
      
      await loadTables();
      await loadTodayOrders();
    } catch (error: any) {
      console.error('Erro ao processar pagamento:', error);
      const errorMessage = error?.message || error?.error || 'Erro desconhecido';
      toast.error(`Erro ao processar pagamento: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSessionWithoutPayment = async () => {
    if (!currentSession || !selectedTable) return;
    
    setLoading(true);
    try {
      if (currentOrder) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', currentOrder.id);
      }

      await supabase
        .from('table_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          final_total: 0,
          notes: 'Sessão cancelada sem consumo'
        })
        .eq('id', currentSession.id);

      await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', selectedTable.id);

      toast.success(`Mesa ${selectedTable.number} liberada`);
      
      setCloseSessionDialog(false);
      setCart([]);
      setCurrentOrder(null);
      setCurrentSession(null);
      setSelectedTable(null);
      setScreen('tables');
      
      await loadTables();
    } catch (error) {
      console.error('Erro ao fechar sessão:', error);
      toast.error('Erro ao fechar sessão');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintComanda = () => {
    if (!currentOrder || cart.length === 0) {
      toast.error("Nenhum pedido para imprimir");
      return;
    }
    
    // Implementar impressão real aqui
    toast.success("Comanda enviada para impressora");
    setPrintDialog(false);
  };

  // Filtros e busca
  const filteredItems = useMemo(() => {
    let filtered = items;
    
    // Se estiver na aba de carrinho, buscar em todos os produtos
    // Se estiver na aba de categorias, respeitar o filtro de grupo/categoria
    if (activeTab === 'categories') {
      // Filtrar por grupo se selecionado
      if (selectedGroup) {
        filtered = filtered.filter(item => item.group_id === selectedGroup);
      }
      
      // Filtrar por categoria se selecionado
      if (selectedCategory) {
        filtered = filtered.filter(item => item.category_id === selectedCategory);
      }
    }
    // Na aba 'cart', não aplicar filtros de grupo/categoria, buscar em todos os produtos
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toString().includes(searchQuery)
      );
    }
    
    return filtered;
  }, [items, selectedGroup, selectedCategory, searchQuery, activeTab]);

  // Formatação
  const formatCurrency = (value: number, isRodizioItem: boolean = false) => {
    if (value === 0 && isRodizioItem) {
      return 'Incluso';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Modal de Rodízio - Fora de qualquer container para garantir renderização
  const rodizioDialogModal = (
    <Dialog open={rodizioModal} onOpenChange={setRodizioModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-orange-400" />
            Lançar Rodízio - {selectedRodizioGroup?.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Selecione a quantidade de rodízios
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Rodízio Inteiro */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Rodízio Inteiro
              </label>
              <span className="text-orange-400 font-bold">
                {formatCurrency(selectedRodizioGroup?.price || 0)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                onClick={() => setRodizioInteiro(prev => Math.max(0, prev - 1))}
                disabled={rodizioInteiro <= 0}
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                size="sm"
                data-testid="button-rodizio-inteiro-decrement"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center">
                <Input
                  type="number"
                  value={rodizioInteiro}
                  onChange={(e) => setRodizioInteiro(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center bg-gray-700 border-gray-600 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  data-testid="input-rodizio-inteiro"
                />
              </div>
              
              <Button
                type="button"
                onClick={() => setRodizioInteiro(prev => prev + 1)}
                className="bg-gray-600 hover:bg-gray-500"
                size="sm"
                data-testid="button-rodizio-inteiro-increment"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Meio Rodízio */}
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                Meio Rodízio
              </label>
              <span className="text-blue-400 font-bold">
                {formatCurrency(selectedRodizioGroup?.half_price || 0)}
              </span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button
                type="button"
                onClick={() => setRodizioMeio(prev => Math.max(0, prev - 1))}
                disabled={rodizioMeio <= 0}
                className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                size="sm"
                data-testid="button-rodizio-meio-decrement"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center">
                <Input
                  type="number"
                  value={rodizioMeio}
                  onChange={(e) => setRodizioMeio(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-20 text-center bg-gray-700 border-gray-600 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  data-testid="input-rodizio-meio"
                />
              </div>
              
              <Button
                type="button"
                onClick={() => setRodizioMeio(prev => prev + 1)}
                className="bg-gray-600 hover:bg-gray-500"
                size="sm"
                data-testid="button-rodizio-meio-increment"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">Total:</span>
              <div className="text-right">
                <div className="text-sm text-gray-400">
                  {rodizioInteiro > 0 && `${rodizioInteiro} inteiro${rodizioInteiro > 1 ? 's' : ''} `}
                  {rodizioInteiro > 0 && rodizioMeio > 0 && '+ '}
                  {rodizioMeio > 0 && `${rodizioMeio} meio${rodizioMeio > 1 ? 's' : ''}`}
                </div>
                <div className="text-xl font-bold text-orange-400">
                  {formatCurrency((rodizioInteiro * (selectedRodizioGroup?.price || 0)) + (rodizioMeio * (selectedRodizioGroup?.half_price || 0)))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setRodizioModal(false)}
            className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            data-testid="button-rodizio-cancel"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddRodizio}
            disabled={rodizioInteiro === 0 && rodizioMeio === 0}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            data-testid="button-rodizio-confirm"
          >
            Adicionar ao Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // RENDERIZAÇÃO CONDICIONAL POR TELA
  let screenContent;

  if (loading && screen === 'tables') {
    screenContent = (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-white flex flex-col items-center gap-4"
        >
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="text-xl">Carregando sistema...</span>
        </motion.div>
      </div>
    );
  }
  // TELA 1: SELEÇÃO DE MESAS
  else if (screen === 'tables') {
    screenContent = (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-12">
                <h1 className="text-3xl font-bold text-white">
                  Caixa ComideX
                </h1>
                
                {/* Input para Número da Mesa */}
                <div className="relative ml-8">
                  <input
                    id="table-number"
                    ref={(el) => { 
                      if (el && screen === 'tables') {
                        setTimeout(() => el.focus(), 100);
                      }
                    }}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="Mesa"
                    className="text-2xl font-bold text-center bg-gray-900 border-2 border-gray-600 text-white placeholder:text-gray-500 rounded-lg px-4 py-2 w-32 focus:border-orange-500 focus:outline-none"
                    style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value;
                        const tableNumber = parseInt(value);
                        if (!isNaN(tableNumber) && tableNumber > 0) {
                          const table = tables.find(t => t.number === tableNumber.toString());
                          if (table) {
                            handleSelectTable(table);
                            (e.target as HTMLInputElement).value = '';
                          } else {
                            toast.error(`Mesa ${tableNumber} não encontrada`);
                            (e.target as HTMLInputElement).value = '';
                            setTimeout(() => (e.target as HTMLInputElement).focus(), 100);
                          }
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Manter o foco sempre no input quando estiver na tela de mesas
                      if (screen === 'tables') {
                        setTimeout(() => (e.target as HTMLInputElement).focus(), 50);
                      }
                    }}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
              </div>
              
              <div className="flex gap-2 items-center">
                {/* Estatísticas Compactas - Design Minimalista */}
                <div className="flex gap-3">
                  <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-300">
                        {tables.filter(t => t.current_session).length} Abertas
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-300">
                        {tables.filter(t => !t.current_session).length} Livres
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-bold text-white">
                        {format(currentTime, 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-8 w-px bg-gray-700 mx-2"></div>
                <Button
                  onClick={() => setScreen('history')}
                  className="bg-gray-800 hover:bg-gray-700 h-9"
                >
                  <History className="mr-2 h-4 w-4" />
                  Histórico
                </Button>
                <Button
                  onClick={loadInitialData}
                  className="bg-gray-800 hover:bg-gray-700 h-9"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Grid de Mesas com Animação */}
          <div className="grid grid-cols-8 gap-3">
            <AnimatePresence>
              {tables.map((table, index) => (
                <motion.div
                  key={table.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ delay: index * 0.02 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className={`
                      cursor-pointer transition-all h-[160px]
                      ${table.status === 'closed'
                        ? 'bg-gradient-to-br from-red-900/40 to-red-800/30 border-red-600 shadow-red-600/20'
                        : table.current_session 
                        ? 'bg-gradient-to-br from-orange-900/40 to-orange-800/30 border-orange-600 shadow-orange-600/20' 
                        : 'bg-gray-800/50 backdrop-blur border-gray-700 hover:bg-gray-700/50'}
                      shadow-lg hover:shadow-xl
                    `}
                    onClick={() => handleSelectTable(table)}
                  >
                    <CardContent className="p-4 text-center relative h-full flex flex-col justify-between">
                      {table.current_session && (
                        <div className="absolute -top-2 -right-2">
                          <div className="relative">
                            <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></div>
                            <div className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <div className="mb-1 h-8 flex items-center justify-center">
                          {table.type === 'counter' ? (
                            // Ícone de Cadeira Alta de Bar
                            <div className="relative flex flex-col items-center">
                              <div className="w-4 h-3 bg-white/90 rounded-t-md"></div>
                              <div className="w-0.5 h-4 bg-white/80"></div>
                              <div className="w-3 h-0.5 bg-white/70"></div>
                            </div>
                          ) : (
                            // Ícone de Mesa - quadrado com cadeiras ao redor
                            <div className="relative">
                              <div className="w-5 h-5 bg-white/90 rounded-sm"></div>
                              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/70 rounded-full"></div>
                              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white/70 rounded-full"></div>
                              <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-1 h-1 bg-white/70 rounded-full"></div>
                              <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-1 h-1 bg-white/70 rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white">
                          {table.type === 'counter' ? 'Balcão ' : 'Mesa '}{table.number}
                        </h3>
                      </div>
                      
                      <div>
                        {table.status === 'closed' ? (
                          <>
                            <Badge className="bg-red-600 text-white text-xs py-0.5 mb-1">
                              FECHADA
                            </Badge>
                            <div className="text-xs text-gray-300 mt-1 space-y-1">
                              {table.current_session && (
                                <div className="flex items-center justify-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{table.current_session.customer_count} {table.current_session.customer_count === 1 ? 'pessoa' : 'pessoas'}</span>
                                </div>
                              )}
                            </div>
                          </>
                        ) : table.current_session ? (
                          <>
                            <Badge className="bg-orange-600 text-white text-xs py-0.5 mb-1">
                              OCUPADA
                            </Badge>
                            <div className="text-xs text-gray-300 mt-1 space-y-1">
                              <div className="flex items-center justify-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{table.current_session.customer_count} {table.current_session.customer_count === 1 ? 'pessoa' : 'pessoas'}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Badge className="bg-green-600 text-white text-xs py-0.5 mb-1">
                              LIVRE
                            </Badge>
                            <div className="text-xs text-gray-500 mt-2">
                              <p>Disponível</p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>

        {/* Dialog Rodízio */}
        <Dialog open={rodizioModal} onOpenChange={setRodizioModal}>
          <DialogContent className="fixed left-[50%] top-[50%] z-[9999] w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-700 bg-gray-800 p-6 shadow-lg sm:rounded-lg text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-orange-400" />
                Lançar Rodízio - {selectedRodizioGroup?.name}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Selecione a quantidade de rodízios
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              {/* Rodízio Inteiro */}
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    Rodízio Inteiro
                  </label>
                  <span className="text-orange-400 font-bold">
                    {formatCurrency(selectedRodizioGroup?.price || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    onClick={() => setRodizioInteiro(prev => Math.max(0, prev - 1))}
                    disabled={rodizioInteiro <= 0}
                    className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                    size="sm"
                    data-testid="button-rodizio-inteiro-decrement"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={rodizioInteiro}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setRodizioInteiro(Math.max(0, value));
                      }}
                      className="bg-gray-700 border-gray-600 text-white text-xl w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-gray-400 text-sm">
                      = {formatCurrency((selectedRodizioGroup?.price || 0) * rodizioInteiro)}
                    </span>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={() => setRodizioInteiro(prev => prev + 1)}
                    className="bg-gray-600 hover:bg-gray-500"
                    size="sm"
                    data-testid="button-rodizio-inteiro-increment"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Rodízio Meio - só mostra se tem preço configurado */}
              {selectedRodizioGroup?.half_price && selectedRodizioGroup.half_price > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">
                      Rodízio Meio (Crianças)
                    </label>
                    <span className="text-orange-400 font-bold">
                      {formatCurrency(selectedRodizioGroup.half_price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      type="button"
                      onClick={() => setRodizioMeio(prev => Math.max(0, prev - 1))}
                      disabled={rodizioMeio <= 0}
                      className="bg-gray-600 hover:bg-gray-500 disabled:opacity-50"
                      size="sm"
                      data-testid="button-rodizio-meio-decrement"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={rodizioMeio}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setRodizioMeio(Math.max(0, value));
                        }}
                        className="bg-gray-700 border-gray-600 text-white text-xl w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-gray-400 text-sm">
                        = {formatCurrency(selectedRodizioGroup.half_price * rodizioMeio)}
                      </span>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={() => setRodizioMeio(prev => prev + 1)}
                      className="bg-gray-600 hover:bg-gray-500"
                      size="sm"
                      data-testid="button-rodizio-meio-increment"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Total */}
              <div className="bg-gray-900 rounded-lg p-4 border border-orange-500/30">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-orange-400">
                    {formatCurrency(
                      (selectedRodizioGroup?.price || 0) * rodizioInteiro +
                      (selectedRodizioGroup?.half_price || 0) * rodizioMeio
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setRodizioModal(false)}
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddRodizio}
                disabled={rodizioInteiro === 0 && rodizioMeio === 0}
                className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
              >
                Confirmar Rodízio
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Abrir Mesa */}
        <Dialog open={openTableDialog} onOpenChange={setOpenTableDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedTable?.type === 'counter' ? (
                  // Ícone de Cadeira Alta
                  <div className="relative flex flex-col items-center h-5">
                    <div className="w-3 h-2 bg-current rounded-t-sm"></div>
                    <div className="w-0.5 h-2.5 bg-current opacity-80"></div>
                    <div className="w-2 h-0.5 bg-current opacity-70"></div>
                  </div>
                ) : (
                  // Ícone de Mesa
                  <div className="relative">
                    <div className="w-4 h-4 bg-current rounded-sm"></div>
                    <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-current rounded-full opacity-70"></div>
                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-0.5 bg-current rounded-full opacity-70"></div>
                    <div className="absolute top-1/2 -left-0.5 transform -translate-y-1/2 w-0.5 h-0.5 bg-current rounded-full opacity-70"></div>
                    <div className="absolute top-1/2 -right-0.5 transform -translate-y-1/2 w-0.5 h-0.5 bg-current rounded-full opacity-70"></div>
                  </div>
                )}
                Abrir {selectedTable?.type === 'counter' ? 'Balcão' : 'Mesa'} {selectedTable?.number}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Confirme a abertura da mesa
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                <p className="text-lg">
                  Deseja abrir {selectedTable?.type === 'counter' ? 'o balcão' : 'a mesa'} {selectedTable?.number}?
                </p>
              </div>
              
              {/* Campo de quantidade de pessoas */}
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Quantidade de Pessoas
                </label>
                <div className="flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    onClick={() => setCustomerCount(prev => Math.max(1, prev - 1))}
                    disabled={customerCount <= 1}
                    className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
                    size="sm"
                    data-testid="button-decrement-pessoas"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    min="1"
                    value={customerCount}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setCustomerCount(Math.max(1, value));
                    }}
                    className="bg-gray-800 border-gray-600 text-white text-2xl w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    pattern="[0-9]*"
                  />
                  
                  <Button
                    type="button"
                    onClick={() => setCustomerCount(prev => prev + 1)}
                    className="bg-gray-700 hover:bg-gray-600"
                    size="sm"
                    data-testid="button-increment-pessoas"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setOpenTableDialog(false)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleOpenTable}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Abrir Mesa
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  // TELA 2: SESSÃO/PEDIDOS MELHORADA
  else if (screen === 'session') {
    screenContent = (
      <div className="h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">
        {/* Header Melhorado com Design Aprimorado */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 backdrop-blur px-6 py-4 border-b-2 border-orange-600/30">
          <div className="flex items-center justify-between">
            {/* Lado Esquerdo - Informações da Mesa */}
            <div className="flex items-center gap-6">
              <Button
                onClick={() => setScreen('tables')}
                size="lg"
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 h-12 px-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              {/* Informação Principal da Mesa */}
              <div className="flex items-center gap-8">
                {/* Mesa/Balcão com Tipo de Atendimento Inteligente */}
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 p-3 rounded-lg">
                    {(() => {
                      // Detectar ícone baseado no grupo dos itens
                      if (cart.length > 0 && cart[0]?.item?.group_id) {
                        const group = groups.find(g => g.id === cart[0].item?.group_id);
                        if (group?.icon) {
                          const IconComponent = getIconByName(group.icon);
                          if (IconComponent) {
                            return <IconComponent className="h-6 w-6 text-white" />;
                          }
                        }
                      }
                      return <UtensilsCrossed className="h-6 w-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedTable?.type === 'counter' ? 'Balcão' : 'Mesa'} {selectedTable?.number}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {(() => {
                        // Detectar tipo de atendimento baseado nos itens do carrinho
                        if (cart.length > 0) {
                          // Buscar grupos baseado no group_id dos items
                          const groupsInCart: Group[] = [];
                          const groupNames: string[] = [];
                          
                          cart.forEach(cartItem => {
                            if (cartItem.item?.group_id) {
                              const group = groups.find(g => g.id === cartItem.item?.group_id);
                              if (group && !groupNames.includes(group.name)) {
                                groupsInCart.push(group);
                                groupNames.push(group.name);
                              }
                            }
                          });
                          
                          // Prioridade 1: Rodízio (pegar o nome completo)
                          const rodizioGroup = groupsInCart.find(g => 
                            g.type === 'rodizio' ||
                            g.name?.toLowerCase().includes('rodizio') || 
                            g.name?.toLowerCase().includes('rodízio')
                          );
                          
                          if (rodizioGroup) {
                            return `${rodizioGroup.name}`;
                          }
                          
                          // Prioridade 2: À la Carte
                          const carteGroup = groupsInCart.find(g => 
                            g.name?.toLowerCase().includes('carte') ||
                            g.name?.toLowerCase().includes('la carte') ||
                            g.name?.toLowerCase().includes('à la carte')
                          );
                          
                          if (carteGroup) {
                            return 'Atendimento À la Carte';
                          }
                          
                          // Prioridade 3: Delivery ou outros tipos especiais
                          const deliveryGroup = groupsInCart.find(g => 
                            g.name?.toLowerCase().includes('delivery') ||
                            g.name?.toLowerCase().includes('entrega')
                          );
                          
                          if (deliveryGroup) {
                            return 'Pedido Delivery';
                          }
                          
                          // Se tem grupos mistos
                          if (groupNames.length > 1) {
                            return 'Atendimento Misto';
                          }
                          
                          // Se tem apenas um grupo, mostrar o nome dele
                          if (groupNames.length === 1) {
                            return groupNames[0];
                          }
                        }
                        
                        // Valor padrão baseado no tipo da mesa
                        return selectedTable?.type === 'counter' ? 'Atendimento no balcão' : 'Aguardando pedido';
                      })()}
                    </p>
                  </div>
                </div>
                
                {/* Separador Visual */}
                <div className="h-12 w-px bg-gray-600" />
                
                {/* Pessoas */}
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-3 rounded-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {currentSession?.customer_count || 0} {(currentSession?.customer_count || 0) === 1 ? 'Pessoa' : 'Pessoas'}
                    </h3>
                    <p className="text-sm text-gray-400">Capacidade: {selectedTable?.capacity || 4} pessoas</p>
                  </div>
                </div>
                
                {/* Separador Visual */}
                <div className="h-12 w-px bg-gray-600" />
                
                {/* Horário */}
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <History className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {currentSession && format(new Date(currentSession.opened_at), 'HH:mm')}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Aberta há {currentSession && (() => {
                        const diff = new Date().getTime() - new Date(currentSession.opened_at).getTime();
                        const minutes = Math.abs(Math.floor(diff / 60000));
                        const hours = Math.floor(minutes / 60);
                        const mins = minutes % 60;
                        return hours > 0 ? `${hours}h ${mins}min` : `${mins} minutos`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Lado Direito - Informação de Status */}
            <div className="flex items-center gap-4">
              {/* Status da Mesa */}
              <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-600">
                <p className="text-xs text-gray-400">Status</p>
                <p className="text-sm font-bold text-green-400">Mesa Ativa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content com Layout 70/30 */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel 70% - Carrinho e Categorias ou Interface de Pagamento */}
          <div className="w-[70%] flex flex-col border-r border-gray-700 overflow-hidden">
            {/* Se a mesa está fechada, mostra interface de pagamento */}
            {selectedTable?.status === 'closed' ? (
              <div className="flex-1 p-4 pb-20">
                <PaymentWorkspace
                  mode="embedded"
                  groupedItems={groupedItems}
                  calculateSubtotal={calculateSubtotal}
                  calculateTotal={calculateTotal}
                  calculateTotalWithDiscount={calculateTotalWithDiscount}
                  serviceTaxPercentage={serviceTaxPercentage}
                  serviceTaxValue={calculateServiceTax()}
                  discountType={discountType}
                  setDiscountType={setDiscountType}
                  discountValue={discountValue}
                  setDiscountValue={setDiscountValue}
                  splitCount={splitCount}
                  setSplitCount={setSplitCount}
                  calculatorDisplay={calculatorDisplay}
                  setCalculatorDisplay={setCalculatorDisplay}
                  payments={payments}
                  addPayment={addPayment}
                  removePayment={removePayment}
                  handleCompletePayment={handleCompletePayment}
                  reopenTable={reopenTable}
                  setPrintDialog={setPrintDialog}
                  selectedTable={selectedTable}
                  loading={loading}
                />
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col p-4 pb-0 overflow-hidden">
              {/* Input Section com Tabs */}
              <Card className="bg-gray-900/50 backdrop-blur border-gray-700 mb-4 overflow-visible">
                <CardContent className="p-3 overflow-visible">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          ref={codeInputRef}
                          value={inputValue}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            setSearchQuery(e.target.value);
                            setQuantity("1"); // Reset quantity to 1 when searching
                          }}
                          onFocus={() => setActiveInput("code")}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              if (searchQuery && filteredItems.length > 0) {
                                handleAddItem(filteredItems[0]);
                                setInputValue("");
                                setSearchQuery("");
                                setQuantity("1");
                              } else {
                                handleAddItem();
                              }
                            }
                          }}
                          className="bg-gray-800 border-gray-600 text-white text-lg h-10 pl-9 pr-10"
                          placeholder="Buscar produto..."
                        />
                        {inputValue && (
                          <button
                            onClick={() => {
                              setInputValue("");
                              setSearchQuery("");
                              codeInputRef.current?.focus();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                            type="button"
                            data-testid="clear-search"
                          >
                            <X className="h-3 w-3 text-gray-300" />
                          </button>
                        )}
                      </div>
                    </div>
                    <TabsList className="bg-gray-800 border-gray-700 h-10">
                      <TabsTrigger value="cart" className="data-[state=active]:bg-orange-600 h-full px-3">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Carrinho
                      </TabsTrigger>
                      <TabsTrigger value="categories" className="data-[state=active]:bg-orange-600 h-full px-3">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Produtos
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardContent>
              </Card>
              <TabsContent value="cart" className="flex-1 flex flex-col overflow-hidden min-h-0">
                {/* Portal para Resultados da Busca em Tempo Real */}
                {searchQuery.length > 0 && typeof document !== 'undefined' && createPortal(
                        <div className="fixed z-[99999] bg-gray-900 rounded-lg border-2 border-orange-500 shadow-2xl"
                             style={{ 
                               top: codeInputRef.current ? codeInputRef.current.getBoundingClientRect().bottom + 8 : '50%',
                               left: codeInputRef.current ? codeInputRef.current.getBoundingClientRect().left : '50%',
                               width: codeInputRef.current ? codeInputRef.current.getBoundingClientRect().width : '400px',
                               transform: codeInputRef.current ? 'none' : 'translate(-50%, -50%)'
                             }}>
                          {filteredItems.length === 0 ? (
                            <div className="text-gray-400 p-4 text-center">
                              Nenhum produto encontrado para "{searchQuery}"
                            </div>
                          ) : (
                            <ScrollArea className="h-[400px] w-full">
                              <div className="p-2">
                                {filteredItems.map((item) => (
                                  <button
                                    key={item.id}
                                    data-testid={`search-result-${item.id}`}
                                    className="w-full flex items-center p-2 hover:bg-gray-800 rounded-lg transition-all group"
                                    onClick={() => {
                                      handleAddItem(item);
                                      setInputValue("");
                                      setSearchQuery("");
                                    }}
                                  >
                                    {/* Foto do produto */}
                                    <div className="w-14 h-14 bg-gray-700 rounded-lg mr-3 flex-shrink-0 overflow-hidden">
                                      <img
                                        src={item.image || '/fotos/placeholder/placeholder.png'}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.src = '/fotos/placeholder/placeholder.png';
                                        }}
                                      />
                                    </div>
                                    
                                    {/* Informações do produto */}
                                    <div className="flex-1 text-left">
                                      <div className="font-medium text-white group-hover:text-orange-400 transition-colors">
                                        {item.name}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {item.group?.name || '—'} • {item.category?.name || '—'}
                                      </div>
                                    </div>
                                    
                                    {/* Valor */}
                                    <div className="text-right">
                                      <div className="font-bold text-orange-400">
                                        {item.price ? formatCurrency(item.price, item.group?.type === 'rodizio') : 'Sem preço'}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </div>,
                        document.body
                      )}

                {/* Lista de Itens Animada */}
                <Card className="flex-1 bg-gray-900/50 backdrop-blur border-gray-700 overflow-hidden flex flex-col min-h-0">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-orange-400" />
                        Itens do Pedido
                      </span>
                      <button
                        onClick={() => {
                          // Ciclar entre os modos: all -> delivered -> cancelled -> all
                          if (filterMode === 'all') {
                            setFilterMode('delivered');
                          } else if (filterMode === 'delivered') {
                            setFilterMode('cancelled');
                          } else {
                            setFilterMode('all');
                          }
                        }}
                        className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${
                          filterMode === 'all' 
                            ? 'bg-orange-600 text-white' 
                            : filterMode === 'delivered'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                        data-testid="filter-toggle"
                      >
                        {filterMode === 'all' ? (
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4" />
                            Todos
                          </span>
                        ) : filterMode === 'delivered' ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Lançados
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle className="h-4 w-4" />
                            Cancelados
                          </span>
                        )}
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-1 overflow-hidden">
                    <div className="relative h-full">
                      <ScrollArea ref={cartScrollRef} className="h-full pr-4" style={{ willChange: 'scroll-position' }}>
                        {(() => {
                          const filteredCart = filterMode === 'cancelled' 
                            ? cart.filter(item => item.status === 'cancelled')
                            : filterMode === 'delivered'
                            ? cart.filter(item => item.status === 'delivered')
                            : cart;
                          
                          return filteredCart.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center text-gray-500">
                                {filterMode === 'cancelled' ? (
                                  <>
                                    <XCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p>Nenhum item cancelado</p>
                                    <p className="text-sm mt-2">Clique em "Todos" para ver todos os itens</p>
                                  </>
                                ) : filterMode === 'delivered' ? (
                                  <>
                                    <CheckCircle2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p>Nenhum item lançado</p>
                                    <p className="text-sm mt-2">Lance os itens primeiro ou clique em "Todos"</p>
                                  </>
                                ) : (
                                  <>
                                    <ShoppingBag className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p>Carrinho vazio</p>
                                    <p className="text-sm mt-2">Adicione produtos usando o código ou busca</p>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <AnimatePresence>
                              {filteredCart.slice().reverse().map((item, index) => (
                            <motion.div
                              key={`${item.item_id}-${index}`}
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 50 }}
                              transition={{ duration: 0.15 }}
                              className="mb-2"
                            >
                              <Card className={`backdrop-blur transition-all ${
                                item.status === 'delivered' 
                                  ? 'bg-green-900/20 border-green-700/50'
                                  : item.status === 'cancelled'
                                  ? 'bg-red-900/30 border-red-600'
                                  : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70'
                              }`}>
                                <CardContent className="p-3 relative">
                                  {/* Horário - centralizado com transform */}
                                  {(item.status === 'delivered' || item.status === 'cancelled') && item.launched_at && (
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                                      <div className={`${item.status === 'delivered' ? 'text-green-400' : 'text-red-400'} flex flex-col items-center justify-center`}>
                                        <History className="h-3 w-3 mb-1" />
                                        <div className="flex items-center">
                                          {(() => {
                                            const date = new Date(item.launched_at);
                                            const hours = date.getHours().toString().padStart(2, '0');
                                            const minutes = date.getMinutes().toString().padStart(2, '0');
                                            const seconds = date.getSeconds().toString().padStart(2, '0');
                                            return (
                                              <>
                                                <span className="text-sm font-medium">{hours}:{minutes}</span>
                                                <span className="text-[11px] font-normal opacity-80">:{seconds}</span>
                                              </>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between">
                                    {/* Foto do produto */}
                                    <div className="w-14 h-14 bg-gray-700 rounded-lg mr-3 flex-shrink-0 overflow-hidden">
                                      {item.item?.image ? (
                                        <img
                                          src={item.item.image}
                                          alt={item.item?.name || ''}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (item as any).icon || item.item?.icon ? (
                                        <div className="w-full h-full flex items-center justify-center text-orange-400">
                                          {(() => {
                                            const iconName = (item as any).icon || item.item?.icon;
                                            const IconComponent = getIconByName(iconName);
                                            return IconComponent ? <IconComponent className="h-6 w-6" /> : <Package className="h-6 w-6" />;
                                          })()}
                                        </div>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <img
                                            src="/fotos/placeholder/placeholder.png"
                                            alt="Placeholder"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              const parent = target.parentElement;
                                              if (parent) {
                                                parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="15" x2="15" y2="15"/></svg></div>';
                                              }
                                            }}
                                          />
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Nome e preço - flex como era antes */}
                                    <div className="flex-1">
                                      <div className="font-medium flex items-center">
                                        <span className={`${
                                          item.status === 'cancelled' 
                                            ? 'text-red-500 line-through decoration-red-600 decoration-2' 
                                            : 'text-white'
                                        }`}>
                                          {item.item?.name || `Produto ${item.item_id}`}
                                        </span>
                                        {item.status === 'cancelled' && (
                                          <span className="text-xs text-red-600 font-bold ml-2 uppercase">
                                            CANCELADO
                                          </span>
                                        )}
                                      </div>
                                      <div className={`text-sm mt-1 ${
                                        item.status === 'cancelled' 
                                          ? 'text-red-400 line-through decoration-red-600' 
                                          : 'text-gray-400'
                                      }`}>
                                        {formatCurrency(item.unit_price, item.item?.group?.type === 'rodizio')} × {
                                          item.cancelledQuantity && item.cancelledQuantity > 0
                                            ? item.quantity - item.cancelledQuantity
                                            : item.quantity
                                        }
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      {/* Só mostra botões +/- para itens não lançados */}
                                      {item.status === 'pending' || !item.status ? (
                                        <div className="flex items-center gap-1">
                                          <Button
                                            size="sm"
                                            onClick={() => handleUpdateQuantity(item.id!, -1)}
                                            className="h-7 w-7 p-0 bg-gray-700 hover:bg-gray-600"
                                          >
                                            <Minus className="h-3 w-3" />
                                          </Button>
                                          <span className="w-8 text-center font-medium">
                                            {item.quantity}
                                          </span>
                                          <Button
                                            size="sm"
                                            onClick={() => handleUpdateQuantity(item.id!, 1)}
                                            className="h-7 w-7 p-0 bg-gray-700 hover:bg-gray-600"
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      ) : (
                                        /* Para itens lançados, mostra quantidade de forma elegante */
                                        <div className="flex items-center">
                                          <div className="bg-gray-700/50 px-3 py-1 rounded-lg border border-gray-600">
                                            <div className="flex items-center gap-2">
                                              {item.cancelledQuantity && item.cancelledQuantity > 0 && item.status !== 'cancelled' ? (
                                                <>
                                                  <span className="font-bold text-lg text-white">
                                                    {item.quantity - item.cancelledQuantity}
                                                  </span>
                                                  <span className="text-gray-500 text-sm">/</span>
                                                  <span className="text-red-500 line-through text-sm">
                                                    {item.cancelledQuantity}
                                                  </span>
                                                </>
                                              ) : (
                                                <span className={`font-bold text-lg ${
                                                  item.status === 'cancelled' ? 'text-red-500 line-through' : 'text-white'
                                                }`}>
                                                  {item.quantity}
                                                </span>
                                              )}
                                              <span className="text-gray-400 text-xs uppercase tracking-wider ml-1">
                                                UN
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="text-right">
                                        <div className={`font-bold text-lg ${
                                          item.status === 'cancelled' 
                                            ? 'text-red-500 line-through' 
                                            : 'text-orange-400'
                                        }`}>
                                          {formatCurrency(
                                            item.status === 'cancelled' 
                                              ? item.total_price // Sempre mostra o valor total original quando cancelado
                                              : (item.cancelledQuantity && item.cancelledQuantity > 0
                                                  ? item.unit_price * (item.quantity - item.cancelledQuantity)
                                                  : item.total_price)
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Botão de cancelar/restaurar só aparece para itens lançados */}
                                      {(item.status === 'delivered' || item.status === 'cancelled') && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleRemoveItem(item.id!)}
                                          className={`h-7 w-7 p-0 ${
                                            item.status === 'cancelled'
                                              ? 'text-green-400 hover:text-green-300 hover:bg-green-900/20'
                                              : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                          }`}
                                        >
                                          {item.status === 'cancelled' ? (
                                            <RefreshCw className="h-4 w-4" />
                                          ) : (
                                            <X className="h-5 w-5 font-bold" />
                                          )}
                                        </Button>
                                      )}
                                      
                                      {/* Botão de excluir para itens não lançados */}
                                      {(item.status === 'pending' || !item.status) && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleRemoveItem(item.id!)}
                                          className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                        >
                                          <X className="h-5 w-5 font-bold" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )
                    })()}
                    </ScrollArea>
                  </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="categories" className="flex-1 mt-4 overflow-hidden">
                <Card className="h-full bg-gray-900/50 backdrop-blur border-gray-700 flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {selectedGroup 
                          ? `${groups.find(g => g.id === selectedGroup)?.name || ''} - Categorias` 
                          : 'Grupos de Produtos'}
                      </span>
                      {selectedGroup && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedGroup(null);
                            setSelectedCategory(null);
                          }}
                          className="text-gray-300 hover:text-white"
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Voltar aos Grupos
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto">
                    {!selectedGroup ? (
                      // Mostrar Grupos
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          {groups.map((group) => {
                            const Icon = (group.icon ? getIconByName(group.icon) : null) || Package;
                            return (
                              <motion.div
                                key={group.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Card
                                  onClick={() => {
                                    // Se o grupo for rodízio, verifica se já tem rodízio lançado
                                    if (group.type === 'rodizio') {
                                      // Verifica se já tem rodízio deste grupo no carrinho
                                      const hasRodizio = cart.some(cartItem => {
                                        // Verifica se é um rodízio (tem ID negativo) e se é do mesmo grupo
                                        const isRodizioItem = cartItem.item_id < 0;
                                        const isSameGroup = cartItem.item?.group_id === group.id;
                                        const hasRodizioInName = cartItem.item?.name?.includes(group.name);
                                        return isRodizioItem && (isSameGroup || hasRodizioInName);
                                      });
                                      
                                      if (!hasRodizio) {
                                        // Se não tem rodízio, abre o modal para adicionar
                                        setSelectedRodizioGroup(group);
                                        setRodizioInteiro(1);
                                        setRodizioMeio(0);
                                        setRodizioModal(true);
                                      } else {
                                        // Se já tem rodízio, vai para as categorias normalmente
                                        setSelectedGroup(group.id);
                                        const firstCategory = categories
                                          .filter(c => c.active && c.group_id === group.id)
                                          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0];
                                        if (firstCategory) {
                                          setSelectedCategory(firstCategory.id);
                                        }
                                      }
                                    } else {
                                      // Se não for rodízio, procede normalmente
                                      setSelectedGroup(group.id);
                                      const firstCategory = categories
                                        .filter(c => c.active && c.group_id === group.id)
                                        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0];
                                      if (firstCategory) {
                                        setSelectedCategory(firstCategory.id);
                                      }
                                    }
                                  }}
                                  className="h-32 bg-gradient-to-br from-gray-800 to-gray-700 hover:from-orange-700 hover:to-orange-600 border-gray-600 hover:border-orange-500 cursor-pointer transition-all group"
                                >
                                  <CardContent className="h-full flex flex-col items-center justify-between p-4 relative">
                                    {/* Badge Rodízio */}
                                    {group.type === 'rodizio' && (
                                      <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                                        Rodízio
                                      </div>
                                    )}
                                    
                                    {/* Valor sempre no canto esquerdo */}
                                    <div className="absolute top-2 left-2 text-yellow-400 font-bold text-sm">
                                      {group.price ? `R$ ${group.price.toFixed(2)}` : ''}
                                    </div>

                                    {/* Conteúdo centralizado */}
                                    <div className="flex-1 flex flex-col items-center justify-center">
                                      <div className="bg-gray-900/50 p-3 rounded-full mb-2 group-hover:bg-orange-600/30 transition-colors">
                                        <Icon className="h-10 w-10 text-gray-200 group-hover:text-white" />
                                      </div>
                                      <h3 className="text-center text-white font-semibold text-base">
                                        {group.name}
                                      </h3>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      // Mostrar Categorias do Grupo e Produtos
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-1">
                          {categories
                            .filter((c) => c.active && c.group_id === selectedGroup)
                            .map((category) => {
                              return (
                                <Button
                                  key={category.id}
                                  onClick={() => setSelectedCategory(category.id)}
                                  className={`h-7 text-sm font-medium px-2 py-0 w-auto min-w-fit ${selectedCategory === category.id ? 'bg-orange-600' : 'bg-gray-700'} hover:bg-orange-700`}
                                >
                                  {category.name}
                                </Button>
                              );
                            })}
                        </div>
                        
                        <div className="relative h-[400px]">
                          <ScrollArea className="h-full">
                            {filteredItems.length === 0 ? (
                              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <Package className="h-16 w-16 mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">Nenhum produto encontrado</p>
                                {searchQuery && (
                                  <p className="text-sm">Para a busca: "{searchQuery}"</p>
                                )}
                                {!searchQuery && selectedCategory && (
                                  <p className="text-sm">Nesta categoria</p>
                                )}
                              </div>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {filteredItems.map((item) => (
                                <motion.div
                                  key={item.id}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Card
                                    className="bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-all overflow-hidden h-full"
                                    onClick={() => handleAddItem(item)}
                                  >
                                    <CardContent className="p-2 flex items-center gap-2">
                                      {/* Foto do produto - tamanho fixo com borda arredondada */}
                                      <div className="w-16 h-16 bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                          src={item.image || '/fotos/placeholder/placeholder.png'}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/fotos/placeholder/placeholder.png';
                                          }}
                                        />
                                      </div>
                                      {/* Informações do produto */}
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white text-xs line-clamp-2">
                                          {item.name}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">
                                          Cód: {item.id}
                                        </div>
                                        <div className="font-bold text-orange-400 text-sm mt-1">
                                          {formatCurrency(item.price || 0, item.group?.type === 'rodizio')}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          )}
                          </ScrollArea>
                          
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            )}
            
            {/* Botões de Ação na parte inferior do painel esquerdo */}
            <div className="p-4 pt-2 bg-gray-900/50 border-t border-gray-700">
              <div className="flex justify-between items-center gap-4">
                {/* Botão Voltar - Lado Esquerdo */}
                <Button
                  onClick={() => setScreen('tables')}
                  variant="outline"
                  className="h-10 px-6 text-gray-300 border-gray-600 hover:bg-gray-800 font-medium"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
                
                {/* Botões Cancelar/Lançar ou Info de Mesa Fechada */}
                {selectedTable?.status === 'closed' ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-red-900/30 border border-red-600 rounded-lg px-4 py-2">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-red-400" />
                        <div>
                          <p className="text-sm font-semibold text-red-300">Conta Fechada</p>
                          <p className="text-xs text-gray-400">Total: {formatCurrency(calculateTotal())}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setPrintDialog(true)}
                        disabled={loading}
                        className="bg-gray-600 hover:bg-gray-700 text-white flex-1"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir Conta
                      </Button>
                      <Button
                        onClick={reopenTable}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reabrir Mesa
                      </Button>
                    </div>
                  </div>
                ) : (() => {
                  // Verifica se há alterações pendentes
                  const hasPendingItems = cart.some(item => 
                    item.status === 'pending' || !item.status
                  );
                  const hasRestoredItems = cart.some((item: any) => 
                    item.wasRestored === true
                  );
                  const hasCancelledItems = cart.some((item: any) => 
                    item.wasCancelled === true
                  );
                  const hasChanges = hasPendingItems || hasRestoredItems || hasCancelledItems;
                  
                  return (
                    <div className={`flex rounded-full border border-gray-700 overflow-hidden ${
                      hasChanges 
                        ? 'bg-gray-800' 
                        : 'bg-gray-900 opacity-50 cursor-not-allowed'
                    }`}>
                      <button
                        onClick={hasChanges ? handleCancelOrder : undefined}
                        disabled={!hasChanges}
                        className={`px-6 py-2 font-medium transition-all flex items-center gap-2 border-r border-gray-700 ${
                          hasChanges
                            ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                            : 'text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </button>
                      <button
                        onClick={hasChanges ? handleLaunchOrder : undefined}
                        disabled={!hasChanges}
                        className={`px-7 py-2 font-medium transition-all flex items-center gap-2 ${
                          hasChanges
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <Send className="h-4 w-4" />
                        Lançar
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
          
          {/* Right Panel 30% - Menu Lateral Compacto */}
          <div className="w-[30%] flex flex-col p-4 bg-gray-900/50">
            {/* Se a mesa está fechada, mostra apenas resumo */}
            {selectedTable?.status === 'closed' ? (
              <>
              <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-orange-400" />
                    Resumo da Conta Fechada
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Resumo de Valores */}
                  <div className="space-y-3 p-4 bg-gray-800 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Lançados:</span>
                      <span className="font-medium">{formatCurrency(
                        cart.filter(item => item.status === 'delivered').reduce((sum, item) => sum + item.total_price, 0)
                      )}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Cancelados:</span>
                      <span className="font-medium text-red-400">{formatCurrency(
                        cart.filter(item => item.status === 'cancelled').reduce((sum, item) => sum + item.total_price, 0)
                      )}</span>
                    </div>
                    
                    {/* Taxa de Serviço com botão para remover/restaurar */}
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-600">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => setServiceTaxPercentage(serviceTaxPercentage > 0 ? 0 : 10)}
                          className="h-6 w-6 p-0 bg-gray-700 hover:bg-gray-600"
                          title={serviceTaxPercentage > 0 ? "Remover taxa de serviço" : "Restaurar taxa de serviço"}
                        >
                          {serviceTaxPercentage > 0 ? <X className="h-3 w-3" /> : <RefreshCw className="h-3 w-3" />}
                        </Button>
                        <span className="text-gray-400">Taxa de Serviço (10%):</span>
                      </div>
                      <span className={`font-medium ${serviceTaxPercentage > 0 ? 'text-yellow-400' : 'text-gray-500'}`}>
                        {serviceTaxPercentage > 0 ? `+${formatCurrency(calculateServiceTax())}` : 'Removida'}
                      </span>
                    </div>
                    
                    {/* Controles de Desconto */}
                    <div className="pt-2 border-t border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">Desconto:</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => setDiscountType('value')}
                            className={`h-6 px-2 text-xs ${
                              discountType === 'value' ? "bg-orange-600" : "bg-gray-700"
                            }`}
                          >
                            R$
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setDiscountType('percentage')}
                            className={`h-6 px-2 text-xs ${
                              discountType === 'percentage' ? "bg-orange-600" : "bg-gray-700"
                            }`}
                          >
                            %
                          </Button>
                          <Input
                            type="number"
                            value={discountValue || ''}
                            onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                            maxLength={6}
                            className="h-6 w-16 bg-gray-700 border-gray-600 text-white text-xs px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      {discountValue > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Desconto manual:</span>
                          <span className="font-medium text-green-400">
                            -{formatCurrency(
                              discountType === 'percentage'
                                ? (calculateTotal() * discountValue / 100)
                                : discountValue
                            )}
                          </span>
                        </div>
                      )}
                      
                      {appliedPromotions.length > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Desconto promoções:</span>
                          <span className="font-medium text-purple-400">
                            -{formatCurrency(appliedPromotions.reduce((total, promo) => total + promo.discount, 0))}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-600">
                      <span>Total:</span>
                      <span className="text-orange-400">{formatCurrency(calculateTotalWithDiscount())}</span>
                    </div>
                  </div>
                  
                </CardContent>
              </Card>

              {/* Seção de Promoções - Abaixo do Resumo da Conta Fechada */}
              <Card className="bg-gray-900/50 backdrop-blur border-gray-700 mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Gift className="h-4 w-4 text-orange-400" />
                    Promoções Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <PromocoesSection 
                    cart={cart}
                    groups={groups}
                    onPromotionToggle={handlePromotionToggle}
                    appliedPromotions={appliedPromotions}
                    setAppliedPromotions={setAppliedPromotions}
                  />
                </CardContent>
              </Card>
              </>
            ) : (
              <>
              {/* Card de Ações Normal - quando mesa não está fechada */}
              <Card className="bg-gray-900/50 backdrop-blur border-gray-700 mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-orange-400" />
                  Ações da Mesa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {/* Botão Fechar Conta - Principal em laranja */}
                  <Button
                    onClick={startCheckout}
                    disabled={loading || cart.length === 0 || selectedTable?.status === 'closed'}
                    className={`w-full h-11 text-sm font-semibold transition-all ${
                      cart.length === 0 || selectedTable?.status === 'closed'
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                        : "bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20"
                    }`}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {selectedTable?.status === 'closed' ? 'Conta Fechada' : 'Fechar Conta'}
                  </Button>
                  
                  {/* Botão Imprimir - Secundário */}
                  <Button
                    onClick={() => setPrintDialog(true)}
                    disabled={cart.length === 0}
                    className={`w-full h-11 text-sm font-semibold transition-all ${
                      cart.length === 0 
                        ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                        : "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                    }`}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Conta
                  </Button>
                  
                  {/* Botão Transferir - Secundário */}
                  <Button
                    onClick={() => setTransferTableDialog(true)}
                    className="w-full h-11 text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 transition-all"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Transferir Mesa
                  </Button>
                  
                  {/* Botão Cancelar Mesa - Destrutivo mais sutil */}
                  <Button
                    onClick={() => setCancelTableDialog(true)}
                    className="w-full h-11 text-sm font-semibold bg-gray-700 hover:bg-red-900/30 text-red-400 border border-gray-600 hover:border-red-800 transition-all"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar Mesa
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Resumo Financeiro Compacto */}
            <div className="mt-auto pt-3">
              <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700">
                <div className="space-y-2">
                  {/* Itens Lançados */}
                  <div className="flex justify-between items-center">
                    <span className="text-green-400 text-xs flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Lançados
                    </span>
                    <span className="text-green-400 font-semibold text-sm">
                      R$ {calculateLaunchedTotal().toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  
                  {/* Itens Cancelados */}
                  <div className="flex justify-between items-center">
                    <span className="text-red-400 text-xs flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Cancelados
                    </span>
                    <span className="text-red-400 font-semibold text-sm line-through">
                      R$ {calculateCancelledTotal().toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* Subtotal */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400 text-xs">Subtotal</span>
                    <span className="text-gray-300 text-sm">
                      R$ {calculateSubtotal().toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  
                  {/* Taxa de Serviço - só mostra se > 0 */}
                  {serviceTaxPercentage > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-yellow-400 text-xs">
                        Taxa de Serviço ({serviceTaxPercentage}%)
                      </span>
                      <span className="text-yellow-400 text-sm">
                        +R$ {calculateServiceTax().toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}
                  
                  {/* Total Geral */}
                  <div className="border-t border-gray-600 pt-2 mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm font-bold flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-orange-400" />
                        Total
                      </span>
                      <motion.span 
                        className="text-lg font-bold text-orange-500"
                        key={calculateTotal()}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        R$ {calculateTotal().toFixed(2).replace('.', ',')}
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </>)}
            
          </div>
        </div>


        {/* Dialogs Melhorados */}
        {/* Dialog Pagamento com Animação */}
        <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-400" />
                Receber Pagamento
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Confirme o pagamento da conta
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-4"
              >
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total a Pagar:</span>
                  <motion.span 
                    className="text-orange-400"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                  >
                    {formatCurrency(calculateTotal())}
                  </motion.span>
                </div>
              </motion.div>

              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { method: 'cash' as const, icon: DollarSign, label: 'Dinheiro' },
                    { method: 'card' as const, icon: CreditCard, label: 'Cartão' },
                    { method: 'pix' as const, icon: Smartphone, label: 'PIX' }
                  ].map((pm) => (
                    <motion.div
                      key={pm.method}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => setPaymentMethod(pm.method)}
                        className={`h-20 flex flex-col items-center justify-center gap-2 ${
                          paymentMethod === pm.method 
                            ? 'bg-gradient-to-br from-orange-600 to-orange-700' 
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        <pm.icon className="h-6 w-6" />
                        <span className="text-xs">{pm.label}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">
                    Confirme o recebimento do valor total antes de finalizar
                  </p>
                </div>
              </motion.div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setPaymentDialog(false)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancelar (ESC)
              </Button>
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirmar Pagamento
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Checkout Completo */}
        <Dialog open={checkoutDialog} onOpenChange={setCheckoutDialog}>
          <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-2xl">
                <span className="flex items-center gap-3">
                  <Calculator className="h-7 w-7 text-orange-400" />
                  Fechamento de Conta - Mesa {selectedTable?.number}
                </span>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPrintDialog(true)}
                    variant="outline"
                    className="text-gray-400 border-gray-400 hover:bg-gray-400/10"
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Conta
                  </Button>
                  <Button
                    onClick={reopenTable}
                    variant="outline"
                    className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Reabrir Mesa
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-6">
              {/* Coluna 1: Resumo de Itens e Descontos */}
              <div className="space-y-4">
                {/* Itens Agrupados */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumo da Conta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {groupedItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                            <div className="flex-1">
                              <div className="font-medium">{item.item?.name || 'Produto'}</div>
                              <div className="text-sm text-gray-400">
                                {formatCurrency(item.unit_price, item.item?.group?.type === 'rodizio')} × {
                                  item.cancelledQuantity && item.cancelledQuantity > 0
                                    ? `${item.quantity - item.cancelledQuantity}`
                                    : item.quantity
                                }
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-orange-400">
                                {formatCurrency(
                                  item.cancelledQuantity && item.cancelledQuantity > 0
                                    ? item.unit_price * (item.quantity - item.cancelledQuantity)
                                    : item.total_price
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    {/* Totais */}
                    <div className="mt-4 pt-4 border-t border-gray-600 space-y-2">
                      {/* Taxa de Serviço - só mostra se > 0 */}
                      {serviceTaxPercentage > 0 && (
                        <div className="flex justify-between text-yellow-400">
                          <span>Taxa de Serviço ({serviceTaxPercentage}%):</span>
                          <span className="font-bold">+{formatCurrency(calculateServiceTax())}</span>
                        </div>
                      )}
                      
                      {/* Total com Desconto */}
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-orange-400">
                          {formatCurrency(calculateTotalWithDiscount())}
                        </span>
                      </div>
                      
                      {/* Divisão */}
                      <div className="flex items-center gap-2">
                        <span>Dividir em:</span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                            className="h-8 w-8 p-0 bg-gray-700 hover:bg-gray-600"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-12 text-center font-bold">{splitCount}</span>
                          <Button
                            size="sm"
                            onClick={() => setSplitCount(splitCount + 1)}
                            className="h-8 w-8 p-0 bg-gray-700 hover:bg-gray-600"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        {splitCount > 1 && (
                          <span className="text-sm text-gray-400">
                            ({formatCurrency(calculateTotalWithDiscount() / splitCount)} cada)
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Coluna 2: Calculadora e Pagamento */}
              <div className="space-y-4">
                {/* Display da Calculadora */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <div className="bg-black rounded p-3 text-right text-3xl font-mono text-green-400">
                      {calculatorDisplay}
                    </div>
                    
                    {/* Teclado da Calculadora */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '00', 'C'].map((key) => (
                        <Button
                          key={key}
                          onClick={() => {
                            if (key === 'C') {
                              setCalculatorDisplay('0');
                            } else if (calculatorDisplay === '0') {
                              setCalculatorDisplay(key);
                            } else {
                              setCalculatorDisplay(calculatorDisplay + key);
                            }
                          }}
                          className={`h-14 text-xl font-bold ${
                            key === 'C' ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          {key}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Botões de Valor Rápido */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {[10, 20, 50, 100].map((value) => (
                        <Button
                          key={value}
                          onClick={() => setCalculatorDisplay(value.toString())}
                          className="bg-gray-700 hover:bg-gray-600"
                        >
                          R$ {value}
                        </Button>
                      ))}
                    </div>
                    
                    {/* Botões de Pagamento */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button
                        onClick={() => {
                          const amount = parseFloat(calculatorDisplay) || 0;
                          if (amount > 0) {
                            addPayment({
                              id: Date.now().toString(),
                              method: 'cash',
                              amount: amount,
                              timestamp: new Date()
                            });
                            setCalculatorDisplay('0');
                          }
                        }}
                        className="bg-green-600 hover:bg-green-700 h-12"
                      >
                        <DollarSign className="mr-2 h-5 w-5" />
                        Dinheiro
                      </Button>
                      <Button
                        onClick={() => {
                          const amount = parseFloat(calculatorDisplay) || 0;
                          if (amount > 0) {
                            addPayment({
                              id: Date.now().toString(),
                              method: 'credit',
                              amount: amount,
                              timestamp: new Date()
                            });
                            setCalculatorDisplay('0');
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 h-12"
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        Crédito
                      </Button>
                      <Button
                        onClick={() => {
                          const amount = parseFloat(calculatorDisplay) || 0;
                          if (amount > 0) {
                            addPayment({
                              id: Date.now().toString(),
                              method: 'debit',
                              amount: amount,
                              timestamp: new Date()
                            });
                            setCalculatorDisplay('0');
                          }
                        }}
                        className="bg-purple-600 hover:bg-purple-700 h-12"
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        Débito
                      </Button>
                      <Button
                        onClick={() => {
                          const amount = parseFloat(calculatorDisplay) || 0;
                          if (amount > 0) {
                            addPayment({
                              id: Date.now().toString(),
                              method: 'pix',
                              amount: amount,
                              timestamp: new Date()
                            });
                            setCalculatorDisplay('0');
                          }
                        }}
                        className="bg-cyan-600 hover:bg-cyan-700 h-12"
                      >
                        <Smartphone className="mr-2 h-5 w-5" />
                        PIX
                      </Button>
                    </div>
                    
                    {/* Botão Total Restante */}
                    {calculateRemaining() > 0 ? (
                      <Button
                        onClick={() => setCalculatorDisplay(calculateRemaining().toString())}
                        className="w-full mt-2 bg-orange-600 hover:bg-orange-700 h-12 text-lg"
                      >
                        Valor Restante: {formatCurrency(calculateRemaining())}
                      </Button>
                    ) : (
                      <div className="w-full mt-2 bg-green-600 h-12 flex items-center justify-center rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Check className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-white font-semibold text-lg">Conta Paga</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Coluna 3: Pagamentos Realizados */}
              <div className="space-y-4">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Pagamentos Realizados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2">
                        {payments.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Nenhum pagamento registrado</p>
                          </div>
                        ) : (
                          payments.map((payment) => (
                            <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                              <div>
                                <div className="font-medium">
                                  {payment.method === 'cash' && 'Dinheiro'}
                                  {payment.method === 'credit' && 'Crédito'}
                                  {payment.method === 'debit' && 'Débito'}
                                  {payment.method === 'pix' && 'PIX'}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {format(payment.timestamp, 'HH:mm:ss')}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-green-400">
                                  {formatCurrency(payment.amount)}
                                </span>
                                <Button
                                  size="sm"
                                  onClick={() => removePayment(payment.id)}
                                  className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    
                    {/* Resumo de Pagamentos */}
                    <div className="mt-4 pt-4 border-t border-gray-600 space-y-2">
                      <div className="flex justify-between">
                        <span>Total Pago:</span>
                        <span className="font-bold text-green-400">
                          {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                        </span>
                      </div>
                      {calculateRemaining() > 0 ? (
                        <div className="flex justify-between">
                          <span>Restante:</span>
                          <span className="font-bold text-red-400">
                            {formatCurrency(calculateRemaining())}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-green-400 font-semibold">Conta Paga</span>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        </div>
                      )}
                      {calculateChange() > 0 && (
                        <div className="flex justify-between">
                          <span>Troco:</span>
                          <span className="font-bold text-yellow-400">
                            {formatCurrency(calculateChange())}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Botão Finalizar */}
                <Button
                  onClick={finishCheckout}
                  disabled={calculateRemaining() > 0 || loading}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : calculateRemaining() > 0 ? (
                    <>
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Faltam {formatCurrency(calculateRemaining())}
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Finalizar Pagamento
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Imprimir Comanda */}
        <Dialog open={printDialog} onOpenChange={setPrintDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Imprimir Comanda
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="text-center mb-4">
                    <h3 className="font-bold">ComideX Restaurant</h3>
                    <p className="text-sm text-gray-400">
                      {selectedTable?.type === 'counter' ? 'Balcão' : 'Mesa'} {selectedTable?.number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-2">
                    {cart.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm py-1">
                        <span>{item.quantity}x {item.item?.name}</span>
                        <span>{formatCurrency(item.total_price, item.item?.group?.type === 'rodizio')}</span>
                      </div>
                    ))}
                    {cart.length > 5 && (
                      <div className="text-sm text-gray-400 text-center py-1">
                        ... e mais {cart.length - 5} itens
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-700 mt-2 pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-orange-400">
                        {formatCurrency(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setPrintDialog(false)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePrintComanda}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Fechar Mesa Vazia */}
        <Dialog open={closeSessionDialog} onOpenChange={setCloseSessionDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>Fechar Mesa Sem Consumo</DialogTitle>
              <DialogDescription className="text-gray-400">
                Deseja fechar a mesa sem registrar consumo?
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">
                    A mesa será liberada sem registrar vendas
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setCloseSessionDialog(false)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCloseSessionWithoutPayment}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Fechar Mesa
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog de Cancelamento Parcial */}
        <Dialog open={cancelQuantityDialog} onOpenChange={setCancelQuantityDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-sm">
            <div className="space-y-6">
              {itemToCancel && (
                <>
                  <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                    <p className="font-bold text-lg">{itemToCancel.item?.name || 'Produto'}</p>
                    <p className="text-sm text-gray-400 mt-1">Disponível: {itemToCancel.quantity} unidades</p>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-center text-gray-300">Quantidade a cancelar:</p>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancelQuantity(Math.max(1, cancelQuantity - 1))}
                        className="h-12 w-12 p-0 bg-gray-700 hover:bg-gray-600 border-gray-600 rounded-full"
                        disabled={cancelQuantity <= 1}
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <div className="bg-gray-900 px-6 py-2 rounded-lg border border-gray-600">
                        <span className="text-2xl font-bold text-white">
                          {cancelQuantity}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCancelQuantity(Math.min(itemToCancel.quantity, cancelQuantity + 1))}
                        className="h-12 w-12 p-0 bg-gray-700 hover:bg-gray-600 border-gray-600 rounded-full"
                        disabled={cancelQuantity >= itemToCancel.quantity}
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Valor a cancelar:</span>
                      <span className="text-red-400 font-bold text-xl">
                        R$ {((itemToCancel.unit_price || itemToCancel.item?.price || 0) * cancelQuantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter className="gap-2 mt-4">
              <Button
                onClick={() => setCancelQuantityDialog(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600"
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirmCancelQuantity}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog Transferir Mesa */}
        <Dialog open={transferTableDialog} onOpenChange={setTransferTableDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-blue-400" />
                Transferir Mesa
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Transferir todos os pedidos para outra mesa
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-blue-400">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">
                    Mesa atual: {selectedTable?.number || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Número da Mesa de Destino
                </label>
                <input
                  type="number"
                  value={targetTableNumber}
                  onChange={(e) => setTargetTableNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="Digite o número da mesa"
                  autoFocus
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => {
                  setTransferTableDialog(false);
                  setTargetTableNumber('');
                }}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleTransferTable}
                disabled={loading || !targetTableNumber}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Transferir
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog Confirmar Fechamento de Conta */}
        <Dialog open={confirmCloseTableDialog} onOpenChange={setConfirmCloseTableDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-orange-400">
                <CreditCard className="h-5 w-5" />
                Confirmar Fechamento da Conta
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Mesa {selectedTable?.number} - Total: {formatCurrency(calculateTotal())}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  Deseja realmente fechar a conta da mesa {selectedTable?.number}?
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  A mesa ficará marcada como "Fechada" até o pagamento ser processado.
                </p>
              </div>
              
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {serviceTaxPercentage > 0 && (
                    <>
                      <div className="text-gray-400">Taxa de Serviço ({serviceTaxPercentage}%):</div>
                      <div className="text-right font-medium">{formatCurrency(calculateServiceTax())}</div>
                    </>
                  )}
                  <div className="text-orange-400 font-bold">Total:</div>
                  <div className="text-right text-orange-400 font-bold">{formatCurrency(calculateTotal())}</div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setConfirmCloseTableDialog(false)}
                className="bg-gray-700 hover:bg-gray-600 border-gray-600"
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmCloseTable}
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Fechando...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirmar Fechamento
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog Cancelar Mesa */}
        <Dialog open={cancelTableDialog} onOpenChange={setCancelTableDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-5 w-5" />
                Confirmar Cancelamento
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Esta ação não pode ser desfeita
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-red-300 font-medium">
                      Tem certeza que deseja cancelar a mesa {selectedTable?.number}?
                    </p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Todos os pedidos serão cancelados</li>
                      <li>• A mesa será liberada</li>
                      <li>• A sessão será fechada</li>
                      <li>• Esta ação não pode ser desfeita</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setCancelTableDialog(false)}
                variant="ghost"
                className="bg-gray-700 hover:bg-gray-600"
              >
                Voltar
              </Button>
              <Button
                onClick={() => {
                  setCancelTableDialog(false);
                  handleCancelTable();
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <X className="mr-2 h-4 w-4" />
                Sim, Cancelar Mesa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // TELA 3: HISTÓRICO DE VENDAS
  else if (screen === 'history') {
    screenContent = (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <History className="h-8 w-8 text-orange-400" />
                  Histórico de Vendas
                </h1>
                <p className="text-gray-400">Vendas do dia {format(new Date(), 'dd/MM/yyyy')}</p>
              </div>
              <Button
                onClick={() => setScreen('tables')}
                className="bg-gray-800 hover:bg-gray-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar (F1)
              </Button>
            </div>
          </motion.div>

          {/* Estatísticas do Dia */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Total de Vendas</p>
                      <p className="text-3xl font-bold text-white">
                        {formatCurrency(salesStats.totalSales)}
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Pedidos</p>
                      <p className="text-3xl font-bold text-white">
                        {salesStats.totalOrders}
                      </p>
                    </div>
                    <Receipt className="h-10 w-10 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Ticket Médio</p>
                      <p className="text-3xl font-bold text-white">
                        {formatCurrency(salesStats.averageTicket)}
                      </p>
                    </div>
                    <Calculator className="h-10 w-10 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Mesas Atendidas</p>
                      <p className="text-3xl font-bold text-white">
                        {new Set(todayOrders.map(o => o.table_id)).size}
                      </p>
                    </div>
                    <UtensilsCrossed className="h-10 w-10 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Produtos Mais Vendidos */}
            <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Top 5 Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salesStats.topProducts.map((product, index) => (
                    <motion.div
                      key={product.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${index === 0 ? 'bg-yellow-600' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-600'}
                        `}>
                          {index + 1}º
                        </div>
                        <div>
                          <div className="font-medium text-white">{product.name}</div>
                          <div className="text-xs text-gray-400">{product.quantity} unidades</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-400">
                          {formatCurrency(product.total)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Pedidos */}
            <Card className="col-span-2 bg-gray-800/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Pedidos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {todayOrders.slice(0, 10).map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="bg-gray-900/50 border-gray-700">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-white">
                                    Pedido #{order.order_number}
                                  </span>
                                  <Badge className={`
                                    ${order.payment_status === 'paid' ? 'bg-green-600' : 
                                      order.payment_status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'}
                                  `}>
                                    {order.payment_status === 'paid' ? 'Pago' : 
                                     order.payment_status === 'pending' ? 'Pendente' : 'Cancelado'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                  Mesa {order.table_id} • {order.items?.length || 0} itens • 
                                  {order.created_at && format(new Date(order.created_at), ' HH:mm')}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-lg text-orange-400">
                                  {formatCurrency(order.total)}
                                </div>
                                {order.payment_method && (
                                  <div className="text-xs text-gray-400">
                                    {order.payment_method === 'cash' ? 'Dinheiro' :
                                     order.payment_method === 'card' ? 'Cartão' : 'PIX'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // RETURN ÚNICO FINAL - Renderiza o modal e o conteúdo da tela
  return (
    <>
      {rodizioDialogModal}
      {screenContent}
    </>
  );
}