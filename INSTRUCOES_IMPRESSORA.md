# 🖨️ Instruções para Conectar Impressora 192.168.86.191:9100

## ❗ Problema Identificado

O servidor Replit está em uma rede diferente (172.31.x.x) e não consegue acessar diretamente sua impressora local (192.168.86.191). Isso é normal e esperado.

## ✅ Soluções Disponíveis

### Solução 1: Teste Local Primeiro (RECOMENDADO)

1. **Baixe o arquivo `test-printer-local.js`** para seu PC

2. **Abra o terminal/CMD no seu PC** e navegue até a pasta onde salvou o arquivo

3. **Execute o teste:**
   ```bash
   node test-printer-local.js
   # Ou especifique IP e porta:
   node test-printer-local.js 192.168.86.191 9100
   ```

4. **Se funcionar**, você verá:
   - ✅ Conexão estabelecida
   - ✅ Teste impresso na impressora
   - 📄 Arquivo `printer-config.json` criado com as configurações

### Solução 2: Executar o ComideX Localmente

Para que o sistema funcione com sua impressora local, você precisa executar o ComideX no seu PC:

1. **Clone/Baixe o projeto** para seu PC

2. **Configure o arquivo `.env.local`:**
   ```env
   # Suas credenciais do Supabase
   NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
   
   # Configuração da impressora
   PRINTER_IP=192.168.86.191
   PRINTER_PORT=9100
   ```

3. **Execute localmente:**
   ```bash
   npm install
   npm run dev
   ```

4. **Acesse:** http://localhost:5017

### Solução 3: Expor Impressora para Internet (AVANÇADO - NÃO RECOMENDADO)

⚠️ **ATENÇÃO**: Isso pode ser um risco de segurança!

Se você realmente precisa acessar a impressora de fora da rede local:

1. **Configure Port Forwarding** no seu roteador:
   - Redirecione porta externa (ex: 9100) para 192.168.86.191:9100
   - Anote seu IP público (pesquise "meu ip" no Google)

2. **Use serviço de túnel** (mais seguro):
   - Ngrok: `ngrok tcp 192.168.86.191:9100`
   - LocalTunnel: Similar ao ngrok
   - Isso criará um URL público para sua impressora

## 🔍 Diagnóstico da Impressora

### No seu PC, teste a conectividade:

**Windows:**
```cmd
# Testar se o IP responde
ping 192.168.86.191

# Testar a porta (PowerShell)
Test-NetConnection -ComputerName 192.168.86.191 -Port 9100
```

**Linux/Mac:**
```bash
# Testar se o IP responde
ping 192.168.86.191

# Testar a porta
nc -zv 192.168.86.191 9100
# ou
telnet 192.168.86.191 9100
```

## 📊 Informações da Sua Impressora

Com base no IP 192.168.86.191:

- **Subnet**: 192.168.86.x (rede local)
- **Porta Padrão**: 9100 (protocolo RAW/ESC-POS)
- **Tipo**: Impressora térmica de rede
- **Protocolo**: TCP/IP com comandos ESC/POS

## 🛠️ Configuração no ComideX

Quando executar localmente, adicione a impressora com:

1. **Nome**: Impressora Principal
2. **IP**: 192.168.86.191
3. **Porta**: 9100
4. **Tipo**: Térmica
5. **Modelo**: Selecione o modelo da sua impressora

## ❓ Perguntas Frequentes

**P: Por que não funciona no Replit?**
R: O Replit roda em servidores na nuvem que não têm acesso à sua rede local.

**P: Posso usar a impressora sem rodar localmente?**
R: Sim, mas você precisa expor a impressora para a internet (não recomendado por segurança).

**P: A impressora funciona mas não imprime certo?**
R: Verifique o modelo e o charset. Impressoras brasileiras geralmente usam CP850 ou CP860.

**P: Como saber se a impressora suporta ESC/POS?**
R: A maioria das impressoras térmicas (Epson, Bematech, Elgin, Daruma) suportam ESC/POS.

## 📞 Suporte

Se continuar com problemas:

1. Execute o script de teste local
2. Verifique os logs gerados
3. Confirme o modelo exato da impressora
4. Verifique se há firewall bloqueando

## 💡 Dica Final

Para produção, considere:
- Executar o ComideX em um PC/servidor local na mesma rede da impressora
- Usar um Raspberry Pi como servidor de impressão
- Configurar uma VPN entre o servidor e a rede local