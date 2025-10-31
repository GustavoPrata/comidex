# 🗄️ CONFIGURAÇÃO DO BANCO DE DADOS POSTGRESQL

## 🚀 Acesso Rápido
**Página de Configuração:** http://localhost:5000/admin/database-config

## 📋 Passo a Passo

### 1️⃣ Acesse a página de configuração
Navegue até: http://localhost:5000/admin/database-config

### 2️⃣ Insira sua URL de conexão
Cole sua URL PostgreSQL no campo. Exemplo:
```
postgresql://postgres.wlqvqrgjqowervexcosv:ds4ad456sad546as654d@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

### 3️⃣ Teste a conexão
Clique em "Testar Nova Conexão" para verificar se funciona

### 4️⃣ Salve a configuração
Se o teste for bem-sucedido, clique em "Salvar Configuração"

### 5️⃣ Reinicie o servidor
Após salvar, reinicie o servidor para aplicar as mudanças

## 🔧 Configuração Manual (Alternativa)

Você também pode editar diretamente o arquivo `lib/database/config.ts`:

```typescript
export const DATABASE_CONFIG = {
  connectionString: 'sua-url-postgresql-aqui',
  poolConfig: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
};
```

## 📝 Formatos de URL Suportados

### Supabase
```
postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### PostgreSQL Local
```
postgresql://usuario:senha@localhost:5432/nome_do_banco
```

### Neon
```
postgresql://usuario:senha@ep-nome-projeto.region.aws.neon.tech/neondb
```

### Railway
```
postgresql://postgres:senha@containers-region.railway.app:porta/railway
```

## ✅ Verificação do Banco

A página mostra automaticamente:
- ✅ Status da conexão
- ✅ Nome do banco de dados
- ✅ Tabelas existentes
- ✅ Tipo de IDs (inteiros ou UUIDs)
- ✅ Informações do servidor

## ⚠️ Importante

1. **IDs Inteiros:** Seu banco DEVE usar IDs inteiros (1, 2, 3...)
2. **Tabelas Necessárias:** groups, categories, items, additionals
3. **Segurança:** Nunca compartilhe suas credenciais
4. **Reiniciar:** Sempre reinicie após mudar a conexão

## 🎯 Teste Atual

URL em uso:
```
postgresql://postgres.wlqvqrgjqowervexcosv:ds4ad456sad546as654d@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

Status: ✅ FUNCIONANDO COM IDs INTEIROS