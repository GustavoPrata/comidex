// Biblioteca de Gerenciamento de Fila de Impressão
// Centraliza todas as operações de impressão do sistema

export type DocumentType = 'order' | 'receipt' | 'bill' | 'report' | 'test';
export type PrintPriority = 'low' | 'normal' | 'high' | 'urgent';
export type PrintStatus = 'pending' | 'printing' | 'printed' | 'failed' | 'cancelled';

interface PrintJobData {
  order_id?: number;
  order_item_id?: number;
  table_id?: number;
  table_name?: string;
  items?: any[];
  total?: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  payment_method?: string;
  customer_name?: string;
  notes?: string;
  created_at?: string;
  custom_data?: any;
}

interface AddPrintJobParams {
  printer_id?: number;
  document_type: DocumentType;
  document_data: PrintJobData;
  priority?: PrintPriority;
  copies?: number;
  template_id?: number;
}

// Adicionar job à fila de impressão
export async function addPrintJob(params: AddPrintJobParams) {
  try {
    // Se não especificar impressora, buscar a padrão baseada no tipo
    let printerId = params.printer_id;
    
    if (!printerId) {
      // Buscar impressora padrão para o tipo de documento
      const printerMap = await getDefaultPrintersMap();
      printerId = printerMap[params.document_type] || undefined;
    }

    if (!printerId) {
      throw new Error(`Nenhuma impressora configurada para ${params.document_type}`);
    }

    const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:5000';
    const response = await fetch(`${baseUrl}/api/printer-queue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        printer_id: printerId,
        order_item_id: params.document_data.order_item_id, // Referência ao item do pedido
        priority: params.priority || 'normal',
        copies: params.copies || 1
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao adicionar job à fila');
    }

    const job = await response.json();
    return job;
  } catch (error) {
    console.error('Erro ao adicionar job à fila:', error);
    throw error;
  }
}

// Buscar mapeamento de impressoras padrão
async function getDefaultPrintersMap(): Promise<Record<DocumentType, number | null>> {
  // Por enquanto, usar impressora ID 1 como padrão para todos os tipos
  // TODO: Implementar configuração de perfis de impressora quando necessário
  return {
    order: 1,    // Cozinha
    receipt: 1,  // Caixa
    bill: 1,     // Caixa
    report: 1,   // Escritório
    test: 1      // Teste
  };
}

// Imprimir pedido
export async function printOrder(data: {
  order_id: number;
  items: any[];
  table_name: string;
  notes?: string;
  priority?: PrintPriority;
}) {
  return addPrintJob({
    document_type: 'order',
    document_data: {
      order_id: data.order_id,
      items: data.items,
      table_name: data.table_name,
      notes: data.notes,
      created_at: new Date().toISOString()
    },
    priority: data.priority || 'high'
  });
}

// Imprimir conta/recibo
export async function printBill(data: {
  order_id: number;
  table_name: string;
  items: any[];
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  payment_method?: string;
  customer_name?: string;
}) {
  return addPrintJob({
    document_type: 'bill',
    document_data: {
      order_id: data.order_id,
      table_name: data.table_name,
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      total: data.total,
      payment_method: data.payment_method,
      customer_name: data.customer_name,
      created_at: new Date().toISOString()
    },
    priority: 'high',
    copies: 2 // Uma via para o cliente, outra para o estabelecimento
  });
}

// Imprimir recibo de pagamento
export async function printReceipt(data: {
  order_id: number;
  table_name: string;
  total: number;
  payment_method: string;
  customer_name?: string;
}) {
  return addPrintJob({
    document_type: 'receipt',
    document_data: {
      order_id: data.order_id,
      table_name: data.table_name,
      total: data.total,
      payment_method: data.payment_method,
      customer_name: data.customer_name,
      created_at: new Date().toISOString()
    },
    priority: 'normal'
  });
}

// Imprimir teste
export async function printTest(printer_id: number, message?: string) {
  return addPrintJob({
    printer_id,
    document_type: 'test',
    document_data: {
      notes: message || 'Teste de impressão',
      created_at: new Date().toISOString()
    },
    priority: 'low'
  });
}

// Buscar status da fila
export async function getQueueStatus(printer_id?: number) {
  try {
    const params = new URLSearchParams();
    if (printer_id) {
      params.append('printer_id', printer_id.toString());
    }

    const response = await fetch(`/api/printer-queue?${params}`);
    const jobs = await response.json();

    const stats = {
      total: jobs.length,
      pending: jobs.filter((j: any) => j.status === 'pending').length,
      printing: jobs.filter((j: any) => j.status === 'printing').length,
      failed: jobs.filter((j: any) => j.status === 'failed').length
    };

    return { jobs, stats };
  } catch (error) {
    console.error('Erro ao buscar status da fila:', error);
    throw error;
  }
}

// Cancelar job
export async function cancelPrintJob(jobId: number) {
  try {
    const response = await fetch(`/api/printer-queue?id=${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' })
    });

    if (!response.ok) {
      throw new Error('Erro ao cancelar job');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao cancelar job:', error);
    throw error;
  }
}

// Reenviar job
export async function retryPrintJob(jobId: number) {
  try {
    const response = await fetch(`/api/printer-queue?id=${jobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: 'pending',
        retry_count: 0
      })
    });

    if (!response.ok) {
      throw new Error('Erro ao reenviar job');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao reenviar job:', error);
    throw error;
  }
}

// Verificar se há impressoras online
export async function hasOnlinePrinters(): Promise<boolean> {
  try {
    const response = await fetch('/api/printers');
    const printers = await response.json();
    return printers.some((p: any) => p.status === 'online');
  } catch (error) {
    console.error('Erro ao verificar impressoras:', error);
    return false;
  }
}

// Processar fila de impressão (para ser usado em workers)
export async function processQueue() {
  try {
    // Buscar próximo job pendente
    const response = await fetch('/api/printer-queue?status=pending&limit=1');
    const jobs = await response.json();

    if (jobs.length === 0) {
      return null;
    }

    const job = jobs[0];

    // Marcar como imprimindo
    await fetch(`/api/printer-queue?id=${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'printing' })
    });

    // Aqui seria onde enviaria para a impressora real
    // Por enquanto, vamos simular
    await simulatePrint(job);

    // Marcar como impresso
    await fetch(`/api/printer-queue?id=${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'printed' })
    });

    return job;
  } catch (error) {
    console.error('Erro ao processar fila:', error);
    throw error;
  }
}

// Simular impressão (desenvolvimento)
async function simulatePrint(job: any) {
  // Simular tempo de impressão
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 10% de chance de falha (para teste)
  if (Math.random() < 0.1) {
    throw new Error('Impressora offline');
  }

  console.log('Job impresso:', job);
}