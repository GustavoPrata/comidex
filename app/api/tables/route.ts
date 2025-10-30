import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get all tables with active sessions
    const { data: tables, error: tablesError } = await supabase
      .from('restaurant_tables')
      .select(`
        *,
        table_sessions!table_sessions_table_id_fkey (
          id,
          attendance_type,
          number_of_people,
          customer_name,
          unit_price,
          total_price,
          opened_at,
          status
        )
      `)
      .eq('active', true)
      .order('sort_order')
    
    if (tablesError) throw tablesError
    
    // Process tables to include current session info
    const processedTables = tables?.map(table => ({
      ...table,
      current_session: table.table_sessions?.find(
        (session: any) => session.status === 'active'
      ) || null,
      table_sessions: undefined
    }))
    
    return NextResponse.json(processedTables || [])
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from('restaurant_tables')
      .insert(body)
      .select()
      .single()
    
    if (error) throw error
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    )
  }
}