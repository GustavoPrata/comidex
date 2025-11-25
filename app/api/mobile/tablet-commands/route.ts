import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('device_id')

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'device_id é obrigatório' },
        { status: 400 }
      )
    }

    const { data: commands, error } = await supabase
      .from('tablet_commands')
      .select('*')
      .or(`device_id.eq.${deviceId},target_all.eq.true`)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10)

    if (error) throw error

    return NextResponse.json({
      success: true,
      commands: commands || []
    })
  } catch (error: any) {
    console.error('Erro ao buscar comandos:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const data = await request.json()
    const { command, device_id, target_all } = data

    const validCommands = ['reload', 'exit_app', 'close_app', 'restart', 'lock', 'unlock', 'sync_settings']
    
    if (!validCommands.includes(command)) {
      return NextResponse.json(
        { success: false, error: `Comando inválido. Comandos válidos: ${validCommands.join(', ')}` },
        { status: 400 }
      )
    }

    if (!device_id && !target_all) {
      return NextResponse.json(
        { success: false, error: 'device_id ou target_all é obrigatório' },
        { status: 400 }
      )
    }

    const { data: newCommand, error } = await supabase
      .from('tablet_commands')
      .insert({
        command,
        device_id: target_all ? null : device_id,
        target_all: target_all || false,
        status: 'pending',
        created_by: 'admin'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      command: newCommand,
      message: target_all 
        ? `Comando "${command}" enviado para todos os tablets`
        : `Comando "${command}" enviado para o tablet ${device_id}`
    })
  } catch (error: any) {
    console.error('Erro ao enviar comando:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const data = await request.json()
    const { command_id, status, device_id } = data

    if (!command_id || !status) {
      return NextResponse.json(
        { success: false, error: 'command_id e status são obrigatórios' },
        { status: 400 }
      )
    }

    const updateData: any = { 
      status,
      executed_at: status === 'executed' ? new Date().toISOString() : null
    }

    const { error } = await supabase
      .from('tablet_commands')
      .update(updateData)
      .eq('id', command_id)

    if (error) throw error

    if (device_id) {
      await supabase
        .from('registered_tablets')
        .update({ last_command_id: command_id })
        .eq('device_id', device_id)
    }

    return NextResponse.json({
      success: true,
      message: 'Status do comando atualizado'
    })
  } catch (error: any) {
    console.error('Erro ao atualizar comando:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
