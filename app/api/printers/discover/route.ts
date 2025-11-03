// API para descobrir impressoras na rede local e conectadas via USB/Serial
import { NextResponse } from "next/server";
import * as os from 'os';
import * as net from 'net';

// Portas comuns para impressoras térmicas e de rede
const THERMAL_PRINTER_PORTS = [
  9100,  // Porta padrão para impressoras térmicas de rede (RAW)
  515,   // LPR/LPD protocol
  631,   // IPP (Internet Printing Protocol)
  3910,  // Porta alternativa para impressoras térmicas
  9101,  // Porta alternativa
  9102,  // Porta alternativa
  9103,  // Porta alternativa
  4000,  // Algumas Epson
  6001,  // Algumas Bematech
  8000,  // Algumas Daruma
];

// Subnets comuns em redes domésticas e empresariais
const COMMON_SUBNETS = [
  '192.168.0.',
  '192.168.1.',
  '192.168.86.',  // Subnet específica do usuário
  '192.168.100.',
  '192.168.2.',
  '192.168.10.',
  '192.168.11.',
  '10.0.0.',
  '10.0.1.',
  '172.16.0.',
  '172.31.121.' // Subnet do Replit
];

// Verificar se um IP responde em uma porta específica
async function checkPort(ip: string, port: number, timeout: number = 300): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;
    
    const timeoutHandle = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(false);
      }
    }, timeout);
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutHandle);
        socket.destroy();
        resolve(true);
      }
    });
    
    socket.on('error', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutHandle);
        socket.destroy();
        resolve(false);
      }
    });
    
    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutHandle);
        socket.destroy();
        resolve(false);
      }
    });
    
    try {
      socket.connect(port, ip);
    } catch (error) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeoutHandle);
        resolve(false);
      }
    }
  });
}

// Obter informações da impressora via ESC/POS
async function getPrinterInfo(ip: string, port: number): Promise<any> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;
    
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve({ model: 'Impressora Térmica de Rede' });
      }
    }, 1500);
    
    socket.setTimeout(1500);
    
    socket.on('connect', () => {
      // Enviar comandos ESC/POS para identificação
      const commands = [
        Buffer.from([0x1D, 0x49, 0x01]), // GS I 1 - Printer ID
        Buffer.from([0x1D, 0x49, 0x02]), // GS I 2 - Printer type
        Buffer.from([0x1D, 0x49, 0x03]), // GS I 3 - ROM version
      ];
      
      commands.forEach(cmd => socket.write(cmd));
      
      // Aguardar resposta
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          socket.destroy();
          resolve({ model: 'Impressora Térmica ESC/POS' });
        }
      }, 500);
    });
    
    socket.on('data', (data: Buffer) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        socket.destroy();
        
        // Tentar identificar o modelo pela resposta
        const response = data.toString('utf8');
        let model = 'Impressora Térmica';
        
        if (response.includes('EPSON') || response.includes('TM-')) {
          model = 'Epson TM Series';
        } else if (response.includes('BEMATECH') || response.includes('MP-')) {
          model = 'Bematech MP Series';
        } else if (response.includes('ELGIN') || response.includes('I9')) {
          model = 'Elgin I Series';
        } else if (response.includes('DARUMA') || response.includes('DR')) {
          model = 'Daruma DR Series';
        } else if (response.includes('STAR') || response.includes('TSP')) {
          model = 'Star TSP Series';
        } else if (response.includes('CITIZEN')) {
          model = 'Citizen CT Series';
        } else if (response.includes('SWEDA')) {
          model = 'Sweda SI Series';
        } else if (response.includes('DIEBOLD')) {
          model = 'Diebold IM Series';
        } else if (response.includes('TANCA')) {
          model = 'Tanca TP Series';
        } else if (response.includes('JETWAY')) {
          model = 'Jetway JP Series';
        }
        
        resolve({ model, rawResponse: response });
      }
    });
    
    socket.on('error', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve({ model: 'Impressora de Rede' });
      }
    });
    
    socket.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        socket.destroy();
        resolve({ model: 'Impressora de Rede' });
      }
    });
    
    try {
      socket.connect(port, ip);
    } catch (error) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve({ model: 'Impressora de Rede' });
      }
    }
  });
}

