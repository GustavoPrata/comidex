'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Tablet,
  Trash2,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  Clock,
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Power,
  RotateCcw,
  Settings,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Monitor,
  MoreVertical,
  Signal,
  Play,
  Square
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RegisteredTablet {
  id: number
  device_id: string
  name: string
  ip_address: string | null
  status: string
  registered_at: string
  last_seen: string
  battery_level: number | null
  is_charging: boolean
  app_version: string | null
}

interface TabletCommand {
  id: number
  device_id: string | null
  command: string
  target_all: boolean
  status: string
  created_at: string
  executed_at: string | null
}

export default function TabletsPage() {
  const [tablets, setTablets] = useState<RegisteredTablet[]>([])
  const [recentCommands, setRecentCommands] = useState<TabletCommand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [maxTablets, setMaxTablets] = useState(20)
  const [deleteTablet, setDeleteTablet] = useState<RegisteredTablet | null>(null)
  const [sendingCommand, setSendingCommand] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [tabletsRes, settingsRes, commandsRes] = await Promise.all([
        supabase.from('registered_tablets').select('*').order('registered_at', { ascending: false }),
        supabase.from('tablet_settings').select('*').eq('setting_key', 'max_tablets').single(),
        supabase.from('tablet_commands').select('*').order('created_at', { ascending: false }).limit(10)
      ])

      if (tabletsRes.error) throw tabletsRes.error
      if (tabletsRes.data) setTablets(tabletsRes.data)
      
      if (settingsRes.data) {
        setMaxTablets(parseInt(settingsRes.data.setting_value) || 20)
      }

      if (commandsRes.data) {
        setRecentCommands(commandsRes.data)
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendCommand = async (command: string, deviceId?: string, targetAll: boolean = false) => {
    const cmdKey = targetAll ? `all_${command}` : `${deviceId}_${command}`
    setSendingCommand(cmdKey)
    
    try {
      const response = await fetch('/api/mobile/tablet-commands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          device_id: deviceId,
          target_all: targetAll
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        loadData()
      } else {
        toast.error(data.error || 'Erro ao enviar comando')
      }
    } catch (error: any) {
      console.error('Erro ao enviar comando:', error)
      toast.error('Erro ao enviar comando')
    } finally {
      setSendingCommand(null)
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
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOnline = (lastSeen: string) => {
    const diff = Date.now() - new Date(lastSeen).getTime()
    return diff < 60 * 1000 // Online se visto nos últimos 60 segundos
  }

  const getTimeSinceLastSeen = (lastSeen: string) => {
    const diff = Date.now() - new Date(lastSeen).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (diff < 60000) return 'Agora'
    if (minutes < 60) return `${minutes}min atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  const getBatteryIcon = (level: number | null, isCharging: boolean) => {
    if (level === null) return <Battery className="w-4 h-4 text-gray-500" />
    if (isCharging) return <BatteryCharging className="w-4 h-4 text-green-400" />
    if (level <= 20) return <BatteryLow className="w-4 h-4 text-red-500" />
    if (level <= 50) return <BatteryMedium className="w-4 h-4 text-yellow-500" />
    return <BatteryFull className="w-4 h-4 text-green-500" />
  }

  const getBatteryColor = (level: number | null) => {
    if (level === null) return 'text-gray-500'
    if (level <= 20) return 'text-red-500'
    if (level <= 50) return 'text-yellow-500'
    return 'text-green-500'
  }

  const onlineCount = tablets.filter(t => isOnline(t.last_seen)).length
  const offlineCount = tablets.length - onlineCount
  const lowBatteryCount = tablets.filter(t => t.battery_level !== null && t.battery_level <= 20).length
  const chargingCount = tablets.filter(t => t.is_charging).length

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
    <TooltipProvider>
      <div className="min-h-screen relative">
        {/* Header */}
        <div className="m-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 relative shadow-sm rounded-3xl">
          <div className="px-6 py-4">
            {/* Top Row: Title and Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500">
                  <Tablet className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gerenciamento de Tablets</h1>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={loadData} 
                  disabled={isLoading}
                  className="rounded-full"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Controle remoto e monitoramento da frota de tablets
            </p>

            {/* Summary Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Signal className="h-4 w-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">{onlineCount} online</span>
              </div>
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">{offlineCount} offline</span>
              </div>
              <div className="flex items-center gap-2">
                <Tablet className="h-4 w-4 text-orange-500" />
                <span className="text-gray-600 dark:text-gray-400">{tablets.length}/{maxTablets} tablets</span>
              </div>
              {lowBatteryCount > 0 && (
                <div className="flex items-center gap-2">
                  <BatteryLow className="h-4 w-4 text-yellow-500" />
                  <span className="text-yellow-600 dark:text-yellow-400">{lowBatteryCount} bateria baixa</span>
                </div>
              )}
              {chargingCount > 0 && (
                <div className="flex items-center gap-2">
                  <BatteryCharging className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">{chargingCount} carregando</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="m-4 space-y-4">
        {/* Bulk Actions */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Zap className="w-4 h-4 text-orange-500" />
              Ações em Massa
            </CardTitle>
            <CardDescription className="text-sm">
              Envie comandos para todos os tablets de uma vez
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => sendCommand('reload', undefined, true)}
                    disabled={sendingCommand === 'all_reload'}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {sendingCommand === 'all_reload' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4 mr-2" />
                    )}
                    Recarregar Todos
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reinicia o app em todos os tablets online</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => sendCommand('sync_settings', undefined, true)}
                    disabled={sendingCommand === 'all_sync_settings'}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {sendingCommand === 'all_sync_settings' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4 mr-2" />
                    )}
                    Sincronizar Config
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Força todos os tablets a recarregar as configurações</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => sendCommand('exit_app', undefined, true)}
                    disabled={sendingCommand === 'all_exit_app'}
                  >
                    {sendingCommand === 'all_exit_app' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4 mr-2" />
                    )}
                    Fechar Todos
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Solicita o fechamento do app em todos os tablets</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>

        {/* Tablets List */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-white text-base">
              <Monitor className="w-4 h-4 text-orange-500" />
              Dispositivos ({tablets.length})
            </CardTitle>
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
              <div className="space-y-2">
                {tablets.map((tablet) => {
                  const online = isOnline(tablet.last_seen)
                  
                  return (
                    <div
                      key={tablet.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-zinc-800 border-zinc-700"
                    >
                      <div className="flex items-center gap-3">
                        {/* Status indicator */}
                        <div className={`relative p-2 rounded-lg ${online ? 'bg-green-500/20' : 'bg-zinc-700'}`}>
                          {online ? (
                            <Wifi className="w-4 h-4 text-green-500" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-gray-500" />
                          )}
                          {online && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        
                        {/* Tablet info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white truncate">{tablet.name}</p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${online 
                                ? 'border-green-500 text-green-500' 
                                : 'border-gray-500 text-gray-500'
                              }`}
                            >
                              {online ? 'Online' : 'Offline'}
                            </Badge>
                            {tablet.app_version && (
                              <Badge variant="secondary" className="text-xs bg-zinc-700">
                                v{tablet.app_version}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                            <span className="font-mono">{tablet.device_id.substring(0, 20)}...</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeSinceLastSeen(tablet.last_seen)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Battery */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded bg-zinc-700/50 ${getBatteryColor(tablet.battery_level)}`}>
                              {getBatteryIcon(tablet.battery_level, tablet.is_charging)}
                              <span className="text-sm font-medium">
                                {tablet.battery_level !== null ? `${tablet.battery_level}%` : '--'}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {tablet.battery_level !== null 
                                ? `Bateria: ${tablet.battery_level}%${tablet.is_charging ? ' (Carregando)' : ''}`
                                : 'Bateria não informada'
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Individual actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                sendCommand('reload', tablet.device_id)
                              }}
                              className="text-blue-400 focus:text-blue-300"
                              disabled={!online}
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Recarregar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                sendCommand('sync_settings', tablet.device_id)
                              }}
                              className="text-purple-400 focus:text-purple-300"
                              disabled={!online}
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Sincronizar Config
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-700" />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                sendCommand('exit_app', tablet.device_id)
                              }}
                              className="text-orange-400 focus:text-orange-300"
                              disabled={!online}
                            >
                              <Power className="w-4 h-4 mr-2" />
                              Fechar App
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-700" />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteTablet(tablet)
                              }}
                              className="text-red-400 focus:text-red-300"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover Tablet
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Commands */}
        {recentCommands.length > 0 && (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-white text-base">
                <Send className="w-4 h-4 text-orange-500" />
                Comandos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentCommands.slice(0, 5).map((cmd) => (
                  <div 
                    key={cmd.id}
                    className="flex items-center justify-between p-2 bg-zinc-800 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          cmd.status === 'executed' 
                            ? 'border-green-500 text-green-500' 
                            : 'border-yellow-500 text-yellow-500'
                        }`}
                      >
                        {cmd.status === 'executed' ? 'Executado' : 'Pendente'}
                      </Badge>
                      <span className="text-white font-medium">{cmd.command}</span>
                      <span className="text-gray-400">
                        {cmd.target_all ? '(Todos)' : `(${cmd.device_id?.substring(0, 15)}...)`}
                      </span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {formatDate(cmd.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Dialog */}
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
      </div>
    </TooltipProvider>
  )
}
