'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewTablePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    capacity: '4',
    type: 'table' as 'table' | 'counter',
    active: true
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.number || !formData.capacity) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('restaurant_tables')
        .insert({
          name: formData.name,
          number: parseInt(formData.number),
          capacity: parseInt(formData.capacity),
          type: formData.type,
          active: formData.active
        })
      
      if (error) throw error
      
      toast.success('Mesa criada com sucesso!')
      router.push('/admin/tables')
    } catch (error) {
      toast.error('Erro ao criar mesa')
    } finally {
      setSaving(false)
    }
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
            Nova Mesa
          </h1>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="bg-orange-500 text-white">
            <CardTitle>Criar Nova Mesa</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Mesa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Mesa 1"
                    required
                    className="rounded-xl"
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    type="number"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="1"
                    required
                    className="rounded-xl"
                    data-testid="input-number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="4"
                    required
                    className="rounded-xl"
                    data-testid="input-capacity"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'table' | 'counter') => setFormData({ ...formData, type: value })}
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
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
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
                  {saving ? 'Criando...' : 'Criar Mesa'}
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