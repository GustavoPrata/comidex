import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCorsResponse, handleOptions } from '../middleware'

// OPTIONS - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleOptions()
}

// GET - Listar tipos de atendimento ativos
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Buscar tipos de atendimento ativos com grupos linkados
    const { data: serviceTypes, error } = await supabase
      .from('tablet_service_types')
      .select(`
        *,
        tablet_service_type_groups (
          group_id,
          groups (
            id,
            name,
            type,
            price
          )
        )
      `)
      .eq('active', true)
      .order('display_order')
    
    if (error) throw error

    // Formatar resposta
    const formattedTypes = (serviceTypes || []).map(type => ({
      id: type.id,
      name: type.name,
      description: type.description,
      icon: type.icon,
      color: type.color,
      price: type.price,
      display_order: type.display_order,
      linked_groups: type.tablet_service_type_groups?.map((tsg: any) => ({
        id: tsg.groups?.id,
        name: tsg.groups?.name,
        type: tsg.groups?.type,
        price: tsg.groups?.price
      })).filter((g: any) => g.id) || []
    }))

    return createCorsResponse({
      success: true,
      service_types: formattedTypes,
      total: formattedTypes.length
    })
  } catch (error: any) {
    console.error('Erro ao buscar tipos de atendimento:', error)
    return createCorsResponse({ 
      success: false,
      error: 'Erro ao buscar tipos de atendimento',
      message: error.message 
    })
  }
}