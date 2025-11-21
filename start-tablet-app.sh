#!/bin/bash
echo "🚀 Iniciando TABLET App..."
cd TABLET

# Verifica se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

echo "✨ Iniciando Expo..."
npm start
