"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  Activity,
  Clock,
  ChefHat,
  Utensils,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Printer
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface DashboardStats {
  todaySales: number;
  activeTables: number;
  totalTables: number;
  totalOrders: number;
  totalItems: number;
  totalCategories: number;
  activePrinters: number;
  unavailableItems: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    activeTables: 0,
    totalTables: 0,
    totalOrders: 0,
    totalItems: 0,
    totalCategories: 0,
    activePrinters: 0,
    unavailableItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const supabase = createClient();

  useEffect(() => {
    loadDashboardData();
    
    // Atualizar relógio a cada minuto
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Total de mesas
      const { data: tablesData } = await supabase
        .from('restaurant_tables')
        .select('id, active')
        .eq('active', true);
      
      // Total de itens
      const { data: itemsData } = await supabase
        .from('items')
        .select('id, available, active')
        .eq('active', true);
      
      // Total de categorias
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id')
        .eq('active', true);

      // Total de impressoras
      const { data: printersData } = await supabase
        .from('printers')
        .select('id')
        .eq('active', true);
      
      // Mesas com sessões ativas
      const { data: sessionsData } = await supabase
        .from('table_sessions')
        .select('id, total')
        .eq('status', 'active');
      
      // Calcular vendas do dia (sessões ativas)
      const todaySales = sessionsData?.reduce((sum: number, s: any) => sum + (s.total || 0), 0) || 0;
      
      // Itens indisponíveis
      const unavailableItems = itemsData?.filter((item: any) => !item.available).length || 0;
      
      setStats({
        todaySales,
        activeTables: sessionsData?.length || 0,
        totalTables: tablesData?.length || 0,
        totalOrders: sessionsData?.length || 0,
        totalItems: itemsData?.length || 0,
        totalCategories: categoriesData?.length || 0,
        activePrinters: printersData?.length || 0,
        unavailableItems
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const statsCards = [
    {
      title: "Vendas Ativas",
      value: formatCurrency(stats.todaySales),
      subtitle: `${stats.activeTables} mesas ocupadas`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950"
    },
    {
      title: "Mesas",
      value: `${stats.activeTables}/${stats.totalTables}`,
      subtitle: `${Math.round((stats.activeTables / stats.totalTables) * 100) || 0}% ocupação`,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950"
    },
    {
      title: "Cardápio",
      value: stats.totalItems,
      subtitle: `${stats.totalCategories} categorias`,
      icon: Utensils,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950"
    },
    {
      title: "Impressoras",
      value: stats.activePrinters,
      subtitle: "Ativas",
      icon: Printer,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950"
    }
  ];

  const quickActions = [
    { 
      title: "Novo Pedido", 
      icon: ShoppingCart, 
      href: "/pos",
      color: "text-orange-500",
      description: "Abrir tela do caixa"
    },
    { 
      title: "Gerenciar Mesas", 
      icon: Users, 
      href: "/admin/tables",
      color: "text-blue-500",
      description: "Configurar mesas"
    },
    { 
      title: "Cardápio", 
      icon: Utensils, 
      href: "/admin/items",
      color: "text-green-500",
      description: "Editar produtos"
    },
    { 
      title: "Impressoras", 
      icon: Printer, 
      href: "/admin/printers",
      color: "text-purple-500",
      description: "Configurar impressão"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header com efeito glassmorphism */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <ChefHat className="h-8 w-8 text-orange-500" />
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 text-transparent bg-clip-text">
                  Dashboard ComideX
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })} - {currentTime.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {stats.unavailableItems > 0 ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    {stats.unavailableItems} itens em falta
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Sistema operacional
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 hover:scale-105"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    {index === 0 && (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {stat.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions e Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-orange-500" />
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <a
                      key={index}
                      href={action.href}
                      className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all duration-200 hover:scale-105 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-900 rounded-xl group-hover:shadow-md transition-shadow">
                          <Icon className={`h-5 w-5 ${action.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Restaurant Status */}
          <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-orange-500" />
                Status do Restaurante
              </h2>
              
              <div className="space-y-4">
                {/* Ocupação */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Taxa de Ocupação</span>
                    <span className="text-lg font-bold text-orange-600">
                      {Math.round((stats.activeTables / stats.totalTables) * 100) || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white dark:bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.activeTables / stats.totalTables) * 100 || 0}%` }}
                    />
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-2xl font-bold text-orange-500">{stats.totalOrders}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Pedidos Hoje</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-2xl font-bold text-blue-500">25min</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Tempo Médio</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                    <p className="text-2xl font-bold text-green-500">98%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Satisfação</p>
                  </div>
                </div>

                {/* Horário de Funcionamento */}
                <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 text-center">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">
                    🟢 Restaurante Aberto
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Horário: 18:00 - 23:00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}