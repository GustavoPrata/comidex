'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Send } from 'lucide-react'
import { toast } from 'sonner'

export default function SimpleConsolePrompt() {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sendPrompt = async () => {
    if (!prompt.trim()) {
      return
    }

    setIsLoading(true)
    
    try {
      // Send to API
      const response = await fetch('/api/console-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          images: []
        })
      })
      
      if (response.ok) {
        setPrompt('')
        toast.success('Prompt enviado!')
        textareaRef.current?.focus()
      } else {
        toast.error('Erro ao enviar')
      }
    } catch (error) {
      toast.error('Erro ao enviar')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && prompt.trim()) {
      e.preventDefault()
      sendPrompt()
    }
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="border-gray-200 dark:border-gray-800 p-6">
          <h1 className="text-2xl font-bold mb-4">Console Prompt Simplificado</h1>
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite e pressione Enter"
            className="min-h-[150px]"
            disabled={isLoading}
            data-testid="input-prompt"
          />
          <Button
            onClick={sendPrompt}
            disabled={isLoading || !prompt.trim()}
            className="mt-4"
            data-testid="button-send-prompt"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </Card>
      </div>
    </div>
  )
}