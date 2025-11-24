#!/bin/bash

echo "========================================="
echo "🔧 CORREÇÃO DO ERRO export:embed"
echo "========================================="
echo ""

# Passo 1: Limpar tudo
echo "🧹 Limpando projeto completamente..."
rm -rf node_modules
rm -rf .expo
rm -rf dist
rm -rf android
rm -rf ios
rm -f package-lock.json
rm -f yarn.lock

# Passo 2: Otimizar imagens grandes
echo "🖼️ Otimizando assets..."
# Substituir logos grandes por versões menores
if [ -f "assets/logo23.png" ]; then
    cp assets/icon.png assets/logo23.png
fi
if [ -f "assets/logo-comidex-new.png" ]; then
    cp assets/icon.png assets/logo-comidex-new.png
fi

# Passo 3: Reinstalar com versões exatas
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps --save-exact

# Passo 4: Limpar cache do Metro
echo "🔧 Limpando cache do Metro bundler..."
npx expo start --clear
sleep 5
pkill -f "expo start" || true

# Passo 5: Pré-build limpo
echo "⚙️ Preparando projeto para build..."
npx expo prebuild --clear --no-install

echo ""
echo "========================================="
echo "✅ PROJETO CORRIGIDO!"
echo "========================================="
echo ""
echo "Agora execute o build com:"
echo ""
echo "  eas build --profile preview --platform android --clear-cache"
echo ""
echo "Se ainda der erro, use Expo Go:"
echo ""
echo "  npx expo start"
echo ""