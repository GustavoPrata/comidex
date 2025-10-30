import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching groups:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return groups as-is since icon_id now stores the string values directly
    return NextResponse.json(groups || []);
  } catch (error) {
    console.error('Error in GET /api/groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    console.log('Received group data:', body);
    
    // Build values for insert  
    const insertData = {
      name: body.name,
      type: body.type || 'a_la_carte',
      price: body.price || null,
      active: body.active !== undefined ? body.active : true,
      sort_order: body.sort_order || 0
    };
    
    console.log('Inserting group:', insertData);
    
    const { data, error } = await supabase
      .from('groups')
      .insert([insertData])
      .select()
      .single();
      
    if (error) {
      console.error('Error creating group:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('Successfully created group:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    console.log('Updating group:', { id, ...updateData });
    
    // Remove icon_id if present to avoid schema errors
    delete updateData.icon_id;
    
    const { data, error } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating group:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Successfully updated group:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting group:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}