"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const supabase = createClient();

interface Item {
  id: number;
  name: string;
  description?: string | null;
  price: number | null;
  category_id: number;
  available: boolean;
  active: boolean;
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

type Screen = 'tables' | 'session' | 'payment';

export default function POSPage() {
  // Estados principais
  const [screen, setScreen] = useState<Screen>('tables');
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  
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
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'pix'>('cash');
  const [closeSessionDialog, setCloseSessionDialog] = useState(false);
  
  // Refs
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadTables, 30000);
    return () => clearInterval(interval);
  }, []);

  // Focar no input quando voltar para sessão
  useEffect(() => {
    if (screen === 'session' && codeInputRef.current) {
      setTimeout(() => codeInputRef.current?.focus(), 100);
    }
  }, [screen]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadTables(), loadItems()]);
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async () => {
    try {
      // Carregar mesas com sessões abertas
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

      // Processar dados das mesas
      const processedTables = (tablesData || []).map((table: any) => ({
        ...table,
        current_session: table.current_session?.find((s: any) => s.status === 'open')
      }));

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
        .select('*')
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

  const loadSessionDetails = async (tableId: number) => {
    try {
      // Carregar pedidos da sessão
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
        // Se não há pedido, criar carrinho vazio
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
      // Mesa já tem sessão aberta
      setCurrentSession(table.current_session);
      await loadSessionDetails(table.id);
      setScreen('session');
    } else {
      // Abrir diálogo para nova sessão
      setOpenTableDialog(true);
      setCustomerCount("1");
    }
  };

  const handleOpenTable = async () => {
    if (!selectedTable) return;
    
    setLoading(true);
    try {
      // Criar nova sessão
      const { data: sessionData, error: sessionError } = await supabase
        .from('table_sessions')
        .insert({
          table_id: selectedTable.id,
          status: 'open',
          customer_count: parseInt(customerCount) || 1,
          opened_at: new Date().toISOString(),
          total: 0
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Atualizar status da mesa
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
      
      // Recarregar mesas
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

  const handleAddItem = () => {
    if (!inputValue) {
      toast.error("Digite o código do produto");
      return;
    }

    // Buscar item por código ou nome
    const item = items.find(i => 
      i.id.toString() === inputValue || 
      i.name.toLowerCase().includes(inputValue.toLowerCase())
    );

    if (!item) {
      toast.error("Produto não encontrado");
      return;
    }

    if (!item.price) {
      toast.error("Produto sem preço definido");
      return;
    }

    const qty = parseInt(quantity) || 1;
    
    // Adicionar ao carrinho
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

    toast.success(`${item.name} adicionado`);
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
        // Atualizar pedido existente
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

        // Adicionar novos itens
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
        // Criar novo pedido
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

        // Adicionar itens do pedido
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

      // Atualizar total da sessão
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
      
      // Registrar pagamento
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

      // Atualizar status do pedido
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

      // Fechar sessão
      const { error: sessionError } = await supabase
        .from('table_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          final_total: total
        })
        .eq('id', currentSession.id);

      if (sessionError) throw sessionError;

      // Liberar mesa
      const { error: tableError } = await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', selectedTable.id);

      if (tableError) throw tableError;

      toast.success(`Mesa ${selectedTable.number} fechada com sucesso`);
      
      // Limpar estado e voltar para tela de mesas
      setPaymentDialog(false);
      setCart([]);
      setCurrentOrder(null);
      setCurrentSession(null);
      setSelectedTable(null);
      setScreen('tables');
      
      // Recarregar mesas
      await loadTables();
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
      // Cancelar pedidos pendentes
      if (currentOrder) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', currentOrder.id);
      }

      // Fechar sessão
      await supabase
        .from('table_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          final_total: 0,
          notes: 'Sessão cancelada sem consumo'
        })
        .eq('id', currentSession.id);

      // Liberar mesa
      await supabase
        .from('restaurant_tables')
        .update({ status: 'available' })
        .eq('id', selectedTable.id);

      toast.success(`Mesa ${selectedTable.number} liberada`);
      
      // Limpar e voltar
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Carregando sistema...</span>
        </div>
      </div>
    );
  }

  // TELA 1: SELEÇÃO DE MESAS
  if (screen === 'tables') {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ComideX POS</h1>
            <p className="text-gray-400">Selecione uma mesa para iniciar</p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Mesas Abertas</p>
                    <p className="text-2xl font-bold text-white">
                      {tables.filter(t => t.current_session).length}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Mesas Livres</p>
                    <p className="text-2xl font-bold text-white">
                      {tables.filter(t => !t.current_session).length}
                    </p>
                  </div>
                  <Home className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total de Mesas</p>
                    <p className="text-2xl font-bold text-white">
                      {tables.length}
                    </p>
                  </div>
                  <Receipt className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Hora Atual</p>
                    <p className="text-2xl font-bold text-white">
                      {format(new Date(), 'HH:mm')}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grid de Mesas */}
          <div className="grid grid-cols-6 gap-4">
            {tables.map(table => (
              <Card
                key={table.id}
                className={`
                  cursor-pointer transition-all hover:scale-105
                  ${table.current_session 
                    ? 'bg-orange-900/30 border-orange-600 hover:bg-orange-900/40' 
                    : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}
                `}
                onClick={() => handleSelectTable(table)}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-2">
                    {table.type === 'counter' ? (
                      <User className="h-8 w-8 mx-auto text-white" />
                    ) : (
                      <Home className="h-8 w-8 mx-auto text-white" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {table.type === 'counter' ? 'Balcão' : 'Mesa'} {table.number}
                  </h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Capacidade: {table.capacity}
                  </p>
                  
                  {table.current_session ? (
                    <>
                      <Badge className="bg-orange-600 text-white mb-2">
                        OCUPADA
                      </Badge>
                      <div className="text-xs text-gray-300 mt-2">
                        <p>Pessoas: {table.current_session.customer_count}</p>
                        <p>Total: {formatCurrency(table.current_session.total)}</p>
                        <p>Desde: {format(new Date(table.current_session.opened_at), 'HH:mm')}</p>
                      </div>
                    </>
                  ) : (
                    <Badge className="bg-green-600 text-white">
                      LIVRE
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Botão Voltar */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 text-lg"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Voltar ao Menu Principal
            </Button>
          </div>
        </div>

        {/* Dialog Abrir Mesa */}
        <Dialog open={openTableDialog} onOpenChange={setOpenTableDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700">
            <DialogHeader>
              <DialogTitle>Abrir {selectedTable?.type === 'counter' ? 'Balcão' : 'Mesa'} {selectedTable?.number}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Informe a quantidade de pessoas
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
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

  // TELA 2: SESSÃO/PEDIDOS
  if (screen === 'session') {
    return (
      <div className="h-screen bg-gray-800 text-white flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
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
            {cart.length === 0 ? (
              <Button
                onClick={() => setCloseSessionDialog(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                <X className="mr-2 h-4 w-4" />
                Fechar Mesa Vazia
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSaveOrder}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Salvar Pedido
                </Button>
                <Button
                  onClick={() => setPaymentDialog(true)}
                  disabled={loading || cart.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Receber Pagamento
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Carrinho */}
          <div className="flex-1 flex flex-col p-4">
            {/* Input Section */}
            <Card className="bg-gray-900 border-gray-700 mb-4">
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
                    <label className="text-xs text-gray-400 mb-1 block">Qtd</label>
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

            {/* Lista de Itens */}
            <Card className="flex-1 bg-gray-900 border-gray-700 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Itens do Pedido</span>
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
                      <p className="text-sm mt-2">Adicione produtos usando o código ou nome</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((item, index) => (
                        <Card key={index} className="bg-gray-800 border-gray-700">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-white">
                                  {item.item?.name || `Produto ${item.item_id}`}
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
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Totais */}
                {cart.length > 0 && (
                  <>
                    <div className="border-t border-gray-700 my-4" />
                    <div className="space-y-2">
                      <div className="flex justify-between text-xl">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between text-2xl font-bold text-orange-400">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Numpad e Produtos Rápidos */}
          <div className="w-96 p-4 flex flex-col gap-4">
            {/* Numpad */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400">
                  Teclado Numérico
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-2">
                  {[7, 8, 9, 4, 5, 6, 1, 2, 3].map(num => (
                    <Button
                      key={num}
                      onClick={() => handleNumpadClick(num.toString())}
                      className="h-14 text-xl bg-gray-700 hover:bg-gray-600"
                    >
                      {num}
                    </Button>
                  ))}
                  
                  <Button
                    onClick={handleClear}
                    className="h-14 bg-gray-700 hover:bg-gray-600"
                  >
                    C
                  </Button>
                  <Button
                    onClick={() => handleNumpadClick("0")}
                    className="h-14 text-xl bg-gray-700 hover:bg-gray-600"
                  >
                    0
                  </Button>
                  <Button
                    onClick={handleBackspace}
                    className="h-14 bg-gray-700 hover:bg-gray-600"
                  >
                    ←
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button
                    onClick={handleClear}
                    className="h-14 bg-red-600 hover:bg-red-700 text-lg"
                  >
                    <X className="h-6 w-6" />
                    Limpar
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    className="h-14 bg-green-600 hover:bg-green-700 text-lg"
                  >
                    <Check className="h-6 w-6" />
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Produtos Mais Vendidos */}
            <Card className="bg-gray-900 border-gray-700 flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-gray-400">
                  Produtos Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <ScrollArea className="h-[200px]">
                  <div className="grid grid-cols-2 gap-2">
                    {items.slice(0, 8).map(item => (
                      <Button
                        key={item.id}
                        onClick={() => {
                          setInputValue(item.id.toString());
                          setQuantity("1");
                          handleAddItem();
                        }}
                        className="h-16 bg-gray-700 hover:bg-gray-600 flex flex-col items-center justify-center p-2"
                      >
                        <span className="text-xs font-medium truncate w-full">
                          {item.name}
                        </span>
                        {item.price && (
                          <span className="text-xs text-gray-400 mt-1">
                            {formatCurrency(item.price)}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-gray-900 border-t border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex gap-4">
            <span>Terminal: POS-001</span>
            <span>Operador: Admin</span>
          </div>
          <div className="flex gap-4">
            <span>{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</span>
          </div>
        </div>

        {/* Dialog Pagamento */}
        <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-md">
            <DialogHeader>
              <DialogTitle>Receber Pagamento</DialogTitle>
              <DialogDescription className="text-gray-400">
                Confirme o pagamento da conta
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex justify-between items-center text-2xl font-bold">
                  <span>Total a Pagar:</span>
                  <span className="text-orange-400">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-300">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setPaymentMethod('cash')}
                    className={`h-20 flex flex-col items-center justify-center gap-2 ${
                      paymentMethod === 'cash' 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <DollarSign className="h-6 w-6" />
                    <span className="text-xs">Dinheiro</span>
                  </Button>
                  <Button
                    onClick={() => setPaymentMethod('card')}
                    className={`h-20 flex flex-col items-center justify-center gap-2 ${
                      paymentMethod === 'card' 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <CreditCard className="h-6 w-6" />
                    <span className="text-xs">Cartão</span>
                  </Button>
                  <Button
                    onClick={() => setPaymentMethod('pix')}
                    className={`h-20 flex flex-col items-center justify-center gap-2 ${
                      paymentMethod === 'pix' 
                        ? 'bg-orange-600 hover:bg-orange-700' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <Smartphone className="h-6 w-6" />
                    <span className="text-xs">PIX</span>
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">
                    Confirme o recebimento do valor total antes de finalizar
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => setPaymentDialog(false)}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handlePayment}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
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

  return null;
}