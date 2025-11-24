#!/bin/bash

echo "========================================="
echo "🔧 CORREÇÃO DO ERRO GRADLE - ComideX Tablet"
echo "========================================="
echo ""

# Passo 1: Limpar completamente
echo "🧹 Limpando projeto..."
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared
rm -rf android
rm -rf ios
rm -f package-lock.json
rm -f yarn.lock

# Passo 2: Reinstalar
echo "📦 Reinstalando dependências..."
npm install --legacy-peer-deps

# Passo 3: Limpar cache do Expo
echo "🔧 Limpando cache do Expo..."
npx expo doctor --fix-dependencies || true

# Passo 4: Preparar para build
echo "⚙️ Preparando projeto..."
npx expo prebuild --clear

echo ""
echo "========================================="
echo "✅ PROJETO CORRIGIDO!"
echo "========================================="
echo ""
echo "Agora execute o build com:"
echo ""
echo "  eas build --profile preview --platform android --clear-cache"
echo ""
echo "OU se preferir Expo Go (sem APK):"
echo ""
echo "  npx expo start"
echo ""