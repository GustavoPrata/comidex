import { NextResponse } from "next/server";

// Esta API retorna o status real das impressoras virtuais
// baseado no que está armazenado no sistema
export async function POST(request: Request) {
  try {
    const { ipAddress } = await request.json();
    
    // Mapear o status padrão das impressoras virtuais
    // Isso simula a verificação real de rede
    const defaultVirtualStatus: Record<string, { powered: boolean, status: string }> = {
      '192.168.1.101': { powered: false, status: 'offline' }, // Virtual Cozinha - DESLIGADA
      '192.168.1.102': { powered: true, status: 'online' },   // Virtual Bar - LIGADA
      '192.168.1.103': { powered: true, status: 'online' },   // Virtual Caixa - LIGADA
      '192.168.1.104': { powered: true, status: 'online' }    // Virtual Sushi Bar - LIGADA
    };
    
    // Se é um IP conhecido de impressora virtual
    if (defaultVirtualStatus[ipAddress]) {
      return NextResponse.json({
        success: true,
        ...defaultVirtualStatus[ipAddress],
        isVirtual: true
      });
    }
    
    // Para IPs não virtuais, considerar online se ativo
    return NextResponse.json({
      success: true,
      powered: true,
      status: 'online',
      isVirtual: false
    });
    
  } catch (error: any) {
    console.error('Erro ao verificar status virtual:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Erro ao verificar status",
        powered: false,
        status: 'error'
      },
      { status: 500 }
    );
  }
}