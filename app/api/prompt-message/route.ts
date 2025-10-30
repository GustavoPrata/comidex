import { NextRequest, NextResponse } from 'next/server'
import getConsolePromptService from '@/lib/console-prompt-service'

// Configurações dos servidores de console
const CONSOLE_SERVERS = [
  {
    name: 'Prompt Console (TypeScript)',
    port: 3456,
    endpoints: {
      message: 'http://localhost:3456/prompt-message',
      health: 'http://localhost:3456/health'
    }
  },
  {
    name: 'Console Prompt Workflow (JavaScript)', 
    port: 3001,
    endpoints: {
      message: 'http://localhost:3001/console-prompt',
      health: 'http://localhost:3001/console-prompt'
    }
  }
]

// Tenta conectar com os servidores externos na ordem de prioridade
async function tryExternalServers(method: string, body?: any): Promise<{response: Response | null, server: string}> {
  // Primeiro tenta o server TypeScript na porta 3456
  for (const server of CONSOLE_SERVERS) {
    try {
      const endpoint = method === 'POST' || method === 'DELETE' 
        ? server.endpoints.message 
        : server.endpoints.health
        
      const response = await fetch(endpoint, {
        method: method === 'DELETE' && server.port === 3001 ? 'DELETE' : method === 'DELETE' ? 'POST' : method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(500) // timeout rápido
      })
      
      if (response.ok) {
        return { response, server: server.name }
      }
    } catch (error) {
      // Continua para o próximo servidor
      continue
    }
  }
  
  return { response: null, server: '' }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Se for comando de limpar
    if (body.clear) {
      // Para o servidor TypeScript (3456), enviamos como POST com { clear: true }
      const { response: externalResponse, server } = await tryExternalServers('POST', { clear: true })
      
      if (externalResponse && externalResponse.ok) {
        return NextResponse.json({ 
          success: true, 
          server,
          port: server.includes('TypeScript') ? 3456 : 3001
        })
      }
      
      // Usar serviço interno como fallback
      const service = getConsolePromptService()
      service.clear()
      return NextResponse.json({ 
        success: true, 
        server: 'Console Prompt Service (Interno)',
        note: 'Para usar o Console Prompt colorido, execute: tsx server/prompt-console.ts'
      })
    }
    
    // Enviar mensagem normal
    const { message, imageId } = body
    
    // Preparar payload para o servidor TypeScript
    const payload: any = {}
    if (message) {
      payload.message = message
    }
    if (imageId) {
      payload.imageId = imageId
      // Adiciona caminho da imagem na mensagem  
      payload.message = (payload.message || '') + ` [Imagem: attachments/${imageId}.jpg]`
    }
    
    // Tentar servidores externos primeiro
    const { response: externalResponse, server } = await tryExternalServers('POST', payload)
    
    if (externalResponse && externalResponse.ok) {
      const result = await externalResponse.json()
      return NextResponse.json({ 
        success: true, 
        server,
        port: server.includes('TypeScript') ? 3456 : 3001,
        ...result 
      })
    }
    
    // Usar serviço interno como fallback
    const service = getConsolePromptService()
    const images = imageId ? [`attachments/${imageId}.jpg`] : []
    service.handlePrompt(message || '', images)
    
    return NextResponse.json({ 
      success: true, 
      server: 'Console Prompt Service (Interno)',
      message: 'Prompt exibido no console do servidor Next.js',
      note: 'Para usar o Console Prompt colorido, execute: tsx server/prompt-console.ts'
    })
    
  } catch (error: any) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao processar requisição',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// GET para verificar status dos servidores
export async function GET() {
  const status = {
    servers: [] as any[],
    activeServer: null as string | null,
    instructions: {
      typescript: 'tsx server/prompt-console.ts',
      javascript: 'node console-prompt-workflow.js'
    }
  }
  
  // Verificar cada servidor
  for (const server of CONSOLE_SERVERS) {
    try {
      const response = await fetch(server.endpoints.health, {
        method: 'GET',
        signal: AbortSignal.timeout(500)
      })
      
      if (response.ok) {
        const data = await response.json()
        status.servers.push({
          name: server.name,
          port: server.port,
          status: 'online',
          ...data
        })
        
        if (!status.activeServer) {
          status.activeServer = server.name
        }
      } else {
        status.servers.push({
          name: server.name,
          port: server.port,
          status: 'offline'
        })
      }
    } catch (error) {
      status.servers.push({
        name: server.name,
        port: server.port,
        status: 'offline'
      })
    }
  }
  
  // Verificar serviço interno
  const service = getConsolePromptService()
  if (service.isServiceEnabled()) {
    status.servers.push({
      name: 'Console Prompt Service (Interno)',
      status: 'online',
      internal: true,
      messages: service.getMessages()
    })
    
    if (!status.activeServer) {
      status.activeServer = 'Console Prompt Service (Interno)'
    }
  }
  
  return NextResponse.json({
    ...status,
    connected: status.activeServer !== null
  })
}