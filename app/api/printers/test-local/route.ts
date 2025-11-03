import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

// Função para criar arquivo temporário com conteúdo de teste
async function createTestFile(printerName: string): Promise<string> {
  const tempDir = os.tmpdir();
  const fileName = `comidex-test-${Date.now()}.txt`;
  const filePath = path.join(tempDir, fileName);
  
  const content = `
=====================================
         COMIDEX RESTAURANT
         TESTE DE IMPRESSÃO
=====================================

Data/Hora: ${new Date().toLocaleString('pt-BR')}
Impressora: ${printerName}
Sistema: ${os.platform()}
Versão Node: ${process.version}

-------------------------------------
TESTE DE CARACTERES:
-------------------------------------
ABCDEFGHIJKLMNOPQRSTUVWXYZ
abcdefghijklmnopqrstuvwxyz
0123456789
!@#$%^&*()_+-=[]{}|;:,.<>?

-------------------------------------
TESTE DE ACENTUAÇÃO:
-------------------------------------
áéíóú ÁÉÍÓÚ àèìòù ÀÈÌÒÙ
âêîôû ÂÊÎÔÛ ãõ ÃÕ ç Ç

-------------------------------------
TESTE DE ALINHAMENTO:
-------------------------------------
[ESQUERDA] Item 1............R$ 10,00
[CENTRO]   Item 2............R$ 20,00
[DIREITA]  Item 3............R$ 30,00
-------------------------------------
           TOTAL.............R$ 60,00
=====================================

✅ TESTE CONCLUÍDO COM SUCESSO!
   Impressora funcionando corretamente

=====================================
`;
  
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

// Função para sanitizar nome da impressora (prevenir command injection)
function sanitizePrinterName(name: string): string {
  // Remove caracteres perigosos que podem causar command injection
  // Permite apenas letras, números, espaços, hífen, underscore e ponto
  return name.replace(/[^a-zA-Z0-9\s\-_\.]/g, '');
}

// POST /api/printers/test-local
export async function POST(request: Request) {
  try {
    const { printerName, printerData } = await request.json();
    
    if (!printerName) {
      return NextResponse.json({
        success: false,
        error: 'Nome da impressora é obrigatório'
      }, { status: 400 });
    }
    
    // Sanitizar nome da impressora para prevenir command injection
    const safePrinterName = sanitizePrinterName(printerName);
    
    if (safePrinterName !== printerName) {
      console.warn(`⚠️ Nome da impressora sanitizado: "${printerName}" -> "${safePrinterName}"`);
    }
    
    const platform = os.platform();
    console.log(`🖨️ Testando impressora local "${safePrinterName}" no ${platform}...`);
    
    // Criar arquivo de teste
    const testFilePath = await createTestFile(safePrinterName);
    
    let command = '';
    let result: any = {};
    
    try {
      switch (platform) {
        case 'win32':
          // Windows - Usar comandos nativos
          // Primeiro, tentar com PowerShell (mais confiável)
          try {
            command = `powershell -Command "Get-Content '${testFilePath}' | Out-Printer -Name '${safePrinterName}'"`;
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr) {
              throw new Error(stderr);
            }
            
            result = {
              success: true,
              message: `✅ Teste enviado com sucesso para ${safePrinterName}`,
              method: 'PowerShell',
              details: {
                printer: safePrinterName,
                platform: 'Windows',
                command: 'Out-Printer',
                file: testFilePath
              }
            };
          } catch (psError: any) {
            // Se PowerShell falhar, tentar com print.exe
            console.log('PowerShell falhou, tentando print.exe...');
            command = `print /D:"${safePrinterName}" "${testFilePath}"`;
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr && !stderr.includes('is currently being printed')) {
              throw new Error(stderr);
            }
            
            result = {
              success: true,
              message: `✅ Teste enviado com sucesso para ${safePrinterName}`,
              method: 'print.exe',
              details: {
                printer: safePrinterName,
                platform: 'Windows',
                command: 'print',
                file: testFilePath
              }
            };
          }
          break;
          
        case 'linux':
        case 'darwin':
          // Linux/Mac - Usar lp ou lpr
          // Verificar se impressora existe no CUPS
          const checkCommand = `lpstat -p "${safePrinterName}" 2>/dev/null`;
          
          try {
            await execAsync(checkCommand);
            
            // Impressora existe, enviar teste
            command = `lp -d "${safePrinterName}" "${testFilePath}"`;
            const { stdout, stderr } = await execAsync(command);
            
            // lp retorna o job ID no stdout
            const jobId = stdout.match(/request id is (\S+)/)?.[1] || 'unknown';
            
            result = {
              success: true,
              message: `✅ Teste enviado para ${safePrinterName} (Job ID: ${jobId})`,
              method: 'CUPS',
              details: {
                printer: safePrinterName,
                platform: platform === 'linux' ? 'Linux' : 'macOS',
                command: 'lp',
                jobId,
                file: testFilePath
              }
            };
          } catch (cupsError: any) {
            // Se CUPS falhar, tentar lpr como alternativa
            command = `lpr -P "${safePrinterName}" "${testFilePath}"`;
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr) {
              throw new Error(stderr);
            }
            
            result = {
              success: true,
              message: `✅ Teste enviado para ${safePrinterName}`,
              method: 'lpr',
              details: {
                printer: safePrinterName,
                platform: platform === 'linux' ? 'Linux' : 'macOS',
                command: 'lpr',
                file: testFilePath
              }
            };
          }
          break;
          
        default:
          result = {
            success: false,
            error: `Sistema operacional não suportado: ${platform}`
          };
      }
      
      // Limpar arquivo temporário após 5 segundos
      setTimeout(async () => {
        try {
          await fs.unlink(testFilePath);
          console.log('📄 Arquivo temporário removido:', testFilePath);
        } catch {}
      }, 5000);
      
      // Se for impressora térmica, adicionar informações extras
      if (printerData?.type === 'thermal') {
        result.thermalInfo = {
          type: 'thermal',
          protocol: 'ESC/POS',
          note: 'Para impressoras térmicas, considere usar comandos ESC/POS diretos para melhor controle',
          features: [
            'Corte de papel',
            'Abertura de gaveta',
            'Códigos de barras',
            'QR codes',
            'Logos e imagens'
          ]
        };
      }
      
      return NextResponse.json(result);
      
    } catch (error: any) {
      // Tentar limpar arquivo temporário em caso de erro
      try {
        await fs.unlink(testFilePath);
      } catch {}
      
      console.error('❌ Erro ao testar impressora:', error);
      
      // Analisar erro e fornecer solução
      let solution = '';
      let errorType = 'unknown';
      
      if (error.message?.includes('not found') || error.message?.includes('não encontrada')) {
        errorType = 'printer_not_found';
        solution = platform === 'win32'
          ? 'Verifique se a impressora está instalada no Windows. Use o comando: wmic printer get name'
          : 'Verifique se a impressora está instalada no CUPS. Use o comando: lpstat -p';
      } else if (error.message?.includes('permission') || error.message?.includes('permissão')) {
        errorType = 'permission_denied';
        solution = 'Execute o aplicativo com permissões administrativas ou adicione o usuário ao grupo de impressão';
      } else if (error.message?.includes('offline')) {
        errorType = 'printer_offline';
        solution = 'A impressora está offline. Verifique se está ligada e conectada';
      } else if (error.message?.includes('spooler')) {
        errorType = 'spooler_error';
        solution = 'O serviço de spooler não está funcionando. No Windows, execute: net start spooler';
      }
      
      return NextResponse.json({
        success: false,
        error: error.message || 'Erro ao testar impressora',
        errorType,
        solution,
        details: {
          printer: safePrinterName,
          platform,
          command,
          fullError: error.toString()
        }
      });
    }
    
  } catch (error: any) {
    console.error('❌ Erro geral:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao processar requisição'
    }, { status: 500 });
  }
}

