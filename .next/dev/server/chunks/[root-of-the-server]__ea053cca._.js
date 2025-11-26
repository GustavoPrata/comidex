module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/app/api/printers/detect-local/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/util [external] (util, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
;
;
;
;
const execAsync = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["exec"]);
// Função para detectar impressoras no Windows usando WMIC
async function detectWindowsPrinters() {
    try {
        console.log('🖨️ Detectando impressoras Windows com WMIC...');
        // Primeiro, tentar formato lista mais simples (mais confiável)
        try {
            const { stdout: listOutput } = await execAsync('wmic printer get name /format:value');
            console.log('📄 Saída WMIC (formato value):', listOutput);
            // Parser para formato value (Name=PrinterName)
            const printers = [];
            const lines = listOutput.split('\n');
            for (const line of lines){
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('Name=')) {
                    const printerName = trimmedLine.substring(5).trim();
                    if (printerName && printerName.length > 0) {
                        // Obter detalhes adicionais para esta impressora
                        let printerInfo = {
                            name: printerName,
                            port: 'Local',
                            driver: 'Windows Driver',
                            status: 'Ready',
                            type: detectPrinterType(printerName, ''),
                            os: 'Windows',
                            detected_via: 'WMIC'
                        };
                        // Tentar obter mais informações sobre a impressora
                        try {
                            const { stdout: detailOutput } = await execAsync(`wmic printer where name="${printerName.replace(/"/g, '\\"')}" get portname,drivername,printerstatus /format:list`);
                            const detailLines = detailOutput.split('\n');
                            for (const detailLine of detailLines){
                                const trimmed = detailLine.trim();
                                if (trimmed.startsWith('PortName=')) {
                                    printerInfo.port = trimmed.substring(9).trim() || 'Local';
                                } else if (trimmed.startsWith('DriverName=')) {
                                    printerInfo.driver = trimmed.substring(11).trim() || 'Windows Driver';
                                    printerInfo.type = detectPrinterType(printerName, printerInfo.driver);
                                } else if (trimmed.startsWith('PrinterStatus=')) {
                                    const statusCode = trimmed.substring(14).trim();
                                    printerInfo.status = statusCode === '3' ? 'Ready' : statusCode === '1' ? 'Paused' : statusCode === '2' ? 'Error' : 'Unknown';
                                }
                            }
                        } catch (detailError) {
                            console.log(`⚠️ Não foi possível obter detalhes para ${printerName}`);
                        }
                        printers.push(printerInfo);
                        console.log(`✅ Impressora detectada: ${printerName}`);
                    }
                }
            }
            if (printers.length > 0) {
                console.log(`✅ Total: ${printers.length} impressoras encontradas no Windows`);
                return printers;
            }
        } catch (valueError) {
            console.log('⚠️ Formato value falhou, tentando formato CSV...');
        }
        // Fallback: tentar formato CSV original
        const { stdout } = await execAsync('wmic printer get name,portname,drivername,status /format:csv');
        console.log('📄 Saída WMIC (formato CSV):', stdout.substring(0, 500));
        // Parsear saída CSV do WMIC
        const lines = stdout.split(/\r?\n/).filter((line)=>line.trim());
        const printers = [];
        // Debug: mostrar primeiras linhas
        console.log('Primeiras 5 linhas do CSV:');
        lines.slice(0, 5).forEach((line, i)=>{
            console.log(`  Linha ${i}: "${line}"`);
        });
        // WMIC CSV geralmente tem formato: Node,DriverName,Name,PortName,Status
        // A primeira linha com vírgulas é o header
        let headerIndex = -1;
        let headers = [];
        for(let i = 0; i < lines.length; i++){
            if (lines[i].includes(',')) {
                headerIndex = i;
                headers = lines[i].split(',').map((h)=>h.trim());
                console.log(`Headers encontrados na linha ${i}: ${headers.join(', ')}`);
                break;
            }
        }
        if (headerIndex === -1) {
            console.error('❌ Headers não encontrados na saída WMIC');
            return [];
        }
        // Encontrar índice da coluna Name
        const nameIndex = headers.findIndex((h)=>h.toLowerCase() === 'name');
        const portIndex = headers.findIndex((h)=>h.toLowerCase() === 'portname');
        const driverIndex = headers.findIndex((h)=>h.toLowerCase() === 'drivername');
        const statusIndex = headers.findIndex((h)=>h.toLowerCase() === 'status');
        console.log(`Índices: Name=${nameIndex}, Port=${portIndex}, Driver=${driverIndex}, Status=${statusIndex}`);
        if (nameIndex === -1) {
            console.error('❌ Coluna "Name" não encontrada nos headers');
            return [];
        }
        // Process data lines (after header)
        for(let i = headerIndex + 1; i < lines.length; i++){
            const line = lines[i];
            if (!line || line.trim() === '') continue;
            const values = line.split(',').map((v)=>v.trim());
            const printerName = values[nameIndex];
            if (printerName && printerName.length > 0) {
                const printer = {
                    name: printerName,
                    port: portIndex >= 0 ? values[portIndex] || 'Local' : 'Local',
                    driver: driverIndex >= 0 ? values[driverIndex] || 'Windows Driver' : 'Windows Driver',
                    status: statusIndex >= 0 ? values[statusIndex] || 'Ready' : 'Ready',
                    type: detectPrinterType(printerName, driverIndex >= 0 ? values[driverIndex] : ''),
                    os: 'Windows',
                    detected_via: 'WMIC'
                };
                printers.push(printer);
                console.log(`✅ Impressora detectada: ${printerName}`);
            }
        }
        console.log(`✅ Total: ${printers.length} impressoras encontradas no Windows`);
        return printers;
    } catch (error) {
        console.error('❌ Erro ao detectar impressoras Windows:', error.message);
        // Última tentativa: usar PowerShell
        try {
            console.log('🔄 Tentando com PowerShell...');
            const { stdout } = await execAsync('powershell -Command "Get-Printer | Select-Object Name, PortName, DriverName | ConvertTo-Json"');
            const printerData = JSON.parse(stdout);
            const printers = [];
            // Garantir que sempre seja um array
            const printerArray = Array.isArray(printerData) ? printerData : [
                printerData
            ];
            for (const p of printerArray){
                if (p.Name) {
                    printers.push({
                        name: p.Name,
                        port: p.PortName || 'Local',
                        driver: p.DriverName || 'Windows Driver',
                        status: 'Ready',
                        type: detectPrinterType(p.Name, p.DriverName || ''),
                        os: 'Windows',
                        detected_via: 'PowerShell'
                    });
                    console.log(`✅ Impressora detectada via PowerShell: ${p.Name}`);
                }
            }
            return printers;
        } catch (psError) {
            console.error('❌ PowerShell também falhou:', psError);
            throw error;
        }
    }
}
// Função para detectar impressoras no Linux
async function detectLinuxPrinters() {
    try {
        console.log('🖨️ Detectando impressoras Linux com lpstat...');
        // Tentar usar lpstat (CUPS)
        const { stdout } = await execAsync('lpstat -p -d');
        const lines = stdout.split('\n').filter((line)=>line.trim());
        const printers = [];
        for (const line of lines){
            if (line.startsWith('printer')) {
                const match = line.match(/printer\s+(\S+)/);
                if (match) {
                    const printerName = match[1];
                    // Tentar obter mais informações
                    let printerInfo = {
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
                    } catch  {}
                    printers.push(printerInfo);
                }
            }
        }
        console.log(`✅ ${printers.length} impressoras encontradas no Linux`);
        return printers;
    } catch (error) {
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
        const lines = stdout.split('\n').filter((line)=>line.trim());
        const printers = [];
        for (const line of lines){
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
                for (const printer of data.SPPrintersDataType){
                    const existing = printers.find((p)=>p.name === printer._name);
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
        } catch  {}
        console.log(`✅ ${printers.length} impressoras encontradas no macOS`);
        return printers;
    } catch (error) {
        console.error('❌ Erro ao detectar impressoras macOS:', error.message);
        return [];
    }
}
// Função auxiliar para detectar tipo de impressora
function detectPrinterType(name, driver) {
    const nameLower = name.toLowerCase();
    const driverLower = driver.toLowerCase();
    // Verificar se é térmica
    if (nameLower.includes('thermal') || driverLower.includes('thermal') || nameLower.includes('pos') || driverLower.includes('pos') || nameLower.includes('receipt') || driverLower.includes('receipt') || nameLower.includes('epson tm') || nameLower.includes('bematech') || nameLower.includes('elgin') || nameLower.includes('daruma') || nameLower.includes('tanca') || nameLower.includes('sweda')) {
        return 'thermal';
    }
    // Verificar se é PDF/Driver de arquivo (não são impressoras reais)
    if (nameLower.includes('pdf') || nameLower.includes('xps') || nameLower.includes('onenote') || nameLower.includes('fax') || nameLower.includes('virtual') || nameLower.includes('print to file')) {
        return 'other'; // Marcar como 'other' em vez de 'virtual'
    }
    // Verificar se é laser
    if (nameLower.includes('laser') || nameLower.includes('laserjet') || driverLower.includes('laser')) {
        return 'laser';
    }
    // Verificar se é jato de tinta
    if (nameLower.includes('inkjet') || nameLower.includes('deskjet') || nameLower.includes('officejet') || driverLower.includes('inkjet')) {
        return 'inkjet';
    }
    // Verificar se é matricial
    if (nameLower.includes('dot matrix') || nameLower.includes('matricial') || nameLower.includes('lx-') || nameLower.includes('fx-')) {
        return 'dot-matrix';
    }
    return 'unknown';
}
async function GET() {
    try {
        const platform = __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].platform();
        console.log(`🖥️ Sistema operacional detectado: ${platform}`);
        let printers = [];
        let error = null;
        switch(platform){
            case 'win32':
                try {
                    printers = await detectWindowsPrinters();
                } catch (e) {
                    error = `Windows: ${e.message}`;
                }
                break;
            case 'linux':
                try {
                    printers = await detectLinuxPrinters();
                } catch (e) {
                    error = `Linux: ${e.message}`;
                }
                break;
            case 'darwin':
                try {
                    printers = await detectMacPrinters();
                } catch (e) {
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
            hostname: __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].hostname(),
            printers,
            count: printers.length,
            error,
            timestamp: new Date().toISOString(),
            message: printers.length > 0 ? `${printers.length} impressora(s) encontrada(s)` : error || 'Nenhuma impressora encontrada'
        };
        // Se encontrou impressoras, filtrar as térmicas
        if (printers.length > 0) {
            const thermalPrinters = printers.filter((p)=>p.type === 'thermal');
            if (thermalPrinters.length > 0) {
                response.message += ` (${thermalPrinters.length} térmica(s))`;
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error('❌ Erro na detecção de impressoras:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Erro ao detectar impressoras',
            platform: __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].platform(),
            hostname: __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].hostname(),
            printers: [],
            count: 0
        }, {
            status: 500
        });
    }
}
// Função para sanitizar nome da impressora (prevenir command injection)
function sanitizePrinterName(name) {
    // Remove caracteres perigosos que podem causar command injection
    // Permite apenas letras, números, espaços, hífen, underscore e ponto
    return name.replace(/[^a-zA-Z0-9\s\-_\.]/g, '');
}
async function POST(request) {
    try {
        const { printerName } = await request.json();
        if (!printerName) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Nome da impressora é obrigatório'
            }, {
                status: 400
            });
        }
        // Sanitizar nome da impressora para prevenir command injection
        const safePrinterName = sanitizePrinterName(printerName);
        if (safePrinterName !== printerName) {
            console.warn(`⚠️ Nome da impressora sanitizado: "${printerName}" -> "${safePrinterName}"`);
        }
        const platform = __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].platform();
        console.log(`🖨️ Testando impressora "${safePrinterName}" no ${platform}...`);
        // Comando para enviar teste de impressão
        let command = '';
        switch(platform){
            case 'win32':
                // No Windows, podemos usar print ou PowerShell
                command = `powershell -Command "Out-Printer -Name '${safePrinterName}' -InputObject 'TESTE COMIDEX - ${new Date().toLocaleString('pt-BR')}'"`;
                break;
            case 'linux':
            case 'darwin':
                // No Linux/Mac, usar lp
                command = `echo "TESTE COMIDEX - ${new Date().toLocaleString('pt-BR')}" | lp -d "${safePrinterName}"`;
                break;
            default:
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: false,
                    error: `Sistema não suportado: ${platform}`
                }, {
                    status: 400
                });
        }
        const { stdout, stderr } = await execAsync(command);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: !stderr,
            message: stderr ? `Erro: ${stderr}` : 'Teste enviado com sucesso',
            printerName: safePrinterName,
            platform,
            output: stdout || 'Comando executado com sucesso'
        });
    } catch (error) {
        console.error('❌ Erro ao testar impressora:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Erro ao testar impressora'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ea053cca._.js.map