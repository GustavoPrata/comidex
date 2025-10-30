'use client'

import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark') // Dark mode as default
  const [mounted, setMounted] = useState(false)

  // Use useLayoutEffect to apply theme before paint
  useLayoutEffect(() => {
    const savedTheme = (typeof window !== 'undefined' ? localStorage.getItem('theme') : null) as Theme | null
    const initialTheme = savedTheme || 'dark'
    setTheme(initialTheme)
    
    // Apply theme immediately
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(initialTheme)
    
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const root = window.document.documentElement
    
    // Remove both classes first to ensure clean state
    root.classList.remove('light', 'dark')
    
    // Add the current theme class
    root.classList.add(theme)
    
    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark'
      return newTheme
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return a default value for server-side rendering
    return { theme: 'dark' as Theme, toggleTheme: () => {} }
  }
  return context
}