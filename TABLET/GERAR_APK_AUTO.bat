@echo off
echo ==================================================
echo GERADOR DE APK AUTOMATICO - ComideX Tablet
echo ==================================================
echo.
echo AVISO: Use este metodo APENAS em ambiente de desenvolvimento local
echo NUNCA compartilhe este arquivo ou suba para o Git!
echo.

REM Limpar projeto
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
echo ==================================================
echo CONFIGURANDO TOKEN EXPO
echo ==================================================
echo.
echo Para login automatico, siga estes passos:
echo.
echo 1. Faca login uma vez manualmente:
echo    npx eas login
echo.
echo 2. Depois disso, o EAS salvara seu token e nao pedira mais login
echo.
echo 3. Para verificar se esta logado:
echo    npx eas whoami
echo.

REM Verificar se ja esta logado
call npx eas whoami >nul 2>&1
if %errorlevel%==0 (
    echo [OK] Voce ja esta logado no EAS!
) else (
    echo [ATENCAO] Voce precisa fazer login primeiro:
    echo.
    call npx eas login
)

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