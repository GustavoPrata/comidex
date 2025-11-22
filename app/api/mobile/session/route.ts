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

// GET - Obter sessão ativa da mesa
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const table_number = searchParams.get('table_number')
    
    if (!table_number) {
      const response = NextResponse.json(
        { success: false, error: 'Número da mesa não fornecido' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Buscar mesa
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
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Buscar sessão ativa na tabela do POS!
    const { data: session } = await supabase
      .from('table_sessions')
      .select(`
        *,
        orders(
          *
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
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Calcular totais usando estrutura do POS
    const subtotal = session.total_price || 0
    const service_fee = subtotal * 0.1
    const discount = 0
    const total = subtotal + service_fee - discount

    const response = NextResponse.json({
      success: true,
      session: {
        id: session.id,
        table_id: session.table_id,
        table_number,
        status: session.status,
        opened_at: session.opened_at,
        closed_at: session.closed_at,
        subtotal,
        service_fee,
        discount,
        total,
        orders: session.orders || [],
        payment_method: session.payment_method,
        attendance_type: session.attendance_type,
        number_of_people: session.number_of_people
      }
    })
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  } catch (error: any) {
    console.error('Erro ao buscar sessão:', error)
    const response = NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar sessão',
        message: error.message 
      },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }
}

// POST - REMOVIDO: Tablet NUNCA cria sessões!
// A arquitetura correta é: POS é o comandante, tablet apenas lê
// Sessões são criadas APENAS pelo POS/Caixa
export async function POST(request: NextRequest) {
  // BLOQUEADO: Tablet não tem permissão para criar sessões
  return NextResponse.json(
    { 
      success: false, 
      error: 'Operação não permitida',
      message: 'O tablet não pode criar sessões. As mesas devem ser abertas pelo caixa (POS).'
    },
    { status: 403 }
  )
}

/* CÓDIGO ORIGINAL REMOVIDO - Tablet nunca deve criar sessões
 * Apenas o POS tem autoridade para abrir/fechar mesas
 * O tablet é apenas um visualizador que envia pedidos
 */