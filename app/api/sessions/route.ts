import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Check if table has active session
    const { data: existingSession } = await supabase
      .from('table_sessions')
      .select()
      .eq('table_id', body.table_id)
      .eq('status', 'active')
      .single()
    
    if (existingSession) {
      return NextResponse.json(
        { error: 'Table already has an active session' },
        { status: 400 }
      )
    }
    
    // Create new session
    const { data, error } = await supabase
      .from('table_sessions')
      .insert({
        table_id: body.table_id,
        attendance_type: body.attendance_type,
        number_of_people: body.number_of_people,
        customer_name: body.customer_name,
        unit_price: body.unit_price,
        total_price: body.unit_price * body.number_of_people,
        opened_at: new Date().toISOString(),
        status: 'active',
        time_limit: body.time_limit
      })
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('id')
    const body = await request.json()
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('table_sessions')
      .update(body)
      .eq('id', sessionId)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}