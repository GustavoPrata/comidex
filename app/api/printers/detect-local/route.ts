import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

const execAsync = promisify(exec);

// Função para detectar impressoras no Windows usando WMIC
async function detectWindowsPrinters() {
  try {
    console.log('🖨️ Detectando impressoras Windows com WMIC...');
    
    // Comando WMIC para obter informações detalhadas das impressoras
    const { stdout } = await execAsync('wmic printer get name,portname,drivername,status /format:csv');
    
    // Parsear saída CSV do WMIC
    const lines = stdout.split('\n').filter(line => line.trim());
    const headers = lines[1]?.split(',').map(h => h.trim());
    const printers = [];
    
    for (let i = 2; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length > 1 && values[1]) { // Verificar se tem nome
        const printer: any = {};
        headers?.forEach((header, index) => {
          printer[header.toLowerCase()] = values[index] || '';
        });
        
        // Adicionar informações úteis
        if (printer.name) {
          printers.push({
            name: printer.name,
            port: printer.portname || 'USB',
            driver: printer.drivername || 'Unknown',
            status: printer.status || 'Ready',
            type: detectPrinterType(printer.name, printer.drivername),
            os: 'Windows',
            detected_via: 'WMIC'
          });
        }
      }
    }
    
    console.log(`✅ ${printers.length} impressoras encontradas no Windows`);
    return printers;
  } catch (error: any) {
    console.error('❌ Erro ao detectar impressoras Windows:', error.message);
    throw error;
  }
}

// Função para detectar impressoras no Linux
async function detectLinuxPrinters() {
  try {
    console.log('🖨️ Detectando impressoras Linux com lpstat...');
    
    // Tentar usar lpstat (CUPS)
    const { stdout } = await execAsync('lpstat -p -d');
    const lines = stdout.split('\n').filter(line => line.trim());
    const printers = [];
    
    for (const line of lines) {
      if (line.startsWith('printer')) {
        const match = line.match(/printer\s+(\S+)/);
        if (match) {
          const printerName = match[1];
          
          // Tentar obter mais informações
          let printerInfo: any = {
            name: printerName,
            status: line.includes('enabled') ? 'Ready' : 'Offline',
            os: 'Linux',
            detected_via: 'CUPS'
          };
          
          // Tentar obter informações adicionais
          try {
            const { stdout: info } = await execAsync(`lpstat -l -p ${printerName}`);
            if (info.includes('USB')) printerInfo.port = 'USB';
            if (info.includes('network')) printerInfo.port = 'Network';
            printerInfo.type = detectPrinterType(printerName, info);
          } catch {}
          
          printers.push(printerInfo);
        }
      }
    }
    
    console.log(`✅ ${printers.length} impressoras encontradas no Linux`);
    return printers;
  } catch (error: any) {
    console.error('❌ Erro ao detectar impressoras Linux:', error.message);
    return [];
  }
}

// Função para detectar impressoras no macOS
async function detectMacPrinters() {
  try {
    console.log('🖨️ Detectando impressoras macOS...');
    
    // Usar lpstat no macOS (similar ao Linux)
    const { stdout } = await execAsync('lpstat -p');
    const lines = stdout.split('\n').filter(line => line.trim());
    const printers = [];
    
    for (const line of lines) {
      if (line.startsWith('printer')) {
        const match = line.match(/printer\s+(\S+)/);
        if (match) {
          printers.push({
            name: match[1],
            status: line.includes('enabled') ? 'Ready' : 'Offline',
            os: 'macOS',
            detected_via: 'CUPS'
          });
        }
      }
    }
    
    // Tentar também o comando system_profiler para mais detalhes
    try {
      const { stdout: spOutput } = await execAsync('system_profiler SPPrintersDataType -json');
      const data = JSON.parse(spOutput);
      // Processar dados do system_profiler se disponível
      if (data.SPPrintersDataType) {
        for (const printer of data.SPPrintersDataType) {
          const existing = printers.find(p => p.name === printer._name);
          if (existing) {
            existing.driver = printer.driver_version;
            existing.port = printer.uri || 'Unknown';
            existing.type = detectPrinterType(printer._name, printer.driver_version);
          } else {
            printers.push({
              name: printer._name,
              driver: printer.driver_version,
              port: printer.uri || 'Unknown',
              status: printer.printer_status || 'Unknown',
              type: detectPrinterType(printer._name, printer.driver_version),
              os: 'macOS',
              detected_via: 'system_profiler'
            });
          }
        }
      }
    } catch {}
    
    console.log(`✅ ${printers.length} impressoras encontradas no macOS`);
    return printers;
  } catch (error: any) {
    console.error('❌ Erro ao detectar impressoras macOS:', error.message);
    return [];
  }
}

