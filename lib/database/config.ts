// Configuração da conexão PostgreSQL
// Você pode editar a URL abaixo com suas credenciais

export const DATABASE_CONFIG = {
  // Cole sua URL de conexão PostgreSQL aqui:
  connectionString: process.env.DATABASE_URL || 
    'postgresql://postgres.wlqvqrgjqowervexcosv:ds4ad456sad546as654d@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
  
  // Configurações do pool de conexões
  poolConfig: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
};

// Função para validar a connection string
export function validateConnectionString(url: string): boolean {
  try {
    // Verifica se é uma URL PostgreSQL válida
    return url.startsWith('postgresql://') || url.startsWith('postgres://');
  } catch {
    return false;
  }
}