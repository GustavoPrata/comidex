// API para testar conexão direta com impressora por IP
import { NextResponse } from "next/server";
import * as net from 'net';

// Comandos ESC/POS de teste
const TEST_COMMANDS = {
  initialize: Buffer.from([0x1B, 0x40]), // ESC @ - Initialize printer
  selectCharset: Buffer.from([0x1B, 0x52, 0x00]), // ESC R 0 - Select USA charset
  alignCenter: Buffer.from([0x1B, 0x61, 0x01]), // ESC a 1 - Center alignment
  boldOn: Buffer.from([0x1B, 0x45, 0x01]), // ESC E 1 - Bold on
  boldOff: Buffer.from([0x1B, 0x45, 0x00]), // ESC E 0 - Bold off
  alignLeft: Buffer.from([0x1B, 0x61, 0x00]), // ESC a 0 - Left alignment
  feedLines: Buffer.from([0x1B, 0x64, 0x03]), // ESC d 3 - Feed 3 lines
  cut: Buffer.from([0x1D, 0x56, 0x41, 0x03]), // GS V A 3 - Partial cut
  getStatus: Buffer.from([0x1D, 0x72, 0x01]), // GS r 1 - Get status
  openDrawer: Buffer.from([0x1B, 0x70, 0x00, 0x19, 0x19]), // ESC p 0 - Open cash drawer
};

// Testar conexão TCP direta
async function testTCPConnection(ip: string, port: number): Promise<any> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let connected = false;
    let dataReceived = false;
    let statusMessage = '';
    
    const timeout = setTimeout(() => {
      if (!connected) {
        socket.destroy();
        resolve({
          success: false,
          error: 'Timeout: Não foi possível conectar',
          details: `Timeout ao conectar em ${ip}:${port}`,
          solution: 'Verifique se o IP está correto e se a impressora está na mesma rede'
        });
      }
    }, 5000);
    
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      connected = true;
      clearTimeout(timeout);
      console.log(`✅ Conectado em ${ip}:${port}`);
      statusMessage = `Conexão TCP estabelecida em ${ip}:${port}`;
      
      // Enviar comandos de teste
      try {
        const testData = Buffer.concat([
          TEST_COMMANDS.initialize,
          TEST_COMMANDS.selectCharset,
          TEST_COMMANDS.alignCenter,
          TEST_COMMANDS.boldOn,
          Buffer.from('TESTE DE CONEXAO\n'),
          TEST_COMMANDS.boldOff,
          Buffer.from('ComideX Restaurant\n'),
          Buffer.from(`${new Date().toLocaleString('pt-BR')}\n`),
          TEST_COMMANDS.alignLeft,
          Buffer.from('\n'),
          Buffer.from(`IP: ${ip}\n`),
          Buffer.from(`Porta: ${port}\n`),
          Buffer.from('Status: ONLINE\n'),
          TEST_COMMANDS.feedLines,
          TEST_COMMANDS.cut
        ]);
        
        socket.write(testData);
        
        // Aguardar resposta ou timeout
        setTimeout(() => {
          socket.destroy();
          resolve({
            success: true,
            message: statusMessage,
            details: {
              ip,
              port,
              protocol: 'TCP/RAW',
              status: 'online',
              dataReceived,
              testPrintSent: true
            }
          });
        }, 1000);
      } catch (error: any) {
        socket.destroy();
        resolve({
          success: false,
          error: 'Erro ao enviar comandos',
          details: error.message || 'Erro desconhecido'
        });
      }
    });
    
    socket.on('data', (data: Buffer) => {
      dataReceived = true;
      console.log('📥 Resposta da impressora:', data);
      statusMessage += '\nResposta recebida da impressora';
    });
    
    socket.on('error', (error: any) => {
      clearTimeout(timeout);
      console.error(`❌ Erro de conexão:`, error.message);
      
      let solution = '';
      if (error.code === 'ECONNREFUSED') {
        solution = 'Impressora recusou conexão. Verifique se está ligada e se a porta está correta.';
      } else if (error.code === 'ETIMEDOUT') {
        solution = 'Timeout de conexão. Verifique se o IP está correto e se não há firewall bloqueando.';
      } else if (error.code === 'EHOSTUNREACH') {
        solution = 'Host não alcançável. Verifique se está na mesma rede.';
      } else if (error.code === 'ENETUNREACH') {
        solution = 'Rede não alcançável. Verifique as configurações de rede.';
      } else {
        solution = 'Verifique se a impressora está ligada, conectada à rede e se o IP está correto.';
      }
      
      resolve({
        success: false,
        error: error.message || 'Erro de conexão',
        errorCode: error.code,
        details: `Não foi possível conectar em ${ip}:${port}`,
        solution
      });
    });
    
    socket.on('timeout', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({
        success: false,
        error: 'Timeout de socket',
        details: 'A conexão foi estabelecida mas não houve resposta',
        solution: 'A impressora pode estar ocupada ou não suporta o protocolo'
      });
    });
    
    socket.on('close', () => {
      clearTimeout(timeout);
      if (!connected) {
        resolve({
          success: false,
          error: 'Conexão fechada',
          details: 'Não foi possível estabelecer conexão',
          solution: 'Verifique se a impressora está ligada e acessível'
        });
      }
    });
    
    // Tentar conectar
    try {
      socket.connect(port, ip);
    } catch (error: any) {
      clearTimeout(timeout);
      resolve({
        success: false,
        error: 'Erro ao iniciar conexão',
        details: error.message,
        solution: 'Erro interno. Tente novamente.'
      });
    }
  });
}

// Verificar porta específica rapidamente
async function quickPortCheck(ip: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 1000);
    
    socket.on('connect', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
    
    try {
      socket.connect(port, ip);
    } catch {
      clearTimeout(timeout);
      resolve(false);
    }
  });
}

export async function POST(request: Request) {
  try {
    const { ip, port = 9100 } = await request.json();
    
    if (!ip) {
      return NextResponse.json(
        { success: false, error: "IP é obrigatório" },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Testando conexão com ${ip}:${port}...`);
    
    // Primeiro fazer um teste rápido de porta
    const portOpen = await quickPortCheck(ip, port);
    
    if (!portOpen) {
      console.log(`❌ Porta ${port} fechada em ${ip}`);
      
      // Tentar outras portas comuns
      const alternativePorts = [9100, 515, 631, 3910];
      let foundPort = null;
      
      for (const altPort of alternativePorts) {
        if (altPort !== port && await quickPortCheck(ip, altPort)) {
          foundPort = altPort;
          break;
        }
      }
      
      if (foundPort) {
        return NextResponse.json({
          success: false,
          error: `Porta ${port} fechada, mas porta ${foundPort} está aberta`,
          suggestion: `Tente usar a porta ${foundPort} ao invés de ${port}`,
          alternativePort: foundPort
        });
      } else {
        return NextResponse.json({
          success: false,
          error: `Não foi possível conectar em ${ip}:${port}`,
          details: 'Nenhuma porta de impressora está respondendo neste IP',
          solution: 'Verifique se:\n1. A impressora está ligada\n2. O IP está correto\n3. A impressora está na mesma rede\n4. Não há firewall bloqueando',
          checkedPorts: alternativePorts
        });
      }
    }
    
    // Porta está aberta, fazer teste completo
    const result = await testTCPConnection(ip, port);
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('❌ Erro ao testar IP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Erro ao testar conexão",
        details: error.stack
      },
      { status: 500 }
    );
  }
}