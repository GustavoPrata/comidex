'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, Database, Loader2 } from 'lucide-react'

export default function DatabaseConfigPage() {
  const [connectionString, setConnectionString] = useState(
    'postgresql://postgres.wlqvqrgjqowervexcosv:ds4ad456sad546as654d@aws-1-us-east-1.pooler.supabase.com:5432/postgres'
  )
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    data?: any
  } | null>(null)

  const testConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      // Testar conexão através da API
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString })
      })

      const result = await response.json()

      if (result.success) {
        setTestResult({
          success: true,
          message: 'Conexão estabelecida com sucesso!',
          data: result.data
        })
        toast({
          title: '✅ Conexão bem-sucedida!',
          description: `Conectado ao banco: ${result.data.database}`
        })
      } else {
        setTestResult({
          success: false,
          message: result.error || 'Falha na conexão'
        })
        toast({
          title: '❌ Erro na conexão',
          description: result.error,
          variant: 'destructive'
        })
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || 'Erro ao testar conexão'
      })
      toast({
        title: '❌ Erro',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setTesting(false)
    }
  }

  const saveConfiguration = async () => {
    try {
      const response = await fetch('/api/save-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionString })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: '✅ Configuração salva!',
          description: 'A nova URL de conexão foi salva com sucesso.'
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: '❌ Erro ao salvar',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const testCurrentDatabase = async () => {
    setTesting(true)
    try {
      const response = await fetch('/api/db/groups')
      const result = await response.json()
      
      if (result.data) {
        toast({
          title: '✅ Banco atual funcionando!',
          description: `${result.data.length} grupos encontrados no banco.`
        })
        setTestResult({
          success: true,
          message: 'Banco de dados atual está funcionando!',
          data: result.data
        })
      } else {
        throw new Error('Não foi possível buscar dados')
      }
    } catch (error: any) {
      toast({
        title: '❌ Erro no banco atual',
        description: error.message,
        variant: 'destructive'
      })
      setTestResult({
        success: false,
        message: 'Erro ao conectar com o banco atual'
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configuração do Banco de Dados</h2>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Conexão PostgreSQL
            </CardTitle>
            <CardDescription>
              Configure a URL de conexão com o banco de dados PostgreSQL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="connection-string">URL de Conexão PostgreSQL</Label>
              <Input
                id="connection-string"
                type="text"
                placeholder="postgresql://user:password@host:port/database"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Formato: postgresql://usuario:senha@host:porta/banco
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={testConnection}
                disabled={testing || !connectionString}
                className="flex items-center gap-2"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Testar Nova Conexão
              </Button>

              <Button
                onClick={testCurrentDatabase}
                disabled={testing}
                variant="outline"
                className="flex items-center gap-2"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Testar Banco Atual
              </Button>

              <Button
                onClick={saveConfiguration}
                disabled={!testResult?.success}
                variant="default"
                className="flex items-center gap-2"
              >
                Salvar Configuração
              </Button>
            </div>

            {testResult && (
              <Card className={testResult.success ? 'border-green-500' : 'border-red-500'}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    {testResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">{testResult.message}</p>
                      
                      {testResult.success && testResult.data && (
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {testResult.data.database && (
                            <p>Banco: {testResult.data.database}</p>
                          )}
                          {testResult.data.host && (
                            <p>Host: {testResult.data.host}</p>
                          )}
                          {testResult.data.port && (
                            <p>Porta: {testResult.data.port}</p>
                          )}
                          {testResult.data.user && (
                            <p>Usuário: {testResult.data.user}</p>
                          )}
                          {Array.isArray(testResult.data) && (
                            <div className="mt-2">
                              <p>Dados encontrados:</p>
                              <ul className="list-disc list-inside">
                                {testResult.data.slice(0, 3).map((item: any) => (
                                  <li key={item.id}>
                                    ID {item.id}: {item.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-muted">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">URLs de Exemplo:</h4>
                <div className="space-y-2 text-sm font-mono">
                  <p className="text-muted-foreground">
                    Supabase: postgresql://postgres.projeto:senha@aws-0-us-east-1.pooler.supabase.com:5432/postgres
                  </p>
                  <p className="text-muted-foreground">
                    Local: postgresql://usuario:senha@localhost:5432/meubanco
                  </p>
                  <p className="text-muted-foreground">
                    Neon: postgresql://usuario:senha@ep-nome.us-east-1.aws.neon.tech/neondb
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2 text-orange-700 dark:text-orange-400">
                  ⚠️ Importante:
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Teste sempre a conexão antes de salvar</li>
                  <li>• Certifique-se de que o banco tem as tabelas com IDs inteiros</li>
                  <li>• A aplicação precisa ser reiniciada após mudar a conexão</li>
                  <li>• Mantenha suas credenciais seguras</li>
                </ul>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}