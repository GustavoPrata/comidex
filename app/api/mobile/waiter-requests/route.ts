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
      .eq('active', true)
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
