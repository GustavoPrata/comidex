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

// GET - Listar pedidos de uma sessão
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const session_id = searchParams.get('session_id')
    
    if (!session_id) {
      const response = NextResponse.json({
        success: false,
        error: 'ID da sessão obrigatório'
      }, { status: 400 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Primeiro buscar a sessão para obter a table_id
    const { data: session, error: sessionError } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      const response = NextResponse.json({
        success: false,
        error: 'Sessão não encontrada'
      }, { status: 404 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Buscar pedidos da mesa durante o período da sessão
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          item:items (
            id,
            name,
            price,
            description
          )
        )
      `)
      .eq('table_id', session.table_id)
      .gte('created_at', session.opened_at)
      .order('created_at', { ascending: false })

    // Se a sessão já foi fechada, limitar os pedidos até o momento do fechamento
    if (session.closed_at) {
      query = query.lte('created_at', session.closed_at)
    }

    const { data: orders, error } = await query

    if (error) throw error

    // Formatar os pedidos para incluir os itens detalhados
    const formattedOrders = (orders || []).map(order => ({
      ...order,
      items: order.order_items.map((item: any) => ({
        id: item.id,
        product_id: item.item?.id,
        product: item.item?.name || 'Produto removido',
        quantity: item.quantity,
        price: item.unit_price || item.item?.price || 0,
        total: item.total_price || (item.quantity * (item.unit_price || item.item?.price || 0)),
        observation: item.observation || item.notes
      }))
    }))

    const response = NextResponse.json({
      success: true,
      orders: formattedOrders,
      total: formattedOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  } catch (error: any) {
    console.error('Erro ao buscar pedidos:', error)
    const response = NextResponse.json({ 
      success: false,
      error: 'Erro ao buscar pedidos',
      message: error.message 
    }, { status: 500 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }
}

// POST - Lançar novo pedido com impressão automática
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const data = await request.json()
    const { session_id, items, source = 'pos' } = data
    
    console.log('🔍 POS Order: Dados recebidos:', { session_id, items_count: items?.length, source })
    
    if (!session_id || !items || items.length === 0) {
      const response = NextResponse.json({
        success: false,
        error: 'ID da sessão e itens são obrigatórios'
      }, { status: 400 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Debug: Log do session_id recebido
    console.log('🔍 POS Order: Verificando sessão ID:', session_id)
    
    // Verificar se sessão existe e está ativa
    const { data: session, error: sessionError } = await supabase
      .from('table_sessions')
      .select(`
        *,
        restaurant_tables(id, number)
      `)
      .eq('id', session_id)
      .eq('status', 'active')
      .single()

    console.log('🔍 POS Order: Resultado da busca:', { session, sessionError })

    if (sessionError || !session) {
      console.error('❌ POS Order: Sessão não encontrada:', { session_id, sessionError })
      const response = NextResponse.json({
        success: false,
        error: 'Sessão não encontrada ou já fechada'
      }, { status: 404 })
      
      response.headers.set('Access-Control-Allow-Origin', '*')
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      return response
    }

    // Calcular total do pedido
    const orderTotal = items.reduce((sum: number, item: any) => 
      sum + ((item.price || 0) * (item.quantity || 1)), 0
    )

    // Gerar número do pedido
    const orderNumber = `P${Date.now().toString().slice(-8)}`
    
    // Horário correto de São Paulo
    const saoPauloTime = new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" })
    const createdAt = new Date(saoPauloTime).toISOString()
    
    // Criar pedido principal (sem items - eles vão para order_items)
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        table_id: session.table_id,
        total: orderTotal,
        final_total: orderTotal,
        status: 'pending',
        created_at: createdAt,
        notes: `Origem: ${source}`
      })
      .select()
      .single()

    if (orderError) {
      console.error('❌ Erro ao criar pedido:', orderError)
      throw orderError
    }

    // Criar items do pedido na tabela order_items
    const orderItems = items.map((item: any) => ({
      order_id: newOrder.id,
      item_id: item.id > 0 ? item.id : null, // Se for rodízio (id negativo), não tem item_id
      quantity: item.quantity || 1,
      unit_price: item.price || 0,
      total_price: (item.price || 0) * (item.quantity || 1),
      observation: item.observation || item.name, // Usar nome como observação para rodízio
      metadata: {
        name: item.name,
        category: item.category,
        is_rodizio: item.is_rodizio || false,
        group_id: item.group_id || null
      }
    }))

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select()

    if (itemsError) {
      console.error('❌ Erro ao criar items do pedido:', itemsError)
      throw itemsError
    }

    // Atualizar total da sessão
    const newSessionTotal = (session.total_price || 0) + orderTotal
    await supabase
      .from('table_sessions')
      .update({ total_price: newSessionTotal })
      .eq('id', session_id)

    // ENVIAR PARA IMPRESSORAS CONFORME CATEGORIA
    const tableInfo = {
      ...session.restaurant_tables,
      name: `Mesa ${session.restaurant_tables.number}`
    }
    const printJobs = await createPrintJobs(newOrder, tableInfo, items)

    console.log(`✅ POS: Pedido #${newOrder.id} lançado - Mesa ${session.restaurant_tables.number}`)
    console.log(`📨 ${printJobs.length} comandas enviadas para impressão`)

    const response = NextResponse.json({
      success: true,
      order: {
        id: newOrder.id,
        order_number: newOrder.order_number,
        session_id: session_id,
        items: createdItems,
        total: newOrder.total,
        status: newOrder.status,
        created_at: newOrder.created_at,
        table_number: session.restaurant_tables.number,
        table_name: `Mesa ${session.restaurant_tables.number}`
      },
      print_jobs: printJobs,
      session_total: newSessionTotal,
      message: `Pedido lançado com sucesso`
    })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  } catch (error: any) {
    console.error('Erro ao lançar pedido:', error)
    const response = NextResponse.json({ 
      success: false,
      error: 'Erro ao lançar pedido',
      message: error.message 
    }, { status: 500 })
    
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }
}

// Função para criar trabalhos de impressão
async function createPrintJobs(order: any, table: any, items: any[]) {
  const supabase = await createClient()
  
  // Buscar impressoras ativas
  const { data: printers } = await supabase
    .from('printers')
    .select('*')
    .eq('status', 'online')

  if (!printers || printers.length === 0) {
    console.warn('⚠️ Nenhuma impressora online encontrada')
    return []
  }

  // Agrupar itens por setor
  const itemsBySector: Record<string, any[]> = {}
  
  items.forEach(item => {
    // Determinar setor baseado na categoria
    let sector = 'COZINHA' // Default
    
    const category = item.category?.toLowerCase() || ''
    
    if (category.includes('bebida') || 
        category.includes('drink') || 
        category.includes('refrigerante') ||
        category.includes('suco') ||
        category.includes('cerveja')) {
      sector = 'BAR'
    } else if (category.includes('sobremesa') || 
               category.includes('doce')) {
      sector = 'SOBREMESA'
    }
    
    if (!itemsBySector[sector]) {
      itemsBySector[sector] = []
    }
    itemsBySector[sector].push(item)
  })

  // Criar jobs de impressão
  const printJobs = []
  
  for (const [sector, sectorItems] of Object.entries(itemsBySector)) {
    // Encontrar impressora para o setor
    const printer = printers.find(p => 
      p.sector === sector || 
      (sector === 'SOBREMESA' && p.sector === 'COZINHA') // Sobremesa vai para cozinha se não tiver impressora específica
    ) || printers[0] // Fallback para primeira impressora

    if (!printer) continue

    // Formatar conteúdo da comanda
    const content = formatPrintContent(order, table, sectorItems, sector)
    
    // Criar job na fila de impressão
    const { data: job, error } = await supabase
      .from('printer_queues')
      .insert({
        printer_id: printer.id,
        content,
        status: 'pending',
        copies: 1,
        metadata: {
          order_id: order.id,
          table_number: table.number,
          sector,
          items_count: sectorItems.length
        }
      })
      .select()
      .single()

    if (!error && job) {
      printJobs.push({
        id: job.id,
        printer: printer.name,
        sector,
        items_count: sectorItems.length,
        status: 'queued'
      })
    }
  }

  return printJobs
}

// Formatar conteúdo para impressão
function formatPrintContent(order: any, table: any, items: any[], sector: string) {
  const now = new Date()
  const date = now.toLocaleDateString('pt-BR')
  const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  
  let content = `
================================
         COMANDA ${sector}
================================
Mesa: ${table.number} - ${table.name || 'Mesa'}
Data: ${date} - Hora: ${time}
Pedido: #${order.id}
--------------------------------
ITENS:
`

  items.forEach(item => {
    content += `\n${item.quantity}x ${item.name}`
    if (item.observation) {
      content += `\n   OBS: ${item.observation}`
    }
    content += '\n'
  })

  content += `
--------------------------------
Total de itens: ${items.reduce((sum, i) => sum + i.quantity, 0)}
================================
`

  return content
}