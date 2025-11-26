'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { 
  Save, 
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Bell,
  GripVertical,
  Pencil,
  X,
  GlassWater,
  Snowflake,
  UtensilsCrossed,
  Sparkles,
  Flame,
  Droplet,
  Leaf,
  Layers,
  MessageCircle,
  HelpCircle,
  Coffee,
  IceCream,
  Wine,
  Beer,
  Soup,
  Salad,
  Sandwich,
  Pizza
} from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface WaiterRequestType {
  id: number
  name: string
  description: string
  icon: string
  color: string
  active: boolean
  sort_order: number
}

const availableIcons = [
  { name: 'GlassWater', icon: GlassWater },
  { name: 'Snowflake', icon: Snowflake },
  { name: 'UtensilsCrossed', icon: UtensilsCrossed },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Flame', icon: Flame },
  { name: 'Droplet', icon: Droplet },
  { name: 'Leaf', icon: Leaf },
  { name: 'Layers', icon: Layers },
  { name: 'MessageCircle', icon: MessageCircle },
  { name: 'HelpCircle', icon: HelpCircle },
  { name: 'Coffee', icon: Coffee },
  { name: 'IceCream', icon: IceCream },
  { name: 'Wine', icon: Wine },
  { name: 'Beer', icon: Beer },
  { name: 'Soup', icon: Soup },
  { name: 'Salad', icon: Salad },
  { name: 'Sandwich', icon: Sandwich },
  { name: 'Pizza', icon: Pizza },
]

const ORANGE_COLOR = '#FF7043'

function getIconComponent(iconName: string) {
  const found = availableIcons.find(i => i.name === iconName)
  return found ? found.icon : HelpCircle
}

export default function WaiterRequestsPage() {
  const [requests, setRequests] = useState<WaiterRequestType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'HelpCircle',
    active: true
  })

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/admin/waiter-requests')
      if (!res.ok) throw new Error('Erro ao carregar')
      const data = await res.json()
      setRequests(data)
    } catch (error: any) {
      console.error('Erro ao carregar solicitações:', error)
      toast.error('Erro ao carregar solicitações')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/admin/waiter-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          color: ORANGE_COLOR,
          sort_order: requests.length
        })
      })

      if (!res.ok) throw new Error('Erro ao criar')

      toast.success('Solicitação criada com sucesso!')
      setShowAddDialog(false)
      setFormData({ name: '', description: '', icon: 'HelpCircle', active: true })
      loadRequests()
    } catch (error: any) {
      console.error('Erro ao criar solicitação:', error)
      toast.error('Erro ao criar solicitação')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (request: WaiterRequestType) => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/waiter-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          color: ORANGE_COLOR
        })
      })

      if (!res.ok) throw new Error('Erro ao atualizar')

      toast.success('Solicitação atualizada!')
      setEditingId(null)
      loadRequests()
    } catch (error: any) {
      console.error('Erro ao atualizar solicitação:', error)
      toast.error('Erro ao atualizar solicitação')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta solicitação?')) return

    try {
      const res = await fetch(`/api/admin/waiter-requests?id=${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Erro ao excluir')

      toast.success('Solicitação excluída!')
      loadRequests()
    } catch (error: any) {
      console.error('Erro ao excluir solicitação:', error)
      toast.error('Erro ao excluir solicitação')
    }
  }

  const handleToggleActive = async (request: WaiterRequestType) => {
    await handleUpdate({ ...request, active: !request.active })
  }

  const startEditing = (request: WaiterRequestType) => {
    setEditingId(request.id)
    setFormData({
      name: request.name,
      description: request.description || '',
      icon: request.icon,
      active: request.active
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', icon: 'HelpCircle', active: true })
  }

  const saveEditing = async () => {
    if (!editingId) return
    const request = requests.find(r => r.id === editingId)
    if (!request) return

    await handleUpdate({
      ...request,
      ...formData,
      color: ORANGE_COLOR
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
          <p className="text-gray-400">Carregando solicitações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Solicitações do Tablet</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={loadRequests} disabled={isLoading} className="rounded-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={() => setShowAddDialog(true)} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                <Plus className="w-4 h-4 mr-2" />
                Nova Solicitação
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure as opções que aparecem quando o cliente chama o garçom no tablet
          </p>
        </div>
      </div>

      <div className="m-4">
        <Card className="bg-white dark:bg-gray-900/95 border-gray-200 dark:border-gray-700/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">Tipos de Solicitação</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Arraste para reordenar. Clique no lápis para editar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhuma solicitação cadastrada</p>
                <Button onClick={() => setShowAddDialog(true)} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar primeira solicitação
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => {
                  const IconComponent = getIconComponent(request.icon)
                  const isEditing = editingId === request.id

                  return (
                    <div 
                      key={request.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        request.active 
                          ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                          : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 opacity-60'
                      }`}
                    >
                      <div className="cursor-move text-gray-400">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: ORANGE_COLOR + '20' }}
                      >
                        <IconComponent className="w-6 h-6" style={{ color: ORANGE_COLOR }} />
                      </div>

                      {isEditing ? (
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nome"
                          />
                          <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Descrição"
                          />
                          <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableIcons.map((icon) => {
                                const Icon = icon.icon
                                return (
                                  <SelectItem key={icon.name} value={icon.name}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="w-4 h-4" />
                                      <span>{icon.name}</span>
                                    </div>
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{request.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{request.description}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        {isEditing ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={cancelEditing}
                              className="text-gray-500"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={saveEditing}
                              disabled={saving}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleActive(request)}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                request.active 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : 'bg-red-500 hover:bg-red-600 text-white'
                              }`}
                            >
                              {request.active ? 'Ativo' : 'Inativo'}
                            </button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => startEditing(request)}
                              className="hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            >
                              <Pencil className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDelete(request.id)}
                              className="hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Copo Extra"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ex: Solicitar copo adicional"
              />
            </div>
            <div className="space-y-2">
              <Label>Ícone</Label>
              <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map((icon) => {
                    const Icon = icon.icon
                    return (
                      <SelectItem key={icon.name} value={icon.name}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{icon.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdd} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
