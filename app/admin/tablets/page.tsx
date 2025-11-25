'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Tablet,
  Trash2,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  Clock
} from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RegisteredTablet {
  id: number
  device_id: string
  name: string
  ip_address: string | null
  status: string
  registered_at: string
  last_seen: string
}

export default function TabletsPage() {
  const [tablets, setTablets] = useState<RegisteredTablet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [maxTablets, setMaxTablets] = useState(20)
  const [deleteTablet, setDeleteTablet] = useState<RegisteredTablet | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      
      const [tabletsRes, settingsRes] = await Promise.all([
        supabase.from('registered_tablets').select('*').order('registered_at', { ascending: false }),
        supabase.from('tablet_settings').select('*').eq('setting_key', 'max_tablets').single()
      ])

      if (tabletsRes.error) throw tabletsRes.error
      if (tabletsRes.data) setTablets(tabletsRes.data)
      
      if (settingsRes.data) {
        setMaxTablets(parseInt(settingsRes.data.setting_value) || 20)
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar tablets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (tablet: RegisteredTablet) => {
    try {
      const { error } = await supabase
        .from('registered_tablets')
        .delete()
        .eq('id', tablet.id)

      if (error) throw error
      
      setTablets(prev => prev.filter(t => t.id !== tablet.id))
      toast.success(`Tablet "${tablet.name}" removido com sucesso!`)
      setDeleteTablet(null)
    } catch (error: any) {
      console.error('Erro ao remover tablet:', error)
      toast.error('Erro ao remover tablet')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOnline = (lastSeen: string) => {
    const diff = Date.now() - new Date(lastSeen).getTime()
    return diff < 5 * 60 * 1000
  }

  const onlineCount = tablets.filter(t => isOnline(t.last_seen)).length
  const offlineCount = tablets.length - onlineCount

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
          <p className="text-gray-400">Carregando tablets...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Tablet className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tablets Registrados</h1>
            <p className="text-gray-400 text-sm">Gerencie os dispositivos autorizados</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Wifi className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Online</p>
                <p className="text-2xl font-bold text-white">{onlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <WifiOff className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Offline</p>
                <p className="text-2xl font-bold text-white">{offlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Tablet className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold text-white">{tablets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Tablet className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Limite</p>
                <p className="text-2xl font-bold text-white">{maxTablets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Tablet className="w-5 h-5 text-orange-500" />
            Dispositivos ({tablets.length})
          </CardTitle>
          <CardDescription>
            Lista de todos os tablets registrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tablets.length === 0 ? (
            <div className="text-center py-8">
              <Tablet className="w-12 h-12 mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400">Nenhum tablet registrado ainda</p>
              <p className="text-sm text-gray-500 mt-1">
                Os tablets serão registrados automaticamente ao se conectarem
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tablets.map((tablet) => (
                <div
                  key={tablet.id}
                  className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isOnline(tablet.last_seen) ? 'bg-green-500/20' : 'bg-zinc-700'}`}>
                      {isOnline(tablet.last_seen) ? (
                        <Wifi className="w-5 h-5 text-green-500" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-white">{tablet.name}</p>
                        <Badge 
                          variant="outline" 
                          className={isOnline(tablet.last_seen) 
                            ? 'border-green-500 text-green-500' 
                            : 'border-gray-500 text-gray-500'
                          }
                        >
                          {isOnline(tablet.last_seen) ? 'Online' : 'Offline'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span className="font-mono">{tablet.device_id.substring(0, 16)}...</span>
                        {tablet.ip_address && (
                          <span>IP: {tablet.ip_address}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Registrado: {formatDate(tablet.registered_at)}
                        </span>
                        <span>
                          Último acesso: {formatDate(tablet.last_seen)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => setDeleteTablet(tablet)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTablet} onOpenChange={() => setDeleteTablet(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remover Tablet</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Tem certeza que deseja remover o tablet "{deleteTablet?.name}"? 
              O dispositivo precisará ser registrado novamente para acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => deleteTablet && handleDelete(deleteTablet)}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
