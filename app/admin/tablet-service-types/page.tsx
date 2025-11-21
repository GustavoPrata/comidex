'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Save, 
  Trash2, 
  Edit, 
  Link as LinkIcon, 
  Tablet,
  Search,
  Settings,
  Sparkles,
  Crown,
  Flame,
  Utensils,
  BookOpen,
  Coffee,
  Star,
  Pizza,
  Sandwich,
  Salad,
  Cake,
  Wine,
  Loader2,
  ArrowUp,
  ArrowDown
} from "lucide-react"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface ServiceType {
  id: number
  name: string
  description: string | null
  active: boolean
  display_order: number
  icon: string | null
  color: string
  linked_groups?: string[]
  linked_groups_details?: { id: number, name: string, price: number | null }[]
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
  const [searchTerm, setSearchTerm] = useState("")
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadServiceTypes()
    loadGroups()
  }, [])

  const loadServiceTypes = async () => {
    try {
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

      const formattedTypes = typesData?.map((type: any) => ({
        ...type,
        linked_groups: type.tablet_service_type_groups?.map((tsg: any) => tsg.groups?.name).filter(Boolean) || [],
        linked_groups_details: type.tablet_service_type_groups?.map((tsg: any) => tsg.groups).filter(Boolean) || []
      })) || []

      setServiceTypes(formattedTypes)
    } catch (error: any) {
      console.error('Erro ao carregar tipos de atendimento:', error)
      toast.error('Erro ao carregar tipos de atendimento')
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
      toast.error('Erro ao carregar grupos')
    }
  }

  const handleEdit = async (type: ServiceType) => {
    setEditingType(type)
    
    const { data: linkedGroups } = await supabase
      .from('tablet_service_type_groups')
      .select('group_id')
      .eq('service_type_id', type.id)
    
    setSelectedGroups(linkedGroups?.map((lg: any) => lg.group_id) || [])
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editingType) return
    setSaving(true)

    try {
      const { error: updateError } = await supabase
        .from('tablet_service_types')
        .update({
          name: editingType.name,
          description: editingType.description,
          active: editingType.active
        })
        .eq('id', editingType.id)

      if (updateError) throw updateError

      await supabase
        .from('tablet_service_type_groups')
        .delete()
        .eq('service_type_id', editingType.id)

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

      toast.success('Tipo de atendimento atualizado com sucesso')
      setDialogOpen(false)
      loadServiceTypes()
    } catch (error: any) {
      console.error('Erro ao atualizar tipo de atendimento:', error)
      toast.error('Erro ao atualizar tipo de atendimento')
    } finally {
      setSaving(false)
    }
  }

  const handleCreate = () => {
    setEditingType({
      id: 0,
      name: '',
      description: '',
      active: true,
      display_order: serviceTypes.length + 1,
      icon: null,
      color: '#FF7043'
    })
    setSelectedGroups([])
    setDialogOpen(true)
  }

  const handleCreateNew = async () => {
    if (!editingType || editingType.id !== 0) return
    setSaving(true)

    try {
      const { data, error } = await supabase
        .from('tablet_service_types')
        .insert([{
          name: editingType.name,
          description: editingType.description,
          active: editingType.active,
          display_order: editingType.display_order
        }])
        .select()

      if (error) throw error

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

      toast.success('Tipo de atendimento criado com sucesso')
      setDialogOpen(false)
      loadServiceTypes()
    } catch (error: any) {
      console.error('Erro ao criar tipo de atendimento:', error)
      toast.error('Erro ao criar tipo de atendimento')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este tipo de atendimento?')) return

    try {
      await supabase
        .from('tablet_service_type_groups')
        .delete()
        .eq('service_type_id', id)

      const { error } = await supabase
        .from('tablet_service_types')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('Tipo de atendimento excluído com sucesso')
      loadServiceTypes()
    } catch (error: any) {
      console.error('Erro ao excluir tipo de atendimento:', error)
      toast.error('Erro ao excluir tipo de atendimento')
    }
  }

  const handleToggleActive = async (type: ServiceType) => {
    try {
      const { error } = await supabase
        .from('tablet_service_types')
        .update({ active: !type.active })
        .eq('id', type.id)

      if (error) throw error

      toast.success('Status atualizado com sucesso')
      loadServiceTypes()
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status')
    }
  }

  const handleOrderChange = async (type: ServiceType, direction: 'up' | 'down') => {
    const currentIndex = serviceTypes.findIndex(t => t.id === type.id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= serviceTypes.length) return

    const targetType = serviceTypes[targetIndex]

    try {
      await supabase
        .from('tablet_service_types')
        .update({ display_order: targetType.display_order })
        .eq('id', type.id)

      await supabase
        .from('tablet_service_types')
        .update({ display_order: type.display_order })
        .eq('id', targetType.id)

      toast.success('Ordem atualizada com sucesso')
      loadServiceTypes()
    } catch (error: any) {
      console.error('Erro ao atualizar ordem:', error)
      toast.error('Erro ao atualizar ordem')
    }
  }

  // Get icon based on linked group type
  const getIconForType = (type: ServiceType) => {
    // Try to get icon from the first linked group name
    if (type.linked_groups && type.linked_groups.length > 0) {
      const groupName = type.linked_groups[0].toLowerCase()
      if (groupName.includes('premium') || groupName.includes('rodízio premium')) {
        return Crown
      } else if (groupName.includes('tradicional') || groupName.includes('rodízio tradicional')) {
        return Utensils
      } else if (groupName.includes('bebida')) {
        return Coffee
      } else if (groupName.includes('carte')) {
        return BookOpen
      }
    }
    // Default icon
    return Utensils
  }

  const filteredServiceTypes = serviceTypes.filter(type => 
    !searchTerm || 
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-orange-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          {/* Top Row: Title and Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500">
                <Tablet className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tipos de Atendimento</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Input
                  placeholder="Pesquisar..."
                  className="w-64 pr-10 rounded-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 hover:bg-orange-600 rounded-full p-1">
                  <Search className="h-4 w-4 text-white" />
                </button>
              </div>
              <Button 
                onClick={handleCreate}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo
              </Button>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Configure os tipos de atendimento disponíveis no tablet para os clientes
          </p>

          {/* Summary */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {serviceTypes.length} {serviceTypes.length === 1 ? 'tipo' : 'tipos'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                {serviceTypes.filter(t => t.active).length} {serviceTypes.filter(t => t.active).length === 1 ? 'ativo' : 'ativos'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="space-y-4">
          {filteredServiceTypes.map((type, index) => {
            const Icon = getIconForType(type)
            
            return (
              <div
                key={type.id}
                className={`bg-white dark:bg-gray-900/95 rounded-2xl border ${
                  !type.active 
                    ? 'border-gray-200 dark:border-gray-700/40 opacity-60' 
                    : 'border-gray-200 dark:border-gray-700/60'
                } shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Drag Handle with Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <div
                            className="cursor-move p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full touch-none group select-none transition-all hover:shadow-sm flex items-center justify-center"
                            style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
                            onMouseDown={(e) => e.preventDefault()}
                            title="Reordenar"
                          >
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                            </svg>
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem 
                            onClick={() => handleOrderChange(type, 'up')}
                            disabled={index === 0}
                            className="cursor-pointer"
                          >
                            <ArrowUp className="h-4 w-4 mr-2" />
                            Mover para cima
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleOrderChange(type, 'down')}
                            disabled={index === serviceTypes.length - 1}
                            className="cursor-pointer"
                          >
                            <ArrowDown className="h-4 w-4 mr-2" />
                            Mover para baixo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Icon */}
                      <div 
                        className="flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500/10"
                      >
                        <Icon 
                          className="h-7 w-7 text-orange-500"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                            {type.name}
                          </h3>
                        </div>
                        
                        {type.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {type.description}
                          </p>
                        )}
                        
                        {type.linked_groups_details && type.linked_groups_details.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <LinkIcon className="h-4 w-4 text-gray-400" />
                            {type.linked_groups_details.map((group: any, idx: number) => (
                              <Badge 
                                key={idx} 
                                variant="secondary"
                                className="text-xs"
                              >
                                {group.name}
                                {group.price && (
                                  <span className="ml-1 font-bold text-green-600 dark:text-green-400">
                                    R$ {group.price.toFixed(2)}
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleActive(type)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          type.active 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        {type.active ? 'Ativo' : 'Inativo'}
                      </button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(type)}
                        className="hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      >
                        <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(type.id)}
                        className="hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredServiceTypes.length === 0 && (
          <div className="bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm">
            <div className="text-center py-12">
              <Tablet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'Nenhum tipo de atendimento encontrado' 
                  : 'Nenhum tipo de atendimento configurado'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleCreate}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Tipo
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900/95 border-gray-200 dark:border-gray-700/60">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500">
                <Tablet className="h-4 w-4 text-white" />
              </div>
              {editingType?.id === 0 ? 'Novo' : 'Editar'} Tipo de Atendimento
            </DialogTitle>
            <DialogDescription>
              Configure as informações do tipo de atendimento para o tablet
            </DialogDescription>
          </DialogHeader>

          {editingType && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={editingType.name}
                    onChange={(e) => setEditingType({ ...editingType, name: e.target.value })}
                    placeholder="Ex: Rodízio Premium"
                    className="rounded-xl"
                  />
                </div>

              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={editingType.description || ''}
                  onChange={(e) => setEditingType({ ...editingType, description: e.target.value })}
                  placeholder="Ex: Rodízio completo com todas as opções do cardápio"
                  className="rounded-xl min-h-[80px]"
                />
              </div>


              <div className="space-y-2">
                <Label>Grupos de Cardápio Vinculados</Label>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 max-h-60 overflow-y-auto">
                  {groups.map((group) => (
                    <div key={group.id} className="flex items-center space-x-2 py-2">
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
                        className="flex-1 cursor-pointer font-normal"
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
                    <p className="text-gray-500 text-sm text-center">Nenhum grupo disponível</p>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Os grupos selecionados determinam quais itens do cardápio estarão disponíveis
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingType({ ...editingType, active: !editingType.active })}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    editingType.active 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  {editingType.active ? 'Ativo' : 'Inativo'}
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Tipo de atendimento {editingType.active ? 'disponível' : 'não disponível'} no tablet
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="rounded-full"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              onClick={editingType?.id === 0 ? handleCreateNew : handleSave}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full"
              disabled={saving || !editingType?.name}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}