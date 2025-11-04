import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get optional profile_id from query params
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profile_id');

    let query = supabase
      .from('print_templates')
      .select('*')
      .order('template_type', { ascending: true })
      .order('name', { ascending: true });

    if (profileId) {
      query = query.eq('profile_id', profileId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error fetching print templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.profile_id) {
      return NextResponse.json(
        { error: 'Nome e perfil são obrigatórios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('print_templates')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating print template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}