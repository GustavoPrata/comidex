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
    const agentMode = request.headers.get('x-agent-mode') || 'bridge';

    const supabase = await createClient();

    const { data: printers } = await supabase
      .from('printers')
      .select('id, name, ip_address, port, type, active')
      .eq('active', true);

    const { data: jobs, error } = await supabase
      .from('printer_queue')
      .select(`
        id,
        printer_id,
        document_type,
        status,
        priority,
        copies,
        order_item_id,
        created_at,
        printers (
          id,
          name,
          ip_address,
          port,
          type
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

    const jobIds = (jobs || []).map(j => j.order_item_id).filter(Boolean);
    
    let orderItemsMap: Record<number, any> = {};
    if (jobIds.length > 0) {
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity,
          notes,
          order_id,
          items (
            id,
            name
          )
        `)
        .in('id', jobIds);
      
      if (orderItems) {
        for (const item of orderItems) {
          orderItemsMap[item.id] = item;
        }
      }
    }

    const orderIds = Object.values(orderItemsMap).map((oi: any) => oi.order_id).filter(Boolean);
    let ordersMap: Record<number, any> = {};
    if (orderIds.length > 0) {
      const { data: orders } = await supabase
        .from('orders')
        .select('id, table_session_id')
        .in('id', orderIds);
      
      if (orders) {
        for (const order of orders) {
          ordersMap[order.id] = order;
        }
      }
    }

    const sessionIds = Object.values(ordersMap).map((o: any) => o.table_session_id).filter(Boolean);
    let sessionsMap: Record<number, any> = {};
    if (sessionIds.length > 0) {
      const { data: sessions } = await supabase
        .from('table_sessions')
        .select(`id, table_id, tables (id, name)`)
        .in('id', sessionIds);
      
      if (sessions) {
        for (const session of sessions) {
          sessionsMap[session.id] = session;
        }
      }
    }

    const formattedJobs = (jobs || []).map((job: any) => {
      const printer = job.printers;
      const orderItem = job.order_item_id ? orderItemsMap[job.order_item_id] : null;
      const item = orderItem?.items;
      const order = orderItem?.order_id ? ordersMap[orderItem.order_id] : null;
      const session = order?.table_session_id ? sessionsMap[order.table_session_id] : null;
      const table = session?.tables;

      return {
        id: job.id,
        printer_id: job.printer_id,
        printer_name: printer?.name || 'Impressora',
        printer_ip: printer?.ip_address || '',
        printer_port: printer?.port || 9100,
        printer_type: printer?.type || 'network',
        document_type: job.document_type,
        status: job.status,
        table_name: table?.name || 'Mesa ?',
        item_name: item?.name || 'Item',
        quantity: orderItem?.quantity || 1,
        notes: orderItem?.notes || '',
        order_id: order?.id || 0,
        created_at: job.created_at,
        data: ''
      };
    });

    if (formattedJobs.length > 0) {
      await supabase
        .from('printer_queue')
        .update({ status: 'printing' })
        .in('id', formattedJobs.map((j: any) => j.id));
    }

    console.log(`[Agent: ${agentName} v${agentVersion} mode:${agentMode}] ${formattedJobs.length} jobs, ${printers?.length || 0} printers`);

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
