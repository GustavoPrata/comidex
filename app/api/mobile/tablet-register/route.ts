import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const deviceId = request.nextUrl.searchParams.get('device_id')
    
    if (!deviceId) {
      return NextResponse.json(
        { error: 'device_id é obrigatório' },
        { status: 400 }
      )
    }

    const { data: tablet, error } = await supabase
      .from('registered_tablets')
      .select('*')
      .eq('device_id', deviceId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (tablet) {
      await supabase
        .from('registered_tablets')
        .update({ last_seen: new Date().toISOString() })
        .eq('device_id', deviceId)

      return NextResponse.json({
        registered: true,
        tablet: {
          id: tablet.id,
          name: tablet.name,
          device_id: tablet.device_id,
          status: tablet.status
        }
      })
    }

    const { data: maxTabletsSetting } = await supabase
      .from('tablet_settings')
      .select('setting_value')
      .eq('setting_key', 'max_tablets')
      .single()

    const maxTablets = parseInt(maxTabletsSetting?.setting_value || '20')

    const { count } = await supabase
      .from('registered_tablets')
      .select('*', { count: 'exact', head: true })

    const currentCount = count || 0
    const slotsAvailable = currentCount < maxTablets

    return NextResponse.json({
      registered: false,
      slots_available: slotsAvailable,
      current_count: currentCount,
      max_tablets: maxTablets
    })

  } catch (error: any) {
    console.error('Erro ao verificar registro do tablet:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar registro' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { device_id, name, ip_address } = body

    if (!device_id) {
      return NextResponse.json(
        { error: 'device_id é obrigatório' },
        { status: 400 }
      )
    }

    const { data: existing } = await supabase
      .from('registered_tablets')
      .select('id')
      .eq('device_id', device_id)
      .single()

    if (existing) {
      await supabase
        .from('registered_tablets')
        .update({ 
          last_seen: new Date().toISOString(),
          ip_address: ip_address || null
        })
        .eq('device_id', device_id)

      return NextResponse.json({
        success: true,
        message: 'Tablet já registrado, último acesso atualizado'
      })
    }

    const { data: maxTabletsSetting } = await supabase
      .from('tablet_settings')
      .select('setting_value')
      .eq('setting_key', 'max_tablets')
      .single()

    const maxTablets = parseInt(maxTabletsSetting?.setting_value || '20')

    const { count } = await supabase
      .from('registered_tablets')
      .select('*', { count: 'exact', head: true })

    const currentCount = count || 0

    if (currentCount >= maxTablets) {
      return NextResponse.json(
        { 
          error: 'Limite de tablets atingido',
          message: 'Não há mais vagas disponíveis para registro de tablets. Entre em contato com o administrador.',
          current_count: currentCount,
          max_tablets: maxTablets
        },
        { status: 403 }
      )
    }

    const tabletNumber = currentCount + 1
    const tabletName = name || `Tablet ${tabletNumber}`

    const { data: newTablet, error: insertError } = await supabase
      .from('registered_tablets')
      .insert({
        device_id,
        name: tabletName,
        ip_address: ip_address || null,
        status: 'active',
        registered_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      message: 'Tablet registrado com sucesso!',
      tablet: {
        id: newTablet.id,
        name: newTablet.name,
        device_id: newTablet.device_id,
        status: newTablet.status
      }
    })

  } catch (error: any) {
    console.error('Erro ao registrar tablet:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar tablet' },
      { status: 500 }
    )
  }
}
