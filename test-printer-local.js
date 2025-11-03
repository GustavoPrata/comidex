#!/usr/bin/env node

/**
 * Script para testar conexão com impressora térmica localmente
 * Execute este script no seu PC onde a impressora está na mesma rede
 * 
 * Como usar:
 * 1. Salve este arquivo no seu PC
 * 2. Execute: node test-printer-local.js
 * 3. Ou especifique IP e porta: node test-printer-local.js 192.168.86.191 9100
 */

const net = require('net');
const fs = require('fs');

// Configurações padrão
const DEFAULT_IP = '192.168.86.191';
const DEFAULT_PORT = 9100;

// Pegar argumentos da linha de comando
const args = process.argv.slice(2);
const PRINTER_IP = args[0] || DEFAULT_IP;
const PRINTER_PORT = parseInt(args[1]) || DEFAULT_PORT;

// Comandos ESC/POS
const ESC_INIT = Buffer.from([0x1B, 0x40]); // Inicializar
const ESC_CUT = Buffer.from([0x1D, 0x56, 0x41, 0x03]); // Cortar papel
const ESC_BOLD_ON = Buffer.from([0x1B, 0x45, 0x01]); // Negrito ON
const ESC_BOLD_OFF = Buffer.from([0x1B, 0x45, 0x00]); // Negrito OFF
const ESC_CENTER = Buffer.from([0x1B, 0x61, 0x01]); // Centralizar
const ESC_LEFT = Buffer.from([0x1B, 0x61, 0x00]); // Alinhar esquerda
const ESC_FEED = Buffer.from([0x1B, 0x64, 0x03]); // Alimentar 3 linhas
const ESC_DRAWER = Buffer.from([0x1B, 0x70, 0x00, 0x19, 0x19]); // Abrir gaveta

console.log('========================================');
console.log('  TESTE DE IMPRESSORA TÉRMICA');
console.log('========================================');
console.log(`IP da Impressora: ${PRINTER_IP}`);
console.log(`Porta: ${PRINTER_PORT}`);
console.log('');

// Função para criar dados de teste
function createTestData() {
  const now = new Date();
  const dateStr = now.toLocaleString('pt-BR');
  
  return Buffer.concat([
    // Inicializar
    ESC_INIT,
    
    // Cabeçalho centralizado e em negrito
    ESC_CENTER,
    ESC_BOLD_ON,
    Buffer.from('COMIDEX RESTAURANT\n'),
    Buffer.from('TESTE DE IMPRESSAO\n'),
    ESC_BOLD_OFF,
    Buffer.from('================================\n\n'),
    
    // Informações do teste
    ESC_LEFT,
    Buffer.from(`Data/Hora: ${dateStr}\n`),
    Buffer.from(`IP Testado: ${PRINTER_IP}\n`),
    Buffer.from(`Porta: ${PRINTER_PORT}\n`),
    Buffer.from(`Sistema: ${process.platform}\n`),
    Buffer.from(`Node.js: ${process.version}\n\n`),
    
    // Teste de caracteres
    Buffer.from('TESTE DE CARACTERES:\n'),
    Buffer.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ\n'),
    Buffer.from('abcdefghijklmnopqrstuvwxyz\n'),
    Buffer.from('0123456789\n'),
    Buffer.from('!@#$%^&*()_+-=[]{}|;:,.<>?\n\n'),
    
    // Teste de acentuação
    Buffer.from('ACENTUACAO:\n'),
    Buffer.from('áéíóú ÁÉÍÓÚ àèìòù ÀÈÌÒÙ\n'),
    Buffer.from('âêîôû ÂÊÎÔÛ ãõ ÃÕ ç Ç\n\n'),
    
    // Teste de formatação
    ESC_BOLD_ON,
    Buffer.from('TEXTO EM NEGRITO\n'),
    ESC_BOLD_OFF,
    Buffer.from('Texto normal\n\n'),
    
    // Teste de alinhamento
    ESC_CENTER,
    Buffer.from('TEXTO CENTRALIZADO\n'),
    ESC_LEFT,
    Buffer.from('Texto alinhado a esquerda\n\n'),
    
    // Rodapé
    Buffer.from('================================\n'),
    ESC_CENTER,
    Buffer.from('TESTE CONCLUIDO COM SUCESSO!\n'),
    Buffer.from('Impressora funcionando\n'),
    Buffer.from('corretamente\n'),
    ESC_LEFT,
    
    // Alimentar papel e cortar
    ESC_FEED,
    ESC_CUT
  ]);
}

