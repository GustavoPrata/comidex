// Usando conexão PostgreSQL direta no servidor
import { createServerClient } from '../database/server-client'

export async function createClient() {
  console.log('🔌 [Server] Usando conexão PostgreSQL direta')
  return createServerClient()
}