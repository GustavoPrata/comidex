import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Listar categorias (usando group_id direto da tabela categories)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const groupId = searchParams.get('group_id')
    
    let query = supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    
    // Filtrar por grupo se especificado
    if (groupId) {
      query = query.eq('group_id', parseInt(groupId))
    }
    
    const { data: categories, error } = await query
    
    if (error) throw error

    return NextResponse.json({
      success: true,
      categories: categories || []
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
