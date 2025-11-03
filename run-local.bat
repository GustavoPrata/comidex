@echo off
REM Script para executar o Comidex localmente no Windows

echo ===================================================
echo    Comidex Restaurant System - Instalacao Local
echo ===================================================
echo.

REM Verifica se Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao esta instalado!
    echo Por favor, instale o Node.js 18+ de: https://nodejs.org/
    pause
    exit /b 1
)

REM Mostra versão do Node.js
echo [OK] Node.js instalado: 
node --version
echo.

REM Verifica se as dependências estão instaladas
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias
        pause
        exit /b 1
    )
)

REM Verifica se existe o arquivo .env.local
if not exist ".env.local" (
    echo [AVISO] Arquivo .env.local nao encontrado!
    echo [INFO] Criando arquivo .env.local de exemplo...
    
    (
        echo # Configure suas credenciais do Supabase aqui
        echo NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
        echo SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-aqui
        echo.
        echo # Ou use PostgreSQL local
        echo DATABASE_URL=postgresql://usuario:senha@localhost:5432/comidex
        echo.
        echo # Porta do servidor
        echo PORT=5017
    ) > .env.local
    
    echo [OK] Arquivo .env.local criado!
    echo.
    echo ===================================================
    echo IMPORTANTE: Configure suas credenciais no arquivo
    echo .env.local antes de executar novamente
    echo ===================================================
    pause
    exit /b 1
)

REM Define variáveis de ambiente
set PORT=5017
set NODE_OPTIONS=--max-old-space-size=4096

REM Limpa a tela e mostra informações
cls
echo ===================================================
echo    Comidex Restaurant System
echo ===================================================
echo.
echo [OK] Iniciando servidor...
echo.
echo Acesse o sistema em:
echo   - Sistema Principal: http://localhost:5017
echo   - Painel Admin:      http://localhost:5017/admin
echo   - Sistema POS:       http://localhost:5017/pos
echo.
echo Pressione Ctrl+C para parar o servidor
echo ===================================================
echo.

REM Executa o servidor
call npm run dev

pause