// Função auxiliar para detectar tipo de impressora
function detectPrinterType(name: string, driver: string): string {
  const nameLower = name.toLowerCase();
  const driverLower = driver.toLowerCase();
  
  // Verificar se é térmica
  if (nameLower.includes('thermal') || driverLower.includes('thermal') ||
      nameLower.includes('pos') || driverLower.includes('pos') ||
      nameLower.includes('receipt') || driverLower.includes('receipt') ||
      nameLower.includes('epson tm') || nameLower.includes('bematech') ||
      nameLower.includes('elgin') || nameLower.includes('daruma') ||
      nameLower.includes('tanca') || nameLower.includes('sweda')) {
    return 'thermal';
  }
  
  // Verificar se é PDF/Virtual
  if (nameLower.includes('pdf') || nameLower.includes('xps') ||
      nameLower.includes('onenote') || nameLower.includes('fax') ||
      nameLower.includes('virtual') || nameLower.includes('print to file')) {
    return 'virtual';
  }
  
  // Verificar se é laser
  if (nameLower.includes('laser') || nameLower.includes('laserjet') ||
      driverLower.includes('laser')) {
    return 'laser';
  }
  
  // Verificar se é jato de tinta
  if (nameLower.includes('inkjet') || nameLower.includes('deskjet') ||
      nameLower.includes('officejet') || driverLower.includes('inkjet')) {
    return 'inkjet';
  }
  
  // Verificar se é matricial
  if (nameLower.includes('dot matrix') || nameLower.includes('matricial') ||
      nameLower.includes('lx-') || nameLower.includes('fx-')) {
    return 'dot-matrix';
  }
  
  return 'unknown';
}

// GET /api/printers/detect-local
export async function GET() {
  try {
    const platform = os.platform();
    console.log(`🖥️ Sistema operacional detectado: ${platform}`);
    
    let printers: any[] = [];
    let error = null;
    
    switch (platform) {
      case 'win32':
        try {
          printers = await detectWindowsPrinters();
        } catch (e: any) {
          error = `Windows: ${e.message}`;
        }
        break;
        
      case 'linux':
        try {
          printers = await detectLinuxPrinters();
        } catch (e: any) {
          error = `Linux: ${e.message}`;
        }
        break;
        
      case 'darwin':
        try {
          printers = await detectMacPrinters();
        } catch (e: any) {
          error = `macOS: ${e.message}`;
        }
        break;
        
      default:
        error = `Sistema operacional não suportado: ${platform}`;
    }
    
    // Adicionar informações extras
    const response = {
      success: !error || printers.length > 0,
      platform,
      hostname: os.hostname(),
      printers,
      count: printers.length,
      error,
      timestamp: new Date().toISOString(),
      message: printers.length > 0 
        ? `${printers.length} impressora(s) encontrada(s)`
        : error || 'Nenhuma impressora encontrada'
    };
    
    // Se encontrou impressoras, filtrar as térmicas
    if (printers.length > 0) {
      const thermalPrinters = printers.filter(p => p.type === 'thermal');
      if (thermalPrinters.length > 0) {
        response.message += ` (${thermalPrinters.length} térmica(s))`;
      }
    }
    
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('❌ Erro na detecção de impressoras:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao detectar impressoras',
      platform: os.platform(),
      hostname: os.hostname(),
      printers: [],
      count: 0
    }, { status: 500 });
  }
}

// POST /api/printers/detect-local - Detectar e testar impressora específica
export async function POST(request: Request) {
  try {
    const { printerName } = await request.json();
    
    if (!printerName) {
      return NextResponse.json({
        success: false,
        error: 'Nome da impressora é obrigatório'
      }, { status: 400 });
    }
    
    const platform = os.platform();
    console.log(`🖨️ Testando impressora "${printerName}" no ${platform}...`);
    
    // Comando para enviar teste de impressão
    let command = '';
    
    switch (platform) {
      case 'win32':
        // No Windows, podemos usar print ou PowerShell
        command = `powershell -Command "Out-Printer -Name '${printerName}' -InputObject 'TESTE COMIDEX - ${new Date().toLocaleString('pt-BR')}'"`;
        break;
        
      case 'linux':
      case 'darwin':
        // No Linux/Mac, usar lp
        command = `echo "TESTE COMIDEX - ${new Date().toLocaleString('pt-BR')}" | lp -d "${printerName}"`;
        break;
        
      default:
        return NextResponse.json({
          success: false,
          error: `Sistema não suportado: ${platform}`
        }, { status: 400 });
    }
    
    const { stdout, stderr } = await execAsync(command);
    
    return NextResponse.json({
      success: !stderr,
      message: stderr ? `Erro: ${stderr}` : 'Teste enviado com sucesso',
      printerName,
      platform,
      output: stdout || 'Comando executado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro ao testar impressora:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao testar impressora'
    }, { status: 500 });
  }
}