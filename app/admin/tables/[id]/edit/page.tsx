'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Table {
  id: string
  name: string
  number: number
  capacity: number
  type: 'table' | 'counter'
  active: boolean
}

export default function EditTablePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [table, setTable] = useState<Table | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadTable()
  }, [params.id])

  const loadTable = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (error || !data) {
        toast.error('Mesa não encontrada')
        router.push('/admin/tables')
        return
      }
      
      setTable(data)
    } catch (error) {
      toast.error('Erro ao carregar mesa')
      router.push('/admin/tables')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!table) return
    
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .update({
          name: table.name,
          number: table.number,
          capacity: table.capacity,
          type: table.type,
          active: table.active
        })
        .eq('id', params.id)
      
      if (error) throw error
      
      toast.success('Mesa atualizada com sucesso!')
      router.push('/admin/tables')
    } catch (error) {
      toast.error('Erro ao atualizar mesa')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!table) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Mesa não encontrada</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/tables')}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold bg-orange-500 bg-clip-text text-transparent">
            Editar Mesa
          </h1>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="bg-orange-500 text-white">
            <CardTitle>Informações da Mesa</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Mesa</Label>
                  <Input
                    id="name"
                    value={table.name}
                    onChange={(e) => setTable({ ...table, name: e.target.value })}
                    placeholder="Ex: Mesa 1"
                    required
                    className="rounded-xl"
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    type="number"
                    value={table.number}
                    onChange={(e) => setTable({ ...table, number: parseInt(e.target.value) })}
                    placeholder="1"
                    required
                    className="rounded-xl"
                    data-testid="input-number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={table.capacity}
                    onChange={(e) => setTable({ ...table, capacity: parseInt(e.target.value) })}
                    placeholder="4"
                    required
                    className="rounded-xl"
                    data-testid="input-capacity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={table.type}
                    onValueChange={(value: 'table' | 'counter') => setTable({ ...table, type: value })}
                  >
                    <SelectTrigger className="rounded-xl" data-testid="select-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="table">Mesa</SelectItem>
                      <SelectItem value="counter">Balcão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={table.active}
                  onCheckedChange={(checked) => setTable({ ...table, active: checked })}
                  data-testid="switch-active"
                />
                <Label htmlFor="active">Mesa ativa</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-orange-500"
                  data-testid="button-save"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/tables')}
                  className="rounded-full"
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}