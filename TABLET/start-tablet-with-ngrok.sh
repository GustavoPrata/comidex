#!/bin/bash

# Start Expo with tunnel mode (ngrok)
echo "🚀 Iniciando TABLET com túnel ngrok..."
echo "📱 Use este app com o Expo Go no seu celular/tablet"
echo ""

# Start Expo with tunnel
cd /home/runner/workspace/TABLET
npx expo start --tunnel --port 8081 --non-interactive