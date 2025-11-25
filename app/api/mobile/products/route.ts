import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Listar produtos sempre da tabela items
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const category_id = searchParams.get('category_id')
    const group_id = searchParams.get('group_id')
    const mode = searchParams.get('mode') // 'rodizio' ou 'carte'
    
    let products: any[] = []
    
    if (group_id) {
      // Buscar as categorias associadas ao grupo
      const { data: groupCategoriesData, error: groupCatError } = await supabase
        .from('group_categories')
        .select('category_id')
        .eq('group_id', group_id)
        .eq('active', true)
      
      if (groupCatError) throw groupCatError
      
      if (groupCategoriesData && groupCategoriesData.length > 0) {
        const categoryIds = groupCategoriesData.map(gc => gc.category_id)
        
        // Buscar todos os produtos dessas categorias diretamente da tabela items
        let query = supabase
          .from('items')
          .select('*, categories(name, image)')
          .in('category_id', categoryIds)
          .eq('active', true)
          .order('name', { ascending: true })
        
        // Filtrar por categoria específica se informada
        if (category_id && category_id !== '999') {
          query = query.eq('category_id', parseInt(category_id))
        }
        
        const { data: itemsData, error: itemsError } = await query
        if (itemsError) throw itemsError
        
        products = itemsData?.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          category_id: item.category_id,
          active: item.active,
          available: item.available,
          printer_id: item.printer_id,
          categories: item.categories,
          group_id: parseInt(group_id)
        })) || []
      }
    } else {
      // Buscar todos os produtos da tabela items
      let query = supabase
        .from('items')
        .select('*, categories(name, image)')
        .eq('active', true)
        .order('name', { ascending: true })

      // Filtrar por categoria se especificado
      if (category_id && category_id !== '999') {
        query = query.eq('category_id', parseInt(category_id))
      }
      
      const { data, error } = await query
      if (error) throw error
      products = data || []
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
    let filteredProducts = products
    
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
      image_url: product.image || null,
      category: product.categories?.name || 'Sem categoria',
      category_id: product.category_id,
      is_premium: product.group_id ? true : false,
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
