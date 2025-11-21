#!/bin/bash
echo "🚀 Iniciando TABLET App..."
cd TABLET

# Verifica se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

echo "✨ Iniciando Expo na porta 19000..."
echo "📱 Metro Bundler: http://0.0.0.0:19000"
echo "🌐 Web Version: http://0.0.0.0:19006"
npm start
