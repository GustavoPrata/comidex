import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const VALID_AGENT_TOKENS = process.env.AGENT_TOKENS?.split(',') || ['comidex-agent-2024'];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token || !VALID_AGENT_TOKENS.includes(token)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const agentName = request.headers.get('x-agent-name') || 'Unknown';
    const agentVersion = request.headers.get('x-agent-version') || '0.0.0';
    const agentMode = request.headers.get('x-agent-mode') || 'single';

    const supabase = await createClient();

    const { data: printers } = await supabase
      .from('printers')
      .select('id, name, ip_address, port, connection_type, location, status')
      .eq('status', 'online');

    const { data: jobs, error } = await supabase
      .from('printer_queues')
      .select(`
        id,
        printer_id,
        document_type,
        status,
        priority,
        copies,
        notes,
        order_item_id,
        created_at,
        printers (
          id,
          name,
          ip_address,
          port,
          connection_type,
          location
        ),
        order_items (
          id,
          quantity,
          notes,
          items (
            id,
            name
          ),
          orders (
            id,
            table_sessions (
              tables (
                id,
                name
              )
            )
          )
        )
      `)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }

    const formattedJobs = (jobs || []).map((job: any) => {
      const orderItem = job.order_items;
      const item = orderItem?.items;
      const order = orderItem?.orders;
      const tableSession = order?.table_sessions;
      const table = tableSession?.tables;
      const printer = job.printers;

      return {
        id: job.id,
        printer_id: job.printer_id,
        printer_name: printer?.name || 'Impressora',
        printer_ip: printer?.ip_address || '',
        printer_port: printer?.port || 9100,
        printer_type: printer?.connection_type || 'network',
        document_type: job.document_type,
        status: job.status,
        table_name: table?.name || 'Mesa ?',
        item_name: item?.name || 'Item desconhecido',
        quantity: orderItem?.quantity || 1,
        notes: orderItem?.notes || job.notes || '',
        order_id: order?.id || 0,
        created_at: job.created_at,
        data: ''
      };
    });

    if (formattedJobs.length > 0) {
      await supabase
        .from('printer_queues')
        .update({ 
          status: 'printing',
          started_at: new Date().toISOString()
        })
        .in('id', formattedJobs.map((j: any) => j.id));
    }

    console.log(`[Agent: ${agentName} v${agentVersion} mode:${agentMode}] Fetched ${formattedJobs.length} jobs, ${printers?.length || 0} printers`);

    return NextResponse.json({ 
      success: true, 
      jobs: formattedJobs,
      printers: printers || []
    });

  } catch (error) {
    console.error('Agent jobs error:', error);
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
