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
import {
  Users,
  ShoppingCart,
  Plus,
  Minus,
  CreditCard,
  Clock,
  Loader2,
  CheckCircle,
  DollarSign
} from "lucide-react";

const supabase = createClient();

interface RestaurantTable {
  id: number;
  number: string;
  capacity: number;
  type?: string;
  active: boolean;
}

interface TableSession {
  id: number;
  table_id: number;
  status: string;
  customer_count: number;
  opened_at: string;
  closed_at?: string;
  total: number;
  final_total?: number;
}

interface Item {
  id: number;
  name: string;
  price: number;
  description?: string;
  category_id?: number;
  available: boolean;
}

interface Category {
  id: number;
  name: string;
  active: boolean;
}

export default function POSPage() {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [sessions, setSessions] = useState<Map<number, TableSession>>(new Map());
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<TableSession | null>(null);
  
  // Order management
  const [cart, setCart] = useState<{ item: Item; quantity: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [customerCount, setCustomerCount] = useState(1);
  
  // UI states
  const [saving, setSaving] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load tables
      const { data: tablesData } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('active', true)
        .order('number');

      setTables(tablesData || []);

      // Load active sessions
      const { data: sessionsData } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('status', 'active');

      const sessionsMap = new Map<number, TableSession>();
      sessionsData?.forEach(session => {
        sessionsMap.set(session.table_id, session);
      });
      setSessions(sessionsMap);

      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true);

      setCategories(categoriesData || []);

      // Load items
      const { data: itemsData } = await supabase
        .from('items')
        .select('*')
        .eq('active', true)
        .eq('available', true);

      setItems(itemsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
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
          total: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Mesa ${selectedTable.number} aberta com sucesso!`);
      setIsSessionModalOpen(false);
      setSelectedTable(null);
      setCustomerCount(1);
      await loadData();
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
      const existing = prev.find(cartItem => cartItem.item.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { item, quantity: 1 }];
      }
    });
    toast.success(`${item.name} adicionado ao pedido`);
  };

  // Calculate total
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0);
  };

  // Save order
  const saveOrder = async () => {
    if (!activeSession || cart.length === 0) return;

    setSaving(true);
    try {
      // Update session total
      const newTotal = activeSession.total + calculateTotal();
      const { error } = await supabase
        .from('table_sessions')
        .update({ total: newTotal })
        .eq('id', activeSession.id);

      if (error) throw error;

      setCart([]);
      toast.success('Pedido enviado com sucesso!');
      await loadData();
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
      await loadData();
    } catch (error) {
      console.error('Erro ao fechar sessão:', error);
      toast.error('Erro ao fechar conta');
    } finally {
      setSaving(false);
    }
  };

  // Filter items by category
  const filteredItems = selectedCategory 
    ? items.filter(item => item.category_id === selectedCategory)
    : items;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold">Sistema POS</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-500">
              {sessions.size} mesas ativas
            </Badge>
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/'}
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mesas Ocupadas</p>
                  <p className="text-2xl font-bold">{sessions.size}/{tables.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vendas Ativas</p>
                  <p className="text-2xl font-bold">
                    R$ {Array.from(sessions.values()).reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold">
                    {Array.from(sessions.values()).reduce((sum, s) => sum + s.customer_count, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa Ocupação</p>
                  <p className="text-2xl font-bold">
                    {tables.length > 0 ? Math.round((sessions.size / tables.length) * 100) : 0}%
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {tables.map((table) => {
            const session = sessions.get(table.id);
            const isOccupied = !!session;
            
            return (
              <Card
                key={table.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isOccupied 
                    ? 'bg-orange-50 dark:bg-orange-950 border-orange-300' 
                    : 'bg-white dark:bg-gray-800'
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
                  <Badge variant={isOccupied ? "default" : "outline"}>
                    {table.capacity} lugares
                  </Badge>
                  {isOccupied && session && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">
                        {session.customer_count} pessoas
                      </p>
                      <p className="text-sm font-bold text-orange-600">
                        R$ {session.total.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {!isOccupied && (
                    <p className="text-sm text-green-600 mt-2">
                      Disponível
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Session Management Modal */}
      <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Mesa {selectedTable?.number}
              {activeSession && (
                <Badge className="ml-2 bg-orange-500">
                  R$ {activeSession.total.toFixed(2)}
                </Badge>
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
            <div className="flex flex-col h-[60vh]">
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

                <TabsContent value="products" className="flex-1 overflow-auto">
                  <div className="mb-4">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(null)}
                      >
                        Todos
                      </Button>
                      {categories.map(category => (
                        <Button
                          key={category.id}
                          size="sm"
                          variant={selectedCategory === category.id ? 'default' : 'outline'}
                          onClick={() => setSelectedCategory(category.id)}
                        >
                          {category.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredItems.map(item => (
                      <Card
                        key={item.id}
                        className="cursor-pointer hover:shadow-lg"
                        onClick={() => addToCart(item)}
                      >
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm mb-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">
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
                </TabsContent>

                <TabsContent value="cart" className="flex-1 overflow-auto">
                  {cart.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Carrinho vazio</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.map((cartItem, index) => (
                        <Card key={index}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{cartItem.item.name}</h4>
                                <p className="text-sm text-gray-500">
                                  R$ {cartItem.item.price.toFixed(2)} x {cartItem.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  R$ {(cartItem.item.price * cartItem.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-xl font-bold mb-4">
                          <span>Total:</span>
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
                    </div>
                  )}
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