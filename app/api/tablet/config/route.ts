import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Obter configurações do tablet
export async function GET() {
  try {
    const { data: config, error } = await supabase
      .from('tablet_config')
      .select('*')
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Se não houver configuração, retornar padrão
    if (!config) {
      return NextResponse.json({
        idle_time: 60000, // 60 segundos
        lock_password: '0000',
        enable_rodizio: true,
        enable_carte: true,
        require_table_number: true,
        allow_partial_send: true,
        show_history: true,
        theme_color: '#FF6B00'
      })
    }

    return NextResponse.json(config)
  } catch (error: any) {
    console.error('Erro ao buscar configuração:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar configuração' },
      { status: 500 }
    )
  }
}

// Atualizar configurações
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Verificar se já existe uma configuração
    const { data: existing } = await supabase
      .from('tablet_config')
      .select('id')
      .single()

    let result
    if (existing) {
      // Atualizar configuração existente
      result = await supabase
        .from('tablet_config')
        .update(data)
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Criar nova configuração
      result = await supabase
        .from('tablet_config')
        .insert(data)
        .select()
        .single()
    }

    if (result.error) {
      throw result.error
    }

    return NextResponse.json({
      success: true,
      config: result.data
    })
  } catch (error: any) {
    console.error('Erro ao atualizar configuração:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar configuração' },
      { status: 500 }
    )
  }
}