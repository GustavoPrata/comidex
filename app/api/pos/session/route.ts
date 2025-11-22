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

// GET - Obter sessão ativa de uma mesa específica
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const table_number = searchParams.get('table_number')
    const session_id = searchParams.get('session_id')
    
    if (!table_number && !session_id) {
      const response = NextResponse.json({
        success: false,
        error: 'Número da mesa ou ID da sessão necessário'
      }, { status: 400 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Se passou session_id, buscar por ele
    if (session_id) {
      const { data: session, error } = await supabase
        .from('table_sessions')
        .select(`
          *,
          restaurant_tables(id, number, name),
          orders(
            id,
            items,
            total,
            status,
            created_at
          )
        `)
        .eq('id', session_id)
        .single()

      if (error || !session) {
        const response = NextResponse.json({
          success: false,
          error: 'Sessão não encontrada'
        }, { status: 404 })
        
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        return response
      }

      const response = NextResponse.json({
        success: true,
        session: formatSession(session)
      })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Buscar por número da mesa
    const { data: table } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('number', parseInt(table_number))
      .single()

    if (!table) {
      const response = NextResponse.json({
        success: false,
        error: 'Mesa não encontrada'
      }, { status: 404 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Buscar sessão ativa desta mesa
    const { data: session } = await supabase
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
      .eq('table_id', table.id)
      .eq('status', 'active')
      .single()

    if (!session) {
      const response = NextResponse.json({
        success: true,
        session: null,
        message: 'Nenhuma sessão ativa para esta mesa'
      })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    const response = NextResponse.json({
      success: true,
      session: formatSession({...session, restaurant_tables: table})
    })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  } catch (error: any) {
    console.error('Erro ao buscar sessão:', error)
    const response = NextResponse.json({ 
      success: false,
      error: 'Erro ao buscar sessão',
      message: error.message 
    }, { status: 500 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }
}

// POST - Abrir mesa (criar nova sessão) - CONTROLE TOTAL DO POS
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const data = await request.json()
    const { 
      table_number, 
      attendance_type = 'À La Carte',
      number_of_people = 1,
      service_type // Para rodízio
    } = data
    
    if (!table_number) {
      const response = NextResponse.json({
        success: false,
        error: 'Número da mesa obrigatório'
      }, { status: 400 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Buscar mesa
    const { data: table, error: tableError } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('number', parseInt(table_number))
      .single()

    if (tableError || !table) {
      const response = NextResponse.json({
        success: false,
        error: 'Mesa não encontrada'
      }, { status: 404 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Verificar se já tem sessão ativa
    const { data: existingSession } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('table_id', table.id)
      .eq('status', 'active')
      .single()

    if (existingSession) {
      const response = NextResponse.json({
        success: true,
        session: formatSession(existingSession),
        message: 'Mesa já está aberta'
      })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Criar nova sessão
    const { data: newSession, error: sessionError } = await supabase
      .from('table_sessions')
      .insert({
        table_id: table.id,
        attendance_type: service_type?.name || attendance_type,
        number_of_people,
        unit_price: service_type?.price || 0,
        total_price: 0,
        opened_at: new Date().toISOString(),
        status: 'active'
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    // Atualizar status da mesa
    await supabase
      .from('restaurant_tables')
      .update({ 
        status: 'occupied',
        occupied_since: new Date().toISOString(),
        session_id: newSession.id
      })
      .eq('id', table.id)

    // Se for rodízio, criar pedido automático
    if (service_type?.name?.toLowerCase().includes('rodízio')) {
      const { adult_count = 0, child_count = 0 } = data
      
      if (adult_count > 0 || child_count > 0) {
        const items = []
        const adultPrice = service_type.price || 89.90
        const childPrice = service_type.half_price || (adultPrice / 2)
        
        if (adult_count > 0) {
          items.push({
            name: `${service_type.name} - Adulto`,
            price: adultPrice,
            quantity: adult_count,
            category: 'Rodízio',
            observation: 'Lançado automaticamente'
          })
        }
        
        if (child_count > 0) {
          items.push({
            name: `${service_type.name} - Criança`,
            price: childPrice,
            quantity: child_count,
            category: 'Rodízio',
            observation: 'Lançado automaticamente'
          })
        }

        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        // Criar pedido
        await supabase
          .from('orders')
          .insert({
            session_id: newSession.id,
            items,
            total,
            status: 'pending',
            created_at: new Date().toISOString()
          })

        // Atualizar total da sessão
        await supabase
          .from('table_sessions')
          .update({ total_price: total })
          .eq('id', newSession.id)

        newSession.total_price = total
      }
    }

    console.log(`✅ POS: Mesa ${table_number} aberta - Sessão ${newSession.id}`)

    const response = NextResponse.json({
      success: true,
      session: formatSession(newSession),
      message: `Mesa ${table_number} aberta com sucesso`
    })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  } catch (error: any) {
    console.error('Erro ao abrir mesa:', error)
    const response = NextResponse.json({ 
      success: false,
      error: 'Erro ao abrir mesa',
      message: error.message 
    }, { status: 500 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }
}

// PUT - Fechar mesa (encerrar sessão)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const data = await request.json()
    const { session_id, payment_method = 'cash' } = data
    
    if (!session_id) {
      const response = NextResponse.json({
        success: false,
        error: 'ID da sessão obrigatório'
      }, { status: 400 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Buscar sessão
    const { data: session, error: sessionError } = await supabase
      .from('table_sessions')
      .select('*, restaurant_tables(id, number)')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      const response = NextResponse.json({
        success: false,
        error: 'Sessão não encontrada'
      }, { status: 404 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Fechar sessão
    const { data: closedSession, error: closeError } = await supabase
      .from('table_sessions')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        payment_method
      })
      .eq('id', session_id)
      .select()
      .single()

    if (closeError) throw closeError

    // Atualizar status da mesa para disponível
    await supabase
      .from('restaurant_tables')
      .update({ 
        status: 'available',
        occupied_since: null,
        session_id: null
      })
      .eq('id', session.restaurant_tables.id)

    console.log(`✅ POS: Mesa ${session.restaurant_tables.number} fechada - Sessão ${session_id}`)

    const response = NextResponse.json({
      success: true,
      session: formatSession(closedSession),
      message: `Mesa ${session.restaurant_tables.number} fechada com sucesso`
    })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  } catch (error: any) {
    console.error('Erro ao fechar mesa:', error)
    const response = NextResponse.json({ 
      success: false,
      error: 'Erro ao fechar mesa',
      message: error.message 
    }, { status: 500 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }
}

// Função auxiliar para formatar sessão
function formatSession(session: any) {
  const subtotal = session.total_price || 0
  const service_fee = subtotal * 0.1
  const total = subtotal + service_fee
  
  return {
    id: session.id,
    table_id: session.table_id,
    table_number: session.restaurant_tables?.number || null,
    status: session.status,
    opened_at: session.opened_at,
    closed_at: session.closed_at,
    attendance_type: session.attendance_type,
    number_of_people: session.number_of_people,
    subtotal,
    service_fee,
    total,
    payment_method: session.payment_method,
    orders: session.orders || []
  }
}