# ComideX Tablet App

App de autoatendimento para tablet do restaurante ComideX, desenvolvido com React Native/Expo.

## 🚀 Como executar o app

### 1. Instale as dependências

```bash
cd TABLET
npm install @react-native-async-storage/async-storage expo-keep-awake expo-device
```

### 2. Inicie o Expo

```bash
npx expo start
```

### 3. Execute no seu dispositivo

#### No tablet/celular:
1. Instale o app **Expo Go** (Android/iOS)
2. Escaneie o QR Code que aparece no terminal
3. O app abrirá automaticamente

#### No navegador:
- Pressione `w` no terminal para abrir no navegador

#### No emulador:
- Android: Pressione `a` no terminal
- iOS: Pressione `i` no terminal (só no Mac)

## 🔧 Configuração da API

O app está configurado para conectar com a API em:
```
https://84ea5393-3b41-40f9-8bf8-65a1810f577b-00-364t60vf8hwby.riker.replit.dev/api/mobile
```

Para mudar, edite a variável `API_BASE` no arquivo `App.tsx`.

## 📱 Funcionalidades

- ✅ Seleção de mesa
- ✅ Modos Rodízio e À La Carte
- ✅ Navegação por categorias
- ✅ Carrinho de compras
- ✅ Envio de pedidos
- ✅ Modo de bloqueio com senha
- ✅ Integração com impressoras

## 🔒 Segurança

- Senha padrão de bloqueio: `0000`
- Tela sempre ligada (não entra em modo de espera)
- Device ID único para rastreamento

## 🎨 Personalização

Para personalizar cores, edite os valores em `styles` no arquivo `App.tsx`:
- Cor principal: `#FF6B00` (laranja)
- Background: `#030712` (preto)
- Cards: `#111827` (cinza escuro)

## 📲 Deploy para produção

### Build para Android:
```bash
npx eas build --platform android
```

### Build para iOS:
```bash
npx eas build --platform ios
```

## 🆘 Problemas comuns

**Erro de conexão com API:**
- Verifique se o servidor principal está rodando
- Confirme a URL da API no arquivo `App.tsx`

**App não abre no tablet:**
- Certifique que o dispositivo está na mesma rede Wi-Fi
- Reinstale o Expo Go se necessário

**Tela fica travada:**
- Reinicie o app
- Limpe o cache: `npx expo start -c`

## 📞 Suporte

Em caso de dúvidas, verifique se:
1. O servidor principal ComideX está rodando
2. As APIs `/api/mobile/*` estão funcionando
3. O banco de dados tem produtos e categorias cadastrados