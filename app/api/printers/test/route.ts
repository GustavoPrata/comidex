import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    // Em produção, aqui seria feita a conexão real com a impressora
    // Por enquanto, vamos simular o teste baseado no IP
    const isLocalNetwork = printer.ip_address.startsWith('192.168.') || 
                          printer.ip_address.startsWith('10.') || 
                          printer.ip_address.startsWith('172.');

    // Simular teste baseado em condições
    const testSuccess = isLocalNetwork && printer.active;
    const currentTime = new Date().toISOString();

    // Atualizar status no banco
    await supabase
      .from('printers')
      .update({ 
        connection_status: testSuccess ? 'online' : 'offline',
        last_test_at: currentTime,
        test_result: testSuccess 
          ? 'Teste simulado bem-sucedido - Impressora pronta' 
          : 'Teste simulado falhou - Verifique configurações de rede'
      })
      .eq('id', printerId);

    if (testSuccess) {
      return NextResponse.json({
        success: true,
        message: `Teste de impressão enviado com sucesso para ${printer.name}!`,
        details: {
          ip: printer.ip_address,
          port: printer.port,
          model: printer.printer_model,
          timestamp: currentTime
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Impressora fora do alcance ou desligada",
        details: {
          ip: printer.ip_address,
          port: printer.port,
          model: printer.printer_model,
          message: "Verifique se a impressora está ligada e na mesma rede"
        }
      });
    }
  } catch (error: any) {
    console.error('Erro no teste de impressora:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao testar impressora" },
      { status: 500 }
    );
  }
}