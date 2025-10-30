export interface Database {
  public: {
    Tables: {
      groups: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number | null
          type: 'rodizio' | 'a_la_carte' | 'bebidas' | null
          active: boolean
          sort_order: number
          icon_id: string | null
          icon_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          active: boolean
          sort_order: number
          group_id: string | null
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      items: {
        Row: {
          id: string
          name: string
          description: string | null
          quantity: string | null
          price: number | null
          image: string | null
          category_id: string | null
          group_id: string | null
          printer_id: string | null
          active: boolean
          available: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['items']['Insert']>
      }
      restaurant_tables: {
        Row: {
          id: string
          name: string
          number: number
          type: 'table' | 'counter'
          capacity: number
          active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['restaurant_tables']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['restaurant_tables']['Insert']>
      }
      table_sessions: {
        Row: {
          id: string
          table_id: string
          attendance_type: string
          number_of_people: number
          customer_name: string | null
          unit_price: number
          total_price: number
          opened_at: string
          closed_at: string | null
          status: 'active' | 'closed'
          time_limit: number | null
          payment_method: string | null
          final_total: number | null
          notes: string | null
          closing_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['table_sessions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['table_sessions']['Insert']>
      }
      orders: {
        Row: {
          id: string
          session_id: string
          total: number
          status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          notes: string | null
          estimated_time: number | null
          estimated_delivery: string | null
          added_by: 'customer' | 'waiter'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          item_id: string | null
          quantity: number
          unit_price: number
          additionals_price: number
          total_price: number
          notes: string | null
          status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          active_tables: number
          pending_orders: number
          today_revenue: number
          today_sessions: number
        }
      }
    }
  }
}