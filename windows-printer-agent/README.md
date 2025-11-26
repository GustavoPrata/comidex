# ComideX Printer Bridge para Windows

**Proxy de impressoras** que conecta TODAS as suas impressoras locais ao sistema ComideX no Replit - similar ao ngrok!

## Como Funciona

```
┌─────────────────────────────────────────────────────────────────────┐
│                         REPLIT (Nuvem)                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │ Admin Panel  │    │  POS/Tablet  │    │ Fila Impress │          │
│  │ Configura IP │    │ Envia pedido │    │   Pendente   │          │
│  │192.168.1.100 │    │              │    │              │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              │ Internet
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SEU PC WINDOWS                                 │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              ComideX Printer Bridge v2.0                     │  │
│  │        Busca jobs → Envia para IP configurado               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                    │                    │                           │
│                    ▼                    ▼                           │
│  ┌──────────────────────┐    ┌──────────────────────┐              │
│  │ 🖨️ Impressora Cozinha │    │ 🖨️ Impressora Bar    │              │
│  │   192.168.1.100       │    │   192.168.1.101      │              │
│  └──────────────────────┘    └──────────────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

## Vantagens

- ✅ **Configure os IPs no Admin** - A mesma tela de sempre
- ✅ **Funciona na sua rede local** - O Bridge faz a ponte
- ✅ **Múltiplas impressoras** - Quantas quiser, cada uma com seu IP
- ✅ **Sem portas abertas** - Só o Bridge precisa de internet
- ✅ **Simples de usar** - Execute uma vez e pronto

## Instalação

### 1. Baixe e Compile

1. Instale Go: https://go.dev/dl/
2. Baixe `main.go` e `build.bat`
3. Execute `build.bat`
4. Arquivo `comidex-printer-bridge.exe` será criado

### 2. Primeira Execução

```
╔══════════════════════════════════════════════════════════════╗
║       ComideX Printer Bridge v2.0.0                          ║
║       Proxy de Impressoras Local → Replit                    ║
╚══════════════════════════════════════════════════════════════╝

⚙️  Primeira execução - Configuração do Bridge

URL do servidor Replit: https://seu-app.replit.app
Token do agente (padrão: comidex-agent-2024): [Enter]
Nome deste PC/Bridge: Restaurante-Principal

✅ Configuração salva!
```

### 3. Configure as Impressoras no Admin

No painel admin do ComideX (`/admin/printers`):

1. Adicione suas impressoras
2. Coloque o **IP da rede local** (ex: 192.168.1.100)
3. Porta: 9100 (padrão para impressoras térmicas)
4. Tipo: "network" para rede ou "usb" para USB

### 4. Execute o Bridge

Duplo-clique no `.exe` e deixe rodando:

```
📡 Servidor: https://seu-app.replit.app
🏷️  Agente: Restaurante-Principal
🔄 Intervalo: 3s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 MODO BRIDGE: Todas as impressoras configuradas no admin
   serão acessíveis através deste agente!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🖨️  Impressoras conectadas via Bridge:
   🟢 Cozinha (192.168.1.100) - Cozinha Principal
   🟢 Bar (192.168.1.101) - Bar/Bebidas
   🟢 Caixa (192.168.1.102) - Recepção

📄 Job #123
   🖨️  Impressora: Cozinha (192.168.1.100)
   🍽️  Mesa: 15
   📝 Item: 2x Yakissoba
   ✅ Impresso com sucesso!
```

## Tipos de Impressora Suportados

### Impressora de Rede (Recomendado)
- IP fixo na rede local (ex: 192.168.1.100)
- Porta 9100 (padrão ESC/POS)
- Funciona com Epson, Elgin, Bematech, etc.

### Impressora USB/Windows
- Configure o **nome exato** da impressora no Windows
- Use tipo "usb" ou "windows" no admin
- O Bridge envia via Windows Print Spooler

## Configuração Avançada

O arquivo `comidex-printer.json` é criado automaticamente:

```json
{
  "server_url": "https://seu-app.replit.app",
  "agent_token": "comidex-agent-2024",
  "agent_name": "Restaurante-Principal"
}
```

Para reconfigurar, delete o arquivo e execute novamente.

## Executar no Startup do Windows

1. Pressione `Win+R`
2. Digite `shell:startup` e Enter
3. Crie um atalho do `.exe` nessa pasta

## Solução de Problemas

### "Não conectou em 192.168.x.x"
- Verifique se a impressora está ligada
- Teste ping: `ping 192.168.1.100`
- Verifique se a porta 9100 está aberta
- Algumas impressoras usam porta diferente

### "Impressora não encontrada" (USB)
- Verifique o nome exato no Painel de Controle
- O nome deve ser idêntico ao configurado

### "Erro ao conectar ao servidor"
- Verifique a URL do Replit
- Verifique sua conexão com internet

### "Unauthorized"
- Token padrão: `comidex-agent-2024`
- Ou configure `AGENT_TOKENS` no servidor

## Segurança

- O Bridge só lê jobs e reporta resultados
- Não expõe portas na sua rede
- Conexão HTTPS com o servidor
- Token de autenticação configurável
