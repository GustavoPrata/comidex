// Mock data para funcionamento sem Supabase
export const mockGroups = [
  {
    id: '1',
    name: 'Rodízio Premium',
    description: 'Cardápio completo com pratos especiais',
    price: 189.00,
    type: 'rodizio' as const,
    active: true,
    sort_order: 1,
    icon_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Rodízio Tradicional',
    description: 'Cardápio tradicional',
    price: 129.00,
    type: 'rodizio' as const,
    active: true,
    sort_order: 2,
    icon_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'À la Carte',
    description: 'Pedidos individuais',
    price: null,
    type: 'a_la_carte' as const,
    active: true,
    sort_order: 3,
    icon_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Bebidas',
    description: 'Bebidas e drinks',
    price: null,
    type: 'bebidas' as const,
    active: true,
    sort_order: 4,
    icon_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export const mockCategories = [
  { id: '1', name: 'Entradas', description: 'Pratos de entrada', active: true, sort_order: 1, group_id: '1', image: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Sashimis', description: 'Peixes crus fatiados', active: true, sort_order: 2, group_id: '1', image: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Niguiris', description: 'Bolinhos de arroz com peixe', active: true, sort_order: 3, group_id: '1', image: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'Uramakis', description: 'Rolos invertidos', active: true, sort_order: 4, group_id: '1', image: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', name: 'Hot Rolls', description: 'Rolos empanados e fritos', active: true, sort_order: 5, group_id: '1', image: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', name: 'Temakis', description: 'Cones de alga com recheio', active: true, sort_order: 6, group_id: '3', image: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', name: 'Bebidas', description: 'Refrigerantes e sucos', active: true, sort_order: 7, group_id: '4', image: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', name: 'Sobremesas', description: 'Doces e sobremesas', active: true, sort_order: 8, group_id: '3', image: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
]

export const mockItems = [
  // Entradas
  { id: '1', name: 'Gyoza', description: 'Pastel japonês com recheio de carne suína', quantity: '6 unidades', price: null, category_id: '1', group_id: '1', active: true, available: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Sunomono', description: 'Salada de pepino agridoce', quantity: 'Porção', price: null, category_id: '1', group_id: '1', active: true, available: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Harumaki', description: 'Rolinho primavera com legumes', quantity: '4 unidades', price: null, category_id: '1', group_id: '1', active: true, available: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // Sashimis
  { id: '4', name: 'Sashimi de Salmão', description: 'Fatias de salmão fresco', quantity: '10 fatias', price: null, category_id: '2', group_id: '1', active: true, available: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', name: 'Sashimi de Atum', description: 'Fatias de atum fresco', quantity: '10 fatias', price: null, category_id: '2', group_id: '1', active: true, available: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', name: 'Sashimi de Peixe Branco', description: 'Fatias de peixe branco', quantity: '10 fatias', price: null, category_id: '2', group_id: '1', active: true, available: false, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // Niguiris
  { id: '7', name: 'Niguiri de Salmão', description: 'Arroz com salmão', quantity: '2 unidades', price: null, category_id: '3', group_id: '1', active: true, available: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', name: 'Niguiri de Atum', description: 'Arroz com atum', quantity: '2 unidades', price: null, category_id: '3', group_id: '1', active: true, available: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '9', name: 'Niguiri de Camarão', description: 'Arroz com camarão', quantity: '2 unidades', price: null, category_id: '3', group_id: '1', active: true, available: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // Uramakis
  { id: '10', name: 'Uramaki Califórnia', description: 'Kani, pepino, manga e cream cheese', quantity: '8 peças', price: null, category_id: '4', group_id: '1', active: true, available: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11', name: 'Uramaki Philadelphia', description: 'Salmão e cream cheese', quantity: '8 peças', price: null, category_id: '4', group_id: '1', active: true, available: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '12', name: 'Uramaki Especial ComideX', description: 'Salmão flambado com molho especial', quantity: '10 peças', price: null, category_id: '4', group_id: '1', active: true, available: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // Hot Rolls
  { id: '13', name: 'Hot Philadelphia', description: 'Salmão, cream cheese, empanado e frito', quantity: '10 peças', price: null, category_id: '5', group_id: '1', active: true, available: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '14', name: 'Hot Banana', description: 'Banana, doce de leite, empanado', quantity: '8 peças', price: null, category_id: '5', group_id: '1', active: true, available: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '15', name: 'Hot Especial', description: 'Atum, cream cheese, empanado com doritos', quantity: '10 peças', price: null, category_id: '5', group_id: '1', active: true, available: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // Temakis (À la carte)
  { id: '16', name: 'Temaki de Salmão', description: 'Cone com salmão e cream cheese', quantity: '1 unidade', price: 28.90, category_id: '6', group_id: '3', active: true, available: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '17', name: 'Temaki de Atum', description: 'Cone com atum picante', quantity: '1 unidade', price: 32.90, category_id: '6', group_id: '3', active: true, available: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '18', name: 'Temaki Califórnia', description: 'Cone com kani e manga', quantity: '1 unidade', price: 26.90, category_id: '6', group_id: '3', active: true, available: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // Bebidas
  { id: '19', name: 'Coca-Cola', description: 'Lata 350ml', quantity: '350ml', price: 8.00, category_id: '7', group_id: '4', active: true, available: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '20', name: 'Água Mineral', description: 'Garrafa 500ml', quantity: '500ml', price: 5.00, category_id: '7', group_id: '4', active: true, available: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '21', name: 'Suco Natural', description: 'Laranja ou Limão', quantity: '300ml', price: 12.00, category_id: '7', group_id: '4', active: true, available: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '22', name: 'Sake', description: 'Dose tradicional', quantity: '50ml', price: 18.00, category_id: '7', group_id: '4', active: true, available: true, sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  
  // Sobremesas
  { id: '23', name: 'Petit Gateau', description: 'Bolinho de chocolate com sorvete', quantity: '1 unidade', price: 22.00, category_id: '8', group_id: '3', active: true, available: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '24', name: 'Tempurá de Sorvete', description: 'Sorvete empanado e frito', quantity: '1 unidade', price: 24.00, category_id: '8', group_id: '3', active: true, available: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '25', name: 'Dorayaki', description: 'Panqueca japonesa com doce de feijão', quantity: '1 unidade', price: 15.00, category_id: '8', group_id: '3', active: true, available: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
]

export const mockTables = [
  { id: '1', name: 'Mesa 1', number: 1, type: 'table' as const, capacity: 4, active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Mesa 2', number: 2, type: 'table' as const, capacity: 4, active: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Mesa 3', number: 3, type: 'table' as const, capacity: 6, active: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'Mesa 4', number: 4, type: 'table' as const, capacity: 2, active: true, sort_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '5', name: 'Mesa 5', number: 5, type: 'table' as const, capacity: 4, active: true, sort_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '6', name: 'Mesa 6', number: 6, type: 'table' as const, capacity: 8, active: true, sort_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '7', name: 'Mesa 7', number: 7, type: 'table' as const, capacity: 4, active: true, sort_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '8', name: 'Mesa 8', number: 8, type: 'table' as const, capacity: 6, active: true, sort_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '9', name: 'Mesa 9', number: 9, type: 'table' as const, capacity: 4, active: true, sort_order: 9, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '10', name: 'Mesa 10', number: 10, type: 'table' as const, capacity: 4, active: true, sort_order: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '11', name: 'Mesa VIP 1', number: 11, type: 'table' as const, capacity: 10, active: true, sort_order: 11, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '12', name: 'Mesa VIP 2', number: 12, type: 'table' as const, capacity: 10, active: true, sort_order: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '13', name: 'Balcão 1', number: 13, type: 'counter' as const, capacity: 1, active: true, sort_order: 13, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '14', name: 'Balcão 2', number: 14, type: 'counter' as const, capacity: 1, active: true, sort_order: 14, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '15', name: 'Balcão 3', number: 15, type: 'counter' as const, capacity: 1, active: true, sort_order: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export const mockPrinters = [
  { id: '1', name: 'Cozinha Principal', location: 'Cozinha', type: 'kitchen' as const, ip: '192.168.1.100', port: 9100, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '2', name: 'Bar', location: 'Bar', type: 'bar' as const, ip: '192.168.1.101', port: 9100, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '3', name: 'Caixa', location: 'Recepção', type: 'cashier' as const, ip: '192.168.1.102', port: 9100, active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: '4', name: 'Backup', location: 'Escritório', type: 'backup' as const, ip: '192.168.1.103', port: 9100, active: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

// Estado simulado de sessões e pedidos
export let mockSessions: any[] = []
export let mockOrders: any[] = []

// Helper functions para simular operações CRUD
export const mockDatabase = {
  items: {
    getAll: () => mockItems,
    getById: (id: string) => mockItems.find(item => item.id === id),
    create: (item: any) => {
      const newItem = { ...item, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      mockItems.push(newItem)
      return newItem
    },
    update: (id: string, updates: any) => {
      const index = mockItems.findIndex(item => item.id === id)
      if (index !== -1) {
        mockItems[index] = { ...mockItems[index], ...updates, updated_at: new Date().toISOString() }
        return mockItems[index]
      }
      return null
    },
    delete: (id: string) => {
      const index = mockItems.findIndex(item => item.id === id)
      if (index !== -1) {
        const deleted = mockItems[index]
        mockItems.splice(index, 1)
        return deleted
      }
      return null
    }
  },
  tables: {
    getAll: () => mockTables,
    getById: (id: string) => mockTables.find(table => table.id === id),
  },
  sessions: {
    getAll: () => mockSessions,
    getActive: () => mockSessions.filter(s => s.status === 'active'),
    create: (session: any) => {
      const newSession = { 
        ...session, 
        id: Date.now().toString(), 
        opened_at: new Date().toISOString(),
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }
      mockSessions.push(newSession)
      return newSession
    },
    update: (id: string, updates: any) => {
      const index = mockSessions.findIndex(s => s.id === id)
      if (index !== -1) {
        mockSessions[index] = { ...mockSessions[index], ...updates, updated_at: new Date().toISOString() }
        return mockSessions[index]
      }
      return null
    }
  },
  orders: {
    getAll: () => mockOrders,
    getBySession: (sessionId: string) => mockOrders.filter(o => o.session_id === sessionId),
    create: (order: any) => {
      const newOrder = { 
        ...order, 
        id: Date.now().toString(), 
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString() 
      }
      mockOrders.push(newOrder)
      return newOrder
    },
    update: (id: string, updates: any) => {
      const index = mockOrders.findIndex(o => o.id === id)
      if (index !== -1) {
        mockOrders[index] = { ...mockOrders[index], ...updates, updated_at: new Date().toISOString() }
        return mockOrders[index]
      }
      return null
    }
  },
  categories: {
    getAll: () => mockCategories,
    getById: (id: string) => mockCategories.find(cat => cat.id === id),
  },
  groups: {
    getAll: () => mockGroups,
    getById: (id: string) => mockGroups.find(group => group.id === id),
  },
  printers: {
    getAll: () => mockPrinters,
    getById: (id: string) => mockPrinters.find(printer => printer.id === id),
  }
}