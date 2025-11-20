import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// POST - Criar novo pedido
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { table_number, items, mode, device_id } = data

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum item no pedido' },
        { status: 400 }
      )
    }

    // Buscar ou criar sessão da mesa
    let session = null
    if (table_number) {
      // Buscar mesa
      const { data: table } = await supabase
        .from('tables')
        .select('*')
        .eq('number', table_number)
        .single()

      if (table) {
        // Buscar sessão ativa
        const { data: activeSession } = await supabase
          .from('table_sessions')
          .select('*')
          .eq('table_id', table.id)
          .eq('status', 'active')
          .single()

        if (activeSession) {
          session = activeSession
        } else {
          // Criar nova sessão
          const { data: newSession } = await supabase
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
          
          session = newSession
        }
      }
    }

    // Calcular total do pedido
    const total = items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.price) * item.quantity)
    }, 0)

    // Criar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id: session?.table_id || null,
        session_id: session?.id || null,
        status: 'pending',
        total,
        source: 'mobile',
        device_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Adicionar itens do pedido
    const orderItems = []
    for (const item of items) {
      const { data: orderItem } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          observation: item.observation || null
        })
        .select()
        .single()
      
      orderItems.push(orderItem)

      // Buscar produto para enviar para impressão
      const { data: product } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', item.product_id)
        .single()

      if (product && product.printer_id) {
        // Criar item na fila de impressão
        await supabase
          .from('printer_queue')
          .insert({
            printer_id: product.printer_id,
            content: `
================================
        NOVO PEDIDO
================================
Mesa: ${table_number || 'S/N'}
Pedido: #${order.id}
Hora: ${new Date().toLocaleTimeString('pt-BR')}
================================
${item.quantity}x ${product.name}
${item.observation ? `OBS: ${item.observation}` : ''}
================================
            `.trim(),
            document_type: 'kitchen_order',
            document_data: JSON.stringify({
              order_id: order.id,
              table_number,
              product_id: item.product_id,
              product_name: product.name,
              quantity: item.quantity,
              observation: item.observation,
              mode
            }),
            status: 'pending'
          })
      }
    }

    // Atualizar total da sessão se houver
    if (session) {
      const newTotal = (session.total || 0) + total
      await supabase
        .from('table_sessions')
        .update({ total: newTotal })
        .eq('id', session.id)
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        table_number,
        total,
        items: orderItems,
        session_id: session?.id,
        created_at: order.created_at
      },
      message: 'Pedido criado com sucesso!'
    })
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao criar pedido',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - Listar pedidos
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const table_number = searchParams.get('table_number')
    const device_id = searchParams.get('device_id')
    const session_id = searchParams.get('session_id')
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          products(name, price, image_url)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    // Filtrar por sessão se especificado
    if (session_id) {
      query = query.eq('session_id', session_id)
    }
    
    // Filtrar por device_id se especificado
    if (device_id) {
      query = query.eq('device_id', device_id)
    }

    const { data: orders, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      orders: orders || [],
      total: orders?.length || 0
    })
  } catch (error: any) {
    console.error('Erro ao buscar pedidos:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar pedidos',
        message: error.message 
      },
      { status: 500 }
    )
  }
}