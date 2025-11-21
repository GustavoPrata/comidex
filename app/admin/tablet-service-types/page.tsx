'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Save, Trash2, Edit, GripVertical, Link as LinkIcon, Unlink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface ServiceType {
  id: number
  name: string
  description: string | null
  active: boolean
  display_order: number
  icon: string | null
  color: string
  price: number | null
  linked_groups?: string[]
}

interface Group {
  id: number
  name: string
  type: string | null
  price: number | null
  active: boolean
}

export default function TabletServiceTypesPage() {
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingType, setEditingType] = useState<ServiceType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<number[]>([])
  const supabase = createClient()

  useEffect(() => {
    loadServiceTypes()
    loadGroups()
  }, [])

  const loadServiceTypes = async () => {
    try {
      // Buscar tipos de atendimento com grupos linkados
      const { data: typesData, error: typesError } = await supabase
        .from('tablet_service_types')
        .select(`
          *,
          tablet_service_type_groups (
            group_id,
            groups (
              id,
              name
            )
          )
        `)
        .order('display_order')

      if (typesError) throw typesError

      // Formatar dados com grupos linkados
      const formattedTypes = typesData?.map((type: any) => ({
        ...type,
        linked_groups: type.tablet_service_type_groups?.map((tsg: any) => tsg.groups?.name).filter(Boolean) || []
      })) || []

      setServiceTypes(formattedTypes)
    } catch (error: any) {
      console.error('Erro ao carregar tipos de atendimento:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) throw error
      setGroups(data || [])
    } catch (error: any) {
      console.error('Erro ao carregar grupos:', error)
    }
  }

  const handleEdit = async (type: ServiceType) => {
    setEditingType(type)
    
    // Carregar grupos linkados
    const { data: linkedGroups } = await supabase
      .from('tablet_service_type_groups')
      .select('group_id')
      .eq('service_type_id', type.id)
    
    setSelectedGroups(linkedGroups?.map(lg => lg.group_id) || [])
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingType) return

    try {
      // Atualizar tipo de atendimento
      const { error: updateError } = await supabase
        .from('tablet_service_types')
        .update({
          name: editingType.name,
          description: editingType.description,
          active: editingType.active,
          icon: editingType.icon,
          color: editingType.color,
          price: editingType.price
        })
        .eq('id', editingType.id)

      if (updateError) throw updateError

      // Atualizar grupos linkados
      // Primeiro, remover todos os links existentes
      await supabase
        .from('tablet_service_type_groups')
        .delete()
        .eq('service_type_id', editingType.id)

      // Depois, criar novos links
      if (selectedGroups.length > 0) {
        const { error: linkError } = await supabase
          .from('tablet_service_type_groups')
          .insert(
            selectedGroups.map(groupId => ({
              service_type_id: editingType.id,
              group_id: groupId
            }))
          )

        if (linkError) throw linkError
      }

      console.log('Tipo de atendimento atualizado com sucesso')
      setDialogOpen(false)
      loadServiceTypes()
    } catch (error: any) {
      console.error('Erro ao atualizar tipo de atendimento:', error)
    }
  }

  const handleCreate = () => {
    setEditingType({
      id: 0,
      name: '',
      description: '',
      active: true,
      display_order: serviceTypes.length + 1,
      icon: 'restaurant',
      color: '#FF7043',
      price: null
    })
    setSelectedGroups([])
    setDialogOpen(true)
  }

  const handleCreateNew = async () => {
    if (!editingType || editingType.id !== 0) return

    try {
      const { data, error } = await supabase
        .from('tablet_service_types')
        .insert([{
          name: editingType.name,
          description: editingType.description,
          active: editingType.active,
          display_order: editingType.display_order,
          icon: editingType.icon,
          color: editingType.color,
          price: editingType.price
        }])
        .select()

      if (error) throw error

      // Criar links com grupos selecionados
      if (data && data[0] && selectedGroups.length > 0) {
        await supabase
          .from('tablet_service_type_groups')
          .insert(
            selectedGroups.map(groupId => ({
              service_type_id: data[0].id,
              group_id: groupId
            }))
          )
      }

      console.log('Tipo de atendimento criado com sucesso')
      setDialogOpen(false)
      loadServiceTypes()
    } catch (error: any) {
      console.error('Erro ao criar tipo de atendimento:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este tipo de atendimento?')) return

    try {
      // Primeiro remover os links
      await supabase
        .from('tablet_service_type_groups')
        .delete()
        .eq('service_type_id', id)

      // Depois remover o tipo
      const { error } = await supabase
        .from('tablet_service_types')
        .delete()
        .eq('id', id)

      if (error) throw error

      console.log('Tipo de atendimento excluído com sucesso')
      loadServiceTypes()
    } catch (error: any) {
      console.error('Erro ao excluir tipo de atendimento:', error)
    }
  }

  const handleToggleActive = async (type: ServiceType) => {
    try {
      const { error } = await supabase
        .from('tablet_service_types')
        .update({ active: !type.active })
        .eq('id', type.id)

      if (error) throw error

      console.log('Status atualizado com sucesso')
      loadServiceTypes()
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const handleOrderChange = async (type: ServiceType, direction: 'up' | 'down') => {
    const currentIndex = serviceTypes.findIndex(t => t.id === type.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= serviceTypes.length) return

    const targetType = serviceTypes[targetIndex]

    try {
      // Trocar as ordens
      await supabase
        .from('tablet_service_types')
        .update({ display_order: targetType.display_order })
        .eq('id', type.id)

      await supabase
        .from('tablet_service_types')
        .update({ display_order: type.display_order })
        .eq('id', targetType.id)

      console.log('Ordem atualizada com sucesso')
      loadServiceTypes()
    } catch (error: any) {
      console.error('Erro ao atualizar ordem:', error)
    }
  }

  const iconOptions = [
    { value: 'crown', label: '👑 Coroa' },
    { value: 'fire', label: '🔥 Fogo' },
    { value: 'utensils', label: '🍴 Talheres' },
    { value: 'menu-book', label: '📖 Menu' },
    { value: 'cup-soda', label: '🥤 Bebida' },
    { value: 'star', label: '⭐ Estrela' },
    { value: 'pizza', label: '🍕 Pizza' },
    { value: 'burger', label: '🍔 Hambúrguer' },
    { value: 'salad', label: '🥗 Salada' },
    { value: 'coffee', label: '☕ Café' },
    { value: 'cake', label: '🍰 Bolo' },
    { value: 'restaurant', label: '🍽️ Restaurante' }
  ]

  const getIconDisplay = (icon: string | null) => {
    const option = iconOptions.find(opt => opt.value === icon)
    return option ? option.label : '🍽️ Restaurante'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configurar Tipos de Atendimento</h1>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Tipo
        </Button>
      </div>

      <div className="grid gap-4">
        {serviceTypes.map((type, index) => (
          <Card key={type.id} className={!type.active ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleOrderChange(type, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleOrderChange(type, 'down')}
                      disabled={index === serviceTypes.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                  
                  <div className="text-3xl">{getIconDisplay(type.icon)}</div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">{type.name}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                    {type.price && (
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        R$ {type.price.toFixed(2)}
                      </p>
                    )}
                    {type.linked_groups && type.linked_groups.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                        {type.linked_groups.map((group, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {group}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={type.active}
                    onCheckedChange={() => handleToggleActive(type)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(type)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(type.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {serviceTypes.length === 0 && (
        <Card className="mt-4">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Nenhum tipo de atendimento configurado</p>
            <Button className="mt-4" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Tipo
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingType?.id === 0 ? 'Novo' : 'Editar'} Tipo de Atendimento
            </DialogTitle>
            <DialogDescription>
              Configure as informações do tipo de atendimento
            </DialogDescription>
          </DialogHeader>

          {editingType && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={editingType.name}
                    onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                    placeholder="Ex: Rodízio Premium"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Preço (opcional)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editingType.price || ''}
                    onChange={(e) => setEditingType({ 
                      ...editingType, 
                      price: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    placeholder="Ex: 189.00"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={editingType.description || ''}
                  onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                  placeholder="Ex: Rodízio completo com todas as opções do cardápio"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Ícone</Label>
                  <Select
                    value={editingType.icon || 'restaurant'}
                    onValueChange={(value) => setEditingType({ ...editingType, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="color">Cor</Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={editingType.color}
                      onChange={(e) => setEditingType({ ...editingType, color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      value={editingType.color}
                      onChange={(e) => setEditingType({ ...editingType, color: e.target.value })}
                      placeholder="#FF7043"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Grupos de Cardápio Linkados</Label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2 py-1">
                      <Checkbox
                        id={`group-${group.id}`}
                        checked={selectedGroups.includes(group.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedGroups([...selectedGroups, group.id])
                          } else {
                            setSelectedGroups(selectedGroups.filter(id => id !== group.id))
                          }
                        }}
                      />
                      <Label
                        htmlFor={`group-${group.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        {group.name}
                        {group.price && (
                          <span className="ml-2 text-sm text-gray-500">
                            (R$ {group.price.toFixed(2)})
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                  {groups.length === 0 && (
                    <p className="text-gray-500 text-sm">Nenhum grupo disponível</p>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Os grupos selecionados determinarão quais itens do cardápio estarão disponíveis neste tipo de atendimento
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={editingType.active}
                  onCheckedChange={(checked) => setEditingType({ ...editingType, active: checked })}
                />
                <Label htmlFor="active">Ativo</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editingType?.id === 0 ? handleCreateNew : handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}