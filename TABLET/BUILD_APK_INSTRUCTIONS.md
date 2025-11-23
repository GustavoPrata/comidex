# 📱 Como Gerar e Instalar o APK com Hot Reload

## ✅ Tudo Já Configurado!

Já configurei tudo que você precisa:
- **expo-dev-client** instalado ✅
- **expo-updates** para atualizações automáticas ✅
- **eas.json** configurado ✅
- **metro.config.js** preparado ✅
- **app.json** com package name ✅

## 🚀 PASSO A PASSO PARA GERAR O APK

### 1️⃣ Instale o EAS CLI no seu computador local
```bash
npm install -g eas-cli
```

### 2️⃣ Faça login na sua conta Expo
```bash
eas login
```
(Se não tem conta, crie em https://expo.dev)

### 3️⃣ Configure o projeto (primeira vez apenas)
```bash
cd TABLET
eas build:configure
```

### 4️⃣ Gere o APK de Desenvolvimento
```bash
eas build --profile development --platform android --local
```

**OU** se preferir build na nuvem (mais rápido):
```bash
eas build --profile development --platform android
```

### 5️⃣ Baixe o APK
- Se build local: O APK estará na pasta do projeto
- Se build na nuvem: Baixe do link que aparece no terminal

## 📲 INSTALANDO NO TABLET

### 1️⃣ Habilite instalação de fontes desconhecidas
- Configurações > Segurança > Fontes desconhecidas ✅

### 2️⃣ Transfira o APK para o tablet
- Via USB, Google Drive, ou email

### 3️⃣ Instale o APK
- Toque no arquivo APK no tablet
- Aceite as permissões

## 🔥 ATIVANDO HOT RELOAD (Atualização Automática)

### No Replit:

1. **Mantenha o servidor Metro rodando**:
```bash
cd TABLET
npx expo start --tunnel
```

2. **Anote a URL do túnel** que aparece (algo como: `exp://xxxxxx.exp.direct`)

### No Tablet (após instalar o APK):

1. **Abra o app ComideX Tablet**

2. **Shake/Balance o tablet** para abrir o menu de desenvolvimento
   - OU pressione Volume Up + Volume Down simultaneamente

3. **Toque em "Settings"**

4. **Configure o servidor**:
   - Debug server host: Cole a URL do túnel (sem exp://)
   - Exemplo: `brevpv8-anonymous-8081.exp.direct`

5. **Reload o app**

## ✨ PRONTO! Agora o app atualiza automaticamente!

### Como funciona o Hot Reload:
- ✅ Faça mudanças no código no Replit
- ✅ Salve o arquivo
- ✅ O app atualiza INSTANTANEAMENTE no tablet
- ✅ Sem precisar fechar/abrir o app
- ✅ Sem precisar gerar novo APK

## 🎯 Recursos do APK de Desenvolvimento:

1. **Hot Reload** - Atualiza ao salvar código
2. **Fast Refresh** - Mantém estado do app
3. **Debug Menu** - Shake para opções de debug
4. **Console Logs** - Veja logs no terminal do Replit
5. **Modo Kiosk** - Tela cheia configurada
6. **Orientação Landscape** - Travada horizontal

## 🔧 Solução de Problemas

### App não conecta ao servidor:
1. Verifique se o Metro está rodando no Replit
2. Use `--tunnel` no comando expo start
3. Configure o Debug server host corretamente

### Hot reload não funciona:
1. Shake o tablet e vá em Settings
2. Verifique a URL do servidor
3. Toque em "Reload" no menu

### App fecha sozinho:
- Normal na primeira vez, abra novamente
- O app precisa se conectar ao servidor Metro

## 📌 URLs Importantes do Seu Replit:

- **API Backend**: `http://0cf83c93-8147-42e6-967b-30b169de3e65.spock.replit.dev:5000`
- **Metro Bundler**: Será mostrado quando rodar `npx expo start --tunnel`

## 🎉 Vantagens do Development Build:

1. **Desenvolvimento Rápido** - Veja mudanças instantaneamente
2. **Debug Fácil** - Console logs e debug tools
3. **Sem Rebuilds** - Não precisa gerar novo APK a cada mudança
4. **Como Expo Go** - Mas com seu próprio app instalado
5. **Modo Kiosk** - Configurações de tela cheia aplicadas

---

## 💡 Dica Pro:

Para modo produção (sem hot reload), use:
```bash
eas build --profile production --platform android
```

Mas para desenvolvimento e testes, **sempre use o profile development** para ter hot reload!