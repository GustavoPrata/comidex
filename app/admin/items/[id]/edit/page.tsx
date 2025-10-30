'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
}

interface Item {
  id: string
  name: string
  description: string
  price: number
  category_id: string
  available: boolean
  image_url?: string
}

export default function EditItemPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [item, setItem] = useState<Item | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      // Carregar categorias
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('active', true)
        .order('name')
      
      setCategories(categoriesData || [])
      
      // Carregar item
      const { data: itemData, error } = await supabase
        .from('items')
        .select('*')
        .eq('id', params.id)
        .single()
      
      if (error || !itemData) {
        toast.error('Item não encontrado')
        router.push('/admin/items')
        return
      }
      
      setItem(itemData)
    } catch (error) {
      toast.error('Erro ao carregar dados')
      router.push('/admin/items')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!item) return
    
    setSaving(true)
    
    try {
      const { error } = await supabase
        .from('items')
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          category_id: item.category_id,
          available: item.available,
          image_url: item.image_url
        })
        .eq('id', params.id)
      
      if (error) throw error
      
      toast.success('Item atualizado com sucesso!')
      router.push('/admin/items')
    } catch (error) {
      toast.error('Erro ao atualizar item')
    } finally {
      setSaving(false)
    }
  }

  if (!item && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Item não encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/items')}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          
          <h1 className="text-3xl font-bold bg-orange-500 bg-clip-text text-transparent">
            Editar Item
          </h1>
        </div>

        <Card className="border-gray-200 dark:border-gray-800 rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="bg-orange-500 text-white">
            <CardTitle>Informações do Item</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Item</Label>
                  <Input
                    id="name"
                    value={item.name}
                    onChange={(e) => setItem({ ...item, name: e.target.value })}
                    placeholder="Ex: Salmão Especial"
                    required
                    className="rounded-xl"
                    data-testid="input-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => setItem({ ...item, price: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    required
                    className="rounded-xl"
                    data-testid="input-price"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={item.category_id}
                    onValueChange={(value) => setItem({ ...item, category_id: value })}
                  >
                    <SelectTrigger className="rounded-xl" data-testid="select-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">URL da Imagem</Label>
                  <Input
                    id="image"
                    value={item.image_url || ''}
                    onChange={(e) => setItem({ ...item, image_url: e.target.value })}
                    placeholder="https://..."
                    className="rounded-xl"
                    data-testid="input-image"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={item.description || ''}
                  onChange={(e) => setItem({ ...item, description: e.target.value })}
                  placeholder="Descrição detalhada do item..."
                  rows={4}
                  className="rounded-xl"
                  data-testid="textarea-description"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={item.available}
                  onCheckedChange={(checked) => setItem({ ...item, available: checked })}
                  data-testid="switch-available"
                />
                <Label htmlFor="available">Disponível para venda</Label>
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
                  onClick={() => router.push('/admin/items')}
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