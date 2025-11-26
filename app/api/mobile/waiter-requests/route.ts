import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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
