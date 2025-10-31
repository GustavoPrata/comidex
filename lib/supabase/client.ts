// Cliente para browser - usa API proxy para PostgreSQL
export function createClient() {
  console.log('🔌 Usando API proxy para PostgreSQL (browser)')
  
  // Criar um cliente que usa fetch para chamar nossas APIs
  return {
    from: (table: string) => ({
      select: async (columns?: string) => {
        try {
          const response = await fetch(`/api/db/${table}?columns=${columns || '*'}`)
          const data = await response.json()
          return { data: data.data || data, error: data.error || null }
        } catch (error: any) {
          return { data: null, error: { message: error.message } }
        }
      },
      
      insert: async (data: any) => {
        try {
          const response = await fetch(`/api/db/${table}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          })
          const result = await response.json()
          return { data: result.data || result, error: result.error || null }
        } catch (error: any) {
          return { data: null, error: { message: error.message } }
        }
      },
      
      update: async (data: any) => ({
        eq: async (column: string, value: any) => {
          try {
            const response = await fetch(`/api/db/${table}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ data, where: { [column]: value } })
            })
            const result = await response.json()
            return { data: result.data || result, error: result.error || null }
          } catch (error: any) {
            return { data: null, error: { message: error.message } }
          }
        }
      }),
      
      delete: async () => ({
        eq: async (column: string, value: any) => {
          try {
            const response = await fetch(`/api/db/${table}`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ where: { [column]: value } })
            })
            const result = await response.json()
            return { data: result.data || result, error: result.error || null }
          } catch (error: any) {
            return { data: null, error: { message: error.message } }
          }
        }
      }),
      
      eq: (column: string, value: any) => ({
        select: async (columns?: string) => {
          try {
            const response = await fetch(`/api/db/${table}?columns=${columns || '*'}&${column}=${value}`)
            const data = await response.json()
            return { data: data.data || data, error: data.error || null }
          } catch (error: any) {
            return { data: null, error: { message: error.message } }
          }
        },
        single: async () => {
          try {
            const response = await fetch(`/api/db/${table}?${column}=${value}&single=true`)
            const data = await response.json()
            return { data: data.data || data, error: data.error || null }
          } catch (error: any) {
            return { data: null, error: { message: error.message } }
          }
        }
      }),
      
      order: (column: string, options?: { ascending?: boolean }) => ({
        select: async (columns?: string) => {
          try {
            const order = options?.ascending === false ? 'desc' : 'asc'
            const response = await fetch(`/api/db/${table}?columns=${columns || '*'}&order=${column}.${order}`)
            const data = await response.json()
            return { data: data.data || data, error: data.error || null }
          } catch (error: any) {
            return { data: null, error: { message: error.message } }
          }
        }
      }),
      
      in: (column: string, values: any[]) => ({
        select: async (columns?: string) => {
          try {
            const response = await fetch(`/api/db/${table}?columns=${columns || '*'}&${column}_in=${values.join(',')}`)
            const data = await response.json()
            return { data: data.data || data, error: data.error || null }
          } catch (error: any) {
            return { data: null, error: { message: error.message } }
          }
        }
      }),
      
      single: async () => {
        try {
          const response = await fetch(`/api/db/${table}?single=true`)
          const data = await response.json()
          return { data: data.data || data, error: data.error || null }
        } catch (error: any) {
          return { data: null, error: { message: error.message } }
        }
      },
      
      limit: (count: number) => ({
        select: async (columns?: string) => {
          try {
            const response = await fetch(`/api/db/${table}?columns=${columns || '*'}&limit=${count}`)
            const data = await response.json()
            return { data: data.data || data, error: data.error || null }
          } catch (error: any) {
            return { data: null, error: { message: error.message } }
          }
        }
      })
    })
  }
}