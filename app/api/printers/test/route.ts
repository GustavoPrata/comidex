import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Simular teste de impressão realista
async function simulatePrintTest(printer: any): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  // Verificar se impressora está ativa
  if (!printer.active) {
    return {
      success: false,
      message: `Impressora ${printer.name} está desativada`,
      details: { reason: 'inactive' }
    };
  }

  // Verificar IP válido
  const isLocalNetwork = printer.ip_address.startsWith('192.168.') || 
                        printer.ip_address.startsWith('10.') || 
                        printer.ip_address.startsWith('172.');
  
  if (!isLocalNetwork) {
    return {
      success: false,
      message: `IP ${printer.ip_address} inválido ou fora da rede local`,
      details: { reason: 'invalid_ip' }
    };
  }

  // Simular diferentes resultados de teste (80% sucesso, 20% falha)
  const randomChance = Math.random();
  
  if (randomChance < 0.8) {
    // Sucesso - 80% de chance
    const testContent = [
      `====================================`,
      `     TESTE DE IMPRESSÃO`,
      `====================================`,
      `Impressora: ${printer.name}`,
      `Modelo: ${printer.printer_model || 'N/A'}`,
      `IP: ${printer.ip_address}:${printer.port}`,
      `Data/Hora: ${new Date().toLocaleString('pt-BR')}`,
      `------------------------------------`,
      `Status: FUNCIONANDO CORRETAMENTE`,
      `====================================`,
      ``,
      `[CORTE AUTOMÁTICO]`
    ].join('\n');

    // Simular tempo de impressão (1-3 segundos)
    const printTime = Math.random() * 2000 + 1000;
    await new Promise(resolve => setTimeout(resolve, printTime));
    
    return {
      success: true,
      message: `Teste enviado com sucesso para ${printer.name}`,
      details: {
        printTime: Math.round(printTime),
        linesCount: 12,
        content: testContent
      }
    };
  } else {
    // Falha - 20% de chance
    const errors = [
      { 
        message: 'Impressora sem papel - reponha o papel térmico', 
        code: 'NO_PAPER' 
      },
      { 
        message: 'Tampa da impressora aberta - feche a tampa para continuar', 
        code: 'COVER_OPEN' 
      },
      { 
        message: 'Erro de comunicação - verifique o cabo de rede', 
        code: 'CONNECTION_ERROR' 
      },
      { 
        message: 'Impressora offline - ligue a impressora', 
        code: 'OFFLINE' 
      },
      { 
        message: 'Erro no mecanismo de corte - manutenção necessária', 
        code: 'CUTTER_ERROR' 
      }
    ];
    
    const error = errors[Math.floor(Math.random() * errors.length)];
    
    // Simular tempo de tentativa (0.5-2 segundos)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));
    
    return {
      success: false,
      message: error.message,
      details: {
        errorCode: error.code,
        printerName: printer.name
      }
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

    // Simular teste de impressão
    const testResult = await simulatePrintTest(printer);
    
    // Salvar resultado do teste no banco
    const updateData: any = {
      last_test_at: new Date().toISOString(),
      test_result: testResult.success ? 'Sucesso' : testResult.message
    };
    
    // Se o teste foi bem sucedido, atualizar status para online
    if (testResult.success) {
      updateData.connection_status = 'online';
    } else if (testResult.details?.errorCode === 'OFFLINE') {
      updateData.connection_status = 'offline';
    } else {
      updateData.connection_status = 'error';
    }
    
    await supabase
      .from('printers')
      .update(updateData)
      .eq('id', printerId);

    return NextResponse.json(testResult);
  } catch (error: any) {
    console.error('Erro ao testar impressora:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao testar impressora" },
      { status: 500 }
    );
  }
}