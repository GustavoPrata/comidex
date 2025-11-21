# Como Rodar o App TABLET no Replit

## Opção 1: Usando o Terminal do Replit (Recomendado)

1. **Abra um novo terminal/console:**
   - Clique no menu no canto superior esquerdo da aba **Shell**
   - Selecione **New Shell** (Nova Shell)
   
2. **Navegue até a pasta TABLET:**
   ```bash
   cd TABLET
   ```

3. **Instale as dependências (apenas primeira vez):**
   ```bash
   npm install
   ```

4. **Inicie o aplicativo:**
   ```bash
   npm start
   ```

5. **O Expo vai iniciar em:**
   - Metro Bundler: porta **8081**
   - Web: porta **8082**

## Opção 2: Usando o Script de Inicialização

No terminal:
```bash
./TABLET/start-tablet.sh
```

## Rodando Ambos os Apps Simultaneamente

- **Aplicação Principal (Next.js):** Já está rodando no workflow "Start application" na porta 5000
- **App TABLET (Expo):** Execute em um terminal separado usando os comandos acima

### Dica: Gerenciando Múltiplos Terminais

- Para abrir vários terminais no Replit, clique no menu da aba Shell → **New Shell**
- Cada terminal ficará com o nome do último comando executado
- Você pode alternar entre eles pelo mesmo menu

## Testando

- **Aplicação Principal:** Acesse `http://localhost:5000`
- **TABLET Web:** Acesse `http://localhost:8082`
- **TABLET Mobile:** Use o app Expo Go no celular e escaneie o QR code

## Problemas Comuns

### "Port already in use"
Se aparecer erro de porta já em uso:
```bash
# Mate o processo na porta 8081
npx kill-port 8081
```

### Dependências não instaladas
```bash
cd TABLET
npm install
```
