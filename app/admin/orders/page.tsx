"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ShoppingCart,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  RefreshCw,
  Download,
  MoreVertical,
  User,
  TableIcon,
  DollarSign,
  Loader2,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const supabase = createClient();

interface OrderItem {
  id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: number;
  table_number: number;
  status: string;
  created_at: string;
  total_amount: number;
  items_count: number;
  items?: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load data
  useEffect(() => {
    loadOrders();
    // Auto refresh every 10 seconds
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadOrders = async () => {
    try {
      if (!refreshing) setLoading(true);
      
      // Load orders from tablet_pedidos
      let query = supabase
        .from('tablet_pedidos')
        .select(`
          *,
          tablet_pedido_itens(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filter
      if (filter !== "all") {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data
      const transformedOrders: Order[] = (data || []).map(pedido => ({
        id: pedido.id,
        table_number: pedido.mesa || 0,
        status: pedido.status || 'open',
        created_at: pedido.created_at,
        total_amount: pedido.total || 0,
        items_count: pedido.tablet_pedido_itens?.length || 0,
        items: pedido.tablet_pedido_itens?.map((item: any) => ({
          id: item.id,
          item_name: item.item_name || 'Item',
          quantity: item.quantity || 1,
          unit_price: item.unit_price || 0,
          total_price: item.total_price || 0
        }))
      }));

      setOrders(transformedOrders);
      
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh orders
  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  // Calculate statistics
  const stats = {
    openTables: orders.filter(o => o.status === 'open').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalAmount: orders.reduce((sum, o) => sum + o.total_amount, 0)
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-blue-500 text-white">Aberto</Badge>;
      case 'preparing':
        return <Badge className="bg-orange-500 text-white">Preparando</Badge>;
      case 'ready':
        return <Badge className="bg-green-500 text-white">Pronto</Badge>;
      case 'delivered':
        return <Badge variant="secondary">Entregue</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Update order status
  const updateOrderStatus = async (order: Order, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('tablet_pedidos')
        .update({ status: newStatus })
        .eq('id', order.id);

      if (error) throw error;
      
      toast.success(`Pedido atualizado para ${newStatus}`);
      loadOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error("Erro ao atualizar pedido");
    }
  };

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Export orders
  const exportOrders = () => {
    const csv = orders.map(order => ({
      ID: order.id,
      Mesa: order.table_number,
      Status: order.status,
      Items: order.items_count,
      Total: order.total_amount,
      Data: new Date(order.created_at).toLocaleString('pt-BR')
    }));
    
    const csvString = [
      Object.keys(csv[0]).join(','),
      ...csv.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pedidos_${new Date().toISOString()}.csv`;
    a.click();
    
    toast.success("Pedidos exportados com sucesso!");
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                  <ShoppingCart className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                </div>
                Controle de Pedidos
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Monitore mesas abertas e pedidos em tempo real
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={exportOrders}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mesas Abertas</p>
                    <p className="text-xl font-bold">{stats.openTables}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Preparando</p>
                    <p className="text-xl font-bold">{stats.preparing}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prontos</p>
                    <p className="text-xl font-bold">{stats.ready}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900/20">
                    <AlertCircle className="h-5 w-5 text-gray-600 dark:text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Entregues</p>
                    <p className="text-xl font-bold">{stats.delivered}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold">R$ {stats.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Filtrar:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Abertas</SelectItem>
              <SelectItem value="preparing">Preparando</SelectItem>
              <SelectItem value="ready">Prontas</SelectItem>
              <SelectItem value="delivered">Entregues</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {orders.map((order) => (
            <Card 
              key={order.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => viewOrderDetails(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5 text-orange-500" />
                    <span className="text-lg font-bold">Mesa {order.table_number}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order, 'preparing');
                        }}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Preparando
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order, 'ready');
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Pronto
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order, 'delivered');
                        }}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Entregue
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateOrderStatus(order, 'cancelled');
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2">
                  {getStatusBadge(order.status)}
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-500">
                      {order.items_count} {order.items_count === 1 ? 'item' : 'itens'}
                    </span>
                    <span className="text-lg font-bold text-orange-500">
                      R$ {order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'Nenhum pedido encontrado' : `Nenhum pedido ${filter}`}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={(open) => setIsDetailsModalOpen(open)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Mesa {selectedOrder?.table_number} - {selectedOrder && new Date(selectedOrder.created_at).toLocaleString('pt-BR')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status:</span>
                {getStatusBadge(selectedOrder.status)}
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-semibold mb-2">Itens do Pedido</h3>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity}x R$ {item.unit_price.toFixed(2)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      R$ {item.total_price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-orange-500">
                  R$ {selectedOrder.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDetailsModalOpen(false);
              setSelectedOrder(null);
            }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}