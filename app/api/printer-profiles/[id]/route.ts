import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const id = params.id;

    // Validate required fields
    if (!body.name || !body.model) {
      return NextResponse.json(
        { error: 'Nome e modelo são obrigatórios' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('printer_profiles')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Perfil não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating printer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const id = params.id;

    // First delete all associated templates
    await supabase
      .from('print_templates')
      .delete()
      .eq('profile_id', id);

    // Then delete the profile
    const { error } = await supabase
      .from('printer_profiles')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Perfil excluído com sucesso' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting printer profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}