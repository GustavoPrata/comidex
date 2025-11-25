'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { 
  Save, 
  Tablet,
  Sun,
  Moon,
  Clock,
  Hand,
  Settings,
  Loader2,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface TabletSetting {
  id: number
  setting_key: string
  setting_value: string
  setting_type: string
  description: string
}

export default function TabletSettingsPage() {
  const [settings, setSettings] = useState<TabletSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const [brightnessEnabled, setBrightnessEnabled] = useState(true)
  const [idleTimeoutSeconds, setIdleTimeoutSeconds] = useState(120)
  const [dimBrightness, setDimBrightness] = useState(0.1)
  const [defaultBrightness, setDefaultBrightness] = useState(0.8)
  const [touchToWake, setTouchToWake] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('tablet_settings')
        .select('*')
        .order('id')

      if (error) throw error

      if (data) {
        setSettings(data)
        data.forEach((setting: TabletSetting) => {
          switch (setting.setting_key) {
            case 'brightness_enabled':
              setBrightnessEnabled(setting.setting_value === 'true')
              break
            case 'idle_timeout_seconds':
              setIdleTimeoutSeconds(parseInt(setting.setting_value) || 120)
              break
            case 'dim_brightness':
              setDimBrightness(parseFloat(setting.setting_value) || 0.1)
              break
            case 'default_brightness':
              setDefaultBrightness(parseFloat(setting.setting_value) || 0.8)
              break
            case 'touch_to_wake':
              setTouchToWake(setting.setting_value === 'true')
              break
          }
        })
      }
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)

      const updates = [
        { setting_key: 'brightness_enabled', setting_value: brightnessEnabled.toString() },
        { setting_key: 'idle_timeout_seconds', setting_value: idleTimeoutSeconds.toString() },
        { setting_key: 'dim_brightness', setting_value: dimBrightness.toString() },
        { setting_key: 'default_brightness', setting_value: defaultBrightness.toString() },
        { setting_key: 'touch_to_wake', setting_value: touchToWake.toString() },
      ]

      for (const update of updates) {
        const { error } = await supabase
          .from('tablet_settings')
          .update({ 
            setting_value: update.setting_value,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', update.setting_key)

        if (error) throw error
      }

      toast.success('Configurações salvas com sucesso! Os tablets serão atualizados automaticamente.')
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} segundos`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    if (remainingSeconds === 0) return `${minutes} minuto${minutes > 1 ? 's' : ''}`
    return `${minutes}min ${remainingSeconds}s`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
          <p className="text-gray-400">Carregando configurações...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500">
                <Tablet className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tela do Tablet</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={loadSettings} disabled={isLoading} className="rounded-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button onClick={saveSettings} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white rounded-full">
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerencie o comportamento dos tablets em tempo real
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="m-4 grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-gray-900/95 border-gray-200 dark:border-gray-700/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Settings className="w-5 h-5 text-orange-500" />
              Controle de Brilho
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Configure o comportamento do brilho automático nos tablets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-900 dark:text-gray-100">Ativar controle de brilho</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Diminui o brilho automaticamente após inatividade
                </p>
              </div>
              <Switch
                checked={brightnessEnabled}
                onCheckedChange={setBrightnessEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-gray-900 dark:text-gray-100">Toque para acordar</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Qualquer toque na tela restaura o brilho
                </p>
              </div>
              <Switch
                checked={touchToWake}
                onCheckedChange={setTouchToWake}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900/95 border-gray-200 dark:border-gray-700/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Clock className="w-5 h-5 text-orange-500" />
              Tempo de Inatividade
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Tempo até o brilho diminuir automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-gray-100">Tempo: {formatTime(idleTimeoutSeconds)}</Label>
                <span className="text-sm text-gray-600 dark:text-gray-400">{idleTimeoutSeconds}s</span>
              </div>
              <Slider
                value={[idleTimeoutSeconds]}
                onValueChange={(value) => setIdleTimeoutSeconds(value[0])}
                min={30}
                max={600}
                step={30}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>30s</span>
                <span>5min</span>
                <span>10min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900/95 border-gray-200 dark:border-gray-700/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Sun className="w-5 h-5 text-orange-500" />
              Brilho Padrão
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Nível de brilho durante uso normal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-gray-100">Brilho: {Math.round(defaultBrightness * 100)}%</Label>
                <Sun className="w-5 h-5 text-yellow-400" />
              </div>
              <Slider
                value={[defaultBrightness * 100]}
                onValueChange={(value) => setDefaultBrightness(value[0] / 100)}
                min={20}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>20%</span>
                <span>60%</span>
                <span>100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-900/95 border-gray-200 dark:border-gray-700/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Moon className="w-5 h-5 text-orange-500" />
              Brilho Reduzido
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Nível de brilho quando o tablet está inativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-900 dark:text-gray-100">Brilho: {Math.round(dimBrightness * 100)}%</Label>
                <Moon className="w-5 h-5 text-blue-400" />
              </div>
              <Slider
                value={[dimBrightness * 100]}
                onValueChange={(value) => setDimBrightness(value[0] / 100)}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                <span>5%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="m-4">
        <Card className="bg-white dark:bg-gray-900/95 border-gray-200 dark:border-gray-700/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Hand className="w-5 h-5 text-orange-500" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-orange-500 font-bold">1</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Inatividade</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Após o tempo configurado sem interação, o brilho do tablet é reduzido automaticamente.
                </p>
              </div>

              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-orange-500 font-bold">2</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Toque para Acordar</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  O cliente pode tocar em qualquer lugar da tela para restaurar o brilho normal.
                </p>
              </div>

              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <span className="text-orange-500 font-bold">3</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Sincronização</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  As configurações são aplicadas em todos os tablets automaticamente ao salvar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
