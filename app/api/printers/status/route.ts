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

  // Simular diferentes condições de rede com aleatoriedade
  const randomChance = Math.random();
  
  // 70% de chance de estar online
  if (randomChance < 0.7) {
    const responseTime = Math.floor(Math.random() * 100) + 20; // 20-120ms
    return {
      status: 'online',
      message: `Impressora ${printer.name} está online e pronta`,
      responseTime
    };
  }
  
  // 20% de chance de estar offline (desligada, sem papel, etc)
  if (randomChance < 0.9) {
    const reasons = [
      'está offline ou desligada',
      'sem papel - repor papel térmico',
      'tampa aberta - verificar impressora',
      'erro de comunicação - verificar cabo de rede',
      'sem resposta - reiniciar impressora'
    ];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    return {
      status: 'offline',
      message: `Impressora ${printer.name} ${reason}`
    };
  }
  
  // 10% de chance de erro (problema técnico)
  const errors = [
    'erro no mecanismo de impressão',
    'superaquecimento - aguardar esfriar',
    'erro de firmware - atualização necessária',
    'problema na guilhotina de corte'
  ];
  const error = errors[Math.floor(Math.random() * errors.length)];
  return {
    status: 'error',
    message: `Impressora ${printer.name} - ${error}`
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