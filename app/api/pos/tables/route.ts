import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// OPTIONS - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

// GET - Listar todas as mesas com status real do POS
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Buscar todas as mesas ativas do restaurante
    const { data: tables, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('active', true)
      .order('number')
    
    if (error) throw error

    // Buscar todas as sessões ativas (mesas abertas no POS)
    const { data: sessions, error: sessionsError } = await supabase
      .from('table_sessions')
      .select(`
        *,
        orders(
          id,
          items,
          total,
          status,
          created_at
        )
      `)
      .eq('status', 'active')

    if (sessionsError) throw sessionsError

    // Formatar resposta com informações completas de cada mesa
    const formattedTables = (tables || []).map(table => {
      // Encontrar sessão ativa para esta mesa
      const activeSession = sessions?.find(
        session => session.table_id === table.id
      )
      
      // Determinar tipo de mesa (Mesa ou Balcão)
      const tableNumber = parseInt(table.number)
      const displayName = tableNumber > 100 
        ? `Balcão ${table.number}` 
        : table.name || `Mesa ${table.number}`
      
      // Calcular total de pedidos se houver sessão ativa
      let totalValue = 0
      let orderCount = 0
      if (activeSession) {
        totalValue = activeSession.total_price || 0
        orderCount = activeSession.orders?.length || 0
        
        // Se houver pedidos, somar o total real dos pedidos
        if (activeSession.orders && activeSession.orders.length > 0) {
          const ordersTotal = activeSession.orders.reduce((sum: number, order: any) => 
            sum + (order.total || 0), 0
          )
          if (ordersTotal > totalValue) {
            totalValue = ordersTotal
          }
        }
      }
      
      return {
        // Informações da mesa
        id: table.id,
        number: table.number,
        name: displayName,
        capacity: table.capacity || 4,
        isCounter: tableNumber > 100,
        
        // Status atual
        status: activeSession ? 'occupied' : 'available',
        
        // Informações da sessão (se houver)
        session: activeSession ? {
          id: activeSession.id,
          opened_at: activeSession.opened_at,
          attendance_type: activeSession.attendance_type || 'À La Carte',
          number_of_people: activeSession.number_of_people || 1,
          total: totalValue,
          order_count: orderCount,
          orders: activeSession.orders || []
        } : null
      }
    })

    // Estatísticas gerais
    const stats = {
      total: formattedTables.length,
      available: formattedTables.filter(t => t.status === 'available').length,
      occupied: formattedTables.filter(t => t.status === 'occupied').length,
      total_revenue: formattedTables.reduce((sum, t) => 
        sum + (t.session?.total || 0), 0
      )
    }

    const response = NextResponse.json({
      success: true,
      tables: formattedTables,
      stats,
      timestamp: new Date().toISOString()
    })
    
    // Adicionar headers CORS
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  } catch (error: any) {
    console.error('Erro ao buscar mesas do POS:', error)
    const response = NextResponse.json({ 
      success: false,
      error: 'Erro ao buscar mesas',
      message: error.message 
    }, { status: 500 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }
}