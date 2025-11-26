import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { printerService } from '@/server/printer-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: pendingJobs, error: fetchError } = await supabase
      .from('printer_queue')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          notes,
          items (
            id,
            name,
            price,
            description
          ),
          orders (
            id,
            table_id,
            tables (
              id,
              name,
              number
            )
          )
        ),
        printers (
          id,
          name,
          ip_address,
          port,
          is_local,
          active
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10)
    
    if (fetchError) {
      console.error('❌ Erro ao buscar jobs pendentes:', fetchError)
      throw fetchError
    }
    
    if (!pendingJobs || pendingJobs.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Nenhum job pendente na fila',
        processed: 0 
      })
    }
    
    let processed = 0
    let failed = 0
    const results: any[] = []
    
    for (const job of pendingJobs) {
      try {
        const printer = job.printers
        const orderItem = job.order_items
        const item = orderItem?.items
        const order = orderItem?.orders
        const table = order?.tables
        
        // Validar impressora
        if (!printer || !printer.active) {
          await supabase
            .from('printer_queue')
            .update({ 
              status: 'failed',
              error_message: 'Impressora não encontrada ou inativa'
            })
            .eq('id', job.id)
          failed++
          results.push({ id: job.id, status: 'failed', error: 'Impressora não encontrada' })
          continue
        }
        
        // Validar se dados essenciais existem
        if (!orderItem || !item) {
          console.error(`❌ Job ${job.id}: Dados incompletos (order_item ou item ausente)`)
          await supabase
            .from('printer_queue')
            .update({ 
              status: 'failed',
              error_message: 'Dados do pedido incompletos ou produto inexistente'
            })
            .eq('id', job.id)
          failed++
          results.push({ id: job.id, status: 'failed', error: 'Dados incompletos' })
          continue
        }
        
        // Atualizar status para 'printing' apenas após validações
        await supabase
          .from('printer_queue')
          .update({ status: 'printing' })
          .eq('id', job.id)
        
        const printData = printerService.createOrderItemPrint({
          itemName: item.name || 'Item',
          quantity: orderItem.quantity || 1,
          notes: orderItem.notes || '',
          tableName: table?.name || table?.number || 'Mesa',
          orderId: order?.id || job.id,
          timestamp: new Date().toLocaleString('pt-BR')
        })
        
        const success = await printerService.print(printer, printData)
        
        if (success) {
          await supabase
            .from('printer_queue')
            .update({ 
              status: 'printed',
              printed_at: new Date().toISOString()
            })
            .eq('id', job.id)
          processed++
          results.push({ id: job.id, status: 'printed' })
        } else {
          await supabase
            .from('printer_queue')
            .update({ 
              status: 'failed',
              error_message: 'Falha ao comunicar com a impressora'
            })
            .eq('id', job.id)
          failed++
          results.push({ id: job.id, status: 'failed', error: 'Falha na comunicação' })
        }
        
      } catch (error: any) {
        console.error(`Erro ao processar job ${job.id}:`, error)
        
        await supabase
          .from('printer_queue')
          .update({ 
            status: 'failed',
            error_message: error.message || 'Erro desconhecido'
          })
          .eq('id', job.id)
        failed++
        results.push({ id: job.id, status: 'failed', error: error.message })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Processados: ${processed}, Falhas: ${failed}`,
      processed,
      failed,
      results
    })
    
  } catch (error: any) {
    console.error('Erro ao processar fila:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erro ao processar fila' },
      { status: 500 }
    )
  }
}
