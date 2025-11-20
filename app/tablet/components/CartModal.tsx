'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, Send, ShoppingCart } from 'lucide-react'

interface CartItem {
  id: number
  name: string
  price: string
  quantity: number
  observation?: string
}

interface CartModalProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (id: number, quantity: number) => void
  onRemoveItem: (id: number) => void
  onSendOrder: (sendAll: boolean) => void
  loading?: boolean
  allowPartialSend?: boolean
}

export default function CartModal({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onSendOrder,
  loading = false,
  allowPartialSend = true
}: CartModalProps) {
  // Calcular total
  const getTotal = () => {
    return cart.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity)
    }, 0)
  }

  // Calcular quantidade total
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-gray-900 z-50 shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gray-800 p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-orange-500" />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Carrinho</h2>
                    <p className="text-sm text-gray-400">
                      {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Carrinho vazio</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Adicione produtos para começar
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-gray-800 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">
                          {item.name}
                        </h3>
                        <p className="text-orange-500 font-medium">
                          {parseFloat(item.price) === 0 
                            ? 'Incluso' 
                            : `R$ ${parseFloat(item.price).toFixed(2).replace('.', ',')}`
                          }
                        </p>
                        {item.observation && (
                          <p className="text-sm text-gray-400 mt-1">
                            {item.observation}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Controles de quantidade */}
                        <div className="flex items-center gap-2 bg-gray-700 rounded-lg p-1">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          
                          <span className="text-white font-semibold min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        {/* Botão remover */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="p-2 hover:bg-red-600/20 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal do item */}
                    {parseFloat(item.price) > 0 && item.quantity > 1 && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                          Subtotal: 
                          <span className="text-white font-semibold ml-2">
                            R$ {(parseFloat(item.price) * item.quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer com total e botões */}
            {cart.length > 0 && (
              <div className="bg-gray-800 border-t border-gray-700 p-6">
                {/* Total */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xl text-gray-400">Total:</span>
                  <span className="text-3xl font-bold text-orange-500">
                    R$ {getTotal().toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Botões de ação */}
                <div className="space-y-3">
                  <button
                    onClick={() => onSendOrder(true)}
                    disabled={loading}
                    className={`
                      w-full py-4 rounded-xl font-semibold text-lg
                      flex items-center justify-center gap-3
                      transition-all duration-200
                      ${loading 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }
                    `}
                  >
                    <Send className="w-5 h-5" />
                    {loading ? 'Enviando...' : 'Enviar Tudo'}
                  </button>

                  {allowPartialSend && (
                    <button
                      onClick={() => onSendOrder(false)}
                      disabled={loading}
                      className={`
                        w-full py-3 rounded-xl font-medium
                        flex items-center justify-center gap-3
                        transition-all duration-200
                        ${loading 
                          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }
                      `}
                    >
                      <Send className="w-4 h-4" />
                      Enviar Item por Item
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}