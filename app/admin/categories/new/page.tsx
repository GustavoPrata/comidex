'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function NewCategoryPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sort_order: 1,
    active: true
  })
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      toast.error('Preencha o nome da categoria')
      return
    }
    
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          name: formData.name,
          description: formData.description,
          sort_order: formData.sort_order,
          active: formData.active
        })
      
      if (error) throw error
      
      toast.success('Categoria criada com sucesso!')
      router.push('/admin/categories')
    } catch (error) {
      toast.error('Erro ao criar categoria')
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
            onClick={() => router.push('/admin/categories')}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold bg-orange-500 bg-clip-text text-transparent">
            Nova Categoria
          </h1>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="bg-orange-500 text-white">
            <CardTitle>Criar Nova Categoria</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Categoria *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Sashimis"
                    required
                    className="rounded-xl"
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Ordem de Exibição</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                    placeholder="1"
                    className="rounded-xl"
                    data-testid="input-order"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da categoria..."
                  rows={4}
                  className="rounded-xl"
                  data-testid="textarea-description"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  data-testid="switch-active"
                />
                <Label htmlFor="active">Categoria ativa</Label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-orange-500"
                  data-testid="button-save"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Criando...' : 'Criar Categoria'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/categories')}
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