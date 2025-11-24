#!/bin/bash

echo "========================================="
echo "🚀 GERADOR DE APK - ComideX Tablet"
echo "========================================="
echo ""
echo "Este script gera o APK sem o erro export:embed"
echo ""

# 1. Limpar tudo
echo "🧹 Limpando projeto..."
rm -rf node_modules .expo android ios package-lock.json dist

# 2. Usar versão que funciona
echo "✅ Aplicando configuração correta..."
cp package.json.minimal package.json
cp babel.config.minimal.js babel.config.js

# 3. Instalar
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps

# 4. Limpar cache do EAS
echo "🔧 Limpando caches..."
npx expo doctor --fix-dependencies 2>/dev/null || true

# 5. Gerar APK
echo ""
echo "🔨 GERANDO APK..."
echo ""
eas build --profile preview --platform android --clear-cache

echo ""
echo "========================================="
echo "✅ APK SENDO GERADO!"
echo "========================================="
echo ""
echo "Aguarde o link para download do APK..."
echo ""