import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const group = searchParams.get('group')
    
    let query = supabase
      .from('items')
      .select(`
        *,
        categories (name),
        groups (name)
      `)
      .eq('active', true)
      .order('sort_order')
    
    if (category) {
      query = query.eq('category_id', category)
    }
    
    if (group) {
      query = query.eq('group_id', group)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Extract additional_category_ids from the body
    const { additional_category_ids, ...itemData } = body
    
    // Create the item
    const { data: newItem, error } = await supabase
      .from('items')
      .insert(itemData)
      .select()
      .single()
    
    if (error) throw error
    
    // Handle additional categories if provided
    if (newItem && additional_category_ids && additional_category_ids.length > 0) {
      const associations = additional_category_ids.map((categoryId: number) => ({
        item_id: newItem.id,
        additional_category_id: categoryId
      }))
      
      const { error: insertError } = await supabase
        .from('item_additional_categories')
        .insert(associations)
      
      if (insertError) throw insertError
    }
    
    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
}