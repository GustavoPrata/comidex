import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Listar produtos da tabela items (igual admin/items)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const category_id = searchParams.get('category_id')
    const group_id = searchParams.get('group_id')
    const mode = searchParams.get('mode') // 'rodizio' ou 'carte'
    
    let products: any[] = []
    
    // Buscar produtos da tabela items diretamente
    let query = supabase
      .from('items')
      .select('*, categories(id, name, image, group_id)')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    
    // Filtrar por categoria se especificado
    if (category_id && category_id !== '999') {
      query = query.eq('category_id', parseInt(category_id))
    }
    
    const { data: itemsData, error: itemsError } = await query
    if (itemsError) throw itemsError
    
    products = itemsData || []
    
    // Se tem group_id, filtrar produtos cujas categorias pertencem a esse grupo
    if (group_id) {
      products = products.filter(item => 
        item.categories && item.categories.group_id === parseInt(group_id)
      )
    }
    
    // Se categoria bebidas (999), filtrar por produtos que contenham "bebida" ou "drink"
    if (category_id === '999') {
      products = products.filter(p => 
        p.name.toLowerCase().includes('bebida') ||
        p.name.toLowerCase().includes('drink') ||
        p.name.toLowerCase().includes('suco') ||
        p.name.toLowerCase().includes('refrigerante')
      )
    }

    // Filtrar por modo se especificado
    if (mode === 'rodizio') {
      // Rodízio - apenas produtos com preço 0
      products = products.filter(p => parseFloat(p.price) === 0)
    } else if (mode === 'carte') {
      // À La Carte - apenas produtos com preço > 0
      products = products.filter(p => parseFloat(p.price) > 0)
    }

    // Formatar resposta
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image || null,
      category: product.categories?.name || 'Sem categoria',
      category_id: product.category_id,
      group_id: product.categories?.group_id || null,
      printer_id: product.printer_id,
      available: product.available
    }))

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      total: formattedProducts.length
    })
  } catch (error: any) {
    console.error('Erro ao buscar produtos:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar produtos',
        message: error.message 
      },
      { status: 500 }
    )
  }
}
