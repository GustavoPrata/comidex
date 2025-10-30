# Console Prompt Workflow

O Console Prompt Workflow é um servidor separado que recebe e exibe prompts enviados da interface `/prompt`.

## Como Executar

### Opção 1: Com Node.js
```bash
node console-prompt-workflow.js
```

### Opção 2: Com NPX (se preferir)
```bash
npx nodemon console-prompt-workflow.js
```

## O que é?

O Console Prompt Workflow é um servidor Express simples que:
- **Roda na porta 3001**
- **Recebe prompts** da interface web em `/prompt`
- **Exibe no console** de forma formatada
- **Limpa o console** quando solicitado

## Endpoints

- `POST /console-prompt` - Recebe e exibe prompts
- `DELETE /console-prompt` - Limpa o console
- `GET /console-prompt` - Retorna mensagens armazenadas (debug)

## Uso

1. **Inicie o workflow** usando um dos comandos acima
2. **Acesse `/prompt`** no navegador
3. **Digite seu prompt** e envie
4. **Veja o resultado** no console do workflow

## Notas

- O workflow deve estar rodando para receber prompts
- Se não estiver rodando, você verá uma mensagem de erro
- O console é limpo automaticamente ao receber novos prompts
- Imagens anexadas são exibidas como caminhos de arquivo