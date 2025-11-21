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

- **Metro Bundler (React Native):** Porta 8081
- **Web Version:** Porta 8082

---

## 📱 Acessando o App

Depois de iniciar:

1. **No navegador:**
   - Acesse: `http://localhost:8082`

2. **No celular (Expo Go):**
   - Instale o app **Expo Go** no celular
   - Escaneie o QR code que aparece no terminal
   - Ou digite o endereço manualmente

---

## 🔄 Rodando Ambos os Apps

- **Aplicação Principal:** Já está rodando no workflow "Start application" (porta 5000)
- **TABLET App:** Execute em um workflow separado ou terminal

Ambos podem rodar ao mesmo tempo! 🎉
