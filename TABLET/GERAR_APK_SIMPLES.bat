@echo off
echo ===============================================
echo   GERADOR DE APK COMIDEX - WINDOWS
echo ===============================================
echo.

REM Verificar Node
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao instalado!
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js instalado
echo.

REM Instalar EAS CLI
echo Instalando ferramentas...
call npm install -g eas-cli@latest
echo.

REM Fazer login
echo ===============================================
echo   LOGIN NO EXPO (Conta Gratuita)
echo ===============================================
echo Se nao tem conta, crie em: https://expo.dev
echo.
call eas login

REM Limpar e instalar
echo.
echo Limpando projeto...
rmdir /s /q node_modules 2>nul
rmdir /s /q .expo 2>nul
del package-lock.json 2>nul

echo.
echo Instalando dependencias...
call npm install --legacy-peer-deps

REM Gerar APK
echo.
echo ===============================================
echo   GERANDO APK (15-30 minutos)
echo ===============================================
call eas build --profile preview --platform android --clear-cache

echo.
echo ===============================================
echo   CONCLUIDO!
echo ===============================================
echo.
echo 1. Va em https://expo.dev
echo 2. Baixe o APK quando pronto
echo 3. Instale no tablet
echo.
pause