import { supabase } from '@/lib/supabase/client'
import type {
  Group, Icon, Category, AdditionalCategory, Additional, Printer, Item,
  PrintQueue, RestaurantTable, Session, Order, OrderItem, PrintConfig,
  GroupInput, IconInput, CategoryInput, AdditionalCategoryInput, AdditionalInput,
  PrinterInput, ItemInput, PrintQueueInput, RestaurantTableInput,
  SessionInput, OrderInput, OrderItemInput, PrintConfigInput
} from '@/types/supabase'

// Generic CRUD service
class DatabaseService<T, TInput> {
  constructor(private tableName: string) {}

  async getAll() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data as T[]
  }

  async getById(id: number) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as T
  }

  async create(input: TInput) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(input)
      .select()
      .single()
    
    if (error) throw error
    return data as T
  }

  async update(id: number, input: Partial<TInput>) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(input)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as T
  }

  async delete(id: number) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }

  async bulkDelete(ids: number[]) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .in('id', ids)
    
    if (error) throw error
    return true
  }
}

// Service instances for each entity
export const groupsService = new DatabaseService<Group, GroupInput>('groups')
export const iconsService = new DatabaseService<Icon, IconInput>('icons')
export const categoriesService = new DatabaseService<Category, CategoryInput>('categories')
export const additionalCategoriesService = new DatabaseService<AdditionalCategory, AdditionalCategoryInput>('additional_categories')
export const additionalsService = new DatabaseService<Additional, AdditionalInput>('additionals')
export const printersService = new DatabaseService<Printer, PrinterInput>('printers')
export const itemsService = new DatabaseService<Item, ItemInput>('items')
export const printQueueService = new DatabaseService<PrintQueue, PrintQueueInput>('print_queue')
export const tablesService = new DatabaseService<RestaurantTable, RestaurantTableInput>('restaurant_tables')
export const sessionsService = new DatabaseService<Session, SessionInput>('tablet_sessoes')
export const ordersService = new DatabaseService<Order, OrderInput>('tablet_pedidos')
export const orderItemsService = new DatabaseService<OrderItem, OrderItemInput>('tablet_pedido_itens')
export const printConfigService = new DatabaseService<PrintConfig, PrintConfigInput>('print_config')

// Extended services with specific methods

// Items service with category and group relations
export class ItemsServiceExtended extends DatabaseService<Item, ItemInput> {
  constructor() {
    super('items')
  }

  async getAllWithRelations() {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        category:categories(*),
        group:groups(*),
        printer:printers(*)
      `)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  }

  async getByCategory(categoryId: number) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('category_id', categoryId)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data as Item[]
  }

  async getByGroup(groupId: number) {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('group_id', groupId)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data as Item[]
  }

  async toggleAvailability(id: number, available: boolean) {
    const { data, error } = await supabase
      .from('items')
      .update({ available })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Item
  }
}

// Categories service with group relation
export class CategoriesServiceExtended extends DatabaseService<Category, CategoryInput> {
  constructor() {
    super('categories')
  }

  async getAllWithGroups() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        group:groups(*)
      `)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  }

  async getByGroup(groupId: number) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('group_id', groupId)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data as Category[]
  }
}

// Additionals service with category relation
export class AdditionalsServiceExtended extends DatabaseService<Additional, AdditionalInput> {
  constructor() {
    super('additionals')
  }

  async getAllWithCategories() {
    const { data, error } = await supabase
      .from('additionals')
      .select(`
        *,
        category:additional_categories(*)
      `)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  }

  async getByCategory(categoryId: number) {
    const { data, error } = await supabase
      .from('additionals')
      .select('*')
      .eq('additional_category_id', categoryId)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data as Additional[]
  }
}

// Print Queue service with extended methods
export class PrintQueueServiceExtended extends DatabaseService<PrintQueue, PrintQueueInput> {
  constructor() {
    super('print_queue')
  }

  async getPending() {
    const { data, error } = await supabase
      .from('print_queue')
      .select(`
        *,
        printer:printers(*),
        item:items(*)
      `)
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  }

  async getByPrinter(printerId: number) {
    const { data, error } = await supabase
      .from('print_queue')
      .select('*')
      .eq('printer_id', printerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as PrintQueue[]
  }

  async updateStatus(id: number, status: PrintQueue['status']) {
    const { data, error } = await supabase
      .from('print_queue')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as PrintQueue
  }

  async retry(id: number) {
    const { data, error } = await supabase
      .from('print_queue')
      .update({ 
        status: 'pending', 
        attempts: 0,
        error_message: null
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as PrintQueue
  }
}

// Orders service with extended methods
export class OrdersServiceExtended extends DatabaseService<Order, OrderInput> {
  constructor() {
    super('tablet_pedidos')
  }

  async getActiveOrders() {
    const { data, error } = await supabase
      .from('tablet_pedidos')
      .select(`
        *,
        session:tablet_sessoes(
          *,
          table:restaurant_tables(*)
        ),
        items:tablet_pedido_itens(
          *,
          item:items(*)
        )
      `)
      .in('status', ['pendente', 'preparando', 'pronto'])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getBySession(sessionId: number) {
    const { data, error } = await supabase
      .from('tablet_pedidos')
      .select(`
        *,
        items:tablet_pedido_itens(
          *,
          item:items(*)
        )
      `)
      .eq('sessao_id', sessionId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async updateStatus(id: number, status: Order['status']) {
    const { data, error } = await supabase
      .from('tablet_pedidos')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Order
  }
}

// Sessions service with extended methods
export class SessionsServiceExtended extends DatabaseService<Session, SessionInput> {
  constructor() {
    super('tablet_sessoes')
  }

  async getActiveSessions() {
    const { data, error } = await supabase
      .from('tablet_sessoes')
      .select(`
        *,
        table:restaurant_tables(*),
        orders:tablet_pedidos(
          *,
          items:tablet_pedido_itens(*)
        )
      `)
      .eq('status', 'ativa')
      .order('inicio_atendimento', { ascending: false })
    
    if (error) throw error
    return data
  }

  async getByTable(tableId: number) {
    const { data, error } = await supabase
      .from('tablet_sessoes')
      .select('*')
      .eq('mesa_id', tableId)
      .eq('status', 'ativa')
      .single()
    
    if (error) throw error
    return data as Session | null
  }

  async closeSession(id: number, valorPago: number) {
    const { data, error } = await supabase
      .from('tablet_sessoes')
      .update({ 
        status: 'finalizada',
        fim_atendimento: new Date().toISOString(),
        valor_pago: valorPago
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Session
  }
}

// Export extended services
export const itemsServiceExtended = new ItemsServiceExtended()
export const categoriesServiceExtended = new CategoriesServiceExtended()
export const additionalsServiceExtended = new AdditionalsServiceExtended()
export const printQueueServiceExtended = new PrintQueueServiceExtended()
export const ordersServiceExtended = new OrdersServiceExtended()
export const sessionsServiceExtended = new SessionsServiceExtended()