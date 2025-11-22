import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Listar categorias ativas (com suporte a filtro por grupo)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const groupId = searchParams.get('group_id')
    
    let categories
    
    if (groupId) {
      // Buscar categorias através da tabela ponte
      const { data, error } = await supabase
        .from('group_categories')
        .select(`
          category_id,
          sort_order,
          categories!inner (
            id,
            name,
            description,
            image,
            active,
            sort_order
          )
        `)
        .eq('group_id', groupId)
        .eq('categories.active', true)
        .eq('active', true)
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      
      // Remodelar os dados para o formato esperado
      categories = data?.map(item => ({
        id: item.categories.id,
        name: item.categories.name,
        description: item.categories.description,
        image: item.categories.image,
        active: item.categories.active,
        sort_order: item.sort_order,
        group_id: parseInt(groupId)
      }))
    } else {
      // Buscar todas as categorias (comportamento antigo)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      categories = data
    }

    // Adicionar categoria especial de bebidas
    const categoriesWithDrinks = [
      ...(categories || []),
      {
        id: 999,
        name: 'Bebidas',
        description: 'Bebidas e drinks',
        active: true,
        icon: 'wine',
        order_index: 999
      }
    ]

    return NextResponse.json({
      success: true,
      categories: categoriesWithDrinks
    })
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar categorias',
        message: error.message 
      },
      { status: 500 }
    )
  }
}