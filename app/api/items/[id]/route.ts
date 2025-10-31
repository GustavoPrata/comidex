import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: item, error: itemError } = await supabase
      .from('items')
      .select(`
        *,
        categories (name),
        groups (name)
      `)
      .eq('id', params.id)
      .single()
    
    if (itemError) throw itemError
    
    // Get associated additional categories
    const { data: additionalCategories, error: acError } = await supabase
      .from('item_additional_categories')
      .select('additional_category_id')
      .eq('item_id', params.id)
    
    if (acError) throw acError
    
    return NextResponse.json({
      ...item,
      additional_category_ids: additionalCategories?.map(ac => ac.additional_category_id) || []
    })
  } catch (error) {
    console.error('Error fetching item:', error)
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Extract additional_category_ids from the body
    const { additional_category_ids, ...itemData } = body
    
    // Update the item
    const { data: updatedItem, error: updateError } = await supabase
      .from('items')
      .update(itemData)
      .eq('id', params.id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    // Handle additional categories if provided
    if (additional_category_ids !== undefined) {
      // Delete existing associations
      const { error: deleteError } = await supabase
        .from('item_additional_categories')
        .delete()
        .eq('item_id', params.id)
      
      if (deleteError) throw deleteError
      
      // Insert new associations
      if (additional_category_ids && additional_category_ids.length > 0) {
        const associations = additional_category_ids.map((categoryId: number) => ({
          item_id: parseInt(params.id),
          additional_category_id: categoryId
        }))
        
        const { error: insertError } = await supabase
          .from('item_additional_categories')
          .insert(associations)
        
        if (insertError) throw insertError
      }
    }
    
    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating item:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting item:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}