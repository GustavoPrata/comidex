import { NextResponse } from "next/server";

// API endpoint to get virtual printer status
export async function GET() {
  try {
    // This endpoint would normally check the actual state from the server
    // For now, we return the default states
    const virtualPrintersStatus = {
      '192.168.1.101': false, // Virtual Cozinha - DESLIGADA
      '192.168.1.102': true,  // Virtual Bar - LIGADA
      '192.168.1.103': true,  // Virtual Caixa - LIGADA
      '192.168.1.104': true   // Virtual Sushi Bar - LIGADA
    };
    
    return NextResponse.json({
      success: true,
      status: virtualPrintersStatus
    });
  } catch (error: any) {
    console.error('Erro ao obter status das impressoras virtuais:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao obter status" },
      { status: 500 }
    );
  }
}

// API endpoint to update virtual printer status
export async function POST(request: Request) {
  try {
    const { ipAddress, powered } = await request.json();
    
    // Here we would update the actual virtual printer state
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: `Status da impressora ${ipAddress} atualizado para ${powered ? 'ligada' : 'desligada'}`
    });
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro ao atualizar status" },
      { status: 500 }
    );
  }
}