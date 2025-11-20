'use client'

import { Utensils } from 'lucide-react'
import { motion } from 'framer-motion'

interface Product {
  id: number
  name: string
  description: string
  price: string
  image_url: string | null
  category: string
  category_id: number
  is_premium?: boolean
}

interface ProductCardProps {
  product: Product
  onClick: (product: Product) => void
  isInCart?: boolean
}

export default function ProductCard({ product, onClick, isInCart = false }: ProductCardProps) {
  // Formatar preço para exibição
  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price)
    if (numPrice === 0) return 'Incluso'
    return `R$ ${numPrice.toFixed(2).replace('.', ',')}`
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(product)}
      className={`
        bg-gray-900 rounded-xl overflow-hidden cursor-pointer
        transition-all duration-200
        ${isInCart ? 'ring-2 ring-orange-500' : ''}
      `}
    >
      {/* Imagem 16:9 */}
      <div className="relative aspect-video bg-gray-800">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Utensils className="w-12 h-12 text-gray-600" />
          </div>
        )}
        
        {/* Badge Premium se aplicável */}
        {product.is_premium && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-md text-xs font-bold">
            Premium
          </div>
        )}
        
        {/* Indicador de item no carrinho */}
        {isInCart && (
          <div className="absolute bottom-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-bold">
            ✓
          </div>
        )}
      </div>
      
      {/* Informações do produto */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>
        
        {product.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-orange-500">
            {formatPrice(product.price)}
          </p>
          
          <p className="text-xs text-gray-500">
            {product.category}
          </p>
        </div>
      </div>
    </motion.div>
  )
}