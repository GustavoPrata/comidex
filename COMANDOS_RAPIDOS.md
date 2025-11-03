# 📋 Comandos Rápidos - Comidex

## 🚀 Iniciar o Sistema

### No Linux/Mac:
```bash
# Dar permissão de execução (só primeira vez)
chmod +x run-local.sh

# Executar
./run-local.sh
```

### No Windows:
```cmd
# Duplo clique no arquivo run-local.bat
# Ou no terminal:
run-local.bat
```

### Comando Manual (qualquer sistema):
```bash
# Definir porta e memória
PORT=5017 NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

## 📦 Comandos de Instalação

```bash
# Instalar dependências
npm install

# Limpar e reinstalar (se houver problemas)
rm -rf node_modules package-lock.json
npm install
```

## 🗄️ Comandos do Banco de Dados

```bash
# Aplicar schema no banco (Supabase/PostgreSQL)
npm run db:push

# Forçar aplicação (primeira vez ou reset)
npm run db:push -- --force

# Popular com dados de teste
npx tsx scripts/import-data.ts
```

## 🔧 Comandos de Desenvolvimento

```bash
# Modo desenvolvimento (com hot reload)
npm run dev

# Compilar para produção
npm run build

# Rodar em produção
npm run start

# Verificar código
npm run lint

# Limpar arquivos temporários
npm run clean
```

## 🔍 Verificação de Requisitos

```bash
# Verificar Node.js
node --version   # Deve ser 18+

# Verificar npm
npm --version    # Deve ser 8+

# Verificar PostgreSQL (se local)
psql --version   # Deve ser 14+
```

## ⚡ Atalhos Úteis

```bash
# Matar processo na porta 5017 (Linux/Mac)
kill $(lsof -t -i:5017)

# Matar processo na porta 5017 (Windows)
netstat -ano | findstr :5017
taskkill /PID [numero_do_pid] /F

# Ver logs em tempo real
tail -f .next/server/*.log

# Limpar cache Next.js
rm -rf .next

# Resetar tudo
rm -rf node_modules .next package-lock.json
npm install
```

## 🌐 URLs do Sistema

Após iniciar, acesse:

- **Home**: http://localhost:5017
- **Admin**: http://localhost:5017/admin  
- **POS**: http://localhost:5017/pos
- **Impressoras Virtuais**: http://localhost:5017/admin/virtual-printers

## 🆘 Problemas Comuns

### Porta já em uso:
```bash
# Mudar para outra porta
PORT=3000 npm run dev
```

### Erro de memória:
```bash
# Aumentar limite
NODE_OPTIONS="--max-old-space-size=8192" npm run dev
```

### Banco não conecta:
```bash
# Verificar se PostgreSQL está rodando
pg_ctl status

# Ou verificar Supabase
curl https://seu-projeto.supabase.co/rest/v1/
```