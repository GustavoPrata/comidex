import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET - Obter configurações do app mobile
export async function GET() {
  try {
    // Buscar configurações do restaurante
    const { data: restaurant } = await supabase
      .from('restaurant_settings')
      .select('*')
      .single()

    // Configurações padrão do app mobile
    const config = {
      restaurant_name: restaurant?.name || 'ComideX',
      enable_rodizio: true,
      enable_carte: true,
      require_table_number: true,
      allow_partial_send: true,
      idle_timeout: 60000,
      lock_password: '0000',
      theme: {
        primary_color: '#FF6B00',
        secondary_color: '#1F2937',
        background_color: '#030712',
        text_color: '#FFFFFF'
      },
      features: {
        show_history: true,
        show_bill: true,
        allow_observations: true,
        allow_remove_items: true
      },
      api_version: '1.0.0'
    }

    return NextResponse.json(config)
  } catch (error: any) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configurações' },
      { status: 500 }
    )
  }
}