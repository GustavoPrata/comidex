"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Trash2,
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
  Zap,
  Star,
  ShoppingBag,
  Calculator,
  Keyboard,
  UtensilsCrossed,
  Armchair,
  Soup
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient();

// Types
interface Category {
  id: number;
  name: string;
  active: boolean;
  sort_order: number;
  icon?: string;
}

interface Item {
  id: number;
  name: string;
  description?: string | null;
  price: number | null;
  category_id: number;
  category?: Category;
  available: boolean;
  active: boolean;
  image?: string | null;
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
  service_type?: 'a_la_carte' | 'rodizio_tradicional' | 'rodizio_premium';
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
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
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
  const [customerCount, setCustomerCount] = useState("1");
  const [serviceType, setServiceType] = useState<'a_la_carte' | 'rodizio_tradicional' | 'rodizio_premium'>('a_la_carte');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash');
  const [closeSessionDialog, setCloseSessionDialog] = useState(false);
  const [printDialog, setPrintDialog] = useState(false);
  
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
      } else if (e.key === 'F2' && selectedTable) {
        e.preventDefault();
        handleSaveOrder();
      } else if (e.key === 'F3' && cart.length > 0) {
        e.preventDefault();
        setPaymentDialog(true);
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
      }
      
      // Atalhos da sessão
      if (screen === 'session') {
        if (e.ctrlKey && e.key === 'f') {
          e.preventDefault();
          setSearchOpen(!searchOpen);
        } else if (e.key === '+' && !e.ctrlKey) {
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

  // Funções de carregamento
  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTables(), 
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

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          category:categories(*)
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
        setCart(orderData.items || []);
      } else {
        setCart([]);
        setCurrentOrder(null);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da sessão:', error);
    }
  };

  // FUNÇÕES DE MESA/SESSÃO
  const handleSelectTable = async (table: RestaurantTable) => {
    setSelectedTable(table);
    
    if (table.current_session) {
      setCurrentSession(table.current_session);
      await loadSessionDetails(table.id);
      setScreen('session');
    } else {
      setOpenTableDialog(true);
      setCustomerCount("1");
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
          customer_count: parseInt(customerCount) || 1,
          opened_at: new Date().toISOString(),
          total: 0,
          service_type: serviceType
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
      setScreen('session');
      toast.success(`Mesa ${selectedTable.number} aberta`);
      
      await loadTables();
    } catch (error) {
      console.error('Erro ao abrir mesa:', error);
      toast.error('Erro ao abrir mesa');
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

    if (!item.price) {
      toast.error("Produto sem preço definido");
      return;
    }

    const qty = parseInt(quantity) || 1;
    
    const newItem: OrderItem = {
      item_id: item.id,
      item: item,
      quantity: qty,
      unit_price: item.price,
      total_price: item.price * qty,
      status: 'pending'
    };

    setCart(prev => {
      const existing = prev.find(c => c.item_id === item.id);
      if (existing) {
        return prev.map(c => 
          c.item_id === item.id 
            ? { 
                ...c, 
                quantity: c.quantity + qty, 
                total_price: c.unit_price * (c.quantity + qty) 
              }
            : c
        );
      } else {
        return [...prev, newItem];
      }
    });

    // Feedback visual e sonoro
    toast.success(
      <div className="flex items-center gap-2">
        <Check className="h-4 w-4" />
        <span>{item.name} adicionado</span>
      </div>
    );
    
    setInputValue("");
    setQuantity("1");
    setActiveInput("code");
    codeInputRef.current?.focus();
  };

  const handleUpdateQuantity = (itemId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.item_id === itemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: newQty,
          total_price: item.unit_price * newQty
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId: number) => {
    setCart(prev => prev.filter(item => item.item_id !== itemId));
    toast.success("Item removido");
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total_price, 0);
  };

  // FUNÇÕES DE PEDIDO/PAGAMENTO
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
            subtotal: total,
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
              item_id: item.item_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              status: item.status
            }))
          );

        if (itemsError) throw itemsError;
      } else {
        const orderNumber = `${selectedTable.number}-${Date.now().toString().slice(-6)}`;
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            table_id: selectedTable.id,
            status: 'confirmed',
            payment_status: 'pending',
            type: 'dine_in',
            subtotal: total,
            discount: 0,
            delivery_fee: 0,
            total: total
          })
          .select()
          .single();

        if (orderError) throw orderError;

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(
            cart.map(item => ({
              order_id: orderData.id,
              item_id: item.item_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price,
              status: item.status
            }))
          );

        if (itemsError) throw itemsError;
        
        setCurrentOrder(orderData as any);
      }

      await supabase
        .from('table_sessions')
        .update({ 
          total,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);

      toast.success("Pedido salvo com sucesso");
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      toast.error('Erro ao salvar pedido');
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
          payment_status: 'paid',
          payment_method: paymentMethod,
          completed_at: new Date().toISOString()
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
    
    if (selectedCategory) {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toString().includes(searchQuery)
      );
    }
    
    return filtered;
  }, [items, selectedCategory, searchQuery]);

  // Formatação
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // RENDERIZAÇÃO CONDICIONAL POR TELA
  if (loading && screen === 'tables') {
    return (
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
  if (screen === 'tables') {
    return (
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
                  <Zap className="h-10 w-10 text-orange-400" />
                  ComideX POS Pro
                </h1>
                <p className="text-gray-400">Sistema Profissional de Vendas</p>
              </div>
              <div className="flex gap-2">
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
                              {table.current_session.service_type && (
                                <div className="text-center">
                                  <span className="text-yellow-400 font-semibold">
                                    {table.current_session.service_type === 'a_la_carte' 
                                      ? 'À la Carte'
                                      : table.current_session.service_type === 'rodizio_tradicional'
                                      ? 'Rodízio Tradicional'
                                      : 'Rodízio Premium'}
                                  </span>
                                </div>
                              )}
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
                  <span><kbd className="px-2 py-1 bg-gray-700 rounded">F2</kbd> Salvar</span>
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
                Selecione o tipo de serviço e quantidade de pessoas
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Tipo de Serviço
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    onClick={() => setServiceType('a_la_carte')}
                    className={`${
                      serviceType === 'a_la_carte' 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    À la Carte
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setServiceType('rodizio_tradicional')}
                    className={`${
                      serviceType === 'rodizio_tradicional' 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Rodízio Tradicional
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setServiceType('rodizio_premium')}
                    className={`${
                      serviceType === 'rodizio_premium' 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    Rodízio Premium
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Número de Pessoas
                </label>
                <Input
                  type="number"
                  min="1"
                  max={selectedTable?.capacity || 10}
                  value={customerCount}
                  onChange={(e) => setCustomerCount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white text-xl"
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1">
                  Capacidade máxima: {selectedTable?.capacity}
                </p>
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
  if (screen === 'session') {
    return (
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
                  onClick={handleSaveOrder}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Salvar (F2)
                </Button>
                <Button
                  onClick={() => setPrintDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                  size="sm"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir (F4)
                </Button>
                <Button
                  onClick={() => setPaymentDialog(true)}
                  disabled={loading || cart.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pagar (F3)
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Busca Inteligente */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-800/50 backdrop-blur border-b border-gray-700 p-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Digite o nome ou código do produto..."
                  className="pl-10 bg-gray-700 border-gray-600 text-white text-lg"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && filteredItems.length > 0) {
                      handleAddItem(filteredItems[0]);
                      setSearchQuery("");
                      setSearchOpen(false);
                    }
                  }}
                />
              </div>
              
              {searchQuery.length > 0 && (
                <div className="mt-3 max-h-[400px] overflow-auto bg-gray-900 rounded-lg border border-gray-700">
                  {filteredItems.length === 0 ? (
                    <div className="text-gray-400 p-4 text-center">
                      Nenhum produto encontrado.
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {filteredItems.slice(0, 10).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-800 cursor-pointer rounded-lg transition-colors"
                          onClick={() => {
                            handleAddItem(item);
                            setSearchQuery("");
                            setSearchOpen(false);
                          }}
                        >
                          <div>
                            <div className="font-medium text-white">{item.name}</div>
                            <div className="text-sm text-gray-400">
                              Código: {item.id} • {item.category?.name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-orange-400">
                              {formatCurrency(item.price || 0)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content com Tabs */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Carrinho e Categorias */}
          <div className="flex-1 flex flex-col p-4">
            <Tabs defaultValue="cart" className="flex-1 flex flex-col">
              <TabsList className="bg-gray-800 border-gray-700">
                <TabsTrigger value="cart" className="data-[state=active]:bg-orange-600">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Carrinho ({cart.length})
                </TabsTrigger>
                <TabsTrigger value="categories" className="data-[state=active]:bg-orange-600">
                  <Package className="mr-2 h-4 w-4" />
                  Grupos e Categorias
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="cart" className="flex-1 flex flex-col mt-4">
                {/* Input Section */}
                <Card className="bg-gray-900/50 backdrop-blur border-gray-700 mb-4">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs text-gray-400 mb-1 block">
                          Código ou Nome do Produto
                        </label>
                        <Input
                          ref={codeInputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onFocus={() => setActiveInput("code")}
                          onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
                          className="bg-gray-800 border-gray-600 text-white text-2xl h-14"
                          placeholder="Digite ou busque"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Quantidade</label>
                        <div className="flex gap-1">
                          <Input
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            onFocus={() => setActiveInput("quantity")}
                            onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
                            className="bg-gray-800 border-gray-600 text-white text-2xl h-14 w-20 text-center"
                            type="number"
                            min="1"
                          />
                          <div className="flex flex-col gap-1">
                            <Button 
                              onClick={() => setQuantity(prev => (parseInt(prev) + 1).toString())}
                              className="h-6 px-2 bg-gray-700 hover:bg-gray-600"
                              size="sm"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button 
                              onClick={() => setQuantity(prev => Math.max(1, parseInt(prev) - 1).toString())}
                              className="h-6 px-2 bg-gray-700 hover:bg-gray-600"
                              size="sm"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

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
                  <CardContent className="p-4 pt-0 h-[calc(100%-60px)] flex flex-col">
                    <ScrollArea className="flex-1 pr-4">
                      {cart.length === 0 ? (
                        <div className="text-center text-gray-500 mt-8">
                          <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>Carrinho vazio</p>
                          <p className="text-sm mt-2">Adicione produtos usando o código ou busca</p>
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
                              <Card className="bg-gray-800/50 backdrop-blur border-gray-700 hover:bg-gray-800/70 transition-all">
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-white flex items-center gap-2">
                                        {item.item?.name || `Produto ${item.item_id}`}
                                        {index === cart.length - 1 && (
                                          <Badge className="bg-green-600 text-xs">NOVO</Badge>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-400 mt-1">
                                        {formatCurrency(item.unit_price)} × {item.quantity}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1">
                                        <Button
                                          size="sm"
                                          onClick={() => handleUpdateQuantity(item.item_id, -1)}
                                          className="h-7 w-7 p-0 bg-gray-700 hover:bg-gray-600"
                                        >
                                          <Minus className="h-3 w-3" />
                                        </Button>
                                        <span className="w-8 text-center font-medium">
                                          {item.quantity}
                                        </span>
                                        <Button
                                          size="sm"
                                          onClick={() => handleUpdateQuantity(item.item_id, 1)}
                                          className="h-7 w-7 p-0 bg-gray-700 hover:bg-gray-600"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      
                                      <div className="text-right">
                                        <div className="font-bold text-lg text-orange-400">
                                          {formatCurrency(item.total_price)}
                                        </div>
                                      </div>
                                      
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveItem(item.item_id)}
                                        className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
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
                          <div className="flex justify-between text-xl">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(calculateTotal())}</span>
                          </div>
                          <div className="flex justify-between text-2xl font-bold text-orange-400">
                            <span className="flex items-center gap-2">
                              <Calculator className="h-6 w-6" />
                              Total:
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
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="categories" className="flex-1 mt-4">
                <Card className="h-full bg-gray-900/50 backdrop-blur border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedGroup ? `${selectedGroup} - Categorias` : 'Grupos de Produtos'}</span>
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
                          <Button
                            onClick={() => setSelectedGroup('Entradas')}
                            className="h-24 text-lg bg-gray-700 hover:bg-orange-600 flex flex-col items-center justify-center"
                          >
                            <Package className="h-8 w-8 mb-2" />
                            Entradas
                          </Button>
                          <Button
                            onClick={() => setSelectedGroup('Pratos Quentes')}
                            className="h-24 text-lg bg-gray-700 hover:bg-orange-600 flex flex-col items-center justify-center"
                          >
                            <Soup className="h-8 w-8 mb-2" />
                            Pratos Quentes
                          </Button>
                          <Button
                            onClick={() => setSelectedGroup('Sushi')}
                            className="h-24 text-lg bg-gray-700 hover:bg-orange-600 flex flex-col items-center justify-center"
                          >
                            <Fish className="h-8 w-8 mb-2" />
                            Sushi
                          </Button>
                          <Button
                            onClick={() => setSelectedGroup('Bebidas')}
                            className="h-24 text-lg bg-gray-700 hover:bg-orange-600 flex flex-col items-center justify-center"
                          >
                            <Coffee className="h-8 w-8 mb-2" />
                            Bebidas
                          </Button>
                          <Button
                            onClick={() => setSelectedGroup('Sobremesas')}
                            className="h-24 text-lg bg-gray-700 hover:bg-orange-600 flex flex-col items-center justify-center"
                          >
                            <IceCream className="h-8 w-8 mb-2" />
                            Sobremesas
                          </Button>
                          <Button
                            onClick={() => setSelectedGroup('Especiais')}
                            className="h-24 text-lg bg-gray-700 hover:bg-orange-600 flex flex-col items-center justify-center"
                          >
                            <Star className="h-8 w-8 mb-2" />
                            Especiais
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Mostrar Categorias do Grupo e Produtos
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2">
                          <Button
                            onClick={() => setSelectedCategory(null)}
                            className={`${!selectedCategory ? 'bg-orange-600' : 'bg-gray-700'} hover:bg-orange-700`}
                          >
                            Todos
                          </Button>
                          {(() => {
                            // Mapear categorias aos grupos
                            const groupCategories: Record<string, string[]> = {
                              'Entradas': ['Sunomono', 'Carpaccio', 'Ceviche', 'Temaki'],
                              'Pratos Quentes': ['Yakisoba', 'Teppanyaki', 'Tempurá', 'Gyoza'],
                              'Sushi': ['Sashimi', 'Nigiri', 'Combinados', 'Hot Roll'],
                              'Bebidas': ['Refrigerantes', 'Sucos', 'Cervejas', 'Saquê'],
                              'Sobremesas': ['Dorayaki', 'Mochi', 'Tempurá de Sorvete'],
                              'Especiais': ['Omakase', 'Festival', 'Promoções']
                            };
                            
                            const currentGroupCategories = groupCategories[selectedGroup] || [];
                            
                            return categories
                              .filter((c) => c.active && currentGroupCategories.includes(c.name))
                              .map((category) => {
                                const Icon = categoryIcons[category.name] || Package;
                                return (
                                  <Button
                                    key={category.id}
                                    onClick={() => setSelectedCategory(category.id)}
                                    className={`${selectedCategory === category.id ? 'bg-orange-600' : 'bg-gray-700'} hover:bg-orange-700`}
                                  >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {category.name}
                                  </Button>
                                );
                              });
                          })()}
                        </div>
                        
                        <ScrollArea className="h-[400px]">
                          <div className="grid grid-cols-2 gap-2">
                            {filteredItems.map((item) => (
                              <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card
                                  className="bg-gray-800 border-gray-700 hover:bg-gray-700 cursor-pointer transition-all"
                                  onClick={() => handleAddItem(item)}
                                >
                                  <CardContent className="p-3">
                                    <div className="font-medium text-white text-sm">
                                      {item.name}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      Código: {item.id}
                                    </div>
                                    <div className="font-bold text-orange-400 mt-2">
                                      {formatCurrency(item.price || 0)}
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Numpad e Produtos Favoritos */}
          <div className="w-96 p-4 flex flex-col gap-4">
            {/* Produtos Favoritos */}
            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  Produtos Favoritos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-2 gap-2">
                    {items.slice(0, 8).map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          onClick={() => {
                            setInputValue(item.id.toString());
                            setQuantity("1");
                            handleAddItem(item);
                          }}
                          className="h-16 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-orange-700 hover:to-orange-800 flex flex-col items-center justify-center p-2 transition-all"
                        >
                          <span className="text-xs font-medium truncate w-full">
                            {item.name}
                          </span>
                          {item.price && (
                            <span className="text-xs text-orange-300 mt-1">
                              {formatCurrency(item.price)}
                            </span>
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* Numpad Melhorado */}
            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400 flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Teclado Numérico
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-2">
                  {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(num => (
                    <motion.div
                      key={num}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => handleNumpadClick(num.toString())}
                        className="h-14 text-xl bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                      >
                        {num}
                      </Button>
                    </motion.div>
                  ))}
                  
                  <Button
                    onClick={handleClear}
                    className="h-14 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                  >
                    C
                  </Button>
                  <Button
                    onClick={() => handleNumpadClick("0")}
                    className="h-14 text-xl bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                  >
                    0
                  </Button>
                  <Button
                    onClick={handleBackspace}
                    className="h-14 bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700"
                  >
                    ←
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={handleClear}
                      className="h-14 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-lg"
                    >
                      <X className="h-6 w-6" />
                      Limpar
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={() => handleAddItem()}
                      className="h-14 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg"
                    >
                      <Check className="h-6 w-6" />
                      Adicionar
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer com mais informações */}
        <div className="bg-gray-900/80 backdrop-blur border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex gap-4">
            <span>Terminal: POS-001</span>
            <span>Operador: Admin</span>
            <span>Pedido: #{currentOrder?.order_number || 'Novo'}</span>
          </div>
          <div className="flex gap-4">
            <span>{format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</span>
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
      </div>
    );
  }

  // TELA 3: HISTÓRICO DE VENDAS
  if (screen === 'history') {
    return (
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

  return null;
}