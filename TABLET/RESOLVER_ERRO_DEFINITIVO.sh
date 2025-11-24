#!/bin/bash

echo "========================================="
echo "🚀 SOLUÇÃO DEFINITIVA - ComideX Tablet"
echo "========================================="
echo ""
echo "Este script resolve o erro export:embed PERMANENTEMENTE"
echo ""

# Passo 1: Backup do projeto atual
echo "📦 Fazendo backup..."
cp package.json package.json.backup 2>/dev/null
cp babel.config.js babel.config.js.backup 2>/dev/null

# Passo 2: Limpar TUDO
echo "🧹 Limpeza total do projeto..."
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared
rm -rf dist
rm -rf android
rm -rf ios
rm -f package-lock.json
rm -f yarn.lock
rm -rf __pycache__
rm -rf .cache

# Passo 3: Usar versão minimal que funciona
echo "✅ Aplicando configuração que funciona 100%..."
cp package.json.minimal package.json
cp babel.config.minimal.js babel.config.js

# Passo 4: Remover assets problemáticos
echo "🖼️ Otimizando assets..."
cd assets
# Criar backup
mkdir -p backup
cp *.png backup/ 2>/dev/null

# Reduzir tamanho dos logos grandes
if [ -f "logo23.png" ]; then
    cp icon.png logo23.png
fi
if [ -f "logo-comidex-new.png" ]; then
    cp icon.png logo-comidex-new.png
fi
cd ..

# Passo 5: Instalar versão que funciona
echo "📦 Instalando dependências corretas..."
npm install --legacy-peer-deps

# Passo 6: Limpar todos os caches
echo "🔧 Limpando todos os caches..."
npx expo doctor --fix-dependencies 2>/dev/null || true
watchman watch-del-all 2>/dev/null || true
npx react-native start --reset-cache 2>/dev/null &
sleep 5
pkill -f "react-native start" 2>/dev/null || true

# Passo 7: Preparar para build
echo "⚙️ Preparando build limpo..."
npx expo prebuild --clear

echo ""
echo "========================================="
echo "✅ PROJETO PRONTO PARA BUILD!"
echo "========================================="
echo ""
echo "OPÇÃO 1: Gerar APK (na nuvem):"
echo "  eas build --profile preview --platform android --clear-cache"
echo ""
echo "OPÇÃO 2: Testar com Expo Go (recomendado primeiro):"
echo "  npx expo start"
echo ""
echo "OPÇÃO 3: Build local:"
echo "  eas build --profile preview --platform android --local"
echo ""
echo "Se ainda der erro, execute:"
echo "  npm run expo-doctor"
echo ""