import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { connectionString } = await request.json();
    
    if (!connectionString) {
      return NextResponse.json(
        { success: false, error: 'URL de conexão é obrigatória' },
        { status: 400 }
      );
    }

    // Salvar em arquivo .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    
    try {
      // Ler arquivo atual
      let envContent = '';
      try {
        envContent = await fs.readFile(envPath, 'utf-8');
      } catch {
        // Arquivo não existe, criar novo
      }
      
      // Atualizar ou adicionar DATABASE_URL
      const lines = envContent.split('\n');
      let updated = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('DATABASE_URL=')) {
          lines[i] = `DATABASE_URL=${connectionString}`;
          updated = true;
          break;
        }
      }
      
      if (!updated) {
        // Adicionar no final se não existir
        lines.push(`DATABASE_URL=${connectionString}`);
      }
      
      // Salvar arquivo atualizado
      await fs.writeFile(envPath, lines.join('\n'));
      
      return NextResponse.json({
        success: true,
        message: 'Configuração salva com sucesso! Reinicie o servidor para aplicar as mudanças.'
      });
      
    } catch (error: any) {
      console.error('Erro ao salvar arquivo:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao salvar configuração: ' + error.message
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Erro geral:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}