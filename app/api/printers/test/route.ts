import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import net from 'net';

// Comandos ESC/POS básicos
const ESC_POS = {
  INIT: Buffer.from([0x1B, 0x40]), // Initialize printer
  CUT: Buffer.from([0x1D, 0x56, 0x42, 0x00]), // Cut paper
  LINE_FEED: Buffer.from([0x0A]), // Line feed
  ALIGN_CENTER: Buffer.from([0x1B, 0x61, 0x01]), // Center align
  ALIGN_LEFT: Buffer.from([0x1B, 0x61, 0x00]), // Left align
  BOLD_ON: Buffer.from([0x1B, 0x45, 0x01]), // Bold on
  BOLD_OFF: Buffer.from([0x1B, 0x45, 0x00]), // Bold off
  FONT_SIZE_NORMAL: Buffer.from([0x1D, 0x21, 0x00]), // Normal size
  FONT_SIZE_DOUBLE: Buffer.from([0x1D, 0x21, 0x11]), // Double width and height
};

function encodeText(text: string): Buffer {
  // Converter texto para buffer com encoding apropriado para impressoras térmicas
  return Buffer.from(text, 'utf8');
}

export async function POST(request: Request) {
  try {
    const { printerId } = await request.json();
    const supabase = createClient();

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

    // Tentar conectar à impressora
    return new Promise((resolve) => {
      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        // Atualizar status no banco
        supabase
          .from('printers')
          .update({ 
            connection_status: 'offline',
            last_test_at: new Date().toISOString(),
            test_result: 'Timeout - Impressora não respondeu'
          })
          .eq('id', printerId)
          .then(() => {
            resolve(NextResponse.json({
              success: false,
              error: "Timeout - Impressora não respondeu",
              details: {
                ip: printer.ip_address,
                port: printer.port,
                model: printer.printer_model
              }
            }));
          });
      }, 5000); // 5 segundos de timeout

      client.connect(parseInt(printer.port), printer.ip_address, async () => {
        clearTimeout(timeout);
        
        try {
          // Criar comando de teste
          const testCommands = Buffer.concat([
            ESC_POS.INIT,
            ESC_POS.ALIGN_CENTER,
            ESC_POS.FONT_SIZE_DOUBLE,
            ESC_POS.BOLD_ON,
            encodeText("TESTE DE IMPRESSÃO\n"),
            ESC_POS.BOLD_OFF,
            ESC_POS.FONT_SIZE_NORMAL,
            encodeText("======================\n"),
            ESC_POS.ALIGN_LEFT,
            encodeText(`Impressora: ${printer.name}\n`),
            encodeText(`Modelo: ${printer.printer_model || 'Não especificado'}\n`),
            encodeText(`IP: ${printer.ip_address}:${printer.port}\n`),
            encodeText(`Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`),
            encodeText("======================\n"),
            ESC_POS.ALIGN_CENTER,
            encodeText("Impressora funcionando\n"),
            encodeText("corretamente!\n"),
            ESC_POS.LINE_FEED,
            ESC_POS.LINE_FEED,
            ESC_POS.LINE_FEED,
            ESC_POS.CUT
          ]);

          // Enviar comandos para a impressora
          client.write(testCommands);
          
          // Aguardar um pouco e fechar conexão
          setTimeout(async () => {
            client.end();
            
            // Atualizar status no banco
            await supabase
              .from('printers')
              .update({ 
                connection_status: 'online',
                last_test_at: new Date().toISOString(),
                test_result: 'Teste bem-sucedido - Impressão enviada'
              })
              .eq('id', printerId);

            resolve(NextResponse.json({
              success: true,
              message: "Teste de impressão enviado com sucesso!",
              details: {
                ip: printer.ip_address,
                port: printer.port,
                model: printer.printer_model
              }
            }));
          }, 1000);
        } catch (err) {
          client.end();
          await supabase
            .from('printers')
            .update({ 
              connection_status: 'error',
              last_test_at: new Date().toISOString(),
              test_result: `Erro ao enviar comando: ${err}`
            })
            .eq('id', printerId);

          resolve(NextResponse.json({
            success: false,
            error: "Erro ao enviar comando de impressão",
            details: err
          }));
        }
      });

      client.on('error', async (err) => {
        clearTimeout(timeout);
        
        // Atualizar status no banco
        await supabase
          .from('printers')
          .update({ 
            connection_status: 'offline',
            last_test_at: new Date().toISOString(),
            test_result: `Erro de conexão: ${err.message}`
          })
          .eq('id', printerId);

        resolve(NextResponse.json({
          success: false,
          error: "Não foi possível conectar à impressora",
          details: {
            message: err.message,
            ip: printer.ip_address,
            port: printer.port,
            model: printer.printer_model
          }
        }));
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}