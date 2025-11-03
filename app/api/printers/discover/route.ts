// API para descobrir impressoras na rede local e conectadas via USB/Serial
import { NextResponse } from "next/server";
import * as os from 'os';

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

// Verificar se um IP responde em uma porta específica
async function checkPort(ip: string, port: number, timeout: number = 200): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    const timeoutHandle = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, timeout);
    
    socket.connect(port, ip, () => {
      clearTimeout(timeoutHandle);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      clearTimeout(timeoutHandle);
      socket.destroy();
      resolve(false);
    });
  });
}

// Obter informações da impressora via ESC/POS
async function getPrinterInfo(ip: string, port: number): Promise<any> {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(null);
    }, 1000);
    
    socket.connect(port, ip, () => {
      // Enviar comando de status ESC/POS
      const statusCommand = Buffer.from([0x1D, 0x49, 0x01]); // GS I n - Get printer information
      socket.write(statusCommand);
      
      socket.on('data', (data: Buffer) => {
        clearTimeout(timeout);
        socket.destroy();
        
        // Tentar identificar o modelo pela resposta
        const response = data.toString('utf8');
        let model = 'Impressora Térmica';
        
        if (response.includes('EPSON')) model = 'Epson TM Series';
        else if (response.includes('BEMATECH')) model = 'Bematech MP Series';
        else if (response.includes('ELGIN')) model = 'Elgin I Series';
        else if (response.includes('DARUMA')) model = 'Daruma DR Series';
        else if (response.includes('STAR')) model = 'Star TSP Series';
        else if (response.includes('CITIZEN')) model = 'Citizen CT Series';
        else if (response.includes('SWEDA')) model = 'Sweda SI Series';
        else if (response.includes('DIEBOLD')) model = 'Diebold IM Series';
        
        resolve({ model, rawResponse: response });
      });
      
      setTimeout(() => {
        // Se não receber resposta, fechar
        clearTimeout(timeout);
        socket.destroy();
        resolve({ model: 'Impressora de Rede (ESC/POS)' });
      }, 500);
    });
    
    socket.on('error', () => {
      clearTimeout(timeout);
      resolve({ model: 'Impressora de Rede' });
    });
  });
}

// Obter subnets locais do sistema
function getLocalSubnets(): string[] {
  const interfaces = os.networkInterfaces();
  const subnets = new Set<string>();
  
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
  
  // Adicionar subnets comuns caso não encontre nenhuma
  if (subnets.size === 0) {
    subnets.add('192.168.1.');
    subnets.add('192.168.0.');
    subnets.add('10.0.0.');
  }
  
  return Array.from(subnets);
}

// Descobrir impressoras em uma subnet
async function scanSubnet(subnet: string, quickScan: boolean = false): Promise<any[]> {
  const foundPrinters: any[] = [];
  const promises: Promise<void>[] = [];
  
  console.log(`🔍 Escaneando subnet ${subnet}0/24...`);
  
  // Range de IPs para escanear
  const startIP = quickScan ? 1 : 1;
  const endIP = quickScan ? 50 : 254; // Quick scan: apenas primeiros 50 IPs
  
  for (let i = startIP; i <= endIP; i++) {
    const ip = `${subnet}${i}`;
    
    promises.push(
      (async () => {
        // Testar portas mais comuns primeiro
        for (const port of THERMAL_PRINTER_PORTS) {
          try {
            const isOpen = await checkPort(ip, port, quickScan ? 100 : 200);
            if (isOpen) {
              console.log(`✅ Impressora encontrada em ${ip}:${port}`);
              
              // Tentar obter informações da impressora
              const info = await getPrinterInfo(ip, port);
              
              foundPrinters.push({
                ip,
                port,
                name: `Impressora ${ip}`,
                model: info?.model || `Impressora de Rede (Porta ${port})`,
                type: port === 9100 ? 'network' : 'network',
                status: 'online',
                protocol: port === 9100 ? 'RAW' : port === 515 ? 'LPR' : port === 631 ? 'IPP' : 'RAW'
              });
              
              break; // Encontrou em uma porta, não precisa testar outras
            }
          } catch (error) {
            // Ignorar erros de conexão
          }
        }
      })()
    );
    
    // Limitar concorrência para não sobrecarregar a rede
    if (promises.length >= 20) {
      await Promise.all(promises);
      promises.length = 0;
    }
  }
  
  // Aguardar verificações restantes
  await Promise.all(promises);
  
  return foundPrinters;
}

// Descobrir impressoras USB/Serial locais (simulado para web)
function getLocalPrinters(): any[] {
  // Em um ambiente web, não temos acesso direto a portas USB/Serial
  // Mas podemos listar portas comuns onde impressoras locais podem estar
  const localPrinters: any[] = [];
  
  // Verificar portas COM virtuais comuns (Windows)
  const commonPorts = [
    { path: 'COM1', name: 'Porta Serial COM1' },
    { path: 'COM2', name: 'Porta Serial COM2' },
    { path: 'COM3', name: 'Porta Serial COM3' },
    { path: 'COM4', name: 'Porta Serial COM4' },
    { path: 'COM5', name: 'USB Serial COM5' },
    { path: 'COM6', name: 'USB Serial COM6' },
    { path: '/dev/ttyUSB0', name: 'USB Serial Linux' },
    { path: '/dev/ttyUSB1', name: 'USB Serial Linux' },
    { path: '/dev/usb/lp0', name: 'USB Printer Linux' },
    { path: '/dev/usb/lp1', name: 'USB Printer Linux' },
  ];
  
  // Nota: Em produção, você precisaria usar uma biblioteca específica
  // para detectar portas seriais reais, como 'serialport'
  
  return localPrinters;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const quickScan = url.searchParams.get('quick') === 'true';
    const scanType = url.searchParams.get('type') || 'all'; // all, network, local
    
    console.log(`🔍 Iniciando descoberta de impressoras (${quickScan ? 'rápida' : 'completa'})...`);
    
    const allFoundPrinters: any[] = [];
    
    // Descobrir impressoras de rede
    if (scanType === 'all' || scanType === 'network') {
      const subnets = getLocalSubnets();
      console.log(`📡 Subnets detectadas: ${subnets.join(', ')}`);
      
      for (const subnet of subnets) {
        const printers = await scanSubnet(subnet, quickScan);
        allFoundPrinters.push(...printers);
      }
    }
    
    // Descobrir impressoras locais (USB/Serial)
    if (scanType === 'all' || scanType === 'local') {
      const localPrinters = getLocalPrinters();
      allFoundPrinters.push(...localPrinters);
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
      subnets: scanType !== 'local' ? getLocalSubnets() : [],
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
    
    const portsToScan = ports || THERMAL_PRINTER_PORTS;
    const foundPrinters: any[] = [];
    
    console.log(`🔍 Escaneando IP específico: ${ip}`);
    
    for (const port of portsToScan) {
      const isOpen = await checkPort(ip, port, 500);
      if (isOpen) {
        const info = await getPrinterInfo(ip, port);
        
        foundPrinters.push({
          ip,
          port,
          name: `Impressora ${ip}:${port}`,
          model: info?.model || `Impressora de Rede`,
          type: 'network',
          status: 'online',
          protocol: port === 9100 ? 'RAW' : port === 515 ? 'LPR' : port === 631 ? 'IPP' : 'RAW'
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      found: foundPrinters.length > 0,
      printers: foundPrinters
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