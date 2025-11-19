import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { printOrder } from '@/lib/print-queue'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const status = searchParams.get('status')
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          items (name, description)
        ),
        table_sessions (
          table_id,
          restaurant_tables (name, number)
        )
      `)
      .order('created_at', { ascending: false })
    
    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        session_id: body.session_id,
        total: body.total,
        status: 'pending',
        priority: body.priority || 'normal',
        notes: body.notes
      })
      .select()
      .single()
    
    if (orderError) throw orderError
    
    // Create order items
    if (body.items && body.items.length > 0) {
      const orderItems = body.items.map((item: any) => ({
        order_id: order.id,
        item_id: item.item_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        additionals_price: item.additionals_price || 0,
        total_price: item.total_price,
        notes: item.notes,
        status: 'pending'
      }))
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
      
      if (itemsError) throw itemsError
      
      // Adicionar pedido à fila de impressão
      try {
        // Buscar informações da mesa
        const { data: session } = await supabase
          .from('table_sessions')
          .select(`
            restaurant_tables (name, number)
          `)
          .eq('id', body.session_id)
          .single()
        
        const tableName = session?.restaurant_tables?.name || `Mesa ${session?.restaurant_tables?.number || 'Desconhecida'}`
        
        // Adicionar job de impressão para o pedido
        await printOrder({
          order_id: order.id,
          items: body.items.map((item: any) => ({
            name: item.name || 'Item',
            quantity: item.quantity,
            notes: item.notes
          })),
          table_name: tableName,
          notes: body.notes,
          priority: 'high'
        })
        
        console.log('Pedido adicionado à fila de impressão:', order.id)
      } catch (printError) {
        console.error('Erro ao adicionar pedido à fila de impressão:', printError)
        // Não falhar a criação do pedido se a impressão falhar
      }
    }
    
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')
    const body = await request.json()
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('orders')
      .update(body)
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}