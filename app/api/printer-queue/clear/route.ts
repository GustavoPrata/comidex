import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/printer-queue/clear - Limpar toda a fila pendente
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Deletar todos os jobs pendentes ou em impressão
    const { data, error } = await supabase
      .from('printer_queue')
      .delete()
      .in('status', ['pending', 'printing'])
      .select();

    if (error) {
      throw error;
    }

    const count = data?.length || 0;

    return NextResponse.json(
      { 
        message: `${count} trabalho(s) removido(s) da fila`,
        count: count
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao limpar fila de impressão:', error);
    return NextResponse.json(
      { error: 'Falha ao limpar fila de impressão' },
      { status: 500 }
    );
  }
}