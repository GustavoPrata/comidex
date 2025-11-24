#!/bin/bash

# Script Automatizado para Gerar APK do ComideX Tablet
# NÃO COMPARTILHE SUAS CREDENCIAIS!

echo "=============================================="
echo "🚀 GERADOR AUTOMÁTICO DE APK - ComideX Tablet"
echo "=============================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "app.json" ]; then
    echo "❌ ERRO: Execute este script dentro da pasta TABLET!"
    echo "Use: cd TABLET && ./GERAR_APK_AUTOMATICO.sh"
    exit 1
fi

# Passo 1: Verificar Node.js
echo "📋 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não instalado!"
    echo "👉 Baixe em: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js instalado: $(node -v)"
echo ""

# Passo 2: Instalar EAS CLI globalmente
echo "📦 Instalando EAS CLI (ferramenta de build)..."
npm install -g eas-cli@latest
echo "✅ EAS CLI instalado!"
echo ""

# Passo 3: Login no Expo
echo "🔐 Fazendo login no Expo..."
echo "👉 Se não tem conta, crie GRÁTIS em: https://expo.dev"
echo ""
eas login
if [ $? -ne 0 ]; then
    echo "❌ Login falhou. Tente novamente."
    exit 1
fi
echo "✅ Login realizado com sucesso!"
echo ""

# Passo 4: Limpar caches
echo "🧹 Limpando caches antigos..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf android
rm -rf ios
echo "✅ Caches limpos!"
echo ""

# Passo 5: Instalar dependências
echo "📦 Instalando dependências..."
npm install
echo "✅ Dependências instaladas!"
echo ""

# Passo 6: Configurar projeto EAS (se necessário)
if [ ! -f ".eas" ]; then
    echo "⚙️ Configurando projeto EAS..."
    eas build:configure -p android
fi

# Passo 7: Iniciar build
echo ""
echo "=============================================="
echo "🎯 INICIANDO BUILD DO APK"
echo "=============================================="
echo ""
echo "Escolha uma opção:"
echo "1) Build na NUVEM (recomendado - mais rápido)"
echo "2) Build LOCAL (precisa Android Studio)"
echo ""
read -p "Digite 1 ou 2: " opcao

if [ "$opcao" = "1" ]; then
    echo ""
    echo "☁️ Iniciando build na nuvem Expo..."
    echo "⏳ Isso pode levar 15-30 minutos na primeira vez"
    eas build --profile development --platform android --clear-cache
    
    echo ""
    echo "=============================================="
    echo "✅ BUILD INICIADO!"
    echo "=============================================="
    echo ""
    echo "👉 Acompanhe o progresso em: https://expo.dev"
    echo "👉 Quando terminar, baixe o APK do link fornecido"
    echo ""
    
elif [ "$opcao" = "2" ]; then
    echo ""
    echo "🖥️ Iniciando build local..."
    eas build --profile development --platform android --local
    
    echo ""
    echo "=============================================="
    echo "✅ APK GERADO LOCALMENTE!"
    echo "=============================================="
    echo ""
    echo "👉 O arquivo APK está nesta pasta"
    
else
    echo "❌ Opção inválida. Execute o script novamente."
    exit 1
fi

echo ""
echo "📱 COMO INSTALAR NO TABLET:"
echo "1. Transfira o APK para o tablet (USB, Google Drive, etc)"
echo "2. No tablet: Configurações > Segurança > Fontes desconhecidas ✅"
echo "3. Abra o arquivo APK e instale"
echo ""
echo "🔥 ATIVANDO HOT RELOAD:"
echo "1. No Replit: cd TABLET && npm start"
echo "2. No tablet: Balance/shake para abrir menu"
echo "3. Configure o servidor com a URL do túnel"
echo ""
echo "✨ Pronto! Seu app está funcionando!"