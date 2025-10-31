import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Conexão PostgreSQL direta
const pool = new Pool({
  connectionString: 'postgresql://postgres.wlqvqrgjqowervexcosv:ds4ad456sad546as654d@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// GET - Buscar dados
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  const searchParams = request.nextUrl.searchParams;
  const columns = searchParams.get('columns') || '*';
  const limit = searchParams.get('limit');
  const single = searchParams.get('single') === 'true';
  const order = searchParams.get('order');
  
  try {
    let query = `SELECT ${columns} FROM ${table}`;
    const values: any[] = [];
    let paramCount = 1;
    
    // Adicionar filtros WHERE
    const whereConditions: string[] = [];
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'columns' && key !== 'limit' && key !== 'single' && key !== 'order') {
        if (key.endsWith('_in')) {
          const column = key.replace('_in', '');
          const inValues = value.split(',');
          const placeholders = inValues.map(() => `$${paramCount++}`).join(',');
          whereConditions.push(`${column} IN (${placeholders})`);
          values.push(...inValues);
        } else {
          whereConditions.push(`${key} = $${paramCount++}`);
          values.push(value);
        }
      }
    }
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    // Adicionar ORDER BY
    if (order) {
      const [column, direction] = order.split('.');
      query += ` ORDER BY ${column} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
    } else {
      query += ` ORDER BY id`;
    }
    
    // Adicionar LIMIT
    if (single) {
      query += ` LIMIT 1`;
    } else if (limit) {
      query += ` LIMIT $${paramCount++}`;
      values.push(parseInt(limit));
    }
    
    const result = await pool.query(query, values);
    
    const data = single ? result.rows[0] || null : result.rows;
    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    console.error(`Error fetching from ${table}:`, error);
    return NextResponse.json(
      { data: null, error: { message: error.message } },
      { status: 500 }
    );
  }
}

// POST - Inserir dados
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  
  try {
    const body = await request.json();
    const items = Array.isArray(body) ? body : [body];
    const results = [];
    
    for (const item of items) {
      const keys = Object.keys(item);
      const values = Object.values(item);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `
        INSERT INTO ${table} (${keys.join(', ')}) 
        VALUES (${placeholders}) 
        RETURNING *
      `;
      
      const result = await pool.query(query, values);
      results.push(result.rows[0]);
    }
    
    const data = Array.isArray(body) ? results : results[0];
    return NextResponse.json({ data, error: null });
  } catch (error: any) {
    console.error(`Error inserting into ${table}:`, error);
    return NextResponse.json(
      { data: null, error: { message: error.message } },
      { status: 500 }
    );
  }
}

// PUT - Atualizar dados
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  
  try {
    const { data, where } = await request.json();
    
    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);
    const whereKey = Object.keys(where)[0];
    const whereValue = where[whereKey];
    
    const setClause = dataKeys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    
    const query = `
      UPDATE ${table} 
      SET ${setClause}, updated_at = NOW()
      WHERE ${whereKey} = $1 
      RETURNING *
    `;
    
    const result = await pool.query(query, [whereValue, ...dataValues]);
    return NextResponse.json({ data: result.rows, error: null });
  } catch (error: any) {
    console.error(`Error updating ${table}:`, error);
    return NextResponse.json(
      { data: null, error: { message: error.message } },
      { status: 500 }
    );
  }
}

// DELETE - Deletar dados
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;
  
  try {
    const { where } = await request.json();
    const whereKey = Object.keys(where)[0];
    const whereValue = where[whereKey];
    
    const query = `DELETE FROM ${table} WHERE ${whereKey} = $1 RETURNING *`;
    const result = await pool.query(query, [whereValue]);
    
    return NextResponse.json({ data: result.rows, error: null });
  } catch (error: any) {
    console.error(`Error deleting from ${table}:`, error);
    return NextResponse.json(
      { data: null, error: { message: error.message } },
      { status: 500 }
    );
  }
}