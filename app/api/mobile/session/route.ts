import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Obter sessão ativa da mesa
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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
      .from('restaurant_tables')
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
      .from('tablet_sessoes')
      .select(`
        *,
        tablet_pedidos(
          *,
          tablet_pedido_itens(
            *,
            items(name, price, image)
          )
        )
      `)
      .eq('mesa_id', table.id)
      .eq('status', 'ativa')
      .single()

    if (!session) {
      return NextResponse.json({
        success: true,
        session: null,
        message: 'Nenhuma sessão ativa para esta mesa'
      })
    }

    // Calcular totais
    const subtotal = session.valor_total || 0
    const service_fee = session.taxa_servico || (subtotal * 0.1)
    const discount = session.valor_desconto || 0
    const total = subtotal + service_fee - discount

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        table_id: session.mesa_id,
        table_number,
        status: session.status,
        opened_at: session.inicio_atendimento,
        closed_at: session.fim_atendimento,
        subtotal,
        service_fee,
        discount,
        total,
        orders: session.tablet_pedidos || [],
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
    const supabase = await createClient()
    
    const { table_number } = await request.json()
    
    if (!table_number) {
      return NextResponse.json(
        { success: false, error: 'Número da mesa não fornecido' },
        { status: 400 }
      )
    }

    // Buscar mesa
    const { data: table } = await supabase
      .from('restaurant_tables')
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
      .from('tablet_sessoes')
      .select('*')
      .eq('mesa_id', table.id)
      .eq('status', 'ativa')
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
      .from('tablet_sessoes')
      .insert({
        mesa_id: table.id,
        status: 'ativa',
        inicio_atendimento: new Date().toISOString(),
        valor_total: 0,
        valor_desconto: 0
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