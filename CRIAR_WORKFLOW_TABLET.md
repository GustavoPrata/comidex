# 🔧 Como Criar o Workflow para o TABLET App

## Método 1: Criar Workflow pela Interface (Recomendado)

1. **Abra o painel de Workflows:**
   - Clique em **"Workflows"** no painel lateral esquerdo
   - Ou vá em **Tools** → **Workflows**

2. **Crie um novo workflow:**
   - Clique no botão **"+ New Workflow"**
   
3. **Configure o workflow:**
   - **Nome:** `Start TABLET`
   - **Execution mode:** `Parallel` (ou `Sequential`)
   
4. **Adicione uma tarefa:**
   - Clique em **"Add Task"**
   - Selecione **"Execute Shell Command"**
   - **Command:** `./start-tablet-app.sh`
   - Ou: `cd TABLET && npm install && npm start`

5. **Salve o workflow:**
   - Clique em **"Save"** ou **"Create Workflow"**

6. **Execute o workflow:**
   - Encontre o workflow "Start TABLET" na lista
   - Clique no botão **"Run"** ao lado dele

---

## Método 2: Rodar Diretamente no Terminal (Mais Rápido)

Abra um novo terminal e execute:

```bash
./start-tablet-app.sh
```

Ou:

```bash
cd TABLET
npm install
npm start
```

---

## ✅ Portas Configuradas

- **Metro Bundler (com Tunnel):** Porta 8081
- **Web Version:** Porta 8000

---

## 📱 Acessando o App

### MELHOR FORMA: Expo Go no Celular 🎯

1. **Instale o Expo Go:**
   - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS - App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Escaneie o QR code:**
   - Depois de rodar o script, um QR code aparecerá no terminal
   - Abra o Expo Go e escaneie o código
   - O app vai carregar no seu celular!

### Opção Web (Navegador):

1. No terminal, pressione **`w`** (depois de iniciar)
2. Acesse: `http://0.0.0.0:8000`

**📖 Guia completo:** Veja `TABLET/COMO_RODAR_EXPO_REPLIT.md`

---

## 🔄 Rodando Ambos os Apps

- **Aplicação Principal:** Já está rodando no workflow "Start application" (porta 5000)
- **TABLET App:** Execute em um workflow separado ou terminal

Ambos podem rodar ao mesmo tempo! 🎉
