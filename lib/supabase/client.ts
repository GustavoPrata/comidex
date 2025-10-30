import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { createFallbackClient } from './fallback-client'
import { getSupabaseConfig } from './auto-detect'

export function createClient() {
  // Detecta automaticamente a configuração correta
  const config = getSupabaseConfig()
  
  if (!config.configured || !config.url || !config.anonKey) {
    console.warn('⚠️ Supabase não configurado - usando dados locais')
    return createFallbackClient() as any
  }
  
  try {
    // Conectar com as variáveis detectadas automaticamente
    return createBrowserClient<Database>(config.url, config.anonKey)
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error)
    console.log('   Usando dados locais como fallback')
    return createFallbackClient() as any
  }
}