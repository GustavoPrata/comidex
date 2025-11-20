'use client'

import { useState, useEffect } from 'react'
import { Save, Tablet, Lock, Clock, Eye, EyeOff, Palette, ShoppingBag, History, QrCode } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface TabletConfig {
  idle_time: number
  lock_password: string
  enable_rodizio: boolean
  enable_carte: boolean
  require_table_number: boolean
  allow_partial_send: boolean
  show_history: boolean
  theme_color: string
}

export default function TabletConfigPage() {
  const [config, setConfig] = useState<TabletConfig>({
    idle_time: 60000,
    lock_password: '0000',
    enable_rodizio: true,
    enable_carte: true,
    require_table_number: true,
    allow_partial_send: true,
    show_history: true,
    theme_color: '#FF6B00'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [tabletUrl, setTabletUrl] = useState('')

  useEffect(() => {
    loadConfig()
    // Gerar URL do tablet
    const baseUrl = window.location.origin
    setTabletUrl(`${baseUrl}/tablet`)
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/tablet/config')
      const data = await response.json()
      if (data) {
        setConfig(data)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/tablet/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Configurações salvas com sucesso!')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const generateQRCode = () => {
    // Abrir nova aba com QR Code
    window.open(`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(tabletUrl)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 p-8 flex items-center justify-center">
        <div className="text-white">Carregando configurações...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Tablet className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-white">Configurações do Tablet</h1>
              <p className="text-gray-400">Configure o sistema de autoatendimento para tablets</p>
            </div>
          </div>
          
          <button
            onClick={saveConfig}
            disabled={saving}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>

        {/* URL e QR Code */}
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-orange-500" />
            Acesso ao Tablet
          </h2>
          
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <p className="text-sm text-gray-400 mb-2">URL do Tablet:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tabletUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(tabletUrl)
                  toast.success('URL copiada!')
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Copiar
              </button>
              <button
                onClick={() => window.open(tabletUrl, '_blank')}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Abrir
              </button>
              <button
                onClick={generateQRCode}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                QR Code
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>• Acesse esta URL no navegador do tablet</p>
            <p>• Adicione aos favoritos ou crie atalho na tela inicial</p>
            <p>• Configure o navegador em modo tela cheia (F11)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Configurações de Segurança */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-500" />
              Segurança
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Senha de Bloqueio
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={config.lock_password}
                    onChange={(e) => setConfig({ ...config, lock_password: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Senha para bloquear/desbloquear o tablet
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Tempo de Ociosidade
                </label>
                <select
                  value={config.idle_time}
                  onChange={(e) => setConfig({ ...config, idle_time: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg"
                >
                  <option value="30000">30 segundos</option>
                  <option value="60000">1 minuto</option>
                  <option value="120000">2 minutos</option>
                  <option value="300000">5 minutos</option>
                  <option value="600000">10 minutos</option>
                  <option value="0">Nunca</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Tempo sem atividade para entrar em modo ocioso
                </p>
              </div>
            </div>
          </div>

          {/* Configurações de Funcionalidades */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              Funcionalidades
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-white">Habilitar Rodízio</span>
                <input
                  type="checkbox"
                  checked={config.enable_rodizio}
                  onChange={(e) => setConfig({ ...config, enable_rodizio: e.target.checked })}
                  className="w-5 h-5 text-orange-500 bg-gray-800 border-gray-700 rounded focus:ring-orange-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-white">Habilitar À La Carte</span>
                <input
                  type="checkbox"
                  checked={config.enable_carte}
                  onChange={(e) => setConfig({ ...config, enable_carte: e.target.checked })}
                  className="w-5 h-5 text-orange-500 bg-gray-800 border-gray-700 rounded focus:ring-orange-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-white">Exigir Número da Mesa</span>
                <input
                  type="checkbox"
                  checked={config.require_table_number}
                  onChange={(e) => setConfig({ ...config, require_table_number: e.target.checked })}
                  className="w-5 h-5 text-orange-500 bg-gray-800 border-gray-700 rounded focus:ring-orange-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-white">Permitir Envio Parcial</span>
                <input
                  type="checkbox"
                  checked={config.allow_partial_send}
                  onChange={(e) => setConfig({ ...config, allow_partial_send: e.target.checked })}
                  className="w-5 h-5 text-orange-500 bg-gray-800 border-gray-700 rounded focus:ring-orange-500"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-white">Mostrar Histórico</span>
                <input
                  type="checkbox"
                  checked={config.show_history}
                  onChange={(e) => setConfig({ ...config, show_history: e.target.checked })}
                  className="w-5 h-5 text-orange-500 bg-gray-800 border-gray-700 rounded focus:ring-orange-500"
                />
              </label>
            </div>
          </div>

          {/* Configurações de Aparência */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-orange-500" />
              Aparência
            </h2>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Cor do Tema
              </label>
              <input
                type="color"
                value={config.theme_color}
                onChange={(e) => setConfig({ ...config, theme_color: e.target.value })}
                className="w-full h-12 bg-gray-800 rounded-lg cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cor principal do aplicativo
              </p>
            </div>
          </div>

          {/* Instruções de Configuração */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-orange-500" />
              Instruções de Configuração
            </h2>
            
            <div className="space-y-3 text-sm text-gray-400">
              <h3 className="text-white font-semibold">Android:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Instale o Chrome ou Firefox</li>
                <li>Acesse a URL do tablet</li>
                <li>Menu → "Adicionar à tela inicial"</li>
                <li>Ative "Fixar tela" nas configurações</li>
              </ul>
              
              <h3 className="text-white font-semibold mt-4">iPad/iOS:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Abra no Safari</li>
                <li>Toque no ícone de compartilhar</li>
                <li>Selecione "Adicionar à Tela de Início"</li>
                <li>Use "Acesso Guiado" para bloquear</li>
              </ul>
              
              <h3 className="text-white font-semibold mt-4">Windows:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Use Chrome em modo quiosque</li>
                <li>chrome.exe --kiosk {tabletUrl}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}