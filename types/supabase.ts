// Database types for Supabase tables

export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: number
          name: string
          price: number | null
          half_price: number | null
          type: 'rodizio' | 'a_la_carte' | 'bebidas'
          active: boolean
          sort_order: number
          icon: string | null
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
          id: number
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
          id: number
          name: string
          price: number
          active: boolean
          additional_category_id: number | null
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
          printer_model: string | null
          profile_id: number | null
          is_main: boolean
          is_local: boolean
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
          number: string
          capacity: number
          type: 'table' | 'counter'
          status: 'available' | 'occupied' | 'reserved' | 'cleaning'
          active: boolean
          location: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['restaurant_tables']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['restaurant_tables']['Insert']>
      }
      orders: {
        Row: {
          id: number
          order_number: string
          table_id: number | null
          customer_name: string | null
          customer_phone: string | null
          status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled'
          payment_status: 'pending' | 'partial' | 'paid' | 'refunded'
          payment_method: 'cash' | 'card' | 'pix' | 'mixed' | null
          type: 'dine_in' | 'takeout' | 'delivery'
          subtotal: number
          discount: number
          delivery_fee: number
          total: number
          notes: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          item_id: number
          quantity: number
          unit_price: number
          total_price: number
          notes: string | null
          status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
      order_item_additionals: {
        Row: {
          id: number
          order_item_id: number
          additional_id: number
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_item_additionals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['order_item_additionals']['Insert']>
      }
      item_additional_categories: {
        Row: {
          id: number
          item_id: number
          additional_category_id: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['item_additional_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['item_additional_categories']['Insert']>
      }
      payments: {
        Row: {
          id: number
          order_id: number
          amount: number
          payment_method: 'cash' | 'card' | 'pix'
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          reference_number: string | null
          notes: string | null
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['payments']['Insert']>
      }
    }
  }
}

// Convenience types
export type Group = Database['public']['Tables']['groups']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type AdditionalCategory = Database['public']['Tables']['additional_categories']['Row']
export type Additional = Database['public']['Tables']['additionals']['Row']
export type Printer = Database['public']['Tables']['printers']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type RestaurantTable = Database['public']['Tables']['restaurant_tables']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type OrderItemAdditional = Database['public']['Tables']['order_item_additionals']['Row']
export type ItemAdditionalCategory = Database['public']['Tables']['item_additional_categories']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type PrintQueue = Database['public']['Tables']['print_queue']['Row']

// Insert types
export type GroupInsert = Database['public']['Tables']['groups']['Insert']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type AdditionalCategoryInsert = Database['public']['Tables']['additional_categories']['Insert']
export type AdditionalInsert = Database['public']['Tables']['additionals']['Insert']
export type PrinterInsert = Database['public']['Tables']['printers']['Insert']
export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type RestaurantTableInsert = Database['public']['Tables']['restaurant_tables']['Insert']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert']
export type OrderItemAdditionalInsert = Database['public']['Tables']['order_item_additionals']['Insert']
export type ItemAdditionalCategoryInsert = Database['public']['Tables']['item_additional_categories']['Insert']
export type PaymentInsert = Database['public']['Tables']['payments']['Insert']
export type PrintQueueInsert = Database['public']['Tables']['print_queue']['Insert']

// Update types
export type GroupUpdate = Database['public']['Tables']['groups']['Update']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']
export type AdditionalCategoryUpdate = Database['public']['Tables']['additional_categories']['Update']
export type AdditionalUpdate = Database['public']['Tables']['additionals']['Update']
export type PrinterUpdate = Database['public']['Tables']['printers']['Update']
export type ItemUpdate = Database['public']['Tables']['items']['Update']
export type RestaurantTableUpdate = Database['public']['Tables']['restaurant_tables']['Update']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']
export type OrderItemUpdate = Database['public']['Tables']['order_items']['Update']
export type OrderItemAdditionalUpdate = Database['public']['Tables']['order_item_additionals']['Update']
export type ItemAdditionalCategoryUpdate = Database['public']['Tables']['item_additional_categories']['Update']
export type PaymentUpdate = Database['public']['Tables']['payments']['Update']
export type PrintQueueUpdate = Database['public']['Tables']['print_queue']['Update']