// API para descobrir impressoras na rede local
import { NextResponse } from "next/server";

// IPs e portas comuns para impressoras térmicas
const COMMON_PRINTER_PORTS = [9100, 515, 631, 3910];
const COMMON_PRINTER_IPS = [
  '192.168.1.', '192.168.0.', '10.0.0.', '172.16.0.'
];

// Verificar se um IP responde em uma porta específica
async function checkPort(ip: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    const timeout = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 500); // 500ms timeout para cada tentativa
    
    socket.connect(port, ip, () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

// Descobrir impressoras na rede
async function discoverPrinters(subnet: string): Promise<any[]> {
  const foundPrinters: any[] = [];
  const promises: Promise<void>[] = [];
  
  // Varrer IPs comuns (últimos 20 IPs da subnet)
  for (let i = 100; i <= 120; i++) {
    const ip = `${subnet}${i}`;
    
    promises.push(
      (async () => {
        for (const port of COMMON_PRINTER_PORTS) {
          const isOpen = await checkPort(ip, port);
          if (isOpen) {
            foundPrinters.push({
              ip,
              port,
              name: `Impressora em ${ip}`,
              model: 'Detectada Automaticamente',
              status: 'online'
            });
            break; // Encontrou em uma porta, não precisa testar outras
          }
        }
      })()
    );
  }
  
  // Aguardar todas as verificações
  await Promise.all(promises);
  
  return foundPrinters;
}

export async function GET(request: Request) {
  try {
    console.log('🔍 Iniciando descoberta de impressoras na rede...');
    
    const allFoundPrinters: any[] = [];
    
    // Tentar descobrir em subnets comuns
    for (const subnet of COMMON_PRINTER_IPS) {
      const printers = await discoverPrinters(subnet);
      allFoundPrinters.push(...printers);
    }
    
    // Adicionar impressoras conhecidas (para teste)
    const knownPrinters = [
      {
        ip: '192.168.1.101',
        port: 9100,
        name: 'Virtual Cozinha',
        model: 'Bematech MP-4200 TH',
        status: 'virtual',
        isVirtual: true
      },
      {
        ip: '192.168.1.102',
        port: 9100,
        name: 'Virtual Bar',
        model: 'Bematech MP-4200 TH',
        status: 'virtual',
        isVirtual: true
      },
      {
        ip: '192.168.1.103',
        port: 9100,
        name: 'Virtual Caixa',
        model: 'Bematech MP-4200 TH',
        status: 'virtual',
        isVirtual: true
      },
      {
        ip: '192.168.1.104',
        port: 9100,
        name: 'Virtual Sushi Bar',
        model: 'Bematech MP-4200 TH',
        status: 'virtual',
        isVirtual: true
      }
    ];
    
    // Combinar impressoras descobertas com as conhecidas
    const allPrinters = [...allFoundPrinters, ...knownPrinters];
    
    console.log(`✅ Descoberta concluída. ${allFoundPrinters.length} impressoras reais encontradas`);
    
    return NextResponse.json({
      success: true,
      discovered: allFoundPrinters.length,
      virtual: knownPrinters.length,
      total: allPrinters.length,
      printers: allPrinters
    });
    
  } catch (error: any) {
    console.error('❌ Erro na descoberta de impressoras:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Erro ao descobrir impressoras"
      },
      { status: 500 }
    );
  }
}