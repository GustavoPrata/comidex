import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// DELETE /api/printer-queue/[id] - Deletar job da fila
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const jobId = params.id;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID é obrigatório' },
        { status: 400 }
      );
    }

    // Primeiro verificar se o job existe e seu status
    const { data: job, error: fetchError } = await supabase
      .from('printer_queue')
      .select('status')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { error: 'Job não encontrado' },
        { status: 404 }
      );
    }

    // Só permitir deletar jobs que não estão ativos
    if (!['printed', 'cancelled', 'failed'].includes(job.status)) {
      return NextResponse.json(
        { error: 'Apenas jobs impressos, cancelados ou falhados podem ser deletados' },
        { status: 400 }
      );
    }

    // Deletar o job
    const { error: deleteError } = await supabase
      .from('printer_queue')
      .delete()
      .eq('id', jobId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json(
      { message: 'Job deletado com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao deletar job da fila:', error);
    return NextResponse.json(
      { error: 'Falha ao deletar job da fila' },
      { status: 500 }
    );
  }
}