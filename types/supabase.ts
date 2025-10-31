// Database types for Supabase tables

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: number
          name: string
          price: number | null
          type: 'rodizio' | 'a_la_carte' | 'bebidas'
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
      }
      categories: {
        Row: {
          id: number
          name: string
          description: string | null
          active: boolean
          sort_order: number
          group_id: number | null
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      additional_categories: {
        Row: {
          id: string
          name: string
          sort_order: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['additional_categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['additional_categories']['Insert']>
      }
      additionals: {
        Row: {
          id: string
          name: string
          price: number
          active: boolean
          additional_category_id: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['additionals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['additionals']['Insert']>
      }
      printers: {
        Row: {
          id: number
          name: string
          ip_address: string | null
          port: string
          type: 'thermal' | 'laser' | 'inkjet' | 'other'
          is_main: boolean
          active: boolean
          description: string | null
          sort_order: number
          settings: any | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['printers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['printers']['Insert']>
      }
      items: {
        Row: {
          id: number
          name: string
          description: string | null
          quantity: string | null
          price: number | null
          image: string | null
          category_id: number
          group_id: number
          active: boolean
          available: boolean
          sort_order: number
          printer_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['items']['Insert']>
      }
      print_queue: {
        Row: {
          id: number
          type: string
          source: string
          order_id: number | null
          item_id: number | null
          printer_id: number
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          content: string
          metadata: any | null
          attempts: number
          max_attempts: number
          error_message: string | null
          scheduled_at: string | null
          started_at: string | null
          completed_at: string | null
          failed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['print_queue']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['print_queue']['Insert']>
      }
      restaurant_tables: {
        Row: {
          id: number
          name: string
          number: number
          type: 'table' | 'counter'
          capacity: number
          attendant: string | null
          active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['restaurant_tables']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['restaurant_tables']['Insert']>
      }
      tablet_sessoes: {
        Row: {
          id: number
          mesa_id: number
          tablet_id: number | null
          status: 'ativa' | 'finalizada' | 'cancelada'
          tipo_atendimento_id: number | null
          pessoas_total: number
          pessoas_adultos: number
          pessoas_criancas: number
          inicio_atendimento: string
          fim_atendimento: string | null
          tempo_decorrido: number | null
          valor_total: number
          valor_pago: number
          valor_desconto: number
          taxa_servico: number
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tablet_sessoes']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tablet_sessoes']['Insert']>
      }
      tablet_pedidos: {
        Row: {
          id: number
          sessao_id: number
          numero: string
          status: 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'cancelado'
          observacoes: string | null
          valor_total: number
          tempo_preparo: number | null
          prioridade: 'baixa' | 'normal' | 'alta' | 'urgente'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tablet_pedidos']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tablet_pedidos']['Insert']>
      }
      tablet_pedido_itens: {
        Row: {
          id: number
          pedido_id: number
          item_id: number
          quantidade: number
          preco_unitario: number | null
          preco_total: number | null
          observacoes: string | null
          status: 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'cancelado'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tablet_pedido_itens']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tablet_pedido_itens']['Insert']>
      }
      item_additionals: {
        Row: {
          id: number
          item_id: number
          additional_id: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['item_additionals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['item_additionals']['Insert']>
      }
      print_config: {
        Row: {
          id: number
          name: string
          config_type: string
          printer_id: number
          template: string | null
          settings: any | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['print_config']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['print_config']['Insert']>
      }
    }
  }
}

// Type aliases for easier use
export type Group = Database['public']['Tables']['groups']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type AdditionalCategory = Database['public']['Tables']['additional_categories']['Row']
export type Additional = Database['public']['Tables']['additionals']['Row']
export type Printer = Database['public']['Tables']['printers']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type PrintQueue = Database['public']['Tables']['print_queue']['Row']
export type RestaurantTable = Database['public']['Tables']['restaurant_tables']['Row']
export type Session = Database['public']['Tables']['tablet_sessoes']['Row']
export type Order = Database['public']['Tables']['tablet_pedidos']['Row']
export type OrderItem = Database['public']['Tables']['tablet_pedido_itens']['Row']
export type ItemAdditional = Database['public']['Tables']['item_additionals']['Row']
export type PrintConfig = Database['public']['Tables']['print_config']['Row']

// Input types for creating/updating
export type GroupInput = Database['public']['Tables']['groups']['Insert']
export type CategoryInput = Database['public']['Tables']['categories']['Insert']
export type AdditionalCategoryInput = Database['public']['Tables']['additional_categories']['Insert']
export type AdditionalInput = Database['public']['Tables']['additionals']['Insert']
export type PrinterInput = Database['public']['Tables']['printers']['Insert']
export type ItemInput = Database['public']['Tables']['items']['Insert']
export type PrintQueueInput = Database['public']['Tables']['print_queue']['Insert']
export type RestaurantTableInput = Database['public']['Tables']['restaurant_tables']['Insert']
export type SessionInput = Database['public']['Tables']['tablet_sessoes']['Insert']
export type OrderInput = Database['public']['Tables']['tablet_pedidos']['Insert']
export type OrderItemInput = Database['public']['Tables']['tablet_pedido_itens']['Insert']
export type ItemAdditionalInput = Database['public']['Tables']['item_additionals']['Insert']
export type PrintConfigInput = Database['public']['Tables']['print_config']['Insert']