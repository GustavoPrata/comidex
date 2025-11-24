#!/bin/bash

# Script para iniciar o TABLET app com Expo

echo "🚀 Iniciando TABLET com túnel ngrok..."
echo "📱 Use este app com o Expo Go no seu celular/tablet"

# Verificar se node_modules existe, se não, instalar
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

# Inicia o Expo com túnel sem CI mode
exec npx expo start --tunnel --port 8081