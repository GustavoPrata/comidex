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
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[project]/app/api/printers/discover/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// API para descobrir impressoras na rede local
__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
// IPs e portas comuns para impressoras térmicas
const COMMON_PRINTER_PORTS = [
    9100,
    515,
    631,
    3910
];
const COMMON_PRINTER_IPS = [
    '192.168.1.',
    '192.168.0.',
    '10.0.0.',
    '172.16.0.'
];
// Verificar se um IP responde em uma porta específica
async function checkPort(ip, port) {
    return new Promise((resolve)=>{
        const net = __turbopack_context__.r("[externals]/net [external] (net, cjs)");
        const socket = new net.Socket();
        const timeout = setTimeout(()=>{
            socket.destroy();
            resolve(false);
        }, 500); // 500ms timeout para cada tentativa
        socket.connect(port, ip, ()=>{
            clearTimeout(timeout);
            socket.destroy();
            resolve(true);
        });
        socket.on('error', ()=>{
            clearTimeout(timeout);
            resolve(false);
        });
    });
}
// Descobrir impressoras na rede
async function discoverPrinters(subnet) {
    const foundPrinters = [];
    const promises = [];
    // Varrer IPs comuns (últimos 20 IPs da subnet)
    for(let i = 100; i <= 120; i++){
        const ip = `${subnet}${i}`;
        promises.push((async ()=>{
            for (const port of COMMON_PRINTER_PORTS){
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
        })());
    }
    // Aguardar todas as verificações
    await Promise.all(promises);
    return foundPrinters;
}
async function GET(request) {
    try {
        console.log('🔍 Iniciando descoberta de impressoras na rede...');
        const allFoundPrinters = [];
        // Tentar descobrir em subnets comuns
        for (const subnet of COMMON_PRINTER_IPS){
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
        const allPrinters = [
            ...allFoundPrinters,
            ...knownPrinters
        ];
        console.log(`✅ Descoberta concluída. ${allFoundPrinters.length} impressoras reais encontradas`);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            discovered: allFoundPrinters.length,
            virtual: knownPrinters.length,
            total: allPrinters.length,
            printers: allPrinters
        });
    } catch (error) {
        console.error('❌ Erro na descoberta de impressoras:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || "Erro ao descobrir impressoras"
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8f26ccb5._.js.map