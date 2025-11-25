import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Listar produtos com filtros (usando tabelas ponte)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const category_id = searchParams.get('category_id')
    const group_id = searchParams.get('group_id')
    const mode = searchParams.get('mode') // 'rodizio' ou 'carte'
    
    let products: any[] = []
    
    if (group_id) {
      // Primeiro, tentar buscar produtos através da tabela ponte group_item_settings
      const { data: groupItemsData, error: groupItemsError } = await supabase
        .from('group_item_settings')
        .select(`
          item_id,
          price_override,
          is_available,
          sort_order,
          items!inner (
            id,
            name,
            description,
            price,
            image,
            category_id,
            active,
            available,
            printer_id,
            categories (
              name,
              image
            )
          )
        `)
        .eq('group_id', group_id)
        .eq('is_available', true)
        .eq('items.active', true)
        .order('sort_order', { ascending: true })
      
      if (groupItemsError) throw groupItemsError
      
      // Se encontrou produtos na tabela ponte, usar esses
      if (groupItemsData && groupItemsData.length > 0) {
        products = groupItemsData.map(item => ({
          id: item.items.id,
          name: item.items.name,
          description: item.items.description,
          price: item.price_override || item.items.price,
          image: item.items.image,
          category_id: item.items.category_id,
          active: item.items.active,
          available: item.is_available,
          printer_id: item.items.printer_id,
          categories: item.items.categories,
          group_id: parseInt(group_id)
        }))
      } else {
        // Se não encontrou na tabela ponte, buscar produtos das categorias associadas ao grupo
        const { data: groupCategoriesData, error: groupCatError } = await supabase
          .from('group_categories')
          .select('category_id')
          .eq('group_id', group_id)
          .eq('active', true)
        
        if (groupCatError) throw groupCatError
        
        if (groupCategoriesData && groupCategoriesData.length > 0) {
          const categoryIds = groupCategoriesData.map(gc => gc.category_id)
          
          // Buscar todos os produtos dessas categorias
          const { data: itemsData, error: itemsError } = await supabase
            .from('items')
            .select('*, categories(name, image)')
            .in('category_id', categoryIds)
            .eq('active', true)
            .order('name', { ascending: true })
          
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
      }
      
      // Filtrar por categoria se especificado
      if (category_id && category_id !== '999') {
        products = products.filter(p => p.category_id === parseInt(category_id))
      }
    } else {
      // Buscar todos os produtos (comportamento antigo)
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