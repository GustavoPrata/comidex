#!/bin/bash

echo "🔧 Fixing Gradle Build Issues for ComideX Tablet"
echo "================================================"
echo ""

# Clean cache and temp files
echo "📋 Step 1: Cleaning caches..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf android
rm -rf ios

# Reinstall dependencies
echo "📦 Step 2: Reinstalling dependencies..."
npm install

# Clear Expo cache
echo "🧹 Step 3: Clearing Expo cache..."
npx expo doctor --fix
npx expo prebuild --clear

echo ""
echo "✅ Fixed! Now you can build the APK with:"
echo ""
echo "   eas build --profile development --platform android"
echo ""
echo "💡 If you still get errors, try:"
echo "   1. Clear EAS Build cache: eas build --clear-cache --profile development --platform android"
echo "   2. Use local build: eas build --profile development --platform android --local"
echo ""