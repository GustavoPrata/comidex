import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - Listar tipos de serviço (rodízio, à la carte, etc)
// Read-only endpoint para o tablet
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Buscar service types com grupos linkados
    const { data: serviceTypes, error } = await supabase
      .from('tablet_service_types')
      .select(`
        *,
        linked_groups:tablet_service_type_groups(
          group:groups(*)
        )
      `)
      .order('display_order', { ascending: true });
      
    if (error) {
      console.error('Erro ao buscar service types:', error);
      return NextResponse.json({
        success: false,
        message: error.message
      }, { status: 500 });
    }
    
    // Formatar resposta
    const formattedTypes = (serviceTypes || []).map((type: any) => ({
      ...type,
      linked_groups: type.linked_groups?.map((link: any) => link.group) || []
    }));
    
    return NextResponse.json({
      success: true,
      serviceTypes: formattedTypes
    });
    
  } catch (error) {
    console.error('Erro ao processar service types:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}