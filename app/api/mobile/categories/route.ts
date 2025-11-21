import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Listar categorias ativas
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

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