import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Simular status realista baseado em diferentes fatores
function simulateRealisticStatus(printer: any): {
  status: 'online' | 'offline' | 'error';
  message: string;
  responseTime?: number;
} {
  // Impressoras desativadas sempre estão offline
  if (!printer.active) {
    return {
      status: 'offline',
      message: `Impressora ${printer.name} está desativada`
    };
  }

  // Verificar se IP é válido
  const isLocalNetwork = printer.ip_address.startsWith('192.168.') || 
                        printer.ip_address.startsWith('10.') || 
                        printer.ip_address.startsWith('172.');
  
  if (!isLocalNetwork) {
    return {
      status: 'error',
      message: `Impressora ${printer.name} - IP inválido ou fora da rede`
    };
  }

  // Status fixo para consistência - impressoras ativas sempre estão online
  // a menos que sejam manualmente definidas como offline/error
  let determinedStatus: 'online' | 'offline' | 'error' = 'online';
  let message = '';
  const responseTime = 50; // Tempo fixo de resposta
  
  // Para impressoras ativas com IP válido, sempre considerar online
  // Isso evita o bug de status mudando aleatoriamente
  determinedStatus = 'online';
  message = `Impressora ${printer.name} está online e pronta`;
  
  return {
    status: determinedStatus,
    message,
    responseTime
  };
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

    // Simular verificação realista
    const simulation = simulateRealisticStatus(printer);
    
    // Simular tempo de resposta de rede
    if (simulation.responseTime) {
      await new Promise(resolve => setTimeout(resolve, simulation.responseTime));
    }

    // Atualizar status no banco
    await supabase
      .from('printers')
      .update({ 
        connection_status: simulation.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', printerId);

    return NextResponse.json({
      success: true,
      status: simulation.status,
      message: simulation.message,
      responseTime: simulation.responseTime,
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