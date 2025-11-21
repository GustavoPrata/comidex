#!/bin/bash
echo "🚀 Iniciando TABLET App (Expo)..."
cd TABLET

# Verifica se node_modules existe
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

echo ""
echo "✨ Iniciando Expo Metro Bundler..."
echo "📱 Para usar no celular:"
echo "   1. Instale o app 'Expo Go' no celular"
echo "   2. Pressione 's' e escolha 'Expo Go' para ver o QR code"
echo ""
echo "🌐 Para web: Pressione 'w' ou acesse http://0.0.0.0:8000"
echo ""
npm start
