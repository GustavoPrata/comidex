import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('waiter_request_types')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('Error fetching waiter request types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waiter request types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, icon, color, active, sort_order } = body

    const { data, error } = await supabase
      .from('waiter_request_types')
      .insert({
        name,
        description: description || '',
        icon: icon || 'HelpCircle',
        color: color || '#FF7043',
        active: active !== false,
        sort_order: sort_order || 0
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error creating waiter request type:', error)
    return NextResponse.json(
      { error: 'Failed to create waiter request type' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, description, icon, color, active, sort_order } = body

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('waiter_request_types')
      .update({
        name,
        description,
        icon,
        color,
        active,
        sort_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error updating waiter request type:', error)
    return NextResponse.json(
      { error: 'Failed to update waiter request type' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('waiter_request_types')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting waiter request type:', error)
    return NextResponse.json(
      { error: 'Failed to delete waiter request type' },
      { status: 500 }
    )
  }
}
