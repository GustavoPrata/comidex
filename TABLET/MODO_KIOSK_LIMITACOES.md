# Modo Kiosk - Limitações e Soluções

## ⚠️ IMPORTANTE: Limitações do Expo Managed Workflow

### ❌ O que NÃO É POSSÍVEL fazer com Expo Managed:

1. **Ficar sobre outros apps** - Requer permissão `SYSTEM_ALERT_WINDOW` (não disponível)
2. **Remover botões de navegação permanentemente** - Requer Device Owner Mode
3. **Bloquear totalmente a saída do app** - Requer lock-task mode nativo
4. **Impedir acesso ao sistema** - Requer provisioning empresarial

### ✅ O que FOI IMPLEMENTADO (máximo possível):

1. **StatusBar oculta** - Barra superior escondida
2. **Orientação travada** - Sempre em paisagem (landscape)
3. **BackHandler** - Bloqueia botão voltar (mas não home/recentes)
4. **PIN de proteção** - Senha 1234 para sair do modo kiosk
5. **Brilho máximo** - Tela sempre em 100% de brilho
6. **Keep Awake** - Tela nunca apaga
7. **Tela ociosa** - Retorna ao início após 2 minutos

## 🚀 Para ter KIOSK COMPLETO você precisa:

### Opção 1: Ejetar para Expo Bare Workflow
```bash
npx expo eject
```
Depois adicionar módulos nativos:
- react-native-android-kiosk
- react-native-immersive
- react-native-lock-task

### Opção 2: Usar soluções empresariais
- **Fully Kiosk Browser** (R$ 30/tablet)
- **SureLock Kiosk** (R$ 50/tablet) 
- **Android Enterprise** (grátis mas complexo)

### Opção 3: Configurar Device Owner Mode via ADB
```bash
# No tablet conectado via USB:
adb shell dpm set-device-owner com.comidex.tablet/.DeviceAdminReceiver
```

## 📱 Configuração Manual no Tablet Android

Para maximizar o modo kiosk com as limitações atuais:

1. **Desativar Google Assistant**
   - Configurações > Google > Busca e Assistente > Google Assistant > Desativar

2. **Usar App Pinning** (Fixação de Apps)
   - Configurações > Segurança > Fixação de apps > Ativar
   - Abrir o app ComideX Tablet
   - Botão recentes > Fixar app

3. **Modo Desenvolvedor**
   - Configurações > Sobre > Tocar 7x no número da versão
   - Ativar opções do desenvolvedor
   - Desativar animações
   - Forçar GPU rendering

4. **Launcher Alternativo**
   - Instalar launcher minimalista (ex: Niagara Launcher)
   - Definir ComideX como único app na tela inicial

## 🔒 Segurança Atual

Com a implementação atual você tem:
- ✅ Proteção básica contra saída acidental
- ✅ PIN para configurações administrativas  
- ⚠️ Usuário determinado ainda consegue sair (home/recentes)
- ❌ Não protege contra reset ou desinstalação

## 💡 Recomendação

Para uso em produção em restaurante:
1. Use tablets dedicados (não pessoais)
2. Configure App Pinning manualmente
3. Considere Fully Kiosk Browser (R$ 30/tablet)
4. Ou migre para Expo Bare se precisar controle total

---

**Nota**: As configurações no `app.json` foram maximizadas, mas muitas só funcionam após ejetar para bare workflow ou em build de produção.