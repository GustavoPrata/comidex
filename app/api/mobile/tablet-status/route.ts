import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const data = await request.json()
    const { device_id, battery_level, is_charging, app_version } = data

    if (!device_id) {
      return NextResponse.json(
        { success: false, error: 'device_id é obrigatório' },
        { status: 400 }
      )
    }

    const updateData: any = {
      last_seen: new Date().toISOString()
    }

    if (battery_level !== undefined) {
      updateData.battery_level = battery_level
    }

    if (is_charging !== undefined) {
      updateData.is_charging = is_charging
    }

    if (app_version) {
      updateData.app_version = app_version
    }

    const { error } = await supabase
      .from('registered_tablets')
      .update(updateData)
      .eq('device_id', device_id)

    if (error) throw error

    const { data: commands } = await supabase
      .from('tablet_commands')
      .select('*')
      .or(`device_id.eq.${device_id},target_all.eq.true`)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(5)

    return NextResponse.json({
      success: true,
      commands: commands || [],
      message: 'Status atualizado com sucesso'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
