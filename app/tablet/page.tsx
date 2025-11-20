'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Clock, Utensils, Wine, Info, Lock, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: number
  name: string
  description: string
  price: string
  image_url: string | null
  category: string
  category_id: number
  is_premium?: boolean
  printer_id?: number
}

interface CartItem extends Product {
  quantity: number
  observation?: string
}

interface Category {
  id: number
  name: string
  icon: string
}

export default function TabletPage() {
  const [isIdle, setIsIdle] = useState(false)
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedMode, setSelectedMode] = useState<'rodizio' | 'carte' | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [tableNumber, setTableNumber] = useState<string>('')
  const [orderHistory, setOrderHistory] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalSpent, setTotalSpent] = useState(0)
  const [tabletConfig, setTabletConfig] = useState<any>(null)

  // Sistema de senha para bloqueio
  const [ADMIN_PASSWORD, setADMIN_PASSWORD] = useState('0000')

  // Configurar modo ocioso
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsIdle(false)
      
      if (idleTimer) {
        clearTimeout(idleTimer)
      }
      
      const timer = setTimeout(() => {
        setIsIdle(true)
      }, tabletConfig?.idle_time || 60000) // Usar tempo configurado
      
      setIdleTimer(timer)
    }
    
    // Eventos que resetam o timer de ociosidade
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true)
    })
    
    resetIdleTimer()
    
    return () => {
      if (idleTimer) {
        clearTimeout(idleTimer)
      }
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true)
      })
    }
  }, [idleTimer])

  // Carregar configurações, categorias e produtos
  useEffect(() => {
    loadTabletConfig()
    loadCategories()
    loadProducts()
  }, [])

  const loadTabletConfig = async () => {
    try {
      const response = await fetch('/api/tablet/config')
      const config = await response.json()
      if (config) {
        setTabletConfig(config)
        setADMIN_PASSWORD(config.lock_password || '0000')
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do tablet:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  // Filtrar produtos baseado no modo e categoria
  const getFilteredProducts = () => {
    let filtered = products

    // Filtrar por modo
    if (selectedMode === 'rodizio') {
      filtered = filtered.filter(p => parseFloat(p.price) === 0)
    } else if (selectedMode === 'carte') {
      filtered = filtered.filter(p => parseFloat(p.price) > 0)
    }

    // Filtrar por categoria
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory)
    }

    return filtered
  }

  // Adicionar ao carrinho
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id)
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  // Remover do carrinho
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId))
  }

  // Atualizar quantidade
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ))
    }
  }

  // Calcular total do carrinho
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity)
    }, 0)
  }

  // Enviar pedido
  const sendOrder = async (sendAll: boolean = false) => {
    if (tabletConfig?.require_table_number && !tableNumber) {
      alert('Por favor, informe o número da mesa')
      return
    }

    setLoading(true)
    
    try {
      const itemsToSend = sendAll ? cart : cart.filter(item => item.quantity > 0)
      
      // Criar pedido
      const orderData = {
        table_id: parseInt(tableNumber) || 0,
        items: itemsToSend.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          observation: item.observation || ''
        })),
        status: 'pending',
        total: itemsToSend.reduce((total, item) => 
          total + (parseFloat(item.price) * item.quantity), 0
        )
      }

      const response = await fetch('/api/tablet/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const data = await response.json()
        
        // Adicionar ao histórico
        setOrderHistory([...orderHistory, data.order])
        
        // Atualizar total gasto
        setTotalSpent(totalSpent + orderData.total)
        
        // Limpar carrinho
        if (sendAll) {
          setCart([])
        }
        
        // Mostrar confirmação com animação
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-xl z-[9999] animate-slide-in'
        notification.textContent = '✓ Pedido enviado com sucesso!'
        document.body.appendChild(notification)
        
        setTimeout(() => {
          notification.remove()
        }, 3000)
      }
    } catch (error) {
      console.error('Erro ao enviar pedido:', error)
      alert('Erro ao enviar pedido. Tente novamente.')
    } finally {
      setLoading(false)
      setShowCart(false)
    }
  }

  // Verificar senha
  const handleUnlock = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLocked(false)
      setPassword('')
    } else {
      alert('Senha incorreta')
      setPassword('')
    }
  }

  // Tela de bloqueio
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-8">
        <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md">
          <Lock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Tablet Bloqueado
          </h2>
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button
              onClick={handleUnlock}
              className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold"
            >
              Desbloquear
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Tela de ociosidade
  if (isIdle) {
    return (
      <div 
        className="min-h-screen bg-black flex items-center justify-center cursor-pointer"
        onClick={() => setIsIdle(false)}
      >
        <div className="text-center animate-pulse">
          <Utensils className="w-32 h-32 text-orange-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">ComideX</h1>
          <p className="text-gray-400">Toque na tela para começar</p>
        </div>
      </div>
    )
  }

  // Seleção de mesa e modo
  if ((!tableNumber && tabletConfig?.require_table_number) || !selectedMode) {
    return (
      <div className="min-h-screen bg-gray-950 p-8 flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <h1 className="text-5xl font-bold text-center text-white mb-2">
            Bem-vindo ao ComideX
          </h1>
          <p className="text-xl text-center text-gray-400 mb-12">
            Faça seu pedido de forma rápida e prática
          </p>

          {!tableNumber && tabletConfig?.require_table_number ? (
            <div className="bg-gray-900 p-8 rounded-2xl mb-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Informe o número da mesa
              </h2>
              <input
                type="number"
                placeholder="Número da mesa"
                className="w-full px-6 py-4 bg-gray-800 text-white text-2xl rounded-lg"
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>
          ) : (
            <div className={`grid ${tabletConfig?.enable_rodizio && tabletConfig?.enable_carte ? 'grid-cols-2' : 'grid-cols-1'} gap-8`}>
              {tabletConfig?.enable_rodizio && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMode('rodizio')}
                  className="bg-gradient-to-br from-orange-500 to-orange-600 p-8 rounded-2xl"
                  style={{ backgroundColor: tabletConfig?.theme_color || '#FF6B00' }}
                >
                  <Clock className="w-16 h-16 text-white mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-2">Rodízio</h3>
                  <p className="text-white/80">Coma à vontade por tempo limitado</p>
                </motion.button>
              )}

              {tabletConfig?.enable_carte && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMode('carte')}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-2xl"
                >
                  <Utensils className="w-16 h-16 text-white mx-auto mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-2">À La Carte</h3>
                  <p className="text-white/80">Escolha seus pratos favoritos</p>
                </motion.button>
              )}
            </div>
          )}

          <button
            onClick={() => setIsLocked(true)}
            className="mt-8 mx-auto block px-6 py-2 text-gray-500 hover:text-gray-400"
          >
            Bloquear Tablet
          </button>
        </div>
      </div>
    )
  }

  // Interface principal
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar com Categorias */}
      <div className="w-80 bg-gray-900 p-4 overflow-y-auto">
        <div className="mb-6">
          <div className="bg-gray-800 p-4 rounded-lg mb-4">
            <p className="text-gray-400 text-sm">Mesa</p>
            <p className="text-2xl font-bold text-white">{tableNumber}</p>
            <p className="text-orange-500 mt-1">
              {selectedMode === 'rodizio' ? 'Rodízio' : 'À La Carte'}
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedMode(null)
              setTableNumber('')
              setCart([])
            }}
            className="w-full py-2 bg-gray-800 text-gray-400 rounded-lg text-sm"
          >
            Trocar Mesa/Modo
          </button>
        </div>

        <h3 className="text-lg font-semibold text-white mb-4">Categorias</h3>
        
        <button
          onClick={() => setSelectedCategory(null)}
          className={`w-full p-4 rounded-lg mb-2 text-left transition ${
            !selectedCategory 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          Todas as Categorias
        </button>

        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`w-full p-4 rounded-lg mb-2 text-left transition ${
              selectedCategory === category.id 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {category.name}
          </button>
        ))}

        {/* Bebidas especial */}
        <button
          onClick={() => setSelectedCategory(999)}
          className={`w-full p-4 rounded-lg mb-2 text-left transition ${
            selectedCategory === 999 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Wine className="inline-block w-5 h-5 mr-2" />
          Bebidas
        </button>
      </div>

      {/* Área Principal - Produtos */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {getFilteredProducts().map(product => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-900 rounded-xl overflow-hidden cursor-pointer"
              onClick={() => addToCart(product)}
            >
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-800 flex items-center justify-center">
                  <Utensils className="w-12 h-12 text-gray-600" />
                </div>
              )}
              
              <div className="p-4">
                <h4 className="font-semibold text-white mb-1">{product.name}</h4>
                {product.description && (
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                )}
                <p className="text-lg font-bold text-orange-500">
                  {parseFloat(product.price) === 0 
                    ? 'Incluso' 
                    : `R$ ${product.price}`
                  }
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Carrinho Flutuante */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={() => setShowCart(!showCart)}
              className="bg-orange-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-3"
            >
              <ShoppingCart className="w-6 h-6" />
              <span className="bg-white text-orange-500 px-2 py-1 rounded-full text-sm font-bold">
                {cart.reduce((total, item) => total + item.quantity, 0)}
              </span>
              <span className="font-semibold">
                R$ {getCartTotal().toFixed(2)}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal do Carrinho */}
      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Carrinho</h3>
              
              {cart.map(item => (
                <div key={item.id} className="bg-gray-800 p-4 rounded-lg mb-3 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{item.name}</h4>
                    <p className="text-orange-500">
                      {parseFloat(item.price) === 0 ? 'Incluso' : `R$ ${item.price}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-700 text-white rounded-lg"
                    >
                      -
                    </button>
                    <span className="text-white font-semibold w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-700 text-white rounded-lg"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-3 text-red-500"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold text-white mb-6">
                  <span>Total:</span>
                  <span>R$ {getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      sendOrder(false)
                      setShowCart(false)
                    }}
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    Enviar Item por Item
                  </button>
                  <button
                    onClick={() => {
                      sendOrder(true)
                      setShowCart(false)
                    }}
                    disabled={loading}
                    className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-semibold disabled:opacity-50"
                  >
                    Enviar Tudo
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão de Info/Histórico */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="fixed top-6 right-6 bg-gray-800 text-white p-3 rounded-full"
      >
        <Info className="w-6 h-6" />
      </button>

      {/* Modal de Histórico */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">Histórico de Pedidos</h3>
              
              <div className="bg-gray-800 p-4 rounded-lg mb-6">
                <p className="text-gray-400 mb-1">Total Gasto</p>
                <p className="text-3xl font-bold text-orange-500">
                  R$ {totalSpent.toFixed(2)}
                </p>
              </div>
              
              {orderHistory.length === 0 ? (
                <p className="text-gray-400 text-center">Nenhum pedido realizado</p>
              ) : (
                orderHistory.map((order, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded-lg mb-3">
                    <p className="text-white font-semibold">Pedido #{order.id}</p>
                    <p className="text-gray-400 text-sm">{order.items.length} itens</p>
                    <p className="text-orange-500">R$ {order.total.toFixed(2)}</p>
                  </div>
                ))
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}