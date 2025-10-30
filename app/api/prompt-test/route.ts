import { NextResponse } from 'next/server'

// Teste de conectividade com o workflow
export async function GET() {
  const tests = []
  
  // Teste 1: Verificar se o workflow está respondendo
  try {
    const response = await fetch('http://localhost:3001/console-prompt', {
      method: 'GET',
      signal: AbortSignal.timeout(2000)
    })
    
    if (response.ok) {
      const data = await response.json()
      tests.push({
        test: 'GET /console-prompt',
        status: 'SUCCESS',
        statusCode: response.status,
        data
      })
    } else {
      tests.push({
        test: 'GET /console-prompt',
        status: 'FAILED',
        statusCode: response.status,
        error: `HTTP ${response.status}`
      })
    }
  } catch (error: any) {
    tests.push({
      test: 'GET /console-prompt',
      status: 'ERROR',
      error: error.message,
      cause: error.cause
    })
  }
  
  // Teste 2: Enviar um prompt de teste
  try {
    const response = await fetch('http://localhost:3001/console-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        prompt: '[TESTE DE CONEXÃO] Este é um teste automático do sistema',
        images: []
      }),
      signal: AbortSignal.timeout(2000)
    })
    
    if (response.ok) {
      const data = await response.json()
      tests.push({
        test: 'POST /console-prompt',
        status: 'SUCCESS',
        statusCode: response.status,
        data
      })
    } else {
      tests.push({
        test: 'POST /console-prompt',
        status: 'FAILED',
        statusCode: response.status,
        error: `HTTP ${response.status}`
      })
    }
  } catch (error: any) {
    tests.push({
      test: 'POST /console-prompt',
      status: 'ERROR',
      error: error.message,
      cause: error.cause
    })
  }
  
  const allPassed = tests.every(t => t.status === 'SUCCESS')
  
  return NextResponse.json(
    {
      connected: allPassed,
      workflowPort: 3001,
      timestamp: new Date().toISOString(),
      tests,
      instructions: !allPassed ? {
        command: 'node console-prompt-workflow.js',
        expectedPort: 3001,
        troubleshooting: [
          '1. Certifique-se de que o workflow está rodando',
          '2. Verifique se a porta 3001 está livre',
          '3. Execute: lsof -i :3001 para verificar se algo está usando a porta',
          '4. Se necessário, mate o processo: kill -9 <PID>'
        ]
      } : undefined
    },
    { status: allPassed ? 200 : 503 }
  )
}