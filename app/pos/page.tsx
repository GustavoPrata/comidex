"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Clock,
  ChefHat,
  Search,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Receipt,
  DollarSign
} from "lucide-react";

const supabase = createClient();

interface RestaurantTable {
  id: string;
  number: string;
  capacity: number;
  type: 'table' | 'counter';
  active: boolean;
}

interface TableSession {
  id: string;
  table_id: string;
  status: 'active' | 'closed';
  customer_count: number;
  opened_at: string;
  closed_at: string | null;
  total: number;
  final_total: number | null;
  notes: string | null;
}

interface Item {
  id: string;
  name: string;
  price: number;
  description: string | null;
  category_id: string;
  available: boolean;
  image_url: string | null;
  category?: Category;
}

interface Category {
  id: string;
  name: string;
  active: boolean;
  sort_order: number;
}

interface OrderItem {
  item_id: string;
  item: Item;
  quantity: number;
  unit_price: number;
  total: number;
  notes?: string;
}

export default function POSPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [sessions, setSessions] = useState<Map<string, TableSession>>(new Map());
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<TableSession | null>(null);
  
  // Order management
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [customerCount, setCustomerCount] = useState(1);
  
  // UI states
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load initial data
  useEffect(() => {
    loadData();
    // Set up real-time subscription for sessions
    const subscription = supabase
      .channel('table_sessions')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'table_sessions' 
      }, handleSessionChange)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load tables
      const { data: tablesData, error: tablesError } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('active', true)
        .order('number');

      if (tablesError) throw tablesError;
      setTables(tablesData || []);

      // Load active sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('status', 'active');

      if (sessionsError) throw sessionsError;
      
      const sessionsMap = new Map();
      sessionsData?.forEach(session => {
        sessionsMap.set(session.table_id, session);
      });
      setSessions(sessionsMap);

      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order');

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('active', true)
        .eq('available', true)
        .order('name');

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionChange = (payload: any) => {
    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
      const session = payload.new as TableSession;
      if (session.status === 'active') {
        setSessions(prev => {
          const newMap = new Map(prev);
          newMap.set(session.table_id, session);
          return newMap;
        });
      } else {
        setSessions(prev => {
          const newMap = new Map(prev);
          newMap.delete(session.table_id);
          return newMap;
        });
      }
    } else if (payload.eventType === 'DELETE') {
      const session: TableSession = payload.old as TableSession;
      setSessions(prev => {
        const newMap = new Map(prev);
        newMap.delete(session.table_id);
        return newMap;
      });
    }
  };

  // Open new session
  const openSession = async () => {
    if (!selectedTable) return;
    
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('table_sessions')
        .insert({
          table_id: selectedTable.id,
          status: 'active',
          customer_count: customerCount,
          total: 0,
          opened_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Mesa ${selectedTable.number} aberta com sucesso!`);
      setIsSessionModalOpen(false);
      setSelectedTable(null);
      setCustomerCount(1);
    } catch (error) {
      console.error('Erro ao abrir sessão:', error);
      toast.error('Erro ao abrir mesa');
    } finally {
      setSaving(false);
    }
  };

  // Add item to cart
  const addToCart = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.item_id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.item_id === item.id
            ? { 
                ...cartItem, 
                quantity: cartItem.quantity + 1,
                total: (cartItem.quantity + 1) * cartItem.unit_price
              }
            : cartItem
        );
      } else {
        return [...prev, {
          item_id: item.id,
          item: item,
          quantity: 1,
          unit_price: item.price,
          total: item.price
        }];
      }
    });
    toast.success(`${item.name} adicionado ao pedido`);
  };

  // Update cart item quantity
  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(cartItem => {
        if (cartItem.item_id === itemId) {
          const newQuantity = Math.max(0, cartItem.quantity + delta);
          if (newQuantity === 0) {
            return null;
          }
          return {
            ...cartItem,
            quantity: newQuantity,
            total: newQuantity * cartItem.unit_price
          };
        }
        return cartItem;
      }).filter(Boolean) as OrderItem[];
    });
  };

  // Remove from cart
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.item_id !== itemId));
    toast.success('Item removido do pedido');
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  // Save order
  const saveOrder = async () => {
    if (!activeSession || cart.length === 0) return;

    setSaving(true);
    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          session_id: activeSession.id,
          table_id: activeSession.table_id,
          status: 'pending',
          total: calculateTotal(),
          items: cart.map(item => ({
            item_id: item.item_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
            notes: item.notes
          }))
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Update session total
      const newTotal = activeSession.total + calculateTotal();
      const { error: sessionError } = await supabase
        .from('table_sessions')
        .update({ total: newTotal })
        .eq('id', activeSession.id);

      if (sessionError) throw sessionError;

      // Update local state
      setActiveSession(prev => prev ? { ...prev, total: newTotal } : null);
      setCart([]);
      
      toast.success('Pedido enviado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
      toast.error('Erro ao enviar pedido');
    } finally {
      setSaving(false);
    }
  };

  // Close session
  const closeSession = async () => {
    if (!activeSession) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('table_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          final_total: activeSession.total
        })
        .eq('id', activeSession.id);

      if (error) throw error;

      toast.success('Conta fechada com sucesso!');
      setActiveSession(null);
      setCart([]);
      setIsSessionModalOpen(false);
    } catch (error) {
      console.error('Erro ao fechar sessão:', error);
      toast.error('Erro ao fechar conta');
    } finally {
      setSaving(false);
    }
  };

  // Filter items by category and search
  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group tables by type
  const tablesByType = {
    mesa: tables.filter(t => t.type === 'table'),
    balcao: tables.filter(t => t.type === 'counter')
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Sistema POS</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {sessions.size} mesas ativas
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="text-gray-600 dark:text-gray-400"
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mesas Ocupadas</p>
                  <p className="text-2xl font-bold">{sessions.size}/{tables.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Vendas Ativas</p>
                  <p className="text-2xl font-bold">
                    R$ {Array.from(sessions.values()).reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Clientes</p>
                  <p className="text-2xl font-bold">
                    {Array.from(sessions.values()).reduce((sum, s) => sum + s.customer_count, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Taxa Ocupação</p>
                  <p className="text-2xl font-bold">
                    {Math.round((sessions.size / tables.length) * 100)}%
                  </p>
                </div>
                <ChefHat className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        <div className="space-y-6">
          {/* Regular Tables */}
          {tablesByType.mesa.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-500" />
                Mesas
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {tablesByType.mesa.map((table) => {
                  const session = sessions.get(table.id);
                  const isOccupied = !!session;
                  
                  return (
                    <Card
                      key={table.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                        isOccupied 
                          ? 'bg-orange-50 dark:bg-orange-950 border-orange-300 dark:border-orange-700' 
                          : 'bg-white dark:bg-gray-900 hover:border-green-400'
                      }`}
                      onClick={() => {
                        setSelectedTable(table);
                        if (session) {
                          setActiveSession(session);
                          setCart([]);
                        }
                        setIsSessionModalOpen(true);
                      }}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold mb-2">
                          {table.number}
                        </div>
                        <Badge variant={isOccupied ? "default" : "outline"} className="mb-2">
                          {table.capacity} lugares
                        </Badge>
                        {isOccupied && session && (
                          <div className="space-y-1 mt-2">
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {session.customer_count} pessoas
                            </p>
                            <p className="text-sm font-bold text-orange-600">
                              R$ {session.total.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(session.opened_at).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        )}
                        {!isOccupied && (
                          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                            Disponível
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Counter Seats */}
          {tablesByType.balcao.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-blue-500" />
                Balcão
              </h2>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                {tablesByType.balcao.map((table) => {
                  const session = sessions.get(table.id);
                  const isOccupied = !!session;
                  
                  return (
                    <Card
                      key={table.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                        isOccupied 
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700' 
                          : 'bg-white dark:bg-gray-900 hover:border-green-400'
                      }`}
                      onClick={() => {
                        setSelectedTable(table);
                        if (session) {
                          setActiveSession(session);
                          setCart([]);
                        }
                        setIsSessionModalOpen(true);
                      }}
                    >
                      <CardContent className="p-3 text-center">
                        <div className="text-2xl font-bold text-blue-500">
                          {table.number}
                        </div>
                        {isOccupied && session && (
                          <div className="mt-1">
                            <p className="text-xs font-bold text-blue-600">
                              R$ {session.total.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Management Modal */}
      <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {selectedTable?.type === 'table' ? 'Mesa' : 'Balcão'} {selectedTable?.number}
                {activeSession && (
                  <Badge className="ml-2 bg-orange-500">
                    R$ {activeSession.total.toFixed(2)}
                  </Badge>
                )}
              </span>
              {activeSession && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  Aberta às {new Date(activeSession.opened_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              )}
            </DialogTitle>
            <DialogDescription>
              {activeSession 
                ? 'Gerencie o pedido desta mesa'
                : 'Abra uma nova sessão para esta mesa'
              }
            </DialogDescription>
          </DialogHeader>

          {!activeSession ? (
            // Open new session form
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quantidade de Clientes
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setCustomerCount(Math.max(1, customerCount - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={customerCount}
                    onChange={(e) => setCustomerCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center"
                    min="1"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setCustomerCount(customerCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsSessionModalOpen(false);
                  setSelectedTable(null);
                }}>
                  Cancelar
                </Button>
                <Button 
                  onClick={openSession}
                  disabled={saving}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Abrindo...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Abrir Mesa
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            // Active session management
            <div className="flex flex-col h-[calc(90vh-120px)]">
              <Tabs defaultValue="products" className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="products">Produtos</TabsTrigger>
                  <TabsTrigger value="cart">
                    Carrinho ({cart.length})
                    {cart.length > 0 && (
                      <Badge className="ml-2 bg-orange-500">
                        R$ {calculateTotal().toFixed(2)}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="flex-1 overflow-hidden">
                  <div className="flex gap-4 h-full">
                    {/* Categories sidebar */}
                    <div className="w-48 space-y-2">
                      <Button
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory('all')}
                      >
                        Todos
                      </Button>
                      {categories.map(category => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>

                    {/* Products grid */}
                    <div className="flex-1 overflow-hidden">
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Buscar produtos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <ScrollArea className="h-[calc(100%-60px)]">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {filteredItems.map(item => (
                            <Card
                              key={item.id}
                              className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                              onClick={() => addToCart(item)}
                            >
                              <CardContent className="p-3">
                                {item.image_url && (
                                  <div className="h-24 mb-2 rounded overflow-hidden bg-gray-100">
                                    <img 
                                      src={item.image_url} 
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <h4 className="font-medium text-sm mb-1 line-clamp-2">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                  {item.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-green-600">
                                    R$ {item.price.toFixed(2)}
                                  </span>
                                  <Plus className="h-5 w-5 text-gray-400" />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="cart" className="flex-1 overflow-hidden">
                  <div className="h-full flex flex-col">
                    {cart.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Carrinho vazio</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Adicione produtos para começar o pedido
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ScrollArea className="flex-1">
                          <div className="space-y-2">
                            {cart.map(item => (
                              <Card key={item.item_id}>
                                <CardContent className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium">{item.item.name}</h4>
                                      <p className="text-sm text-gray-500">
                                        R$ {item.unit_price.toFixed(2)} cada
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => updateCartQuantity(item.item_id, -1)}
                                        className="h-8 w-8"
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="w-8 text-center font-medium">
                                        {item.quantity}
                                      </span>
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => updateCartQuantity(item.item_id, 1)}
                                        className="h-8 w-8"
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => removeFromCart(item.item_id)}
                                        className="h-8 w-8 text-red-500"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                      <div className="ml-4 text-right">
                                        <p className="font-bold">
                                          R$ {item.total.toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>

                        <div className="border-t pt-4 space-y-4">
                          <div className="flex justify-between text-xl font-bold">
                            <span>Total do Pedido:</span>
                            <span className="text-green-600">
                              R$ {calculateTotal().toFixed(2)}
                            </span>
                          </div>
                          <Button
                            className="w-full bg-green-500 hover:bg-green-600"
                            size="lg"
                            onClick={saveOrder}
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Enviar Pedido
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className="border-t pt-4">
                <Button variant="outline" onClick={() => {
                  setIsSessionModalOpen(false);
                  setSelectedTable(null);
                  setActiveSession(null);
                  setCart([]);
                }}>
                  Voltar
                </Button>
                <Button
                  variant="destructive"
                  onClick={closeSession}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Fechando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Fechar Conta
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}