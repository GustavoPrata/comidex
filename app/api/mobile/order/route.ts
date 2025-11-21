import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ThermalPrinterService } from '@/server/printer-service'

// Instância do serviço de impressão
const printerService = new ThermalPrinterService()

// POST - Criar novo pedido com integração completa ao sistema de impressão
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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
        .from('restaurant_tables')
        .select('*')
        .eq('number', table_number)
        .single()

      if (table) {
        // Buscar sessão ativa
        const { data: activeSession } = await supabase
          .from('tablet_sessoes')
          .select('*')
          .eq('mesa_id', table.id)
          .eq('status', 'ativa')
          .single()

        if (activeSession) {
          session = activeSession
        } else {
          // Criar nova sessão
          const { data: newSession } = await supabase
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
          
          session = newSession
        }
      }
    }

    // Calcular total do pedido
    const total = items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.price) * item.quantity)
    }, 0)

    // Criar pedido com status pendente (enviado para cozinha)
    const { data: order, error: orderError } = await supabase
      .from('tablet_pedidos')
      .insert({
        sessao_id: session?.id || null,
        numero: `PED-${Date.now()}`,
        status: 'pendente',
        valor_total: total,
        observacoes: `Origem: tablet${device_id ? ` - Device: ${device_id}` : ''}`,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orderError) throw orderError

    // Adicionar itens do pedido e agrupar por impressora
    const orderItems = []
    const itemsByPrinter = new Map()
    
    // Buscar IDs das impressoras
    const { data: printers } = await supabase
      .from('printers')
      .select('id, name, ip_address, port, active')
      .eq('active', true)
    
    const barPrinter = printers?.find(p => p.name === 'BAR')
    const kitchenPrinter = printers?.find(p => p.name === 'COZINHA')
    
    for (const item of items) {
      const { data: orderItem } = await supabase
        .from('tablet_pedido_itens')
        .insert({
          pedido_id: order.id,
          item_id: item.product_id,
          quantidade: item.quantity,
          preco_unitario: item.price,
          preco_total: item.price * item.quantity,
          observacoes: item.observation || null
        })
        .select()
        .single()
      
      orderItems.push(orderItem)

      // Buscar produto com informações completas incluindo grupo através da categoria
      const { data: product } = await supabase
        .from('items')
        .select(`
          *,
          categories!inner(
            name,
            group_id,
            groups!inner(
              name,
              type
            )
          )
        `)
        .eq('id', item.product_id)
        .single()

      if (product) {
        // Determinar impressora baseada no tipo de grupo
        let targetPrinter = null
        
        // Se o grupo for bebidas, enviar para BAR, senão para COZINHA
        const groupType = product.categories?.groups?.type
        if (groupType === 'bebidas' && barPrinter) {
          targetPrinter = barPrinter
          console.log(`Item ${product.name} routed to BAR printer (bebidas)`)
        } else if (kitchenPrinter) {
          targetPrinter = kitchenPrinter
          console.log(`Item ${product.name} routed to COZINHA printer (${groupType || 'food'})`)
        }
        
        if (targetPrinter) {
          // Agrupar itens por impressora para otimizar impressão
          if (!itemsByPrinter.has(targetPrinter.id)) {
            itemsByPrinter.set(targetPrinter.id, {
              printer: targetPrinter,
              items: []
            })
          }
          
          itemsByPrinter.get(targetPrinter.id).items.push({
            orderItem,
            product,
            quantity: item.quantity,
            observation: item.observation,
            category: product.categories?.name || 'Geral'
          })
        }
      }
    }

    // Criar jobs de impressão para cada impressora
    const printJobs = []
    for (const [printerId, printerData] of itemsByPrinter) {
      // Formatar dados do pedido para impressão no formato esperado pelo virtual printer
      const orderData = {
        id: order.numero,
        table: table_number ? `Mesa ${table_number}` : 'S/Mesa',
        numero_pedido: order.numero,
        mesa: table_number || 'S/N',
        modo: mode === 'rodizio' ? 'RODÍZIO' : 'À LA CARTE',
        items: printerData.items.map((item: any) => ({
          quantidade: item.quantity,
          nome: item.product.name,
          observacao: item.observation || '',
          categoria: item.category,
          preco: item.product.price
        })),
        hora: new Date().toLocaleTimeString('pt-BR'),
        data: new Date().toLocaleDateString('pt-BR'),
        atendente: 'Tablet',
        observacoes_gerais: `Pedido via Tablet${device_id ? ` - Device: ${device_id}` : ''}`,
        total: printerData.items.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0),
        printer_name: printerData.printer.name
      }

      // Criar job na fila de impressão
      const { data: printJob, error: printError } = await supabase
        .from('printer_queue')
        .insert({
          printer_id: printerId,
          document_type: 'order',
          document_data: orderData,
          priority: mode === 'rodizio' ? 'high' : 'normal',
          status: 'pending',
          copies: 1,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (printJob && !printError) {
        printJobs.push(printJob)
        console.log(`Print job criado: ID ${printJob.id} para impressora ${printerData.printer.name}`)

        // Tentar enviar para impressora física se estiver ativa
        if (printerData.printer?.active && printerData.printer?.ip_address && printerData.printer?.port) {
          try {
            // Usar o método correto createOrderPrint
            const printData = printerService.createOrderPrint(orderData)
            await printerService.print(
              printerData.printer.ip_address,
              parseInt(printerData.printer.port),
              printData
            )
            
            // Atualizar status do job para printed
            await supabase
              .from('printer_queue')
              .update({
                status: 'printed',
                printed_at: new Date().toISOString()
              })
              .eq('id', printJob.id)
            console.log(`Print job ${printJob.id} enviado com sucesso para impressora física`)
          } catch (printError) {
            console.error('Erro ao enviar para impressora física:', printError)
            // Job permanece como pending para retry posterior - será visível no virtual printer
          }
        }
      } else if (printError) {
        console.error('Erro ao criar print job:', printError)
      }
    }

    // Atualizar total da sessão se houver
    if (session) {
      const newTotal = (session.valor_total || 0) + total
      await supabase
        .from('tablet_sessoes')
        .update({ valor_total: newTotal })
        .eq('id', session.id)
    }

    // Preparar resposta com informações de impressão
    const printStatus = printJobs.length > 0 ? 'sent_to_kitchen' : 'no_printer_configured'
    const message = printJobs.length > 0 
      ? `Pedido enviado para cozinha! ${printJobs.length} impressora(s) notificada(s).` 
      : 'Pedido criado! Configure impressoras para envio automático à cozinha.'

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        numero: order.numero,
        table_number,
        total,
        items: orderItems,
        session_id: session?.id,
        created_at: order.created_at,
        status: 'pendente',
        print_jobs_count: printJobs.length,
        estimated_preparation_time: printJobs.length > 0 ? '15-20 minutos' : null
      },
      print_status: printStatus,
      print_jobs: printJobs.map(job => ({
        id: job.id,
        printer_id: job.printer_id,
        status: job.status,
        created_at: job.created_at
      })),
      message
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

// PATCH - Atualizar status do pedido
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const data = await request.json()
    const { order_id, status } = data

    const validStatuses = ['enviado_cozinha', 'em_preparacao', 'pronto', 'entregue', 'cancelado']
    
    if (!order_id) {
      return NextResponse.json(
        { success: false, error: 'ID do pedido não fornecido' },
        { status: 400 }
      )
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Status inválido' },
        { status: 400 }
      )
    }

    // Atualizar status do pedido
    const { data: updatedOrder, error } = await supabase
      .from('tablet_pedidos')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', order_id)
      .select()
      .single()

    if (error) throw error

    // Se o status for "pronto", enviar notificação (futura implementação)
    if (status === 'pronto') {
      console.log(`Pedido ${order_id} está pronto para entrega`)
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Status atualizado para: ${status}`
    })
  } catch (error: any) {
    console.error('Erro ao atualizar status do pedido:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao atualizar status do pedido',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

// GET - Listar pedidos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const table_number = searchParams.get('table_number')
    const device_id = searchParams.get('device_id')
    const session_id = searchParams.get('session_id')
    const status = searchParams.get('status')
    
    let query = supabase
      .from('tablet_pedidos')
      .select(`
        *,
        tablet_pedido_itens(
          *,
          items(name, price, image)
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    // Filtrar por sessão se especificado
    if (session_id) {
      query = query.eq('sessao_id', session_id)
    }
    
    // Filtrar por status se especificado
    if (status) {
      query = query.eq('status', status)
    }
    
    // Filtrar por device_id se especificado
    if (device_id) {
      query = query.ilike('observacoes', `%Device: ${device_id}%`)
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