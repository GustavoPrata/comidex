# Guia de Configuração de Impressoras Térmicas - ComideX

## 📋 Visão Geral

O sistema ComideX suporta impressoras térmicas com comandos ESC/POS, compatível com mais de 60 modelos diferentes, incluindo:
- Epson TM-T88 Series (II, III, IV, V, VI)
- Bematech MP-4200 TH
- Elgin i9
- Daruma DR800
- E muitos outros modelos compatíveis com ESC/POS

## 🔧 Configuração de Impressoras

### 1. Impressoras de Rede (Ethernet/WiFi)

**Configuração Recomendada:**
```
IP: 192.168.x.x (IP da sua impressora)
Porta: 9100 (padrão para impressoras térmicas)
Tipo: Térmica
```

**Como obter o IP da impressora:**
1. Imprima o relatório de configuração (geralmente segurando o botão FEED ao ligar)
2. Verifique no display da impressora (modelos com visor)
3. Use o software do fabricante para descobrir

### 2. Impressoras Locais Windows

**Para impressoras USB/Serial conectadas ao PC:**
1. Instale o driver Windows da impressora
2. A impressora aparecerá na detecção automática
3. Será adicionada com IP: LOCAL

**Métodos de comunicação suportados:**
- Porta COM (COM1, COM2, COM3, COM4)
- Porta LPT (LPT1, LPT2)
- Porta USB (USB001, USB002)
- Compartilhamento Windows

## 🖨️ Comandos ESC/POS Suportados

O sistema envia comandos ESC/POS nativos, incluindo:
- **Inicialização:** ESC @ (0x1B 0x40)
- **Corte de papel:** GS V (parcial e total)
- **Alinhamento:** Esquerda, Centro, Direita
- **Tamanhos:** Normal, Dupla altura, Dupla largura
- **Negrito:** ON/OFF
- **Beep:** Som de alerta
- **Gaveta:** Abertura automática

## 🔌 Como Conectar

### Impressora de Rede:
1. Configure o IP fixo na impressora
2. Conecte na mesma rede do servidor
3. Adicione no sistema com IP e porta 9100
4. Teste a conexão

### Impressora Local Windows:
1. Conecte via USB/Serial
2. Instale o driver do Windows
3. Use "Detectar impressoras locais"
4. Adicione a impressora detectada

## 🧪 Teste de Impressão

O teste envia um cupom com:
- Cabeçalho com data/hora
- Teste de caracteres (A-Z, 0-9, símbolos)
- Teste de alinhamento
- Teste de tamanhos de fonte
- Corte automático no final

## ⚠️ Solução de Problemas

### Impressora não conecta:
1. **Verifique o IP:** Ping no endereço da impressora
2. **Porta 9100:** Certifique que está aberta
3. **Firewall:** Desative temporariamente para teste
4. **Cabo de rede:** Teste com outro cabo
5. **Energia:** Verifique se está ligada

### Impressão com caracteres estranhos:
- Verifique o modelo da impressora
- Alguns modelos precisam configuração de charset
- Teste com diferentes encodings

### Impressora local não detectada:
1. Verifique se o driver está instalado
2. Execute o aplicativo como administrador
3. Verifique o spooler de impressão do Windows
4. Reinicie o serviço: `net stop spooler && net start spooler`

### Comandos não funcionam:
- Confirme que é uma impressora térmica ESC/POS
- Impressoras laser/jato não são compatíveis com comandos ESC/POS
- Use o teste local para impressoras não-térmicas

## 📊 Modelos Testados

| Modelo | Conexão | Status |
|--------|---------|--------|
| Epson TM-T88VI | Ethernet | ✅ Funcionando |
| Epson TM-T20 | USB | ✅ Funcionando |
| Bematech MP-4200 TH | USB/Serial | ✅ Funcionando |
| Elgin i9 | USB | ✅ Funcionando |
| Daruma DR800 | Ethernet | ✅ Funcionando |

## 🔐 Segurança

- Nomes de impressoras são sanitizados antes de comandos shell
- Conexões de rede usam timeout de 5 segundos
- Dados ESC/POS são enviados em formato binário seguro
- Arquivos temporários são limpos automaticamente

## 💡 Dicas

1. **Performance:** Use conexão Ethernet para maior velocidade
2. **Confiabilidade:** Configure IP fixo, não use DHCP
3. **Backup:** Tenha uma impressora secundária configurada
4. **Manutenção:** Limpe a cabeça térmica regularmente
5. **Papel:** Use papel térmico de qualidade (80mm x 40m)

## 📞 Suporte

Para adicionar suporte a um novo modelo:
1. Verifique se é compatível com ESC/POS
2. Teste com comandos básicos primeiro
3. Ajuste timeouts se necessário
4. Reporte problemas com logs detalhados

---

**Última atualização:** Novembro 2024  
**Versão:** 1.0.0