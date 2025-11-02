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

    // Em produção, aqui seria feita a verificação real de conectividade
    // Por enquanto, vamos simular baseado nas configurações
    const isLocalNetwork = printer.ip_address.startsWith('192.168.') || 
                          printer.ip_address.startsWith('10.') || 
                          printer.ip_address.startsWith('172.');

    const isOnline = isLocalNetwork && printer.active;
    const status = isOnline ? 'online' : 'offline';
    const message = isOnline 
      ? `Impressora ${printer.name} está online e pronta`
      : `Impressora ${printer.name} está offline ou inacessível`;

    // Atualizar status no banco
    await supabase
      .from('printers')
      .update({ connection_status: status })
      .eq('id', printerId);

    return NextResponse.json({
      success: true,
      status: status,
      message: message,
      details: {
        name: printer.name,
        model: printer.printer_model,
        ip: printer.ip_address,
        port: printer.port
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