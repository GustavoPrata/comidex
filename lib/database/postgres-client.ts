import { Pool } from 'pg';
import { DATABASE_CONFIG } from './config';

// Criar pool de conexões para melhor performance
export const pool = new Pool({
  connectionString: DATABASE_CONFIG.connectionString,
  ...DATABASE_CONFIG.poolConfig
});

// Função helper para executar queries
export async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Função para testar conexão
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('✅ Conexão PostgreSQL funcionando:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão PostgreSQL:', error);
    return false;
  }
}

// Função para buscar grupos
export async function getGroups() {
  const result = await query('SELECT * FROM groups ORDER BY sort_order, id');
  return result.rows;
}

// Função para buscar categorias
export async function getCategories(groupId?: number) {
  const queryText = groupId 
    ? 'SELECT * FROM categories WHERE group_id = $1 ORDER BY sort_order, id'
    : 'SELECT * FROM categories ORDER BY sort_order, id';
  const params = groupId ? [groupId] : undefined;
  const result = await query(queryText, params);
  return result.rows;
}

// Função para buscar produtos
export async function getItems(categoryId?: number) {
  const queryText = categoryId
    ? 'SELECT * FROM items WHERE category_id = $1 ORDER BY sort_order, id'
    : 'SELECT * FROM items ORDER BY sort_order, id';
  const params = categoryId ? [categoryId] : undefined;
  const result = await query(queryText, params);
  return result.rows;
}

// Função para buscar adicionais
export async function getAdditionals() {
  const result = await query('SELECT * FROM additionals ORDER BY sort_order, id');
  return result.rows;
}

// Função para buscar categorias de adicionais
export async function getAdditionalCategories() {
  const result = await query('SELECT * FROM additional_categories ORDER BY sort_order, id');
  return result.rows;
}

// Função genérica para inserir dados
export async function insert(table: string, data: any) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  
  const queryText = `
    INSERT INTO ${table} (${keys.join(', ')}) 
    VALUES (${placeholders}) 
    RETURNING *
  `;
  
  const result = await query(queryText, values);
  return result.rows[0];
}

// Função genérica para atualizar dados
export async function update(table: string, id: number, data: any) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
  
  const queryText = `
    UPDATE ${table} 
    SET ${setClause}, updated_at = NOW()
    WHERE id = $1 
    RETURNING *
  `;
  
  const result = await query(queryText, [id, ...values]);
  return result.rows[0];
}

// Função genérica para deletar dados
export async function remove(table: string, id: number) {
  const queryText = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
  const result = await query(queryText, [id]);
  return result.rows[0];
}

// Função para buscar por ID
export async function findById(table: string, id: number) {
  const queryText = `SELECT * FROM ${table} WHERE id = $1`;
  const result = await query(queryText, [id]);
  return result.rows[0];
}