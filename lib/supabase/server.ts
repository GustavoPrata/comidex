import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'
import { createFallbackClient } from './fallback-client'
import { getSupabaseConfig } from './auto-detect'

export async function createClient() {
  // Detecta automaticamente a configuração correta
  const config = getSupabaseConfig()
  
  if (!config.configured || !config.url || !config.anonKey) {
    console.warn('⚠️ [Server] Supabase não configurado - usando dados locais')
    return createFallbackClient() as any
  }
  
  try {
    // Log seguro sem expor informações sensíveis
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [Server] Conectando ao Supabase...')
    }
    const cookieStore = await cookies()

    return createServerClient<Database>(
      config.url,
      config.anonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  } catch (error) {
    console.error('❌ [Server] Erro ao conectar com Supabase:', error)
    return createFallbackClient() as any
  }
}