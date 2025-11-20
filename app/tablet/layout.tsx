'use client'

import { useEffect } from 'react'

export default function TabletLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Prevenir zoom no tablet
    const viewport = document.querySelector('meta[name=viewport]')
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    }

    // Prevenir menu de contexto (pressão longa)
    const preventContextMenu = (e: Event) => e.preventDefault()
    document.addEventListener('contextmenu', preventContextMenu)

    // Prevenir seleção de texto
    const preventSelection = (e: Event) => e.preventDefault()
    document.addEventListener('selectstart', preventSelection)
    
    // Prevenir scroll bounce no iOS
    document.body.style.overscrollBehavior = 'none'
    
    // Prevenir pull-to-refresh
    let lastY = 0
    const preventPullToRefresh = (e: TouchEvent) => {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop
      const deltaY = e.touches[0].pageY - lastY
      
      if (scrollY === 0 && deltaY > 0) {
        e.preventDefault()
      }
      lastY = e.touches[0].pageY
    }
    
    document.addEventListener('touchstart', (e) => {
      lastY = e.touches[0].pageY
    })
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false })
    
    // Manter tela sempre ligada (Wake Lock API)
    let wakeLock: any = null
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen')
        }
      } catch (err) {
        console.log('Wake Lock não disponível')
      }
    }
    
    requestWakeLock()
    
    // Re-adquirir wake lock quando a página ficar visível novamente
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock()
      }
    })
    
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu)
      document.removeEventListener('selectstart', preventSelection)
      document.removeEventListener('touchmove', preventPullToRefresh)
      if (wakeLock) {
        wakeLock.release()
      }
    }
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {children}
    </div>
  )
}