import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const data = await request.json()
    const { table_number, message, session_id } = data

    if (!table_number) {
      return NextResponse.json(
        { success: false, error: 'Número da mesa não fornecido' },
        { status: 400 }
      )
    }

    // Create notification for waiter call
    const notificationMessage = message || `Mesa ${table_number} está chamando o garçom`
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        message: notificationMessage,
        type: 'waiter_call',
        item_name: `Mesa ${table_number}`,
        metadata: {
          table_number,
          session_id,
          timestamp: new Date().toISOString(),
          source: 'tablet'
        },
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Log the waiter call for history
    console.log(`Waiter called by table ${table_number} at ${new Date().toLocaleTimeString('pt-BR')}`)

    return NextResponse.json({
      success: true,
      notification,
      message: 'Garçom notificado com sucesso!'
    })
  } catch (error: any) {
    console.error('Erro ao chamar garçom:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao chamar garçom',
        message: error.message 
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const searchParams = request.nextUrl.searchParams
    const table_number = searchParams.get('table_number')
    
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('type', 'waiter_call')
      .order('created_at', { ascending: false })
      .limit(20)

    if (table_number) {
      query = query.eq('item_name', `Mesa ${table_number}`)
    }

    const { data: calls, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      calls: calls || [],
      total: calls?.length || 0
    })
  } catch (error: any) {
    console.error('Erro ao buscar chamadas:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao buscar chamadas',
        message: error.message 
      },
      { status: 500 }
    )
  }
}