import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, images } = body

    // Enviar APENAS para o Console Prompt Workflow (porta 3001)
    // NÃO fazer fallback para o console do servidor
    try {
      const response = await fetch('http://localhost:3001/console-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, images })
      })

      if (response.ok) {
        return NextResponse.json({ 
          success: true, 
          message: 'Prompt enviado ao Console Prompt Workflow' 
        })
      } else {
        // Workflow está rodando mas retornou erro
        return NextResponse.json({ 
          success: false, 
          message: 'Erro ao enviar para o Console Prompt Workflow' 
        }, { status: 500 })
      }
    } catch (fetchError) {
      // Workflow não está rodando - retornar erro informativo
      return NextResponse.json({ 
        success: false, 
        message: 'Console Prompt Workflow não está rodando. Inicie o workflow na porta 3001.' 
      }, { status: 503 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar prompt' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Limpar APENAS no Console Prompt Workflow
    // NÃO limpar o console do servidor
    const response = await fetch('http://localhost:3001/console-prompt', {
      method: 'DELETE'
    })
    
    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Console Prompt Workflow limpo' 
      })
    } else {
      // Workflow está rodando mas retornou erro
      return NextResponse.json({ 
        success: false, 
        message: 'Erro ao limpar Console Prompt Workflow' 
      }, { status: 500 })
    }
  } catch (error) {
    // Workflow não está rodando - retornar erro informativo
    return NextResponse.json({ 
      success: false, 
      message: 'Console Prompt Workflow não está rodando. Inicie o workflow na porta 3001.' 
    }, { status: 503 })
  }
}