// Função para testar conexão
function testConnection() {
  console.log(`[${new Date().toLocaleTimeString()}] Conectando...`);
  
  const client = new net.Socket();
  let connected = false;
  
  // Timeout de 5 segundos
  const timeout = setTimeout(() => {
    if (!connected) {
      console.error('\n❌ ERRO: Timeout - Não foi possível conectar');
      console.error('   Verifique se:');
      console.error('   1. A impressora está ligada');
      console.error('   2. O IP está correto');
      console.error('   3. A porta está correta');
      console.error('   4. Não há firewall bloqueando');
      client.destroy();
      process.exit(1);
    }
  }, 5000);
  
  // Conectar à impressora
  client.connect(PRINTER_PORT, PRINTER_IP, () => {
    connected = true;
    clearTimeout(timeout);
    console.log(`[${new Date().toLocaleTimeString()}] ✅ Conectado com sucesso!`);
    
    // Enviar dados de teste
    const testData = createTestData();
    console.log(`[${new Date().toLocaleTimeString()}] Enviando dados de teste (${testData.length} bytes)...`);
    
    client.write(testData, (err) => {
      if (err) {
        console.error('\n❌ ERRO ao enviar dados:', err.message);
      } else {
        console.log(`[${new Date().toLocaleTimeString()}] ✅ Dados enviados com sucesso!`);
        console.log('\n========================================');
        console.log('  TESTE CONCLUÍDO COM SUCESSO!');
        console.log('========================================');
        console.log('✅ Impressora está funcionando corretamente');
        console.log('✅ Verifique se o teste foi impresso');
        console.log('');
        console.log('Configuração testada:');
        console.log(`  IP: ${PRINTER_IP}`);
        console.log(`  Porta: ${PRINTER_PORT}`);
        console.log(`  Protocolo: TCP/RAW (ESC/POS)`);
        console.log('');
        console.log('Use essas configurações no ComideX!');
        
        // Salvar configuração em arquivo
        const config = {
          ip: PRINTER_IP,
          port: PRINTER_PORT,
          protocol: 'TCP/RAW',
          testDate: new Date().toISOString(),
          status: 'working'
        };
        
        fs.writeFileSync('printer-config.json', JSON.stringify(config, null, 2));
        console.log('\n📄 Configuração salva em: printer-config.json');
      }
      
      // Fechar conexão após 1 segundo
      setTimeout(() => {
        client.destroy();
        process.exit(0);
      }, 1000);
    });
  });
  
  // Eventos de erro
  client.on('error', (err) => {
    clearTimeout(timeout);
    console.error('\n❌ ERRO DE CONEXÃO:', err.message);
    
    if (err.code === 'ECONNREFUSED') {
      console.error('   A impressora recusou a conexão.');
      console.error('   Verifique se está ligada e se a porta está correta.');
    } else if (err.code === 'ETIMEDOUT') {
      console.error('   Timeout de conexão.');
      console.error('   Verifique se o IP está correto.');
    } else if (err.code === 'EHOSTUNREACH') {
      console.error('   Host não alcançável.');
      console.error('   Verifique se está na mesma rede.');
    } else if (err.code === 'ENETUNREACH') {
      console.error('   Rede não alcançável.');
      console.error('   Verifique as configurações de rede.');
    }
    
    console.error('\nDicas de solução:');
    console.error('1. Ping o IP:', `ping ${PRINTER_IP}`);
    console.error('2. Verifique se a impressora mostra o IP no display');
    console.error('3. Tente outras portas: 515, 631, 3910');
    console.error('4. Desative temporariamente o firewall para testar');
    
    process.exit(1);
  });
  
  // Receber dados da impressora
  client.on('data', (data) => {
    console.log(`[${new Date().toLocaleTimeString()}] 📥 Resposta da impressora:`, data);
  });
  
  client.on('close', () => {
    console.log(`[${new Date().toLocaleTimeString()}] Conexão fechada`);
  });
}

// Função para fazer ping primeiro
function pingTest() {
  console.log(`[${new Date().toLocaleTimeString()}] Testando conectividade...`);
  
  // Tentar conexão rápida na porta
  const quickTest = new net.Socket();
  
  quickTest.setTimeout(2000);
  
  quickTest.on('connect', () => {
    console.log(`[${new Date().toLocaleTimeString()}] ✅ Porta ${PRINTER_PORT} está aberta!`);
    quickTest.destroy();
    
    // Prosseguir com teste completo
    setTimeout(testConnection, 500);
  });
  
  quickTest.on('timeout', () => {
    console.error(`[${new Date().toLocaleTimeString()}] ⚠️ Porta ${PRINTER_PORT} não responde`);
    quickTest.destroy();
    
    console.log('\nTentando outras portas comuns...');
    tryAlternativePorts();
  });
  
  quickTest.on('error', (err) => {
    console.error(`[${new Date().toLocaleTimeString()}] ⚠️ Erro ao testar porta ${PRINTER_PORT}:`, err.code);
    quickTest.destroy();
    
    console.log('\nTentando outras portas comuns...');
    tryAlternativePorts();
  });
  
  quickTest.connect(PRINTER_PORT, PRINTER_IP);
}

// Tentar portas alternativas
function tryAlternativePorts() {
  const alternativePorts = [9100, 515, 631, 3910, 9101, 9102];
  let foundPort = null;
  let testsCompleted = 0;
  
  alternativePorts.forEach(port => {
    const test = new net.Socket();
    
    test.setTimeout(1000);
    
    test.on('connect', () => {
      console.log(`✅ Porta ${port} está aberta!`);
      foundPort = port;
      test.destroy();
      
      if (!foundPort || port === PRINTER_PORT) {
        PRINTER_PORT = port;
        console.log(`\nUsando porta ${port} para o teste...`);
        setTimeout(testConnection, 500);
      }
    });
    
    test.on('timeout', () => {
      testsCompleted++;
      test.destroy();
      checkAllPortsTested();
    });
    
    test.on('error', () => {
      testsCompleted++;
      test.destroy();
      checkAllPortsTested();
    });
    
    test.connect(port, PRINTER_IP);
  });
  
  function checkAllPortsTested() {
    if (testsCompleted === alternativePorts.length && !foundPort) {
      console.error('\n❌ Nenhuma porta de impressora encontrada');
      console.error(`   IP ${PRINTER_IP} não tem portas de impressora abertas`);
      console.error('\nVerifique:');
      console.error('1. Se a impressora está ligada');
      console.error('2. Se o IP está correto');
      console.error('3. Se está na mesma rede');
      process.exit(1);
    }
  }
}

// Iniciar teste
console.log('Iniciando teste de impressora...\n');
pingTest();