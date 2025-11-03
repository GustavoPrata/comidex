// Serviço de impressão térmica com comandos ESC/POS
import net from 'net';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Comandos ESC/POS básicos
const ESC_POS = {
  // Inicialização
  INIT: Buffer.from([0x1b, 0x40]), // ESC @ - Initialize printer
  
  // Corte de papel
  CUT_PARTIAL: Buffer.from([0x1d, 0x56, 0x01]), // GS V 1
  CUT_FULL: Buffer.from([0x1d, 0x56, 0x00]),    // GS V 0
  
  // Alinhamento
  ALIGN_LEFT: Buffer.from([0x1b, 0x61, 0x00]),   // ESC a 0
  ALIGN_CENTER: Buffer.from([0x1b, 0x61, 0x01]), // ESC a 1
  ALIGN_RIGHT: Buffer.from([0x1b, 0x61, 0x02]),  // ESC a 2
  
  // Tamanho do texto
  TEXT_NORMAL: Buffer.from([0x1b, 0x21, 0x00]),  // ESC ! 0
  TEXT_DOUBLE_HEIGHT: Buffer.from([0x1b, 0x21, 0x10]), // ESC ! 16
  TEXT_DOUBLE_WIDTH: Buffer.from([0x1b, 0x21, 0x20]),  // ESC ! 32
  TEXT_DOUBLE: Buffer.from([0x1b, 0x21, 0x30]),        // ESC ! 48
  
  // Negrito
  BOLD_ON: Buffer.from([0x1b, 0x45, 0x01]),  // ESC E 1
  BOLD_OFF: Buffer.from([0x1b, 0x45, 0x00]), // ESC E 0
  
  // Linha em branco
  LINE_FEED: Buffer.from([0x0a]), // LF
  
  // Beep
  BEEP: Buffer.from([0x1b, 0x42, 0x05, 0x09]), // ESC B 5 9
  
  // Abertura de gaveta
  DRAWER_OPEN: Buffer.from([0x1b, 0x70, 0x00, 0x19, 0x19]), // ESC p 0 25 25
};

export class ThermalPrinterService {
  // Detectar impressoras no sistema
  async detectPrinters(): Promise<string[]> {
    const printers: string[] = [];
    
    try {
      // No Linux, verificar impressoras USB
      const { stdout } = await execAsync('ls /dev/usb/lp* 2>/dev/null || true');
      if (stdout) {
        printers.push(...stdout.trim().split('\n').filter(Boolean));
      }
      
      // Verificar portas seriais
      const { stdout: serial } = await execAsync('ls /dev/ttyUSB* /dev/ttyS* 2>/dev/null || true');
      if (serial) {
        printers.push(...serial.trim().split('\n').filter(Boolean));
      }
    } catch (error) {
      console.error('Erro ao detectar impressoras:', error);
    }
    
    return printers;
  }
  
  // Enviar dados para impressora via rede
  async printToNetwork(ip: string, port: number, data: Buffer): Promise<boolean> {
    return new Promise((resolve) => {
      const client = new net.Socket();
      
      const timeout = setTimeout(() => {
        client.destroy();
        resolve(false);
      }, 5000); // 5 segundos de timeout
      
      client.connect(port, ip, () => {
        clearTimeout(timeout);
        client.write(data);
        client.end();
      });
      
      client.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
      
      client.on('close', () => {
        clearTimeout(timeout);
        resolve(true);
      });
    });
  }
  