// GET /api/printers/test-local - Verificar status do serviço de impressão
export async function GET() {
  try {
    const platform = os.platform();
    let status: any = {
      platform,
      service: 'unknown',
      running: false
    };
    
    switch (platform) {
      case 'win32':
        try {
          // Verificar status do spooler no Windows
          const { stdout } = await execAsync('sc query spooler');
          status.service = 'Windows Print Spooler';
          status.running = stdout.includes('RUNNING');
          status.details = stdout;
          
          // Contar impressoras instaladas
          const { stdout: printers } = await execAsync('wmic printer get name /format:csv');
          const printerCount = printers.split('\n').filter(l => l.trim() && !l.includes('Node,Name')).length;
          status.printerCount = printerCount - 1; // Remover header
        } catch {}
        break;
        
      case 'linux':
      case 'darwin':
        try {
          // Verificar status do CUPS
          const { stdout } = await execAsync('lpstat -r');
          status.service = 'CUPS';
          status.running = stdout.includes('is running');
          status.details = stdout;
          
          // Contar impressoras instaladas
          const { stdout: printers } = await execAsync('lpstat -p');
          const printerCount = printers.split('\n').filter(l => l.startsWith('printer')).length;
          status.printerCount = printerCount;
        } catch {}
        break;
    }
    
    return NextResponse.json({
      success: true,
      ...status,
      message: status.running 
        ? `✅ Serviço de impressão está ativo (${status.printerCount || 0} impressoras)`
        : '❌ Serviço de impressão não está ativo'
    });
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Erro ao verificar status'
    }, { status: 500 });
  }
}