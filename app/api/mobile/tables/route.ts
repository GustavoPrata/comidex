import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCorsResponse, handleOptions } from '../middleware'

// OPTIONS - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return handleOptions()
}

// GET - Listar mesas disponíveis
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Buscar todas as mesas ativas
    const { data: tables, error } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('active', true)
    
    if (error) throw error

    // Buscar sessões ativas separadamente - usar table_sessions do POS
    const { data: sessions } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('status', 'active')

    // Formatar resposta com status das mesas
    const formattedTables = (tables || []).map(table => {
      // Verificar se há sessão ativa para esta mesa
      const activeSession = sessions?.find(
        (session: any) => session.table_id === table.id
      )
      
      // Determinar se é Mesa ou Balcão baseado no número
      const tableNumber = parseInt(table.number)
      const displayName = tableNumber > 100 
        ? `Balcão ${table.number}` 
        : table.name || `Mesa ${table.number}`
      
      return {
        id: table.id,
        number: table.number,
        name: displayName,
        capacity: table.capacity || 4,
        status: activeSession ? 'occupied' : 'available',
        session_id: activeSession?.id || null,
        session_total: activeSession?.total || 0,
        occupied_since: activeSession?.opened_at || null,
        isCounter: tableNumber > 100  // Flag para identificar balcões
      }
    })
    
    // Ordenar por número (convertendo para integer)
    formattedTables.sort((a, b) => {
      return parseInt(a.number) - parseInt(b.number)
    })

    return createCorsResponse({
      success: true,
      tables: formattedTables,
      total: formattedTables.length,
      available: formattedTables.filter(t => t.status === 'available').length,
      occupied: formattedTables.filter(t => t.status === 'occupied').length
    })
  } catch (error: any) {
    console.error('Erro ao buscar mesas:', error)
    return createCorsResponse({ 
      success: false,
      error: 'Erro ao buscar mesas',
      message: error.message 
    })
  }
}

// POST - Atualizar status da mesa
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { table_number, action } = await request.json()
    
    if (!table_number) {
      return NextResponse.json(
        { success: false, error: 'Número da mesa não fornecido' },
        { status: 400 }
      )
    }

    // Buscar mesa
    const { data: table, error: tableError } = await supabase
      .from('restaurant_tables')
      .select('*')
      .eq('number', parseInt(table_number))
      .single()

    if (tableError || !table) {
      return NextResponse.json(
        { success: false, error: 'Mesa não encontrada' },
        { status: 404 }
      )
    }

    // Executar ação baseada no comando
    if (action === 'open') {
      // Abrir mesa (criar sessão) - usar table_sessions do POS
      const { data: existingSession } = await supabase
        .from('table_sessions')
        .select('*')
        .eq('table_id', table.id)
        .eq('status', 'open')
        .single()

      if (existingSession) {
        return NextResponse.json({
          success: true,
          message: 'Mesa já está aberta',
          session_id: existingSession.id
        })
      }

      // Criar nova sessão na tabela do POS
      const { data: newSession, error: sessionError } = await supabase
        .from('table_sessions')
        .insert({
          table_id: table.id,
          status: 'open',
          opened_at: new Date().toISOString(),
          customer_count: 1,
          total: 0
        })
        .select()
        .single()

      if (sessionError) throw sessionError

      return NextResponse.json({
        success: true,
        message: 'Mesa aberta com sucesso',
        session_id: newSession.id
      })
    } else if (action === 'close') {
      // Fechar mesa (encerrar sessão) - usar table_sessions do POS
      const { data: session, error: sessionError } = await supabase
        .from('table_sessions')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('table_id', table.id)
        .eq('status', 'open')
        .select()
        .single()

      if (sessionError) {
        return NextResponse.json({
          success: false,
          error: 'Nenhuma sessão ativa para fechar'
        }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        message: 'Mesa fechada com sucesso',
        session_id: session.id,
        total: session.valor_total
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Ação inválida. Use "open" ou "close"' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Erro ao atualizar mesa:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao atualizar mesa',
        message: error.message 
      },
      { status: 500 }
    )
  }
}