// Cliente PostgreSQL para server-side (API routes)
import { Pool } from 'pg';
import { cookies } from 'next/headers';
import { DATABASE_CONFIG } from './config';

// Pool compartilhado para todas as requisições server-side
const pool = new Pool({
  connectionString: DATABASE_CONFIG.connectionString,
  ...DATABASE_CONFIG.poolConfig
});

// Criar client server-side
export function createServerClient() {
  return {
    from: (table: string) => ({
      select: async (columns?: string) => {
        try {
          const selectClause = columns || '*';
          const queryText = `SELECT ${selectClause} FROM ${table} ORDER BY id`;
          const result = await pool.query(queryText);
          return { data: result.rows, error: null };
        } catch (error: any) {
          console.error(`Error selecting from ${table}:`, error);
          return { data: null, error: { message: error.message } };
        }
      },
      
      insert: async (data: any) => {
        try {
          const items = Array.isArray(data) ? data : [data];
          const results = [];
          
          for (const item of items) {
            const keys = Object.keys(item);
            const values = Object.values(item);
            const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
            
            const queryText = `
              INSERT INTO ${table} (${keys.join(', ')}) 
              VALUES (${placeholders}) 
              RETURNING *
            `;
            
            const result = await pool.query(queryText, values);
            results.push(result.rows[0]);
          }
          
          return { 
            data: Array.isArray(data) ? results : results[0], 
            error: null 
          };
        } catch (error: any) {
          console.error(`Error inserting into ${table}:`, error);
          return { data: null, error: { message: error.message } };
        }
      },
      
      update: async (data: any) => ({
        eq: async (column: string, value: any) => {
          try {
            const keys = Object.keys(data);
            const values = Object.values(data);
            const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
            
            const queryText = `
              UPDATE ${table} 
              SET ${setClause}, updated_at = NOW()
              WHERE ${column} = $1 
              RETURNING *
            `;
            
            const result = await pool.query(queryText, [value, ...values]);
            return { data: result.rows, error: null };
          } catch (error: any) {
            console.error(`Error updating ${table}:`, error);
            return { data: null, error: { message: error.message } };
          }
        }
      }),
      
      delete: async () => ({
        eq: async (column: string, value: any) => {
          try {
            const queryText = `DELETE FROM ${table} WHERE ${column} = $1 RETURNING *`;
            const result = await pool.query(queryText, [value]);
            return { data: result.rows, error: null };
          } catch (error: any) {
            console.error(`Error deleting from ${table}:`, error);
            return { data: null, error: { message: error.message } };
          }
        }
      }),
      
      eq: (column: string, value: any) => ({
        select: async (columns?: string) => {
          try {
            const selectClause = columns || '*';
            const queryText = `SELECT ${selectClause} FROM ${table} WHERE ${column} = $1 ORDER BY id`;
            const result = await pool.query(queryText, [value]);
            return { data: result.rows, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        },
        single: async () => {
          try {
            const queryText = `SELECT * FROM ${table} WHERE ${column} = $1 LIMIT 1`;
            const result = await pool.query(queryText, [value]);
            return { data: result.rows[0] || null, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        }
      }),
      
      order: (column: string, options?: { ascending?: boolean }) => ({
        select: async (columns?: string) => {
          try {
            const selectClause = columns || '*';
            const order = options?.ascending === false ? 'DESC' : 'ASC';
            const queryText = `SELECT ${selectClause} FROM ${table} ORDER BY ${column} ${order}`;
            const result = await pool.query(queryText);
            return { data: result.rows, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        },
        limit: (count: number) => ({
          select: async (columns?: string) => {
            try {
              const selectClause = columns || '*';
              const order = options?.ascending === false ? 'DESC' : 'ASC';
              const queryText = `SELECT ${selectClause} FROM ${table} ORDER BY ${column} ${order} LIMIT $1`;
              const result = await pool.query(queryText, [count]);
              return { data: result.rows, error: null };
            } catch (error: any) {
              return { data: null, error: { message: error.message } };
            }
          }
        })
      }),
      
      in: (column: string, values: any[]) => ({
        select: async (columns?: string) => {
          try {
            const selectClause = columns || '*';
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            const queryText = `SELECT ${selectClause} FROM ${table} WHERE ${column} IN (${placeholders}) ORDER BY id`;
            const result = await pool.query(queryText, values);
            return { data: result.rows, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        }
      }),
      
      single: async () => {
        try {
          const queryText = `SELECT * FROM ${table} LIMIT 1`;
          const result = await pool.query(queryText);
          return { data: result.rows[0] || null, error: null };
        } catch (error: any) {
          return { data: null, error: { message: error.message } };
        }
      },
      
      limit: (count: number) => ({
        select: async (columns?: string) => {
          try {
            const selectClause = columns || '*';
            const queryText = `SELECT ${selectClause} FROM ${table} ORDER BY id LIMIT $1`;
            const result = await pool.query(queryText, [count]);
            return { data: result.rows, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        }
      })
    }),
    
    // Método para queries SQL diretas quando necessário
    sql: async (queryText: string, params?: any[]) => {
      try {
        const result = await pool.query(queryText, params);
        return { data: result.rows, error: null };
      } catch (error: any) {
        console.error('SQL error:', error);
        return { data: null, error: { message: error.message } };
      }
    }
  };
}

// Exportar para compatibilidade
export { createServerClient as createClient };