  // Criar comando de teste de impressão
  createTestPrint(): Buffer {
    const commands: Buffer[] = [];
    
    // Inicializar impressora
    commands.push(ESC_POS.INIT);
    
    // Cabeçalho centralizado e grande
    commands.push(ESC_POS.ALIGN_CENTER);
    commands.push(ESC_POS.TEXT_DOUBLE);
    commands.push(Buffer.from('TESTE DE IMPRESSAO\n'));
    commands.push(ESC_POS.TEXT_NORMAL);
    commands.push(ESC_POS.LINE_FEED);
    
    // Informações do sistema
    commands.push(ESC_POS.ALIGN_LEFT);
    commands.push(Buffer.from(`Data/Hora: ${new Date().toLocaleString('pt-BR')}\n`));
    commands.push(Buffer.from('Sistema: ComideX Restaurant\n'));
    commands.push(ESC_POS.LINE_FEED);
    
    // Linha separadora
    commands.push(Buffer.from('================================\n'));
    
    // Teste de caracteres
    commands.push(ESC_POS.BOLD_ON);
    commands.push(Buffer.from('TESTE DE CARACTERES:\n'));
    commands.push(ESC_POS.BOLD_OFF);
    commands.push(Buffer.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ\n'));
    commands.push(Buffer.from('abcdefghijklmnopqrstuvwxyz\n'));
    commands.push(Buffer.from('0123456789\n'));
    commands.push(Buffer.from('!@#$%^&*()_+-=[]{}|;:,.<>?\n'));
    commands.push(ESC_POS.LINE_FEED);
    
    // Teste de alinhamento
    commands.push(Buffer.from('================================\n'));
    commands.push(ESC_POS.ALIGN_LEFT);
    commands.push(Buffer.from('Alinhado a esquerda\n'));
    commands.push(ESC_POS.ALIGN_CENTER);
    commands.push(Buffer.from('Centralizado\n'));
    commands.push(ESC_POS.ALIGN_RIGHT);
    commands.push(Buffer.from('Alinhado a direita\n'));
    commands.push(ESC_POS.ALIGN_LEFT);
    commands.push(ESC_POS.LINE_FEED);
    
    // Teste de tamanhos
    commands.push(Buffer.from('================================\n'));
    commands.push(ESC_POS.TEXT_NORMAL);
    commands.push(Buffer.from('Texto normal\n'));
    commands.push(ESC_POS.TEXT_DOUBLE_HEIGHT);
    commands.push(Buffer.from('Altura dupla\n'));
    commands.push(ESC_POS.TEXT_DOUBLE_WIDTH);
    commands.push(Buffer.from('Largura dupla\n'));
    commands.push(ESC_POS.TEXT_DOUBLE);
    commands.push(Buffer.from('Duplo\n'));
    commands.push(ESC_POS.TEXT_NORMAL);
    commands.push(ESC_POS.LINE_FEED);
    
    // Rodapé
    commands.push(Buffer.from('================================\n'));
    commands.push(ESC_POS.ALIGN_CENTER);
    commands.push(Buffer.from('Impressao de teste concluida!\n'));
    commands.push(Buffer.from('Se voce pode ler isso,\n'));
    commands.push(Buffer.from('a impressora esta funcionando.\n'));
    commands.push(ESC_POS.LINE_FEED);
    commands.push(ESC_POS.LINE_FEED);
    
    // Beep e corte
    commands.push(ESC_POS.BEEP);
    commands.push(ESC_POS.CUT_PARTIAL);
    
    return Buffer.concat(commands);
  }
  
  // Criar comando de pedido
  createOrderPrint(order: any): Buffer {
    const commands: Buffer[] = [];
    
    // Inicializar
    commands.push(ESC_POS.INIT);
    
    // Cabeçalho
    commands.push(ESC_POS.ALIGN_CENTER);
    commands.push(ESC_POS.TEXT_DOUBLE);
    commands.push(Buffer.from('COMIDEX RESTAURANT\n'));
    commands.push(ESC_POS.TEXT_NORMAL);
    commands.push(Buffer.from('Culinaria Japonesa\n'));
    commands.push(ESC_POS.LINE_FEED);
    
    // Informações do pedido
    commands.push(ESC_POS.ALIGN_LEFT);
    commands.push(ESC_POS.BOLD_ON);
    commands.push(Buffer.from(`PEDIDO #${order.id}\n`));
    commands.push(ESC_POS.BOLD_OFF);
    commands.push(Buffer.from(`Mesa: ${order.table}\n`));
    commands.push(Buffer.from(`Data: ${new Date().toLocaleString('pt-BR')}\n`));
    commands.push(ESC_POS.LINE_FEED);
    
    // Itens
    commands.push(Buffer.from('================================\n'));
    commands.push(ESC_POS.BOLD_ON);
    commands.push(Buffer.from('ITENS DO PEDIDO:\n'));
    commands.push(ESC_POS.BOLD_OFF);
    
    order.items?.forEach((item: any) => {
      commands.push(Buffer.from(`${item.quantity}x ${item.name}\n`));
      if (item.observations) {
        commands.push(Buffer.from(`   OBS: ${item.observations}\n`));
      }
    });
    
    // Total
    commands.push(ESC_POS.LINE_FEED);
    commands.push(Buffer.from('================================\n'));
    commands.push(ESC_POS.TEXT_DOUBLE_HEIGHT);
    commands.push(Buffer.from(`TOTAL: R$ ${order.total || '0,00'}\n`));
    commands.push(ESC_POS.TEXT_NORMAL);
    
    // Rodapé
    commands.push(ESC_POS.LINE_FEED);
    commands.push(ESC_POS.ALIGN_CENTER);
    commands.push(Buffer.from('Obrigado pela preferencia!\n'));
    commands.push(ESC_POS.LINE_FEED);
    commands.push(ESC_POS.LINE_FEED);
    
    // Corte
    commands.push(ESC_POS.CUT_PARTIAL);
    
    return Buffer.concat(commands);
  }
  
  // Testar conectividade com impressora
  async testPrinterConnection(ip: string, port: number = 9100): Promise<boolean> {
    return new Promise((resolve) => {
      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        resolve(false);
      }, 2000);
      
      client.connect(port, ip, () => {
        clearTimeout(timeout);
        client.end();
        resolve(true);
      });
      
      client.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }
}

export const printerService = new ThermalPrinterService();