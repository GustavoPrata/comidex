# 🔐 Login Automático no EAS - Forma SEGURA

## ⚠️ IMPORTANTE: 
**NUNCA coloque senhas em arquivos `.bat` ou código!** Isso é extremamente inseguro.

## ✅ SOLUÇÃO CORRETA (Login persistente):

### Passo 1: Faça login UMA VEZ manualmente:
```bash
npx eas login
```
Digite: `gustavoprata17` e sua senha quando solicitado.

### Passo 2: Verifique se está logado:
```bash
npx eas whoami
```
Deve mostrar: `gustavoprata17`

### Passo 3: O token fica salvo automaticamente!
Após fazer login uma vez, o EAS salva seu token em:
- Windows: `%USERPROFILE%\.expo\state.json`
- Mac/Linux: `~/.expo/state.json`

**Você não precisará fazer login novamente!** 🎉

---

## 🚀 COMANDO COMPLETO (após login):

Depois de fazer login uma vez, use este comando sempre:

```bash
cd TABLET && rmdir /s /q node_modules .expo android ios dist 2>nul && del package-lock.json 2>nul && copy /Y package.json.minimal package.json && copy /Y babel.config.minimal.js babel.config.js && npm install --legacy-peer-deps && eas build --profile preview --platform android --clear-cache
```

---

## 📱 Para múltiplos computadores:

Se precisar build em vários computadores:

### Opção 1: Token de Acesso (Recomendado)
1. Vá em: https://expo.dev/settings/access-tokens
2. Crie um token
3. Use em variável de ambiente:
```bash
set EXPO_TOKEN=seu_token_aqui
eas build --profile preview --platform android
```

### Opção 2: CI/CD (Para automação)
Configure GitHub Actions ou similar com o token como secret.

---

## ❌ Por que NÃO colocar senha no .bat:

1. **Visível no Git:** Qualquer um que acessar o código verá
2. **Histórico permanente:** Mesmo deletando, fica no histórico do Git
3. **Texto puro:** Senha totalmente exposta
4. **Risco de vazamento:** Se compartilhar o projeto, expõe credenciais

---

## ✅ Resumo da solução:

1. Execute `npx eas login` **uma única vez**
2. O EAS salvará seu token automaticamente
3. Todos os builds futuros funcionarão sem pedir login
4. Use o arquivo `GERAR_APK_AUTO.bat` que criei

**Segurança em primeiro lugar!** 🔒