// Fallback client para desenvolvimento sem banco configurado
import { toast } from "sonner"

const mockData = {
  categories: [
    { id: '1', name: 'Sashimis', description: 'Peixes crus fatiados', active: true, sort_order: 1 },
    { id: '2', name: 'Niguiris', description: 'Bolinhos de arroz com peixe', active: true, sort_order: 2 },
    { id: '3', name: 'Hot Rolls', description: 'Rolos empanados e fritos', active: true, sort_order: 3 },
    { id: '4', name: 'Temakis', description: 'Cones de alga com recheio', active: true, sort_order: 4 },
    { id: '5', name: 'Yakissobas', description: 'Macarrão japonês salteado', active: true, sort_order: 5 },
  ],
  restaurant_tables: [
    { id: '1', name: 'Mesa 1', number: 1, capacity: 4, type: 'table', active: true },
    { id: '2', name: 'Mesa 2', number: 2, capacity: 4, type: 'table', active: true },
    { id: '3', name: 'Mesa 3', number: 3, capacity: 6, type: 'table', active: true },
    { id: '4', name: 'Mesa VIP', number: 10, capacity: 10, type: 'table', active: true },
    { id: '5', name: 'Balcão 1', number: 11, capacity: 1, type: 'counter', active: true },
  ],
  table_sessions: [
    { id: '1', table_id: '1', status: 'active', created_at: new Date().toISOString() },
    { id: '2', table_id: '3', status: 'active', created_at: new Date().toISOString() },
  ],
  items: [
    { id: '1', name: 'Salmão', description: 'Sashimi de salmão fresco', price: 25, available: true },
    { id: '2', name: 'Atum', description: 'Sashimi de atum', price: 30, available: true },
    { id: '3', name: 'Hot Philadelphia', description: 'Hot roll com cream cheese', price: 35, available: true },
  ],
  orders: []
}

export function createFallbackClient() {
  console.log('🟨 Usando dados locais de desenvolvimento')
  
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          data: null,
          error: null
        }),
        gte: (column: string, value: any) => ({
          data: null, 
          error: null
        }),
        order: (column: string, options?: any) => ({
          limit: (count: number) => ({
            data: mockData[table as keyof typeof mockData] || [],
            error: null
          }),
          data: mockData[table as keyof typeof mockData] || [],
          error: null
        }),
        limit: (count: number) => ({
          data: mockData[table as keyof typeof mockData]?.slice(0, count) || [],
          error: null
        }),
        in: (column: string, values: any[]) => ({
          data: mockData[table as keyof typeof mockData] || [],
          error: null
        }),
        data: mockData[table as keyof typeof mockData] || [],
        error: null
      }),
      
      insert: (data: any) => ({
        select: () => ({
          data: [{ ...data, id: Date.now().toString() }],
          error: null
        }),
        data: { ...data, id: Date.now().toString() },
        error: null
      }),
      
      update: (data: any) => ({
        eq: (column: string, value: any) => {
          const items = mockData[table as keyof typeof mockData] as any[]
          const index = items?.findIndex((item: any) => item[column] === value)
          if (index !== -1 && items) {
            items[index] = { ...items[index], ...data }
          }
          return { data: items?.[index], error: null }
        }
      }),
      
      delete: () => ({
        eq: (column: string, value: any) => {
          const items = mockData[table as keyof typeof mockData] as any[]
          const index = items?.findIndex((item: any) => item[column] === value)
          if (index !== -1 && items) {
            items.splice(index, 1)
          }
          return { data: null, error: null }
        }
      })
    })
  }
}