# 📱 Como Rodar o App TABLET no Replit (Expo)

## 🎯 Melhor Forma: Expo Go no Celular

O Replit funciona melhor com Expo quando você usa o **Expo Go** no celular:

### Passo 1: Instale o Expo Go
- **Android:** [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS:** [App Store](https://apps.apple.com/app/expo-go/id982107779)

### Passo 2: Inicie o App TABLET
No terminal do Replit:
```bash
./start-tablet-app.sh
```

Ou manualmente:
```bash
cd TABLET
npm install
npm start
```

### Passo 3: Escaneie o QR Code
1. O Expo vai mostrar um **QR code** no terminal
2. Abra o app **Expo Go** no celular
3. Escaneie o QR code
4. O app vai carregar no seu celular! 🎉

---

## 🌐 Opção Web (Navegador)

Se quiser testar no navegador:

1. Inicie o app (passo 2 acima)
2. No terminal, pressione **`w`** (web)
3. Acesse: `http://0.0.0.0:8000`

**Nota:** A versão web usa React Native Web, que pode ter diferenças da versão mobile nativa.

---

## 🔧 Configuração do Tunnel

O script usa `--tunnel` para permitir acesso externo ao Metro Bundler. Isso é necessário no Replit porque:
- O Replit roda em ambiente cloud
- O tunnel cria uma URL pública temporária
- Permite que o Expo Go no celular se conecte ao servidor

---

## ⚙️ Portas Configuradas

- **Metro Bundler:** 8081 (com tunnel)
- **Web Version:** 8000
- **Aplicação Principal:** 5000

Todas as portas são compatíveis com o mapeamento do Replit.

---

## 🚀 Rodando Ambas Aplicações

Você pode rodar os dois apps ao mesmo tempo:

**Terminal 1 (já rodando):**
```bash
npm run dev  # App principal na porta 5000
```

**Terminal 2 (novo):**
```bash
./start-tablet-app.sh  # TABLET na porta 8081/8000
```

---

## ❓ Problemas Comuns

### QR Code não aparece
- Certifique-se que o npm start terminou de carregar
- Aguarde alguns segundos
- O QR code aparece após "Metro waiting on exp://..."

### Erro de conexão no celular
- Verifique se o celular está na mesma rede
- Use a opção "Tunnel" (já configurada no script)
- O tunnel funciona mesmo em redes diferentes

### "Port already in use"
```bash
npx kill-port 8081
npx kill-port 8000
```

### Dependências não instaladas
```bash
cd TABLET
rm -rf node_modules
npm install
```

---

## 📚 Referências

- [Expo Documentation](https://docs.expo.dev/)
- [Replit Expo Support](https://docs.replit.com/mobile-development)
- [Expo Go App](https://expo.dev/go)
