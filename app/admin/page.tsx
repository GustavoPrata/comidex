"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  ChefHat,
  Utensils
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface DashboardStats {
  todaySales: number
  activeTables: number
  totalTables: number
  pendingOrders: number
  urgentOrders: number
  unavailableItems: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    activeTables: 0,
    totalTables: 0,
    pendingOrders: 0,
    urgentOrders: 0,
    unavailableItems: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Carregar estatísticas
      const today = new Date().toISOString().split('T')[0]
      
      // Vendas de hoje
      const { data: salesData } = await supabase
        .from('table_sessions')
        .select('final_total')
        .eq('status', 'closed')
        .gte('closed_at', today)
      
      const todaySales = salesData?.reduce((sum: number, s: any) => sum + (s.final_total || 0), 0) || 0
      
      // Mesas ativas
      const { data: activeTables } = await supabase
        .from('table_sessions')
        .select('id')
        .eq('status', 'active')
      
      // Total de mesas
      const { data: totalTables } = await supabase
        .from('restaurant_tables')
        .select('id')
        .eq('active', true)
      
      // Pedidos pendentes
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id, priority')
        .in('status', ['pending', 'preparing'])
      
      const urgentOrders = pendingOrders?.filter((o: any) => o.priority === 'urgent').length || 0
      
      // Itens indisponíveis
      const { data: unavailableItems } = await supabase
        .from('items')
        .select('id')
        .eq('available', false)
        .eq('active', true)
      
      setStats({
        todaySales,
        activeTables: activeTables?.length || 0,
        totalTables: totalTables?.length || 0,
        pendingOrders: pendingOrders?.length || 0,
        urgentOrders,
        unavailableItems: unavailableItems?.length || 0
      })
      
      // Atividade recente
      const { data: recentSessions } = await supabase
        .from('table_sessions')
        .select(`
          *,
          restaurant_tables (name)
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      setRecentActivity(recentSessions || [])
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: "Vendas Hoje",
      value: `R$ ${stats.todaySales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      subtitle: "+12% desde ontem",
      icon: DollarSign,
      gradient: "gradient-success",
      trend: "up"
    },
    {
      title: "Mesas Ativas",
      value: stats.activeTables,
      subtitle: `de ${stats.totalTables} mesas totais`,
      icon: Users,
      gradient: "gradient-primary",
      trend: null
    },
    {
      title: "Pedidos Pendentes",
      value: stats.pendingOrders,
      subtitle: `${stats.urgentOrders} urgentes`,
      icon: ShoppingCart,
      gradient: "gradient-accent",
      trend: null
    },
    {
      title: "Itens em Falta",
      value: stats.unavailableItems,
      subtitle: "Verificar estoque",
      icon: Package,
      gradient: "gradient-danger",
      trend: "down"
    }
  ]


  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="rounded-modern card-hover overflow-hidden relative">
              <div className={`absolute top-0 left-0 w-full h-1 ${stat.gradient}`} />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300 dark:text-gray-300">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-2xl ${stat.gradient} bg-opacity-10`}>
                  <Icon className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trend === 'up' && <TrendingUp className="h-4 w-4 text-orange-500" />}
                  {stat.trend === 'down' && <TrendingDown className="h-4 w-4 text-gray-500 dark:text-gray-500 dark:text-gray-300" />}
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {stat.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-gray-200 dark:border-gray-800 rounded-modern card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Últimas operações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-orange-100 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-xl">
                      {activity.type === 'table_opened' && <Users className="h-4 w-4 text-orange-500" />}
                      {activity.type === 'order_completed' && <ShoppingCart className="h-4 w-4 text-orange-500" />}
                      {activity.type === 'item_added' && <Package className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div>
                      <p className="font-medium">{activity.table || 'Sistema'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 dark:text-gray-300">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-gray-200 dark:border-gray-800 rounded-modern card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-orange-500" />
              Estatísticas Rápidas
            </CardTitle>
            <CardDescription>
              Resumo do desempenho do dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-100 to-orange-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Taxa de Ocupação</span>
                  <span className="text-sm font-bold text-orange-600">
                    {Math.round((stats.activeTables / stats.totalTables) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2">
                  <div 
                    className="gradient-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.activeTables / stats.totalTables) * 100}%` }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-50">
                  <Utensils className="h-5 w-5 text-orange-500 mb-2" />
                  <p className="text-2xl font-bold text-orange-500">156</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 dark:text-gray-300">Pratos servidos</p>
                </div>
                <div className="p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100">
                  <Clock className="h-5 w-5 text-orange-500 mb-2" />
                  <p className="text-2xl font-bold text-orange-500">28min</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 dark:text-gray-300">Tempo médio</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}