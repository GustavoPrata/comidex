# ComideX Printer Agent para Windows

Executável Windows que conecta sua impressora local ao sistema ComideX rodando no Replit.

## Como Funciona

```
[Replit/Nuvem]              [Seu PC Windows]           [Impressora]
    │                            │                          │
    │   ◄─── Busca jobs ───      │                          │
    │   ─── Envia dados ───►     │                          │
    │                            │   ── Imprime ──►         │
    │   ◄─── Confirma ────       │                          │
```

O agente roda no seu PC Windows, busca os pedidos pendentes no servidor Replit a cada 3 segundos, e envia para sua impressora local.

## Instalação

### Opção 1: Baixar .exe Pré-compilado
1. Baixe o arquivo `comidex-printer-agent.exe` (será disponibilizado)
2. Coloque numa pasta fácil de acessar

### Opção 2: Compilar Você Mesmo
1. Instale Go: https://go.dev/dl/
2. Baixe os arquivos `main.go` e `build.bat`
3. Execute `build.bat`
4. O arquivo `comidex-printer-agent.exe` será criado

## Configuração Inicial

Na primeira execução, o agente pedirá:

1. **URL do servidor Replit**: 
   - Exemplo: `https://seu-app.replit.app`
   - É a URL onde seu sistema ComideX está rodando

2. **Token do agente**:
   - Token padrão: `comidex-agent-2024`
   - (Você pode configurar tokens personalizados no servidor)

3. **Nome do agente**:
   - Exemplo: `Cozinha-PC` ou `Bar-Impressora`
   - Ajuda a identificar qual PC está conectado

4. **Tipo de impressora**:
   - **Windows (USB/Compartilhada)**: Para impressoras instaladas no Windows
   - **Rede (IP direto)**: Para impressoras com IP fixo na rede local

## Executar

Basta dar duplo-clique no `comidex-printer-agent.exe`

Você verá:
```
╔══════════════════════════════════════════════════════════════╗
║       ComideX Printer Agent v1.0.0                           ║
║       Conectando impressora local ao sistema                 ║
╚══════════════════════════════════════════════════════════════╝

📡 Servidor: https://seu-app.replit.app
🖨️  Impressora: EPSON TM-T20 (windows)
🔄 Intervalo de polling: 3s

✅ Impressora 'EPSON TM-T20' encontrada e acessível
✅ Agente iniciado! Aguardando jobs de impressão...
   Pressione Ctrl+C para sair

📄 Job #123: Yakissoba (Mesa: 15)
   ✅ Impresso com sucesso!
```

## Executar como Serviço Windows

Para executar automaticamente quando o Windows iniciar:

1. Crie um atalho do `comidex-printer-agent.exe`
2. Pressione `Win+R`, digite `shell:startup` e Enter
3. Mova o atalho para a pasta que abriu

## Configuração Avançada

O arquivo de configuração `comidex-printer.json` é criado automaticamente na mesma pasta do .exe:

```json
{
  "server_url": "https://seu-app.replit.app",
  "agent_token": "comidex-agent-2024",
  "agent_name": "Cozinha-PC",
  "printer_name": "EPSON TM-T20",
  "printer_type": "windows",
  "printer_ip": "",
  "printer_port": 9100
}
```

Para reconfigura, delete o arquivo e execute o agente novamente.

## Impressoras Suportadas

- ✅ Impressoras térmicas ESC/POS (Epson, Elgin, Bematech, etc.)
- ✅ Impressoras USB instaladas no Windows
- ✅ Impressoras de rede com porta 9100 (RAW)
- ✅ Impressoras compartilhadas na rede Windows

## Solução de Problemas

### "Impressora não encontrada"
- Verifique se a impressora está instalada no Windows
- Vá em Painel de Controle → Dispositivos e Impressoras
- Use exatamente o nome que aparece lá

### "Erro ao conectar ao servidor"
- Verifique a URL do servidor
- Verifique sua conexão com a internet
- Certifique-se que o servidor Replit está rodando

### "Unauthorized"
- Verifique o token do agente
- O token padrão é `comidex-agent-2024`

## Tokens Personalizados (Servidor)

Para usar tokens personalizados, configure a variável de ambiente no Replit:
```
AGENT_TOKENS=token1,token2,token3
```

Cada restaurante/computador pode ter seu próprio token para maior segurança.
