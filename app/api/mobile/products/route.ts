import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Listar produtos com filtros
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category_id = searchParams.get('category_id')
    const mode = searchParams.get('mode') // 'rodizio' ou 'carte'
    
    let query = supabase
      .from('products')
      .select('*, categories(name, icon)')
      .eq('active', true)
      .order('name', { ascending: true })

    // Filtrar por categoria se especificado
    if (category_id && category_id !== '999') {
      query = query.eq('category_id', parseInt(category_id))
    }
    
    // Se categoria bebidas (999), filtrar por produtos que contenham "bebida" ou "drink"
    if (category_id === '999') {
      query = query.or('name.ilike.%bebida%,name.ilike.%drink%,name.ilike.%suco%,name.ilike.%refrigerante%')
    }

    const { data: products, error } = await query

    if (error) throw error

    // Filtrar por modo se especificado
    let filteredProducts = products || []
    
    if (mode === 'rodizio') {
      // Rodízio - apenas produtos com preço 0
      filteredProducts = filteredProducts.filter(p => parseFloat(p.price) === 0)
    } else if (mode === 'carte') {
      // À La Carte - apenas produtos com preço > 0
      filteredProducts = filteredProducts.filter(p => parseFloat(p.price) > 0)
    }

    // Formatar resposta
    const formattedProducts = filteredProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      category: product.categories?.name || 'Sem categoria',
      category_id: product.category_id,
      is_premium: product.is_premium || false,
      printer_id: product.printer_id,
      available: product.active
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