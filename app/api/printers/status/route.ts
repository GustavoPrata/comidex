import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { printerService } from "@/server/printer-service";

async function checkRealStatus(printer: any): Promise<{
  status: 'online' | 'offline' | 'error' | 'unknown';
  message: string;
  responseTime?: number;
  type?: string;
}> {
  // Impressoras desativadas sempre estão offline
  if (!printer.active) {
    return {
      status: 'offline',
      message: `Impressora ${printer.name} está desativada`
    };
  }

  // Impressora local Windows
  if (printer.ip_address === 'LOCAL') {
    return {
      status: 'online',
      message: `Impressora local Windows: ${printer.name}`,
      type: 'local',
      responseTime: 10
    };
  }

  // Impressora localhost (desenvolvimento)
  if (printer.ip_address === '127.0.0.1' || printer.ip_address === 'localhost') {
    return {
      status: 'online',
      message: `Impressora localhost (desenvolvimento)`,
      type: 'localhost',
      responseTime: 5
    };
  }

  // Impressora de rede - testar conexão real
  try {
    const startTime = Date.now();
    const port = parseInt(printer.port) || 9100;
    
    // Usar o serviço de impressora para testar conexão
    const isOnline = await printerService.testPrinterConnection(printer.ip_address, port);
    const responseTime = Date.now() - startTime;
    
    if (isOnline) {
      return {
        status: 'online',
        message: `✅ Conectado em ${printer.ip_address}:${port}`,
        type: 'network',
        responseTime
      };
    } else {
      return {
        status: 'offline',
        message: `❌ Sem resposta de ${printer.ip_address}:${port}`,
        type: 'network',
        responseTime: 0
      };
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return {
      status: 'error',
      message: `Erro ao verificar ${printer.name}: ${error}`,
      type: 'network',
      responseTime: 0
    };
  }
}

export async function POST(request: Request) {
  try {
    const { printerId } = await request.json();
    const supabase = await createClient();

    // Buscar dados da impressora
    const { data: printer, error } = await supabase
      .from('printers')
      .select('*')
      .eq('id', printerId)
      .single();

    if (error || !printer) {
      return NextResponse.json(
        { success: false, error: "Impressora não encontrada" },
        { status: 404 }
      );
    }

    // Verificar status real
    const statusCheck = await checkRealStatus(printer);
    
    // Atualizar status no banco
    await supabase
      .from('printers')
      .update({ 
        connection_status: statusCheck.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', printerId);

    return NextResponse.json({
      success: true,
      status: statusCheck.status,
      message: statusCheck.message,
      responseTime: statusCheck.responseTime,
      type: statusCheck.type,
      details: {
        name: printer.name,
        model: printer.printer_model,
        ip: printer.ip_address,
        port: printer.port,
        active: printer.active
      }
    });
  } catch (error: any) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao verificar status" },
      { status: 500 }
    );
  }
}