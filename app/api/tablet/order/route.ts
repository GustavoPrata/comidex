import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { table_id, items, status = 'pending', total } = data

    // Buscar sessão ativa da mesa
    const { data: session, error: sessionError } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('table_id', table_id)
      .eq('status', 'active')
      .single()

    let sessionId = session?.id

    // Se não houver sessão ativa, criar uma nova
    if (!session) {
      const { data: newSession, error: createError } = await supabase
        .from('table_sessions')
        .insert({
          table_id,
          status: 'active',
          opened_at: new Date().toISOString(),
          total: 0,
          discount_amount: 0
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      sessionId = newSession.id
    }

    // Criar pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_id,
        session_id: sessionId,
        status,
        total,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orderError) {
      throw orderError
    }

    // Adicionar itens do pedido e enviar para impressão
    for (const item of items) {
      // Adicionar item
      await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          observation: item.observation || null
        })

      // Buscar produto para pegar a impressora
      const { data: product } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('id', item.product_id)
        .single()

      if (product && product.printer_id) {
        // Enviar para fila de impressão
        await supabase
          .from('printer_queue')
          .insert({
            printer_id: product.printer_id,
            content: `Mesa ${table_id}\n${product.name} x${item.quantity}${item.observation ? '\n' + item.observation : ''}`,
            document_type: 'kitchen_order',
            document_data: JSON.stringify({
              table_id,
              product_id: item.product_id,
              product_name: product.name,
              quantity: item.quantity,
              observation: item.observation
            }),
            status: 'pending'
          })
      }
    }

    // Atualizar total da sessão
    const { data: updatedTotal } = await supabase
      .from('table_sessions')
      .select('total')
      .eq('id', sessionId)
      .single()

    const newTotal = (updatedTotal?.total || 0) + total

    await supabase
      .from('table_sessions')
      .update({ total: newTotal })
      .eq('id', sessionId)

    return NextResponse.json({ 
      success: true, 
      order: { ...order, items },
      session_id: sessionId
    })
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao criar pedido' },
      { status: 500 }
    )
  }
}