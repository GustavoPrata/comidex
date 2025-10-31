import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: NextRequest) {
  try {
    const { connectionString } = await request.json();
    
    if (!connectionString) {
      return NextResponse.json(
        { success: false, error: 'URL de conexão é obrigatória' },
        { status: 400 }
      );
    }

    // Criar pool temporário para teste
    const testPool = new Pool({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 5000,
    });

    try {
      // Testar conexão
      const client = await testPool.connect();
      
      // Buscar informações do banco
      const result = await client.query(`
        SELECT 
          current_database() as database,
          current_user as user,
          inet_server_addr() as host,
          inet_server_port() as port,
          version() as version
      `);
      
      // Verificar se as tabelas principais existem
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name IN ('groups', 'categories', 'items', 'additionals')
        ORDER BY table_name
      `);
      
      // Verificar estrutura das tabelas (se são IDs inteiros)
      const structureResult = await client.query(`
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND column_name = 'id'
          AND table_name IN ('groups', 'categories', 'items', 'additionals')
        ORDER BY table_name
      `);
      
      client.release();
      
      const info = result.rows[0];
      const tables = tablesResult.rows.map(r => r.table_name);
      const structure = structureResult.rows;
      
      // Verificar se os IDs são inteiros
      const hasIntegerIds = structure.every(s => 
        s.data_type === 'integer' || s.data_type === 'serial'
      );
      
      return NextResponse.json({
        success: true,
        data: {
          ...info,
          tables,
          hasIntegerIds,
          structure,
          message: hasIntegerIds 
            ? '✅ Banco com IDs inteiros detectado!' 
            : '⚠️ Banco usa UUIDs, precisa migração'
        }
      });
      
    } catch (error: any) {
      console.error('Erro ao testar conexão:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: error.message || 'Falha ao conectar com o banco'
        },
        { status: 500 }
      );
    } finally {
      await testPool.end();
    }
    
  } catch (error: any) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}