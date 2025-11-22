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
      .eq('status', 'active')
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
        attendance_type: service_type.name || 'À La Carte',
        number_of_people: (adult_count || 0) + (child_count || 0) || 1,
        unit_price: service_type.price || 0,
        total_price: 0,
        opened_at: new Date().toISOString(),
        status: 'active'
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
    // CORREÇÃO: Verificar se service_type tem dados necessários antes de acessar
    const isRodizio = service_type?.name?.toLowerCase().includes('rodízio') || 
                      service_type?.name?.toLowerCase().includes('rodizio')
    
    if (isRodizio && (adult_count > 0 || child_count > 0)) {
      console.log('🍽️ Detectado rodízio, criando pedido automático...')
      
      // Usar preço do service_type ou valores padrão do banco
      const adultPrice = service_type.price || 89.90  // Preço padrão adulto
      const childPrice = service_type.half_price || (adultPrice / 2)  // Metade do preço para criança
      
      const items = []
      
      // Adicionar rodízios adultos
      if (adult_count > 0) {
        items.push({
          name: `${service_type.name} - Adulto`,
          price: adultPrice,
          quantity: adult_count,
          category: 'Rodízio',
          observation: 'Lançado automaticamente pelo tablet'
        })
      }
      
      // Adicionar rodízios crianças  
      if (child_count > 0) {
        items.push({
          name: `${service_type.name} - Criança`,
          price: childPrice,
          quantity: child_count,
          category: 'Rodízio',
          observation: 'Lançado automaticamente pelo tablet'
        })
      }

      // Calcular total
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

      // Criar pedido na tabela orders (POS)
      const { data: order, error: orderError } = await supabase
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

      if (orderError) {
        console.error('⚠️ Erro ao criar pedido de rodízio:', orderError)
      } else {
        console.log('✅ Pedido de rodízio criado:', order)
      }

      // Atualizar total da sessão
      await supabase
        .from('table_sessions')
        .update({ total_price: total })
        .eq('id', newSession.id)
    }

    console.log(`✅ Mesa ${table_number} aberta pelo POS via tablet - Sessão ${newSession.id}`)

    return NextResponse.json({
      success: true,
      session: {
        id: newSession.id,
        table_id: table.id,
        table_number,
        status: 'active',
        opened_at: newSession.opened_at,
        total: newSession.total_price || 0,
        attendance_type: service_type.name,
        number_of_people: newSession.number_of_people
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