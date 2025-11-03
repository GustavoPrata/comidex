#!/bin/bash

# Script para executar o Comidex localmente
echo "🚀 Iniciando Comidex Restaurant System..."

# Verifica se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js 18+"
    exit 1
fi

# Verifica se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verifica se existe o arquivo .env.local
if [ ! -f ".env.local" ]; then
    echo "⚠️  Arquivo .env.local não encontrado!"
    echo "📝 Criando arquivo .env.local de exemplo..."
    cat > .env.local << 'EOF'
# Configure suas credenciais do Supabase aqui
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-aqui

# Ou use PostgreSQL local
DATABASE_URL=postgresql://usuario:senha@localhost:5432/comidex

# Porta do servidor (padrão 5017)
PORT=5017
EOF
    echo "✅ Arquivo .env.local criado. Por favor, configure suas credenciais antes de continuar."
    exit 1
fi

# Define a porta
export PORT=5017

# Aumenta limite de memória do Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Inicia o servidor
echo "🌐 Servidor rodando em http://localhost:5017"
echo "📊 Painel Admin: http://localhost:5017/admin"
echo "🍽️  Sistema POS: http://localhost:5017/pos"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

# Executa o servidor
npm run dev