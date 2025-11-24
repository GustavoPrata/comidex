@echo off
echo ==================================================
echo GERADOR DE APK - ComideX Tablet
echo ==================================================
echo.
echo Limpando projeto...
rmdir /s /q node_modules 2>nul
rmdir /s /q .expo 2>nul
rmdir /s /q android 2>nul
rmdir /s /q ios 2>nul
rmdir /s /q dist 2>nul
del package-lock.json 2>nul

echo.
echo Aplicando configuracao correta...
copy /Y package.json.minimal package.json
copy /Y babel.config.minimal.js babel.config.js

echo.
echo Instalando dependencias...
call npm install --legacy-peer-deps

echo.
echo Limpando caches...
call npx expo doctor --fix-dependencies

echo.
echo ==================================================
echo GERANDO APK...
echo ==================================================
echo.
call eas build --profile preview --platform android --clear-cache

echo.
echo ==================================================
echo APK SENDO GERADO!
echo ==================================================
echo.
echo Aguarde o link para download do APK...
pause