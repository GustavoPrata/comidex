import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Tablet solicita ao POS para abrir mesa
// Esta é a ÚNICA forma do tablet abrir mesa - através do POS!
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const data = await request.json()
    const { table_number, service_type, adult_count, child_count } = data
    
    if (!table_number || !service_type) {
      return NextResponse.json(
        { success: false, error: 'Mesa e tipo de atendimento são obrigatórios' },
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
      return NextResponse.json({
        success: false,
        error: 'Mesa não encontrada'
      }, { status: 404 })
    }

    // Verificar se já tem sessão ativa
    const { data: existingSession } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('table_id', table.id)
      .eq('status', 'open')
      .single()

    if (existingSession) {
      return NextResponse.json({
        success: true,
        session: existingSession,
        message: 'Mesa já está aberta'
      })
    }

    // ABRIR MESA USANDO LÓGICA DO POS
    // Criar sessão na tabela table_sessions (mesma que o POS usa!)
    const { data: newSession, error: sessionError } = await supabase
      .from('table_sessions')
      .insert({
        table_id: table.id,
        status: 'open',
        opened_at: new Date().toISOString(),
        total: 0,
        service_type: service_type.name || 'À La Carte'
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    // Atualizar status da mesa para ocupada
    await supabase
      .from('restaurant_tables')
      .update({ 
        status: 'occupied',
        occupied_since: new Date().toISOString(),
        session_id: newSession.id
      })
      .eq('id', table.id)

    // Se for rodízio, já criar o pedido inicial
    if (service_type.linked_groups?.length > 0) {
      const firstGroup = service_type.linked_groups[0]
      if (firstGroup.type === 'rodizio' && firstGroup.price) {
        const items = []
        
        // Adicionar rodízios adultos
        if (adult_count > 0) {
          items.push({
            name: `${service_type.name} - Adulto`,
            price: firstGroup.price,
            quantity: adult_count,
            category: 'Rodízio',
            observation: 'Lançado automaticamente pelo tablet'
          })
        }
        
        // Adicionar rodízios crianças
        if (child_count > 0) {
          items.push({
            name: `${service_type.name} - Criança`,
            price: firstGroup.half_price || (firstGroup.price / 2),
            quantity: child_count,
            category: 'Rodízio',
            observation: 'Lançado automaticamente pelo tablet'
          })
        }

        // Calcular total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        // Criar pedido na tabela orders (POS)
        const { data: order } = await supabase
          .from('orders')
          .insert({
            session_id: newSession.id,
            items: items,
            total: total,
            status: 'pending',
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        // Atualizar total da sessão
        await supabase
          .from('table_sessions')
          .update({ total: total })
          .eq('id', newSession.id)
      }
    }

    console.log(`✅ Mesa ${table_number} aberta pelo POS via tablet - Sessão ${newSession.id}`)

    return NextResponse.json({
      success: true,
      session: {
        id: newSession.id,
        table_id: table.id,
        table_number,
        status: 'open',
        opened_at: newSession.opened_at,
        total: newSession.total || 0,
        service_type: service_type.name
      },
      message: `Mesa ${table_number} aberta com sucesso`
    })
  } catch (error: any) {
    console.error('Erro ao abrir mesa pelo POS:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro ao abrir mesa',
        message: error.message 
      },
      { status: 500 }
    )
  }
}