// Obter subnets locais do sistema
function getLocalSubnets(): string[] {
  const interfaces = os.networkInterfaces();
  const subnets = new Set<string>();
  
  // Adicionar subnets do sistema
  for (const [name, addresses] of Object.entries(interfaces)) {
    if (!addresses) continue;
    
    for (const addr of addresses) {
      // Apenas IPv4 e não loopback
      if (addr.family === 'IPv4' && !addr.internal) {
        // Extrair subnet (primeiros 3 octetos)
        const parts = addr.address.split('.');
        if (parts.length === 4) {
          subnets.add(`${parts[0]}.${parts[1]}.${parts[2]}.`);
        }
      }
    }
  }
  
  // Sempre incluir subnets comuns
  COMMON_SUBNETS.forEach(subnet => subnets.add(subnet));
  
  return Array.from(subnets);
}

// Descobrir impressoras em uma subnet
async function scanSubnet(subnet: string, quickScan: boolean = false): Promise<any[]> {
  const foundPrinters: any[] = [];
  const promises: Promise<void>[] = [];
  
  console.log(`🔍 Escaneando subnet ${subnet}0/24...`);
  
  // Range de IPs para escanear
  let ipsToScan: number[] = [];
  
  if (quickScan) {
    // Quick scan: IPs comuns para impressoras
    ipsToScan = [1, 2, 10, 20, 30, 50, 100, 101, 102, 103, 110, 150, 190, 191, 192, 200, 250, 254];
  } else {
    // Full scan: todos os IPs
    for (let i = 1; i <= 254; i++) {
      ipsToScan.push(i);
    }
  }
  
  for (const i of ipsToScan) {
    const ip = `${subnet}${i}`;
    
    promises.push(
      (async () => {
        // Testar apenas porta 9100 primeiro (mais comum)
        const isOpen9100 = await checkPort(ip, 9100, quickScan ? 150 : 250);
        if (isOpen9100) {
          console.log(`✅ Impressora encontrada em ${ip}:9100`);
          
          // Tentar obter informações da impressora
          const info = await getPrinterInfo(ip, 9100);
          
          foundPrinters.push({
            ip,
            port: 9100,
            name: `Impressora ${ip}`,
            model: info?.model || 'Impressora Térmica',
            type: 'network',
            status: 'online',
            protocol: 'RAW',
            discovered: true
          });
        } else if (!quickScan) {
          // Se não for quick scan, testar outras portas
          for (const port of [515, 631, 3910]) {
            const isOpen = await checkPort(ip, port, 150);
            if (isOpen) {
              console.log(`✅ Impressora encontrada em ${ip}:${port}`);
              
              foundPrinters.push({
                ip,
                port,
                name: `Impressora ${ip}`,
                model: `Impressora de Rede (Porta ${port})`,
                type: 'network',
                status: 'online',
                protocol: port === 515 ? 'LPR' : port === 631 ? 'IPP' : 'RAW',
                discovered: true
              });
              break;
            }
          }
        }
      })()
    );
    
    // Limitar concorrência para não sobrecarregar
    if (promises.length >= 30) {
      await Promise.all(promises);
      promises.length = 0;
    }
  }
  
  // Aguardar verificações restantes
  await Promise.all(promises);
  
  return foundPrinters;
}

