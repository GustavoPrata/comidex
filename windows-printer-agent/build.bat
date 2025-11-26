@echo off
echo ========================================
echo ComideX Printer Agent - Build Script
echo ========================================
echo.

REM Check if Go is installed
where go >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Go nao esta instalado!
    echo.
    echo Baixe Go em: https://go.dev/dl/
    echo.
    pause
    exit /b 1
)

echo Compilando para Windows AMD64...
set GOOS=windows
set GOARCH=amd64
go build -ldflags="-s -w" -o comidex-printer-agent.exe main.go

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo [SUCESSO] Executavel criado!
    echo.
    echo Arquivo: comidex-printer-agent.exe
    echo Tamanho: 
    for %%A in (comidex-printer-agent.exe) do echo   %%~zA bytes
    echo ========================================
) else (
    echo.
    echo [ERRO] Falha na compilacao!
)

pause
