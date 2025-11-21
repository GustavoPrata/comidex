#!/bin/bash

echo "🚀 Starting Tablet App with Ngrok Tunnel..."
echo ""
echo "This will create a public URL accessible from anywhere!"
echo ""

# Start Expo with tunnel mode
npx expo start --tunnel --web

echo ""
echo "✅ Ngrok tunnel is ready!"
echo ""
echo "📱 For Mobile (Expo Go):"
echo "   - Scan the QR code above with Expo Go app"
echo ""
echo "💻 For Web Browser:"
echo "   - Use the localhost URL shown above"
echo ""
echo "🌐 The tunnel URL is public and can be accessed from anywhere!"