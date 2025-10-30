// Serviço de Console Prompt interno ao Next.js
// Simula o comportamento do workflow externo mas roda dentro do próprio servidor

interface ConsoleMessage {
  type: 'prompt' | 'image' | 'clear'
  content?: string
  images?: string[]
  timestamp: string
}

class ConsolePromptService {
  private messages: ConsoleMessage[] = []
  private isEnabled: boolean = false

  constructor() {
  }

  private clearConsole() {
    if (typeof process !== 'undefined' && process.stdout) {
      // Limpar console completamente
      process.stdout.write('\x1Bc')
      process.stdout.write('\x1b[0;0H')
    }
  }

  private printHeader() {
    console.log('╔════════════════════════════════════════════╗')
    console.log('║     Console Prompt Service (Interno)      ║')
    console.log('╚════════════════════════════════════════════╝')
    console.log('\n🚀 Serviço integrado ao Next.js')
    console.log('📝 Aguardando prompts...\n')
  }

  public handlePrompt(prompt: string, images?: string[]) {
    if (!this.isEnabled) return

    // Limpar console antes de mostrar novo prompt
    this.clearConsole()
    
    if (prompt) {
      console.log('================== PROMPT ==================')
      console.log(prompt)
      console.log('============================================')
      
      this.messages.push({
        type: 'prompt',
        content: prompt,
        timestamp: new Date().toISOString()
      })
    }
    
    if (images && images.length > 0) {
      console.log('\n📎 Imagens anexadas:')
      images.forEach((path, index) => {
        console.log(`  ${index + 1}. ${path}`)
      })
      
      this.messages.push({
        type: 'image',
        images,
        timestamp: new Date().toISOString()
      })
    }
  }

  public clear() {
    this.clearConsole()
    this.messages = []
    console.log('✨ Console Prompt Service limpo')
    
    this.messages.push({
      type: 'clear',
      timestamp: new Date().toISOString()
    })
  }

  public getMessages() {
    return this.messages
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  public isServiceEnabled() {
    return this.isEnabled
  }
}

// Singleton instance
let serviceInstance: ConsolePromptService | null = null

export function getConsolePromptService(): ConsolePromptService {
  if (!serviceInstance) {
    serviceInstance = new ConsolePromptService()
  }
  return serviceInstance
}

export default getConsolePromptService