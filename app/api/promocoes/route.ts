import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active') === 'true';
    const today = searchParams.get('today') === 'true';

    let query = supabase
      .from('promotions')
      .select('*')
      .order('priority', { ascending: false });

    if (active) {
      query = query.eq('active', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Filter by today if requested
    if (today && data) {
      const todayDate = new Date();
      const dayOfWeek = todayDate.getDay();
      const currentTime = todayDate.toTimeString().slice(0, 5);
      
      const filteredData = data.filter(promo => {
        // Check weekdays
        if (promo.weekdays && promo.weekdays.length > 0) {
          if (!promo.weekdays.includes(dayOfWeek)) {
            return false;
          }
        }
        
        // Check time
        if (promo.start_time && promo.end_time) {
          if (currentTime < promo.start_time || currentTime > promo.end_time) {
            return false;
          }
        }
        
        // Check date range
        if (promo.valid_from && new Date(promo.valid_from) > todayDate) {
          return false;
        }
        if (promo.valid_until && new Date(promo.valid_until) < todayDate) {
          return false;
        }
        
        return true;
      });
      
      return NextResponse.json(filteredData);
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('promotions')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}