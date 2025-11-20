import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obter sessão ativa da mesa
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const table_number = searchParams.get('table_number')
    
    if (!table_number) {
      return NextResponse.json(
        { success: false, error: 'Número da mesa não fornecido' },
        { status: 400 }
      )
    }

    // Buscar mesa
    const { data: table } = await supabase
      .from('tables')
      .select('*')
      .eq('number', parseInt(table_number))
      .single()

    if (!table) {
      return NextResponse.json({
        success: false,
        error: 'Mesa não encontrada'
      }, { status: 404 })
    }

    // Buscar sessão ativa
    const { data: session } = await supabase
      .from('table_sessions')
      .select(`
        *,
        orders(
          *,
          order_items(
            *,
            products(name, price, image_url)
          )
        )
      `)
      .eq('table_id', table.id)
      .eq('status', 'active')
      .single()

    if (!session) {
      return NextResponse.json({
        success: true,
        session: null,
        message: 'Nenhuma sessão ativa para esta mesa'
      })
    }

    // Calcular totais
    const subtotal = session.total || 0
    const service_fee = subtotal * 0.1
    const discount = session.discount_amount || 0
    const total = subtotal + service_fee - discount

    return NextResponse.json({
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
        payment_method: session.payment_method
      }
    })
  } catch (error: any) {
    console.error('Erro ao buscar sessão:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar sessão',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// POST - Criar nova sessão
export async function POST(request: NextRequest) {
  try {
    const { table_number } = await request.json()
    
    if (!table_number) {
      return NextResponse.json(
        { success: false, error: 'Número da mesa não fornecido' },
        { status: 400 }
      )
    }

    // Buscar mesa
    const { data: table } = await supabase
      .from('tables')
      .select('*')
      .eq('number', parseInt(table_number))
      .single()

    if (!table) {
      return NextResponse.json({
        success: false,
        error: 'Mesa não encontrada'
      }, { status: 404 })
    }

    // Verificar se já existe sessão ativa
    const { data: existingSession } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('table_id', table.id)
      .eq('status', 'active')
      .single()

    if (existingSession) {
      return NextResponse.json({
        success: true,
        session: existingSession,
        message: 'Sessão já existe para esta mesa'
      })
    }

    // Criar nova sessão
    const { data: newSession, error } = await supabase
      .from('table_sessions')
      .insert({
        table_id: table.id,
        status: 'active',
        opened_at: new Date().toISOString(),
        total: 0,
        discount_amount: 0
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      session: newSession,
      message: 'Sessão criada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao criar sessão:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao criar sessão',
        message: error.message 
      },
      { status: 500 }
    )
  }
}