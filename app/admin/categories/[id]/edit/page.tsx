'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description?: string
  active: boolean
  sort_order: number
}

export default function EditCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState<Category | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadCategory()
  }, [params.id])

  const loadCategory = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (error || !data) {
        toast.error('Categoria não encontrada')
        router.push('/admin/categories')
        return
      }
      
      setCategory(data)
    } catch (error) {
      toast.error('Erro ao carregar categoria')
      router.push('/admin/categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!category) return
    
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('categories')
        .update({
          name: category.name,
          description: category.description,
          active: category.active,
          sort_order: category.sort_order
        })
        .eq('id', params.id)
      
      if (error) throw error
      
      toast.success('Categoria atualizada com sucesso!')
      router.push('/admin/categories')
    } catch (error) {
      toast.error('Erro ao atualizar categoria')
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

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Categoria não encontrada</div>
      </div>
    )
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
            Editar Categoria
          </h1>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="bg-orange-500 text-white">
            <CardTitle>Informações da Categoria</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Categoria</Label>
                  <Input
                    id="name"
                    value={category.name}
                    onChange={(e) => setCategory({ ...category, name: e.target.value })}
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
                    value={category.sort_order}
                    onChange={(e) => setCategory({ ...category, sort_order: parseInt(e.target.value) })}
                    placeholder="1"
                    required
                    className="rounded-xl"
                    data-testid="input-order"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={category.description || ''}
                  onChange={(e) => setCategory({ ...category, description: e.target.value })}
                  placeholder="Descrição da categoria..."
                  rows={4}
                  className="rounded-xl"
                  data-testid="textarea-description"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={category.active}
                  onCheckedChange={(checked) => setCategory({ ...category, active: checked })}
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
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
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