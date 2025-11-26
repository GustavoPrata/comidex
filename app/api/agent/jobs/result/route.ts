import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_AGENT_TOKENS = process.env.AGENT_TOKENS?.split(',') || ['comidex-agent-2024'];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !VALID_AGENT_TOKENS.includes(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { job_id, status, error_message } = body;

    if (!job_id || !status) {
      return NextResponse.json({ success: false, error: 'Missing job_id or status' }, { status: 400 });
    }

    if (!['printed', 'failed'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const supabase = await createClient();

    const updateData: any = {
      status,
      printed_at: new Date().toISOString()
    };

    if (error_message) {
      updateData.error_message = error_message;
    }

    const { error } = await supabase
      .from('printer_queue')
      .update(updateData)
      .eq('id', job_id);

    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    console.log(`[Agent] Job #${job_id} -> ${status}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Agent result error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
