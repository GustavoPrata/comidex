// Adaptador para usar PostgreSQL direto ao invés do Supabase client
import * as db from './postgres-client';

// Simular interface do Supabase para compatibilidade
export function createClient() {
  return {
    from: (table: string) => ({
      select: async (columns?: string) => {
        try {
          let queryText = '';
          let result;
          
          switch(table) {
            case 'groups':
              result = await db.getGroups();
              break;
            case 'categories':
              result = await db.getCategories();
              break;
            case 'items':
              result = await db.getItems();
              break;
            case 'additionals':
              result = await db.getAdditionals();
              break;
            case 'additional_categories':
              result = await db.getAdditionalCategories();
              break;
            default:
              queryText = columns 
                ? `SELECT ${columns} FROM ${table} ORDER BY id`
                : `SELECT * FROM ${table} ORDER BY id`;
              const queryResult = await db.query(queryText);
              result = queryResult.rows;
          }
          
          return { data: result, error: null };
        } catch (error: any) {
          console.error(`Error fetching from ${table}:`, error);
          return { data: null, error: { message: error.message } };
        }
      },
      
      insert: async (data: any) => {
        try {
          const result = Array.isArray(data) 
            ? await Promise.all(data.map(item => db.insert(table, item)))
            : await db.insert(table, data);
          return { data: result, error: null };
        } catch (error: any) {
          console.error(`Error inserting into ${table}:`, error);
          return { data: null, error: { message: error.message } };
        }
      },
      
      update: async (data: any) => ({
        eq: async (column: string, value: any) => {
          try {
            if (column === 'id') {
              const result = await db.update(table, value, data);
              return { data: result, error: null };
            } else {
              // Update baseado em outra coluna
              const queryText = `
                UPDATE ${table} 
                SET ${Object.keys(data).map((k, i) => `${k} = $${i + 2}`).join(', ')}, 
                    updated_at = NOW()
                WHERE ${column} = $1 
                RETURNING *
              `;
              const queryResult = await db.query(queryText, [value, ...Object.values(data)]);
              return { data: queryResult.rows, error: null };
            }
          } catch (error: any) {
            console.error(`Error updating ${table}:`, error);
            return { data: null, error: { message: error.message } };
          }
        }
      }),
      
      delete: async () => ({
        eq: async (column: string, value: any) => {
          try {
            if (column === 'id') {
              const result = await db.remove(table, value);
              return { data: result, error: null };
            } else {
              const queryText = `DELETE FROM ${table} WHERE ${column} = $1 RETURNING *`;
              const queryResult = await db.query(queryText, [value]);
              return { data: queryResult.rows, error: null };
            }
          } catch (error: any) {
            console.error(`Error deleting from ${table}:`, error);
            return { data: null, error: { message: error.message } };
          }
        }
      }),
      
      // Métodos de filtragem encadeados
      eq: (column: string, value: any) => ({
        select: async (columns?: string) => {
          try {
            const selectClause = columns || '*';
            const queryText = `SELECT ${selectClause} FROM ${table} WHERE ${column} = $1 ORDER BY id`;
            const result = await db.query(queryText, [value]);
            return { data: result.rows, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        },
        single: async () => {
          try {
            const queryText = `SELECT * FROM ${table} WHERE ${column} = $1 LIMIT 1`;
            const result = await db.query(queryText, [value]);
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
            const result = await db.query(queryText);
            return { data: result.rows, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        }
      }),
      
      in: (column: string, values: any[]) => ({
        select: async (columns?: string) => {
          try {
            const selectClause = columns || '*';
            const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
            const queryText = `SELECT ${selectClause} FROM ${table} WHERE ${column} IN (${placeholders}) ORDER BY id`;
            const result = await db.query(queryText, values);
            return { data: result.rows, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        }
      }),
      
      single: async () => {
        try {
          const queryText = `SELECT * FROM ${table} LIMIT 1`;
          const result = await db.query(queryText);
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
            const result = await db.query(queryText, [count]);
            return { data: result.rows, error: null };
          } catch (error: any) {
            return { data: null, error: { message: error.message } };
          }
        }
      })
    }),
    
    // Testar conexão
    testConnection: db.testConnection
  };
}

// Exportar funções diretas também
export * from './postgres-client';