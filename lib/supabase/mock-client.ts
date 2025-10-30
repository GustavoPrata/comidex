import { mockDatabase } from '@/lib/mock-data'

// Mock Supabase client that uses local data
export function createClient() {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          data: null,
          error: null,
          single: () => ({
            data: null,
            error: null
          })
        }),
        order: (column: string, options?: any) => ({
          data: mockDatabase[table as keyof typeof mockDatabase]?.getAll?.() || [],
          error: null
        }),
        single: () => ({
          data: mockDatabase[table as keyof typeof mockDatabase]?.getAll?.()[0] || null,
          error: null
        }),
        data: mockDatabase[table as keyof typeof mockDatabase]?.getAll?.() || [],
        error: null
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => ({
            data: mockDatabase[table as keyof typeof mockDatabase]?.create?.(data) || null,
            error: null
          }),
          data: [mockDatabase[table as keyof typeof mockDatabase]?.create?.(data)] || [],
          error: null
        }),
        data: mockDatabase[table as keyof typeof mockDatabase]?.create?.(data) || null,
        error: null
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => ({
              data: mockDatabase[table as keyof typeof mockDatabase]?.update?.(value, data) || null,
              error: null
            })
          }),
          data: mockDatabase[table as keyof typeof mockDatabase]?.update?.(value, data) || null,
          error: null
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          data: mockDatabase[table as keyof typeof mockDatabase]?.delete?.(value) || null,
          error: null
        })
      })
    })
  }
}