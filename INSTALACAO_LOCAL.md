# 🚀 Guia de Instalação Local - Comidex Restaurant System

## 📋 Pré-requisitos

Certifique-se de ter instalado em seu PC:

1. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/
   - Verifique a instalação: `node --version`

2. **PostgreSQL** (versão 14 ou superior) 
   - Download: https://www.postgresql.org/download/
   - Ou use o Supabase local: https://supabase.com/docs/guides/local-development

3. **Git** (para clonar o repositório)
   - Download: https://git-scm.com/downloads
   - Verifique: `git --version`

## 🔧 Passo 1: Clone o Projeto

```bash
# Clone o repositório (substitua pela URL do seu repositório)
git clone [URL_DO_SEU_REPOSITORIO]
cd comidex

# Ou baixe o ZIP e extraia
```

## 📦 Passo 2: Instale as Dependências

```bash
# Instale todas as dependências do projeto
npm install

# Se houver erro de memória, use:
NODE_OPTIONS="--max-old-space-size=4096" npm install
```

## 🗄️ Passo 3: Configure o Banco de Dados

### Opção A: Usando PostgreSQL Local

```bash
# Acesse o PostgreSQL
psql -U postgres

# Crie o banco de dados
CREATE DATABASE comidex;
\q
```

### Opção B: Usando Supabase (Recomendado)

1. Crie uma conta gratuita em https://supabase.com
2. Crie um novo projeto
3. Copie a URL e as chaves do projeto

## ⚙️ Passo 4: Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configuração do Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_aqui

# Configuração do Banco Local (se não usar Supabase)
DATABASE_URL=postgresql://usuario:senha@localhost:5432/comidex

# Porta do servidor (opcional, padrão 5000)
PORT=5017
```

## 🗃️ Passo 5: Configure o Schema do Banco

### Se estiver usando Supabase:

```bash
# Push o schema para o banco
npm run db:push

# Se houver aviso de perda de dados (primeira vez):
npm run db:push -- --force
```

### Execute o SQL diretamente no Supabase Dashboard:

Copie o conteúdo do arquivo `database-schema.sql` e execute no SQL Editor do Supabase.

## 🎮 Passo 6: Execute o Aplicativo

### Modo Desenvolvimento (com hot reload):

```bash
# Inicia o servidor de desenvolvimento
npm run dev

# Ou com mais memória se necessário:
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

### Modo Produção:

```bash
# Compila o projeto
npm run build

# Inicia o servidor de produção
npm run start
```

## 🌐 Passo 7: Acesse o Sistema

Após iniciar, acesse no navegador:

- **Sistema Principal**: http://localhost:5017
- **Painel Admin**: http://localhost:5017/admin
- **Sistema POS**: http://localhost:5017/pos
- **Impressoras Virtuais**: http://localhost:5017/admin/virtual-printers

## 🐛 Resolução de Problemas Comuns

### Erro de Memória
```bash
# Aumente o limite de memória do Node
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

### Porta já em uso
```bash
# Use uma porta diferente
PORT=3000 npm run dev
```

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no `.env.local`
- Teste a conexão: `psql -U postgres -d comidex`

### Erro de dependências
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📝 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Compila para produção
npm run start        # Inicia servidor de produção
npm run db:push      # Atualiza schema do banco
npm run lint         # Verifica código
npm run clean        # Limpa arquivos temporários
```

## 🔌 Dados de Teste

Para popular o banco com dados de exemplo:

```bash
# Execute o script de importação
npx tsx scripts/import-data.ts
```

## 💡 Dicas

1. **Desenvolvimento**: Use `npm run dev` para ver mudanças em tempo real
2. **Performance**: Em produção, sempre use `npm run build` + `npm run start`
3. **Backup**: Faça backup regular do banco de dados
4. **Logs**: Verifique os logs em caso de erro no console

## 🆘 Precisa de Ajuda?

- Verifique os logs do console para mensagens de erro
- Certifique-se que todas as dependências estão instaladas
- Confirme que o banco de dados está acessível
- Teste com dados mínimos primeiro

---

**Pronto!** Seu sistema Comidex deve estar rodando localmente. 🎉