// Verificar IP específico
async function checkSpecificIP(ip: string, ports?: number[]): Promise<any[]> {
  const portsToCheck = ports || THERMAL_PRINTER_PORTS;
  const foundPrinters: any[] = [];
  
  console.log(`🔍 Verificando IP específico: ${ip}`);
  
  for (const port of portsToCheck) {
    const isOpen = await checkPort(ip, port, 500);
    if (isOpen) {
      console.log(`✅ Impressora encontrada em ${ip}:${port}`);
      
      const info = await getPrinterInfo(ip, port);
      
      foundPrinters.push({
        ip,
        port,
        name: `Impressora ${ip}:${port}`,
        model: info?.model || 'Impressora de Rede',
        type: 'network',
        status: 'online',
        protocol: port === 9100 ? 'RAW' : port === 515 ? 'LPR' : port === 631 ? 'IPP' : 'RAW',
        discovered: true
      });
    }
  }
  
  if (foundPrinters.length === 0) {
    console.log(`❌ Nenhuma impressora encontrada em ${ip}`);
  }
  
  return foundPrinters;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const quickScan = url.searchParams.get('quick') === 'true';
    const scanType = url.searchParams.get('type') || 'all';
    const targetSubnet = url.searchParams.get('subnet'); // Permitir especificar subnet
    const targetIP = url.searchParams.get('ip'); // Permitir especificar IP
    
    console.log(`🔍 Iniciando descoberta de impressoras (${quickScan ? 'rápida' : 'completa'})...`);
    
    const allFoundPrinters: any[] = [];
    
    // Se um IP específico foi fornecido, verificar apenas ele
    if (targetIP) {
      const printers = await checkSpecificIP(targetIP);
      allFoundPrinters.push(...printers);
    } else {
      // Descobrir impressoras de rede
      if (scanType === 'all' || scanType === 'network') {
        let subnetsToScan: string[] = [];
        
        if (targetSubnet) {
          // Usar subnet específica fornecida
          subnetsToScan = [targetSubnet];
        } else {
          // Usar todas as subnets conhecidas
          subnetsToScan = getLocalSubnets();
        }
        
        console.log(`📡 Subnets a escanear: ${subnetsToScan.join(', ')}`);
        
        // Priorizar subnets comuns
        const prioritySubnets = ['192.168.86.', '192.168.1.', '192.168.0.'];
        
        for (const subnet of prioritySubnets) {
          if (subnetsToScan.includes(subnet)) {
            const printers = await scanSubnet(subnet, quickScan);
            allFoundPrinters.push(...printers);
          }
        }
        
        // Escanear outras subnets
        for (const subnet of subnetsToScan) {
          if (!prioritySubnets.includes(subnet)) {
            const printers = await scanSubnet(subnet, quickScan);
            allFoundPrinters.push(...printers);
          }
        }
      }
    }
    
    // Remover duplicatas por IP
    const uniquePrinters = allFoundPrinters.reduce((acc: any[], printer) => {
      if (!acc.find(p => p.ip === printer.ip && p.port === printer.port)) {
        acc.push(printer);
      }
      return acc;
    }, []);
    
    console.log(`✅ Descoberta concluída. ${uniquePrinters.length} impressoras encontradas`);
    
    return NextResponse.json({
      success: true,
      discovered: uniquePrinters.length,
      network: uniquePrinters.filter(p => p.type === 'network').length,
      local: uniquePrinters.filter(p => p.type === 'local').length,
      printers: uniquePrinters,
      subnets: targetSubnet ? [targetSubnet] : getLocalSubnets(),
      scanType,
      quickScan
    });
    
  } catch (error: any) {
    console.error('❌ Erro na descoberta de impressoras:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Erro ao descobrir impressoras",
        details: error.stack
      },
      { status: 500 }
    );
  }
}

// POST para escanear um IP específico
export async function POST(request: Request) {
  try {
    const { ip, ports } = await request.json();
    
    if (!ip) {
      return NextResponse.json(
        { success: false, error: "IP é obrigatório" },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Verificando IP específico: ${ip}`);
    
    const foundPrinters = await checkSpecificIP(ip, ports);
    
    return NextResponse.json({
      success: true,
      found: foundPrinters.length > 0,
      printers: foundPrinters,
      message: foundPrinters.length > 0 
        ? `✅ ${foundPrinters.length} impressora(s) encontrada(s) em ${ip}`
        : `❌ Nenhuma impressora encontrada em ${ip}. Verifique se está ligada e na mesma rede.`
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao escanear IP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Erro ao escanear IP"
      },
      { status: 500 }
    );
  }
}