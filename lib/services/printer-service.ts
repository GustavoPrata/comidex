interface PrintJob {
  id: string
  content: string
  printer_id: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  copies: number
  type: 'order' | 'bill' | 'report'
}

interface PrinterConfig {
  id: string
  name: string
  ip: string
  port: number
  type: 'kitchen' | 'bar' | 'cashier' | 'backup'
  active: boolean
}

class PrinterService {
  private printers: Map<string, PrinterConfig> = new Map()
  private queue: PrintJob[] = []
  private isProcessing = false
  
  constructor() {
    this.initializePrinters()
  }
  
  private async initializePrinters() {
    // Load printer configurations from database
    try {
      const response = await fetch('/api/printers')
      const printers = await response.json()
      
      printers.forEach((printer: PrinterConfig) => {
        this.printers.set(printer.id, printer)
      })
    } catch (error) {
      console.error('Failed to initialize printers:', error)
    }
  }
  
  async printOrder(orderData: any, printerId: string) {
    const job: PrintJob = {
      id: crypto.randomUUID(),
      content: this.formatOrderForPrinting(orderData),
      printer_id: printerId,
      priority: orderData.priority || 'normal',
      copies: 1,
      type: 'order'
    }
    
    return this.addToQueue(job)
  }
  
  async printBill(sessionData: any, printerId: string) {
    const job: PrintJob = {
      id: crypto.randomUUID(),
      content: this.formatBillForPrinting(sessionData),
      printer_id: printerId,
      priority: 'high',
      copies: 2,
      type: 'bill'
    }
    
    return this.addToQueue(job)
  }
  
  private formatOrderForPrinting(orderData: any): string {
    const lines = []
    lines.push('================================')
    lines.push('         PEDIDO DE COZINHA      ')
    lines.push('================================')
    lines.push(`Mesa: ${orderData.table_name}`)
    lines.push(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`)
    lines.push(`Pedido #${orderData.id.slice(0, 8)}`)
    lines.push('--------------------------------')
    
    orderData.items.forEach((item: any) => {
      lines.push(`${item.quantity}x ${item.name}`)
      if (item.notes) {
        lines.push(`   OBS: ${item.notes}`)
      }
    })
    
    lines.push('================================')
    
    return lines.join('\n')
  }
  
  private formatBillForPrinting(sessionData: any): string {
    const lines = []
    lines.push('================================')
    lines.push('        MAAD RESTAURANT         ')
    lines.push('================================')
    lines.push(`Mesa: ${sessionData.table_name}`)
    lines.push(`Cliente: ${sessionData.customer_name || '-'}`)
    lines.push(`Data: ${new Date().toLocaleDateString('pt-BR')}`)
    lines.push(`Hora: ${new Date().toLocaleTimeString('pt-BR')}`)
    lines.push('--------------------------------')
    
    if (sessionData.attendance_type === 'rodizio_premium') {
      lines.push('RODÍZIO PREMIUM')
      lines.push(`${sessionData.number_of_people} pessoas x R$ ${sessionData.unit_price}`)
      lines.push(`Subtotal: R$ ${sessionData.total_price}`)
    } else if (sessionData.attendance_type === 'rodizio_tradicional') {
      lines.push('RODÍZIO TRADICIONAL')
      lines.push(`${sessionData.number_of_people} pessoas x R$ ${sessionData.unit_price}`)
      lines.push(`Subtotal: R$ ${sessionData.total_price}`)
    } else {
      // À la carte items
      sessionData.orders?.forEach((order: any) => {
        order.items?.forEach((item: any) => {
          lines.push(`${item.quantity}x ${item.name}`)
          lines.push(`   R$ ${item.total_price.toFixed(2)}`)
        })
      })
    }
    
    lines.push('--------------------------------')
    lines.push(`TOTAL: R$ ${sessionData.final_total || sessionData.total_price}`)
    lines.push('================================')
    lines.push('      Obrigado pela visita!     ')
    lines.push('================================')
    
    return lines.join('\n')
  }
  
  private async addToQueue(job: PrintJob) {
    this.queue.push(job)
    
    // Sort queue by priority
    this.queue.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
    
    // Save to database
    await fetch('/api/printer-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    })
    
    if (!this.isProcessing) {
      this.processQueue()
    }
    
    return job.id
  }
  
  private async processQueue() {
    if (this.queue.length === 0) {
      this.isProcessing = false
      return
    }
    
    this.isProcessing = true
    const job = this.queue.shift()
    
    if (!job) {
      this.isProcessing = false
      return
    }
    
    try {
      await this.sendToPrinter(job)
      
      // Update job status
      await fetch(`/api/printer-queue?id=${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'printed' })
      })
    } catch (error) {
      console.error('Failed to print:', error)
      
      // Update job status to error
      await fetch(`/api/printer-queue?id=${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'error' })
      })
    }
    
    // Process next job
    setTimeout(() => this.processQueue(), 1000)
  }
  
  private async sendToPrinter(job: PrintJob) {
    const printer = this.printers.get(job.printer_id)
    
    if (!printer || !printer.active) {
      throw new Error(`Printer ${job.printer_id} not available`)
    }
    
    // In a real implementation, this would connect to the actual printer
    // For now, we'll just log the print job
    console.log('Printing to', printer.name)
    console.log(job.content)
    
    // Simulate printing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  getPrinterStatus(printerId: string): 'online' | 'offline' | 'error' {
    const printer = this.printers.get(printerId)
    return printer?.active ? 'online' : 'offline'
  }
  
  getQueueLength(printerId?: string): number {
    if (printerId) {
      return this.queue.filter(job => job.printer_id === printerId).length
    }
    return this.queue.length
  }
}

export const printerService = new PrinterService()