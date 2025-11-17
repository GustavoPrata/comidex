"use client";

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
  ShoppingCart,
  X,
  Check,
  ArrowLeft,
  CreditCard,
  DollarSign,
  Smartphone,
  Users,
  User,
  Plus,
  Minus,
  Receipt,
  Clock,
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
  CheckCircle2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

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
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
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
  
  // Estado da mesa/sessão atual
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [currentSession, setCurrentSession] = useState<TableSession | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  
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
  
  // Estados do modal de cancelamento parcial
  const [cancelQuantityDialog, setCancelQuantityDialog] = useState(false);
  const [itemToCancel, setItemToCancel] = useState<any>(null);
  const [cancelQuantity, setCancelQuantity] = useState(1);
  
  // Ref para o ScrollArea dos itens do carrinho
  const cartScrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState<'top' | 'middle' | 'bottom'>('top');
  const previousCartLengthRef = useRef(0);
  
  // Função para rolar para o topo
  const scrollToTop = () => {
    const scrollContainer = cartScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  // Função para rolar para o final
  const scrollToBottom = () => {
    const scrollContainer = cartScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  };
  
  // Monitora posição do scroll para mostrar/ocultar botões
  useEffect(() => {
    const scrollContainer = cartScrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      if (scrollPercentage <= 5) {
        setScrollPosition('top');
      } else if (scrollPercentage >= 95) {
        setScrollPosition('bottom');
      } else {
        setScrollPosition('middle');
      }
    };
    
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [cart]);
  
  // Auto scroll para o final apenas quando adicionar novos itens
  useEffect(() => {
    // Só faz scroll se o número de itens aumentou
    if (cart.length > previousCartLengthRef.current) {
      // Aguardar para garantir que a aba cart esteja renderizada
      setTimeout(() => {
        // Verificar se estamos na aba cart antes de fazer scroll
        if (activeTab === 'cart' && cartScrollRef.current) {
          scrollToBottom();
        }
      }, 300); // Tempo suficiente para garantir renderização
    }
    previousCartLengthRef.current = cart.length;
  }, [cart.length, activeTab]); // Adicionado activeTab como dependência
  
  // Estados do checkout completo
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const [groupedItems, setGroupedItems] = useState<any[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [splitCount, setSplitCount] = useState(1);
  const [payments, setPayments] = useState<any[]>([]);
  const [calculatorValue, setCalculatorValue] = useState('');
  const [calculatorDisplay, setCalculatorDisplay] = useState('0');
  const [activePaymentInput, setActivePaymentInput] = useState<number | null>(null);
  
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

      // Buscar itens do pedido
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
              status: 'delivered' as const // Itens do banco já foram lançados
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
            status: 'delivered' as const // Itens do banco já foram lançados
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
        .in('status', ['pending', 'confirmed', 'preparing', 'ready', 'delivered'])
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
              item_id: -1 * Date.now() - Math.random() * 1000, // Generate negative ID for cart
              quantity: orderItem.quantity,
              unit_price: orderItem.unit_price,
              total_price: orderItem.total_price,
              status: orderItem.status || 'novo',
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
            item_id: orderItem.item_id,
            quantity: orderItem.quantity,
            unit_price: orderItem.unit_price,
            total_price: orderItem.total_price,
            status: orderItem.status || 'novo',
            item: orderItem.item
          };
        }) || [];
        
        setCart(cartItems);
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
      // Procurar apenas por itens NÃO lançados para mesclar
      const existing = prev.find(c => 
        c.item_id === item.id && c.status !== 'delivered'
      );
      
      if (existing) {
        // Mesclar apenas com itens novos
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
        // Sempre criar nova linha - não mesclar com itens lançados
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
          <ShoppingCart className="h-5 w-5 text-green-500" />
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
              total_price: item.unit_price * (item.quantity + delta)
            };
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
              cancelledQuantity: 1
            };
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
            status: 'delivered' as any
          };
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
            cancelledQuantity: item.quantity
          };
        } else {
          // Cancela parcialmente
          return {
            ...item,
            cancelledQuantity: cancelledQty
          };
        }
      }
      return item;
    }));
    
    toast.error(`${cancelQuantity} ${cancelQuantity === 1 ? 'item cancelado' : 'itens cancelados'}`);
    setCancelQuantityDialog(false);
    setItemToCancel(null);
  };

  const handleCancelOrder = () => {
    const newItems = cart.filter(item => item.status !== 'delivered');
    const launchedItems = cart.filter(item => item.status === 'delivered');
    
    if (newItems.length === 0) {
      toast.error("Não há itens novos para cancelar. Todos já foram lançados.");
      return;
    }

    // Confirmação antes de cancelar
    const message = launchedItems.length > 0 
      ? `Deseja cancelar ${newItems.length} item(ns) novo(s)? Os ${launchedItems.length} item(ns) já lançado(s) serão mantidos.`
      : "Deseja realmente cancelar todos os itens do carrinho?";
      
    if (confirm(message)) {
      // Mantém apenas itens já lançados
      setCart(launchedItems);
      toast.success(`${newItems.length} item(ns) cancelado(s)`);
    }
  };

  // Função para agrupar itens duplicados
  const groupCartItems = () => {
    const grouped: any[] = [];
    cart.forEach(item => {
      if (item.status === 'cancelled') return; // Ignorar itens cancelados
      
      const existing = grouped.find(g => 
        g.item_id === item.item_id && 
        g.unit_price === item.unit_price &&
        g.notes === item.notes
      );
      
      if (existing) {
        existing.quantity += item.quantity;
        existing.total_price += item.total_price;
        existing.items.push(item);
      } else {
        grouped.push({
          ...item,
          items: [item],
          grouped_quantity: item.quantity
        });
      }
    });
    return grouped;
  };

  // Calcular total com desconto
  const calculateTotalWithDiscount = () => {
    const subtotal = calculateTotal();
    if (discountType === 'percentage') {
      return subtotal - (subtotal * discountValue / 100);
    } else {
      return Math.max(0, subtotal - discountValue);
    }
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
  const addPayment = (amount: number, method: string) => {
    const remaining = calculateRemaining();
    if (remaining <= 0) {
      toast.error("Conta já está totalmente paga!");
      return;
    }
    
    const paymentAmount = Math.min(amount, remaining);
    setPayments([...payments, {
      id: Date.now(),
      amount: paymentAmount,
      method: method,
      timestamp: new Date()
    }]);
    
    if (calculateRemaining() - paymentAmount <= 0) {
      toast.success("Pagamento completo!");
    }
  };

  // Remover pagamento
  const removePayment = (paymentId: number) => {
    setPayments(payments.filter(p => p.id !== paymentId));
  };

  // Iniciar checkout
  const startCheckout = () => {
    const grouped = groupCartItems();
    setGroupedItems(grouped);
    setCheckoutDialog(true);
    setPayments([]);
    setDiscountValue(0);
    setSplitCount(1);
    setCalculatorDisplay('0');
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
          ? calculateTotal() * discountValue / 100 
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
          discount: discountValue > 0 ? (discountType === 'percentage' ? calculateTotal() * discountValue / 100 : discountValue) : 0,
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
      toast.error("Erro ao processar pagamento!");
    } finally {
      setLoading(false);
    }
  };

  // Reabrir mesa (cancelar checkout)
  const reopenTable = () => {
    if (confirm("Deseja reabrir a mesa e cancelar o fechamento?")) {
      setCheckoutDialog(false);
      setPayments([]);
      setDiscountValue(0);
      setSplitCount(1);
      toast.success("Mesa reaberta!");
    }
  };

  const handleLaunchOrder = async () => {
    // Filtrar apenas itens não lançados e não cancelados
    const newItems = cart.filter(item => item.status !== 'delivered' && item.status !== 'cancelled');
    const cancelledItems = cart.filter(item => item.status === 'cancelled');
    
    if (newItems.length === 0 && cancelledItems.length === 0) {
      toast.error("Todos os itens já foram lançados. Adicione novos itens primeiro.");
      return;
    }
    
    if (newItems.length === 0 && cancelledItems.length > 0) {
      toast.error("Apenas itens cancelados no carrinho. Adicione novos itens ou restaure os cancelados.");
      return;
    }

    if (!selectedTable?.id) {
      toast.error("Mesa não selecionada. Volte para a tela de mesas e selecione uma mesa.");
      console.error("Erro: selectedTable não está definida", selectedTable);
      return;
    }

    try {
      console.log('Lançando pedido para mesa:', selectedTable.id);
      
      // Atualizar status da mesa
      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'occupied' })
        .eq('id', selectedTable.id);

      if (tableError) {
        console.error('Erro ao atualizar status da mesa:', tableError);
        throw tableError;
      }

      // Verificar se já existe uma comanda aberta para esta mesa
      const { data: existingOrders, error: checkError } = await supabase
        .from('orders')
        .select('id')
        .eq('table_id', selectedTable.id)
        .eq('status', 'open')
        .single();

      // Ignorar erro PGRST116 (nenhuma linha encontrada)
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Erro ao verificar pedidos existentes:', checkError);
        throw checkError;
      }

      let orderId;

      if (existingOrders?.id) {
        orderId = existingOrders.id;
        console.log('Usando comanda existente:', orderId);
      } else {
        // Criar nova comanda
        const orderNumber = `${selectedTable.number}-${Date.now().toString().slice(-6)}`;
        
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            table_id: selectedTable.id,
            status: 'open',
            total: calculateTotal()
          })
          .select()
          .single();

        if (orderError) {
          console.error('Erro ao criar nova comanda:', orderError);
          throw orderError;
        }
        orderId = newOrder.id;
        console.log('Nova comanda criada:', orderId);
      }

      // Adicionar apenas itens novos (não lançados) ao pedido
      const orderItems = newItems.map(item => {
        // Para rodízios (IDs negativos), adicionar metadata
        if (item.item_id < 0) {
          return {
            order_id: orderId,
            item_id: null, // Rodízio não tem item_id real
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price,
            status: 'pending',
            metadata: {
              type: 'rodizio',
              icon: item.item?.icon || '',
              group_id: item.item?.group_id || 0,
              name: item.item?.name || '',
              image: item.item?.image || ''
            }
          };
        }
        // Para itens normais
        return {
          order_id: orderId,
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          status: 'pending'
        };
      });

      console.log('Inserindo itens:', orderItems);

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Erro ao inserir itens:', itemsError);
        throw itemsError;
      }

      console.log('Itens inseridos com sucesso');

      // Processar impressão
      try {
        await processPrinting(orderId);
      } catch (printError) {
        console.error('Erro na impressão (continuando):', printError);
        // Não vamos falhar o pedido por erro de impressão
      }

      // Marcar apenas os itens recém-lançados como delivered e adicionar timestamp
      const launchedTimestamp = new Date().toISOString();
      setCart(cart.map(item => {
        // Se o item estava nos newItems (foi lançado agora), marca como delivered
        if (newItems.some(newItem => 
          newItem.item_id === item.item_id && 
          newItem.quantity === item.quantity &&
          newItem.status === item.status
        )) {
          return {
            ...item,
            status: 'delivered' as const,
            order_id: orderId,
            launched_at: launchedTimestamp
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
      
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>Pedido lançado! Você pode continuar adicionando itens.</span>
        </div>
      );
    } catch (error: any) {
      console.error('Erro ao lançar pedido:', error);
      toast.error(error.message || "Erro ao lançar pedido. Verifique o console para mais detalhes.");
    }
  };

  const calculateTotal = () => {
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
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
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
  const formatCurrency = (value: number) => {
    if (value === 0) {
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
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Calculator className="h-10 w-10 text-orange-400" />
                  Caixa ComideX
                </h1>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    // Se houver itens no carrinho, confirmar antes de sair
                    if (cart.length > 0) {
                      const action = confirm("Você tem itens não lançados no carrinho.\n\nDeseja lançar o pedido antes de sair?\n\nOK = Lançar e Sair\nCancelar = Cancelar itens e Sair");
                      
                      if (action) {
                        // Lançar pedido antes de sair
                        handleLaunchOrder().then(() => {
                          window.location.href = '/';
                        });
                      } else {
                        // Cancelar itens e sair
                        setCart([]);
                        window.location.href = '/';
                      }
                    } else {
                      window.location.href = '/';
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Voltar (ESC)
                </Button>
                <Button
                  onClick={() => setScreen('history')}
                  className="bg-gray-800 hover:bg-gray-700"
                >
                  <History className="mr-2 h-4 w-4" />
                  Histórico (F9)
                </Button>
                <Button
                  onClick={loadInitialData}
                  className="bg-gray-800 hover:bg-gray-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar (F5)
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Estatísticas Animadas */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Mesas Abertas', value: tables.filter(t => t.current_session).length, icon: Users, color: 'blue' },
              { label: 'Mesas Livres', value: tables.filter(t => !t.current_session).length, icon: UtensilsCrossed, color: 'green' },
              { label: 'Total de Mesas', value: tables.length, icon: Receipt, color: 'orange' },
              { label: 'Hora Atual', value: format(new Date(), 'HH:mm'), icon: Clock, color: 'pink' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-800/50 backdrop-blur border-gray-700 hover:bg-gray-800/70 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">
                          {stat.value}
                        </p>
                      </div>
                      <stat.icon className={`h-8 w-8 text-${stat.color}-400`} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

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
                      ${table.current_session 
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
                        {table.current_session ? (
                          <>
                            <Badge className="bg-orange-600 text-white text-xs py-0.5 mb-1">
                              OCUPADA
                            </Badge>
                            <div className="text-xs text-gray-300 mt-1 space-y-1">
                              <div className="flex items-center justify-center gap-1">
                                <Users className="h-3 w-3" />
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

          {/* Atalhos de Teclado */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex justify-center"
          >
            <Card className="bg-gray-800/50 backdrop-blur border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-6 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    Atalhos:
                  </span>
                  <span><kbd className="px-2 py-1 bg-gray-700 rounded">F1</kbd> Mesas</span>
                  <span><kbd className="px-2 py-1 bg-gray-700 rounded">F3</kbd> Pagar</span>
                  <span><kbd className="px-2 py-1 bg-gray-700 rounded">F4</kbd> Imprimir</span>
                  <span><kbd className="px-2 py-1 bg-gray-700 rounded">F5</kbd> Atualizar</span>
                  <span><kbd className="px-2 py-1 bg-gray-700 rounded">F9</kbd> Histórico</span>
                  <span><kbd className="px-2 py-1 bg-gray-700 rounded">ESC</kbd> Fechar</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
        {/* Header Melhorado */}
        <div className="bg-gray-900/80 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setScreen('tables')}
              size="sm"
              className="bg-gray-800 hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-600">
                  {selectedTable?.type === 'counter' ? 'Balcão' : 'Mesa'} {selectedTable?.number}
                </Badge>
                <Badge variant="outline" className="text-white border-white">
                  {currentSession?.customer_count} {currentSession?.customer_count === 1 ? 'pessoa' : 'pessoas'}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Aberta às {currentSession && format(new Date(currentSession.opened_at), 'HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSearchOpen(!searchOpen)}
              className="bg-gray-800 hover:bg-gray-700"
              size="sm"
            >
              <Search className="mr-2 h-4 w-4" />
              Buscar (Ctrl+F)
            </Button>
            {cart.length === 0 ? (
              <Button
                onClick={() => setCloseSessionDialog(true)}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
              >
                <X className="mr-2 h-4 w-4" />
                Fechar Vazia
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => setPrintDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir (F4)
                </Button>
                <Button
                  onClick={startCheckout}
                  disabled={loading || cart.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Fechar Conta (F3)
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content com Tabs */}
        <div className="flex flex-1">
          {/* Left Panel - Carrinho e Categorias */}
          <div className="flex-1 flex flex-col p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
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
                          className="bg-gray-800 border-gray-600 text-white text-lg h-10 pl-9"
                          placeholder="Buscar produto..."
                        />
                      </div>
                    </div>
                    <TabsList className="bg-gray-800 border-gray-700 h-10">
                      <TabsTrigger value="cart" className="data-[state=active]:bg-orange-600 h-full px-3">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Carrinho ({cart.length})
                      </TabsTrigger>
                      <TabsTrigger value="categories" className="data-[state=active]:bg-orange-600 h-full px-3">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Produtos
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </CardContent>
              </Card>
              <TabsContent value="cart" className="flex-1 flex flex-col">
                {/* Portal para Resultados da Busca em Tempo Real */}
                {searchQuery.length > 0 && typeof document !== 'undefined' && createPortal(
                        <div className="fixed z-[99999] bg-gray-900 rounded-lg border-2 border-orange-500 shadow-2xl max-h-[320px] overflow-hidden"
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
                            <ScrollArea className="max-h-[320px]">
                              <div className="p-2">
                                {filteredItems.slice(0, 8).map((item) => (
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
                                        {item.price ? formatCurrency(item.price) : 'Sem preço'}
                                      </div>
                                    </div>
                                  </button>
                                ))}
                                {filteredItems.length > 8 && (
                                  <div className="text-center text-xs text-gray-500 py-2 border-t border-gray-800">
                                    +{filteredItems.length - 8} produtos encontrados
                                  </div>
                                )}
                              </div>
                            </ScrollArea>
                          )}
                        </div>,
                        document.body
                      )}

                {/* Lista de Itens Animada */}
                <Card className="flex-1 bg-gray-900/50 backdrop-blur border-gray-700 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-orange-400" />
                        Itens do Pedido
                      </span>
                      <Badge variant="outline" className="text-white">
                        {cart.length} {cart.length === 1 ? 'item' : 'itens'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 relative">
                    {/* Botões de Scroll */}
                    {cart.length > 0 && (
                      <div className="absolute right-2 top-2 z-10 flex flex-col gap-2">
                        {scrollPosition !== 'top' && (
                          <Button
                            onClick={scrollToTop}
                            size="icon"
                            className="h-8 w-8 rounded-full bg-orange-600 hover:bg-orange-700"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                        )}
                        {scrollPosition !== 'bottom' && (
                          <Button
                            onClick={scrollToBottom}
                            size="icon"
                            className="h-8 w-8 rounded-full bg-orange-600 hover:bg-orange-700"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <ScrollArea ref={cartScrollRef} className="h-[400px] pr-10">
                      {cart.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-gray-500">
                            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p>Carrinho vazio</p>
                            <p className="text-sm mt-2">Adicione produtos usando o código ou busca</p>
                          </div>
                        </div>
                      ) : (
                        <AnimatePresence>
                          {cart.map((item, index) => (
                            <motion.div
                              key={`${item.item_id}-${index}`}
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 50 }}
                              transition={{ duration: 0.2 }}
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
                                        <Clock className="h-3 w-3 mb-1" />
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
                                        {formatCurrency(item.unit_price)} × {
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
                      )}
                    </ScrollArea>

                    {/* Totais Animados */}
                    {cart.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                      >
                        <div className="border-t border-gray-700 pt-4 space-y-2">
                          {calculateLaunchedTotal() > 0 && (
                            <div className="flex justify-between text-sm text-green-400">
                              <span>Lançado:</span>
                              <span>{formatCurrency(calculateLaunchedTotal())}</span>
                            </div>
                          )}
                          {calculateCancelledTotal() > 0 && (
                            <div className="flex justify-between text-sm text-red-400 line-through">
                              <span>Cancelado:</span>
                              <span>{formatCurrency(calculateCancelledTotal())}</span>
                            </div>
                          )}
                          {calculateNewItemsTotal() > 0 && (
                            <div className="flex justify-between text-lg">
                              <span>Novos Itens:</span>
                              <span>{formatCurrency(calculateNewItemsTotal())}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-2xl font-bold text-orange-400">
                            <span className="flex items-center gap-2">
                              <Calculator className="h-6 w-6" />
                              Total Geral:
                            </span>
                            <motion.span
                              key={calculateTotal()}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                            >
                              {formatCurrency(calculateTotal())}
                            </motion.span>
                          </div>
                        </div>
                        
                        {/* Botões de Lançar e Cancelar */}
                        <div className="flex gap-3 mt-4">
                          <Button
                            onClick={handleCancelOrder}
                            variant="outline"
                            className="flex-1 h-12 text-red-400 border-red-600 hover:bg-red-900/20 hover:text-red-300"
                          >
                            <X className="h-5 w-5 mr-2" />
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleLaunchOrder}
                            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Send className="h-5 w-5 mr-2" />
                            Lançar Pedido
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="categories" className="flex-1 mt-4">
                <Card className="h-full bg-gray-900/50 backdrop-blur border-gray-700">
                  <CardHeader>
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
                  <CardContent>
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
                        
                        <ScrollArea className="h-[400px]">
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
                                          {formatCurrency(item.price || 0)}
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
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
                <Button
                  onClick={reopenTable}
                  variant="outline"
                  className="text-yellow-400 border-yellow-400 hover:bg-yellow-400/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Reabrir Mesa
                </Button>
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
                                {formatCurrency(item.unit_price)} × {
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
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-bold">{formatCurrency(calculateTotal())}</span>
                      </div>
                      
                      {/* Desconto */}
                      <div className="flex items-center gap-2">
                        <span>Desconto:</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => setDiscountType('percentage')}
                            className={discountType === 'percentage' ? 'bg-orange-600' : 'bg-gray-700'}
                          >
                            %
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setDiscountType('fixed')}
                            className={discountType === 'fixed' ? 'bg-orange-600' : 'bg-gray-700'}
                          >
                            R$
                          </Button>
                        </div>
                        <Input
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                          className="w-20 h-8 bg-gray-700 border-gray-600 text-white"
                          min="0"
                        />
                        {discountValue > 0 && (
                          <span className="text-red-400">
                            -{formatCurrency(
                              discountType === 'percentage' 
                                ? calculateTotal() * discountValue / 100 
                                : discountValue
                            )}
                          </span>
                        )}
                      </div>
                      
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
                            addPayment(amount, 'cash');
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
                            addPayment(amount, 'credit');
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
                            addPayment(amount, 'debit');
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
                            addPayment(amount, 'pix');
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
                    <Button
                      onClick={() => setCalculatorDisplay(calculateRemaining().toString())}
                      className="w-full mt-2 bg-orange-600 hover:bg-orange-700 h-12 text-lg"
                    >
                      Valor Restante: {formatCurrency(calculateRemaining())}
                    </Button>
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
                      <div className="flex justify-between">
                        <span>Restante:</span>
                        <span className={`font-bold ${calculateRemaining() > 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {formatCurrency(calculateRemaining())}
                        </span>
                      </div>
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
                        <span>{formatCurrency(item.total_price)}</span>
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