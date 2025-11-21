#!/bin/bash
echo "🚀 Iniciando TABLET App (Expo com Tunnel)..."
cd TABLET

# Verifica se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

echo ""
echo "✨ Iniciando Expo com Tunnel (acesso externo)..."
echo "📱 Escaneie o QR code com o app Expo Go no seu celular"
echo "🌐 Para web: Pressione 'w' no terminal ou acesse http://0.0.0.0:8000"
echo ""
npm start
