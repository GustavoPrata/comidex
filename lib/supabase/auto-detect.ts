// Sistema inteligente para detectar e usar as variáveis corretas do Supabase
// Detecta automaticamente se as variáveis estão invertidas e usa corretamente

export function getSupabaseConfig() {
  const env1 = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const env2 = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  let supabaseUrl: string | null = null
  let supabaseKey: string | null = null
  
  // Detectar qual é URL e qual é Key
  if (env1.startsWith('https://') && env1.includes('.supabase.')) {
    // env1 é a URL
    supabaseUrl = env1
    supabaseKey = env2
  } else if (env2.startsWith('https://') && env2.includes('.supabase.')) {
    // env2 é a URL (variáveis invertidas!)
    supabaseUrl = env2
    supabaseKey = env1
  } else if (env1.startsWith('eyJ')) {
    // env1 é a Key (JWT sempre começa com eyJ)
    supabaseKey = env1
    supabaseUrl = env2
  } else if (env2.startsWith('eyJ')) {
    // env2 é a Key
    supabaseKey = env2
    supabaseUrl = env1
  }
  
  // Validação final
  const isValid = 
    supabaseUrl && 
    supabaseKey && 
    supabaseUrl.startsWith('https://') && 
    supabaseUrl.includes('.supabase.') &&
    supabaseKey.startsWith('eyJ')
  
  if (isValid) {
    // Log seguro sem expor dados sensíveis
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Supabase configurado corretamente!')
    }
    return {
      url: supabaseUrl!,
      anonKey: supabaseKey!,
      configured: true
    }
  } else {
    console.warn('⚠️ Supabase não configurado ou variáveis inválidas')
    return {
      url: null,
      anonKey: null,
      configured: false
    }
  }
}