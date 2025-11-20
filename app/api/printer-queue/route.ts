import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const printerId = searchParams.get('printer_id')
    const status = searchParams.get('status')
    
    let query = supabase
      .from('printer_queue')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          notes,
          items (
            id,
            name,
            price,
            description,
            category_id,
            group_id,
            categories (
              id,
              name
            ),
            groups (
              id,
              name
            )
          ),
          orders (
            id,
            table_id,
            total,
            status
          )
        )
      `)
      .order('created_at', { ascending: true }) // FIFO - primeiro a entrar, primeiro a sair
    
    if (printerId) {
      query = query.eq('printer_id', printerId)
    }
    
    if (status) {
      query = query.eq('status', status)
    } else {
      // Default to pending items
      query = query.in('status', ['pending', 'printing'])
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching printer queue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch printer queue' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('printer_queue')
      .insert({
        order_item_id: body.order_item_id,
        printer_id: body.printer_id,
        copies: body.copies || 1,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating print job:', error)
    return NextResponse.json(
      { error: 'Failed to create print job' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('id')
    const body = await request.json()
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('printer_queue')
      .update({
        status: body.status,
        printed_at: body.status === 'printed' ? new Date().toISOString() : null
      })
      .eq('id', jobId)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating print job:', error)
    return NextResponse.json(
      { error: 'Failed to update print job' },
      { status: 500 }
    )
  }
}