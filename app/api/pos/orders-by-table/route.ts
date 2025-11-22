import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// OPTIONS - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  return response
}

// GET - Buscar pedidos de uma mesa específica
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const table_id = searchParams.get('table_id')
    
    if (!table_id) {
      const response = NextResponse.json({
        success: false,
        error: 'ID da mesa obrigatório'
      }, { status: 400 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Buscar TODOS os pedidos ativos da mesa (não depende de sessão)
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('table_id', table_id)
      .in('status', ['pending', 'confirmed', 'preparing'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar pedidos da mesa:', error)
      const response = NextResponse.json({
        success: false,
        error: 'Erro ao buscar pedidos',
        message: error.message
      }, { status: 500 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    console.log(`✅ Pedidos da mesa ${table_id}:`, orders?.length || 0, 'pedido(s)')
    
    const response = NextResponse.json({
      success: true,
      orders: orders || [],
      total: orders?.length || 0
    })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  } catch (error: any) {
    console.error('Erro ao buscar pedidos da mesa:', error)
    const response = NextResponse.json({ 
      success: false,
      error: 'Erro ao buscar pedidos',
      message: error.message 
    }, { status: 500 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }
}