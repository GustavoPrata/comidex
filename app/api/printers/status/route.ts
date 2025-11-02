import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import net from 'net';

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

    // Verificar conexão com a impressora
    return new Promise((resolve) => {
      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        resolve(NextResponse.json({
          success: true,
          status: 'offline',
          message: 'Impressora não está respondendo'
        }));
      }, 2000); // 2 segundos de timeout para verificação rápida

      client.connect(parseInt(printer.port), printer.ip_address, () => {
        clearTimeout(timeout);
        client.end();
        
        // Atualizar status no banco
        supabase
          .from('printers')
          .update({ connection_status: 'online' })
          .eq('id', printerId)
          .then(() => {
            resolve(NextResponse.json({
              success: true,
              status: 'online',
              message: 'Impressora está online e respondendo'
            }));
          });
      });

      client.on('error', () => {
        clearTimeout(timeout);
        
        // Atualizar status no banco
        supabase
          .from('printers')
          .update({ connection_status: 'offline' })
          .eq('id', printerId)
          .then(() => {
            resolve(NextResponse.json({
              success: true,
              status: 'offline',
              message: 'Impressora está offline ou inacessível'
            }));
          });
      });
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}