#!/bin/bash

# Script para iniciar o TABLET app com Expo

echo "🚀 Iniciando TABLET com túnel ngrok..."
echo "📱 Use este app com o Expo Go no seu celular/tablet"

# Inicia o Expo com túnel sem CI mode
exec npx expo start --tunnel