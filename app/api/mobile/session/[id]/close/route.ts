import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// PUT - Fechar sessão
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const params = await context.params
    const sessionId = parseInt(params.id)
    
    const body = await request.json()
    const { payment_method = 'cash', discount = 0, tip = 0 } = body

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'ID da sessão não fornecido' },
        { status: 400 }
      )
    }

    // Buscar sessão ativa
    const { data: session, error: sessionError } = await supabase
      .from('tablet_sessoes')
      .select(`
        *,
        restaurant_tables(number, name),
        tablet_pedidos(
          *,
          tablet_pedido_itens(
            *,
            items(name, price)
          )
        )
      `)
      .eq('id', sessionId)
      .eq('status', 'ativa')
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Sessão não encontrada ou já fechada' },
        { status: 404 }
      )
    }

    // Calcular totais
    const subtotal = session.valor_total || 0
    const service_fee = session.taxa_servico || (subtotal * 0.1) // 10% de taxa de serviço
    const final_total = subtotal + service_fee - discount + tip

    // Atualizar sessão para fechada
    const { data: updatedSession, error: updateError } = await supabase
      .from('tablet_sessoes')
      .update({
        status: 'finalizada',
        fim_atendimento: new Date().toISOString(),
        valor_desconto: discount,
        taxa_servico: service_fee,
        valor_gorjeta: tip,
        valor_final: final_total,
        payment_method,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) throw updateError

    // Atualizar status dos pedidos para finalizados
    if (session.tablet_pedidos?.length > 0) {
      const orderIds = session.tablet_pedidos.map((p: any) => p.id)
      await supabase
        .from('tablet_pedidos')
        .update({ status: 'finalizado' })
        .in('id', orderIds)
    }

    // Criar entrada na fila de impressão para o recibo
    const receiptContent = generateReceiptContent(session, {
      subtotal,
      service_fee,
      discount,
      tip,
      total: final_total,
      payment_method
    })

    await supabase
      .from('print_queue')
      .insert({
        type: 'receipt',
        source: 'mobile',
        order_id: session.tablet_pedidos?.[0]?.id,
        content: receiptContent,
        metadata: {
          session_id: sessionId,
          table_number: session.restaurant_tables?.number,
          payment_method,
          total: final_total
        },
        status: 'pending'
      })

    return NextResponse.json({
      success: true,
      session: {
        id: updatedSession.id,
        table_number: session.restaurant_tables?.number,
        status: 'closed',
        closed_at: updatedSession.fim_atendimento,
        subtotal,
        service_fee,
        discount,
        tip,
        total: final_total,
        payment_method,
        items_count: session.tablet_pedidos?.reduce(
          (acc: number, order: any) => 
            acc + (order.tablet_pedido_itens?.length || 0), 0
        ) || 0
      },
      message: 'Sessão fechada com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao fechar sessão:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao fechar sessão',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

function generateReceiptContent(session: any, totals: any) {
  const now = new Date()
  const items: any[] = []
  
  // Coletar todos os itens de todos os pedidos
  session.tablet_pedidos?.forEach((order: any) => {
    order.tablet_pedido_itens?.forEach((item: any) => {
      items.push({
        name: item.items?.name || 'Item',
        quantity: item.quantidade,
        price: item.preco_unitario,
        total: item.preco_total
      })
    })
  })

  // Formatar método de pagamento
  const paymentMethods: { [key: string]: string } = {
    cash: 'Dinheiro',
    credit: 'Cartão de Crédito',
    debit: 'Cartão de Débito',
    pix: 'PIX'
  }

  return `
================================
        COMPROVANTE
================================
Mesa: ${session.restaurant_tables?.number || 'S/N'}
Data: ${now.toLocaleDateString('pt-BR')}
Hora: ${now.toLocaleTimeString('pt-BR')}
Sessão: #${session.id}
================================
        ITENS
--------------------------------
${items.map(item => 
  `${item.quantity}x ${item.name}
   R$ ${item.price.toFixed(2)} = R$ ${item.total.toFixed(2)}`
).join('\n')}
--------------------------------
Subtotal:     R$ ${totals.subtotal.toFixed(2)}
Serviço 10%:  R$ ${totals.service_fee.toFixed(2)}
${totals.discount > 0 ? `Desconto:    -R$ ${totals.discount.toFixed(2)}\n` : ''}
${totals.tip > 0 ? `Gorjeta:     +R$ ${totals.tip.toFixed(2)}\n` : ''}
================================
TOTAL:        R$ ${totals.total.toFixed(2)}
================================
Pagamento: ${paymentMethods[totals.payment_method] || totals.payment_method}

Obrigado pela preferência!
================================
`.trim()
}

// DELETE - Cancelar sessão
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const params = await context.params
    const sessionId = parseInt(params.id)

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'ID da sessão não fornecido' },
        { status: 400 }
      )
    }

    // Cancelar sessão
    const { data: session, error } = await supabase
      .from('tablet_sessoes')
      .update({
        status: 'cancelada',
        fim_atendimento: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Sessão cancelada com sucesso',
      session
    })
  } catch (error: any) {
    console.error('Erro ao cancelar sessão:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao cancelar sessão',
        message: error.message 
      },
      { status: 500 }
    )
  }
}