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

// POST - BLOQUEADO - Tablet não pode criar/fechar sessões diretamente
// ARQUITETURA: Apenas o POS gerencia sessões via /api/mobile/pos/open-table
export async function POST(request: NextRequest) {
  // CRÍTICO: Tablet NUNCA deve criar ou gerenciar sessões diretamente
  // Todo controle de mesas deve ser feito pelo POS como single source of truth
  
  console.error('⚠️ TENTATIVA BLOQUEADA: Tablet tentou criar/fechar sessão diretamente')
  console.error('Use /api/mobile/pos/open-table para abrir mesas pelo POS')
  
  const response = NextResponse.json({
    success: false,
    error: 'Operação não permitida',
    message: 'O tablet não pode gerenciar sessões diretamente. Use o POS para abrir/fechar mesas.',
    redirect_to: '/api/mobile/pos/open-table'
  }, { status: 403 })
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}