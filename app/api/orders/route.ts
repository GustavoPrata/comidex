import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    
    // Buscar table_id da sessão
    let tableId = body.table_id;
    let sessionId = body.session_id;
    
    if (!tableId && sessionId) {
      const { data: session } = await supabase
        .from('table_sessions')
        .select('table_id')
        .eq('id', sessionId)
        .single();
      
      tableId = session?.table_id;
    }
    
    // Verificar se já existe um order ativo para esta mesa
    let order;
    if (tableId) {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select()
        .eq('table_id', tableId)
        .in('status', ['pending', 'confirmed', 'preparing'])
        .single();
      
      if (existingOrder) {
        // Usar o order existente e atualizar o total
        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update({
            total: existingOrder.total + body.total,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingOrder.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        order = updatedOrder;
      } else {
        // Criar novo order se não existir um ativo
        const orderNumber = Date.now().toString();
        const { data: newOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            order_number: orderNumber,
            table_id: tableId,
            total: body.total,
            status: 'pending',
            notes: body.notes
          })
          .select()
          .single();
        
        if (orderError) throw orderError;
        order = newOrder;
      }
    } else {
      throw new Error('Mesa não especificada');
    }
    
    // Create order items
    if (body.items && body.items.length > 0) {
      const orderItems = body.items.map((item: any) => {
        // Para rodízios (item_id null), salvar metadata
        const baseItem = {
          order_id: order.id,
          item_id: item.item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          notes: item.notes || (item.item_id === null ? item.name : null),
          status: 'pending'
        };
        
        // Se é rodízio (item_id null), adicionar metadata
        if (item.item_id === null && item.name) {
          return {
            ...baseItem,
            metadata: {
              type: 'rodizio',
              name: item.name,
              icon: item.icon || null,
              group_id: item.group_id || null
            }
          };
        }
        
        return baseItem;
      })
      
      const { data: insertedItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select()
      
      if (itemsError) throw itemsError
      
      // Adicionar items à fila de impressão (exceto rodízios e itens de grupos rodízio)
      if (insertedItems && insertedItems.length > 0) {
        // Filtrar apenas itens que têm item_id (não são rodízios)
        const itemsWithId = insertedItems.filter((item: any) => item.item_id !== null);
        
        if (itemsWithId.length > 0) {
          // Buscar informações dos itens para verificar se pertencem a grupos rodízio
          const itemIds = itemsWithId.map((item: any) => item.item_id);
          const { data: itemsInfo } = await supabase
            .from('items')
            .select('id, group_id, group:groups(type)')
            .in('id', itemIds);
          
          // Filtrar itens que NÃO pertencem a grupos tipo 'rodizio'
          const itemsToPrint = itemsWithId.filter((item: any) => {
            const itemInfo = itemsInfo?.find((info: any) => info.id === item.item_id);
            // Se não encontrou info ou o grupo não é rodízio, pode imprimir
            return !itemInfo || itemInfo.group?.type !== 'rodizio';
          });
          
          if (itemsToPrint.length > 0) {
            // Buscar impressora principal para pedidos
            const { data: printers } = await supabase
              .from('printers')
              .select('id')
              .eq('is_main', true)
              .eq('active', true)
              .single();
            
            if (printers) {
              // Adicionar cada item à fila de impressão
              const printJobs = itemsToPrint.map((item: any) => ({
                order_item_id: item.id,
                printer_id: printers.id,
                copies: 1,
                status: 'pending'
              }));
              
              const { error: queueError } = await supabase
                .from('printer_queue')
                .insert(printJobs);
              
              if (queueError) {
                console.error('Erro ao adicionar à fila de impressão:', queueError);
              } else {
                console.log('Itens adicionados à fila de impressão:', printJobs.length);
              }
            }
          } else {
            console.log('Nenhum item para impressão (todos são rodízio ou itens de rodízio)');
          }
        }
      }
      
      console.log('Pedido criado com sucesso:', order.id, 'Total de itens:', orderItems.length)
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