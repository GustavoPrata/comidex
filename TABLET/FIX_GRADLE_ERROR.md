# 🔧 SOLUÇÃO: Erro de Build do Gradle

## ❌ O Erro
```
Build failed: Gradle build failed with unknown error. See logs for the "Run gradlew" phase for more information.
```

## ✅ SOLUÇÃO RÁPIDA

### Na sua máquina local (não no Replit):

1. **Clone o projeto:**
```bash
git clone [URL_DO_SEU_REPLIT]
cd TABLET
```

2. **Execute o script de correção:**
```bash
./fix-gradle-build.sh
```

3. **Faça o build com cache limpo:**
```bash
eas build --clear-cache --profile development --platform android
```

## 📋 O que foi corrigido:

### 1. **app.json** - Removidas configurações problemáticas:
- ❌ ~~`newArchEnabled: true`~~ → Removido (incompatível com algumas dependências)
- ❌ ~~`runtimeVersion: "1.0.0"`~~ → ✅ Mudado para `{ "policy": "sdkVersion" }`
- ❌ ~~Configurações Android avançadas~~ → Mantido apenas o essencial

### 2. **eas.json** - Simplificado:
- ❌ ~~`gradleCommand: ":app:assembleDebug"`~~ → Removido (deixar EAS decidir)

### 3. **gradle.properties** - Adicionado arquivo de configuração:
- Memória JVM aumentada para 4GB
- AndroidX e Jetifier habilitados
- New Architecture desabilitada (por compatibilidade)

## 🎯 Se ainda tiver erro, tente:

### Opção 1: Build Local (mais controle)
```bash
# Na sua máquina local com Android Studio instalado
eas build --profile development --platform android --local
```

### Opção 2: Build Simplificado
```bash
# Use o profile preview que tem menos configurações
eas build --profile preview --platform android
```

### Opção 3: Expo Go (para testes rápidos)
```bash
# No Replit, rode:
cd TABLET
npm start --tunnel

# No celular, escaneie o QR com o app Expo Go
```

## 📱 Configurações que mantêm o Modo Kiosk:

Mesmo simplificando, o app ainda terá:
- ✅ Orientação landscape travada
- ✅ StatusBar oculta
- ✅ Tela cheia (máximo possível)
- ✅ Prevenção de gestos do sistema

## 🔍 Para ver logs detalhados do erro:

1. No site do Expo (após fazer build na nuvem):
   - Vá em https://expo.dev
   - Clique na build com erro
   - Veja a aba "Logs"
   - Procure por "FAILURE:" ou "error:"

2. Para build local:
   - Os logs aparecem diretamente no terminal
   - Procure por erros relacionados a:
     - Versões de dependências
     - Configurações do Android Manifest
     - Recursos (assets) não encontrados

## ✨ Build de Produção (após resolver):

Quando o development build funcionar, gere o de produção:
```bash
eas build --profile production --platform android
```

## 💡 Dica Final:

Se nada funcionar, use temporariamente o Expo Go:
1. Remova `expo-dev-client` do package.json
2. Execute `npm install`
3. Use `expo start --tunnel` e teste com Expo Go

Depois você pode adicionar o dev-client novamente quando resolver os problemas de build.