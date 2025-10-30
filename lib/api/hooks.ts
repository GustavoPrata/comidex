import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    // Se houver erro, retornar array vazio para não quebrar a UI
    console.warn(`API ${url} retornou erro:`, res.status)
    return []
  }
  return res.json()
})

export function useItems(category?: string, group?: string) {
  const params = new URLSearchParams()
  if (category) params.append('category', category)
  if (group) params.append('group', group)
  
  const { data, error, mutate } = useSWR(
    `/api/items${params.toString() ? `?${params.toString()}` : ''}`,
    fetcher
  )
  
  return {
    items: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

export function useOrders(sessionId?: string, status?: string) {
  const params = new URLSearchParams()
  if (sessionId) params.append('session_id', sessionId)
  if (status) params.append('status', status)
  
  const { data, error, mutate } = useSWR(
    `/api/orders${params.toString() ? `?${params.toString()}` : ''}`,
    fetcher,
    { refreshInterval: 5000 } // Auto-refresh every 5 seconds
  )
  
  return {
    orders: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

export function useTables() {
  const { data, error, mutate } = useSWR(
    '/api/tables',
    fetcher,
    { refreshInterval: 10000 } // Auto-refresh every 10 seconds
  )
  
  return {
    tables: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}

export async function createOrder(orderData: any) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  })
  
  if (!response.ok) {
    throw new Error('Failed to create order')
  }
  
  return response.json()
}

export async function updateOrderStatus(orderId: string, status: string) {
  const response = await fetch(`/api/orders?id=${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  
  if (!response.ok) {
    throw new Error('Failed to update order status')
  }
  
  return response.json()
}

export async function openTableSession(sessionData: any) {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData)
  })
  
  if (!response.ok) {
    throw new Error('Failed to open table session')
  }
  
  return response.json()
}

export async function closeTableSession(sessionId: string, closingData: any) {
  const response = await fetch(`/api/sessions?id=${sessionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...closingData,
      status: 'closed',
      closed_at: new Date().toISOString()
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to close table session')
  }
  
  return response.json()
}