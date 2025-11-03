// app/api/printers/test/route.ts
// Rota para teste de impressão real com comandos ESC/POS
// Envia comandos de teste para impressoras térmicas via rede

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { printerService } from "@/server/printer-service";

export async function POST(request: Request) {
  try {
    const { printerId } = await request.json();
    
    console.log('🖨️  Teste de impressão iniciado para impressora:', printerId);
    
    const supabase = await createClient();
    
    // Buscar dados da impressora
    const { data: printer, error } = await supabase
      .from('printers')
      .select('*')
      .eq('id', printerId)
      .single();
      
    if (error || !printer) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Impressora não encontrada" 
        },
        { status: 404 }
      );
    }
    
    // Verificar se a impressora está ativa
    if (!printer.active) {
      return NextResponse.json({
        success: false,
        error: "Impressora está desativada"
      }, { status: 400 });
    }
    
    // Criar comando de teste ESC/POS
    const testData = printerService.createTestPrint();
    
    // Usar método unificado de impressão
    let printSuccess = false;
    let printMethod = '';
    
    // Verificar se é impressora local ou de rede
    if (printer.is_local) {
      console.log(`💻 Testando impressora local: ${printer.name}`);
      printMethod = 'local';
    } else if (printer.ip_address) {
      console.log(`🌐 Testando impressora de rede: ${printer.ip_address}:${printer.port || 9100}`);
      printMethod = 'network';
      
      // Verificar conectividade primeiro para impressoras de rede
      const isReachable = await printerService.testPrinterConnection(
        printer.ip_address, 
        parseInt(printer.port) || 9100
      );
      
      if (!isReachable) {
        console.log('⚠️ Impressora não alcançável via rede');
        
        // Atualizar status de erro no banco
        await supabase
          .from('printers')
          .update({ 
            connection_status: 'offline',
            test_result: 'Impressora não alcançável na rede'
          })
          .eq('id', printerId);
          
        return NextResponse.json({
          success: false,
          error: `Não foi possível conectar com a impressora ${printer.name}`,
          message: `Verifique se a impressora está ligada e conectada à rede no endereço ${printer.ip_address}:${printer.port || 9100}`,
          details: {
            ip: printer.ip_address,
            port: printer.port || 9100,
            hints: [
              '1. Verifique se a impressora está ligada',
              '2. Confirme o endereço IP no display da impressora',
              '3. Teste o ping para o IP da impressora',
              '4. Verifique se a porta 9100 está aberta',
              '5. Desative temporariamente o firewall para teste'
            ]
          }
        }, { status: 503 });
      }
    }
    
    // Tentar imprimir usando método unificado
    printSuccess = await printerService.print(printer, testData);
    
    
    const timestamp = new Date().toLocaleString('pt-BR');
    
    if (printSuccess) {
      // Atualizar timestamp do último teste bem-sucedido
      await supabase
        .from('printers')
        .update({ 
          last_test_at: new Date().toISOString(),
          connection_status: 'online',
          test_result: 'Teste realizado com sucesso'
        })
        .eq('id', printerId);
      
      console.log('✅ Teste de impressão concluído com sucesso');
      
      return NextResponse.json({
        success: true,
        message: `Teste de impressão enviado com sucesso para ${printer.name}`,
        method: printMethod,
        timestamp,
        printer: {
          id: printer.id,
          name: printer.name,
          model: printer.printer_model,
          ip: printer.ip_address,
          port: printer.port || 9100
        },
        details: {
          printMethod,
          testContent: [
            `====================================`,
            `     TESTE DE IMPRESSÃO REAL`,
            `====================================`,
            `Impressora: ${printer.name}`,
            `Modelo: ${printer.printer_model || 'N/A'}`,
            `IP: ${printer.ip_address}:${printer.port || 9100}`,
            `Data/Hora: ${timestamp}`,
            `------------------------------------`,
            `Status: IMPRESSORA FÍSICA DETECTADA`,
            `Método: ${printMethod === 'network' ? 'Rede TCP/IP' : 'Local'}`,
            `====================================`,
            ``,
            `✅ TESTE BEM-SUCEDIDO`,
            ``,
            `Se você está lendo isso na impressora,`,
            `a comunicação está funcionando!`,
            `====================================`,
            `[CORTE AUTOMÁTICO]`
          ].join('\n')
        }
      });
    } else {
      console.log('❌ Falha ao enviar teste de impressão');
      
      // Atualizar status de erro no banco
      await supabase
        .from('printers')
        .update({ 
          connection_status: 'offline',
          test_result: 'Falha na comunicação com a impressora'
        })
        .eq('id', printerId);
      
      return NextResponse.json({
        success: false,
        error: `Não foi possível comunicar com a impressora ${printer.name}`,
        message: `Verifique se a impressora está ligada e conectada à rede`,
        details: {
          ip: printer.ip_address,
          port: printer.port || 9100,
          hints: [
            '1. Certifique-se que a impressora está ligada',
            '2. Verifique o cabo de rede ou conexão WiFi',
            '3. Confirme o IP da impressora no display ou configurações',
            '4. A porta padrão para impressoras térmicas é 9100',
            '5. Desative temporariamente o firewall para teste'
          ]
        }
      }, { status: 503 });
    }
    
  } catch (error: any) {
    console.error('❌ Erro no teste de impressão:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Erro ao executar teste de impressão"
      },
      { status: 500 }
    );
  }
}