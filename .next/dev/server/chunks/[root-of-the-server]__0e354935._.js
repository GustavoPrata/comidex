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
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[project]/lib/supabase/fallback-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Fallback client para desenvolvimento sem banco configurado
__turbopack_context__.s([
    "createFallbackClient",
    ()=>createFallbackClient
]);
const mockData = {
    categories: [
        {
            id: '1',
            name: 'Sashimis',
            description: 'Peixes crus fatiados',
            active: true,
            sort_order: 1
        },
        {
            id: '2',
            name: 'Niguiris',
            description: 'Bolinhos de arroz com peixe',
            active: true,
            sort_order: 2
        },
        {
            id: '3',
            name: 'Hot Rolls',
            description: 'Rolos empanados e fritos',
            active: true,
            sort_order: 3
        },
        {
            id: '4',
            name: 'Temakis',
            description: 'Cones de alga com recheio',
            active: true,
            sort_order: 4
        },
        {
            id: '5',
            name: 'Yakissobas',
            description: 'Macarrão japonês salteado',
            active: true,
            sort_order: 5
        }
    ],
    restaurant_tables: [
        {
            id: '1',
            name: 'Mesa 1',
            number: 1,
            capacity: 4,
            type: 'table',
            active: true
        },
        {
            id: '2',
            name: 'Mesa 2',
            number: 2,
            capacity: 4,
            type: 'table',
            active: true
        },
        {
            id: '3',
            name: 'Mesa 3',
            number: 3,
            capacity: 6,
            type: 'table',
            active: true
        },
        {
            id: '4',
            name: 'Mesa VIP',
            number: 10,
            capacity: 10,
            type: 'table',
            active: true
        },
        {
            id: '5',
            name: 'Balcão 1',
            number: 11,
            capacity: 1,
            type: 'counter',
            active: true
        }
    ],
    table_sessions: [
        {
            id: '1',
            table_id: '1',
            status: 'active',
            created_at: new Date().toISOString()
        },
        {
            id: '2',
            table_id: '3',
            status: 'active',
            created_at: new Date().toISOString()
        }
    ],
    items: [
        {
            id: '1',
            name: 'Salmão',
            description: 'Sashimi de salmão fresco',
            price: 25,
            available: true
        },
        {
            id: '2',
            name: 'Atum',
            description: 'Sashimi de atum',
            price: 30,
            available: true
        },
        {
            id: '3',
            name: 'Hot Philadelphia',
            description: 'Hot roll com cream cheese',
            price: 35,
            available: true
        }
    ],
    orders: []
};
function createFallbackClient() {
    console.log('🟨 Usando dados locais de desenvolvimento');
    return {
        from: (table)=>({
                select: (columns)=>({
                        eq: (column, value)=>({
                                data: null,
                                error: null
                            }),
                        gte: (column, value)=>({
                                data: null,
                                error: null
                            }),
                        order: (column, options)=>({
                                limit: (count)=>({
                                        data: mockData[table] || [],
                                        error: null
                                    }),
                                data: mockData[table] || [],
                                error: null
                            }),
                        limit: (count)=>({
                                data: mockData[table]?.slice(0, count) || [],
                                error: null
                            }),
                        in: (column, values)=>({
                                data: mockData[table] || [],
                                error: null
                            }),
                        data: mockData[table] || [],
                        error: null
                    }),
                insert: (data)=>({
                        select: ()=>({
                                data: [
                                    {
                                        ...data,
                                        id: Date.now().toString()
                                    }
                                ],
                                error: null
                            }),
                        data: {
                            ...data,
                            id: Date.now().toString()
                        },
                        error: null
                    }),
                update: (data)=>({
                        eq: (column, value)=>{
                            const items = mockData[table];
                            const index = items?.findIndex((item)=>item[column] === value);
                            if (index !== -1 && items) {
                                items[index] = {
                                    ...items[index],
                                    ...data
                                };
                            }
                            return {
                                data: items?.[index],
                                error: null
                            };
                        }
                    }),
                delete: ()=>({
                        eq: (column, value)=>{
                            const items = mockData[table];
                            const index = items?.findIndex((item)=>item[column] === value);
                            if (index !== -1 && items) {
                                items.splice(index, 1);
                            }
                            return {
                                data: null,
                                error: null
                            };
                        }
                    })
            })
    };
}
}),
"[project]/lib/supabase/auto-detect.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Sistema inteligente para detectar e usar as variáveis corretas do Supabase
// Detecta automaticamente se as variáveis estão invertidas e usa corretamente
__turbopack_context__.s([
    "getSupabaseConfig",
    ()=>getSupabaseConfig
]);
function getSupabaseConfig() {
    const env1 = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTE5NDUsImV4cCI6MjA3NjY4Nzk0NX0.MAZpzWMLZ8_fw4eiHAp3S6D3d6v18rDewMyX4-QMCBc") || '';
    const env2 = ("TURBOPACK compile-time value", "https://wlqvqrgjqowervexcosv.supabase.co") || '';
    let supabaseUrl = null;
    let supabaseKey = null;
    // Detectar qual é URL e qual é Key
    if (env1.startsWith('https://') && env1.includes('.supabase.')) {
        // env1 é a URL
        supabaseUrl = env1;
        supabaseKey = env2;
    } else if (env2.startsWith('https://') && env2.includes('.supabase.')) {
        // env2 é a URL (variáveis invertidas!)
        supabaseUrl = env2;
        supabaseKey = env1;
    } else if (env1.startsWith('eyJ')) {
        // env1 é a Key (JWT sempre começa com eyJ)
        supabaseKey = env1;
        supabaseUrl = env2;
    } else if (env2.startsWith('eyJ')) {
        // env2 é a Key
        supabaseKey = env2;
        supabaseUrl = env1;
    }
    // Validação final
    const isValid = supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.') && supabaseKey.startsWith('eyJ');
    if (isValid) {
        // Log seguro sem expor dados sensíveis
        if ("TURBOPACK compile-time truthy", 1) {
            console.log('✅ Supabase configurado corretamente!');
        }
        return {
            url: supabaseUrl,
            anonKey: supabaseKey,
            configured: true
        };
    } else {
        console.warn('⚠️ Supabase não configurado ou variáveis inválidas');
        return {
            url: null,
            anonKey: null,
            configured: false
        };
    }
}
}),
"[project]/lib/supabase/server.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$fallback$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/fallback-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$auto$2d$detect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/auto-detect.ts [app-route] (ecmascript)");
;
;
;
;
async function createClient() {
    // Detecta automaticamente a configuração correta
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$auto$2d$detect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseConfig"])();
    if (!config.configured || !config.url || !config.anonKey) {
        console.warn('⚠️ [Server] Supabase não configurado - usando dados locais');
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$fallback$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFallbackClient"])();
    }
    try {
        // Log seguro sem expor informações sensíveis
        if ("TURBOPACK compile-time truthy", 1) {
            console.log('✅ [Server] Conectando ao Supabase...');
        }
        const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(config.url, config.anonKey, {
            cookies: {
                get (name) {
                    return cookieStore.get(name)?.value;
                },
                set (name, value, options) {
                    try {
                        cookieStore.set({
                            name,
                            value,
                            ...options
                        });
                    } catch (error) {
                    // The `set` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                    }
                },
                remove (name, options) {
                    try {
                        cookieStore.set({
                            name,
                            value: '',
                            ...options
                        });
                    } catch (error) {
                    // The `delete` method was called from a Server Component.
                    // This can be ignored if you have middleware refreshing
                    // user sessions.
                    }
                }
            }
        });
    } catch (error) {
        console.error('❌ [Server] Erro ao conectar com Supabase:', error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$fallback$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFallbackClient"])();
    }
}
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

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
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[project]/server/printer-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Serviço de impressão térmica com comandos ESC/POS
__turbopack_context__.s([
    "ThermalPrinterService",
    ()=>ThermalPrinterService,
    "printerService",
    ()=>printerService
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/net [external] (net, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/child_process [external] (child_process, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/util [external] (util, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/os [external] (os, cjs)");
;
;
;
;
;
;
const execAsync = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$child_process__$5b$external$5d$__$28$child_process$2c$__cjs$29$__["exec"]);
// Comandos ESC/POS básicos (compatível com maioria das impressoras térmicas)
const ESC_POS = {
    // Inicialização
    INIT: Buffer.from([
        0x1b,
        0x40
    ]),
    // Corte de papel
    CUT_PARTIAL: Buffer.from([
        0x1d,
        0x56,
        0x01
    ]),
    CUT_FULL: Buffer.from([
        0x1d,
        0x56,
        0x00
    ]),
    // Alinhamento
    ALIGN_LEFT: Buffer.from([
        0x1b,
        0x61,
        0x00
    ]),
    ALIGN_CENTER: Buffer.from([
        0x1b,
        0x61,
        0x01
    ]),
    ALIGN_RIGHT: Buffer.from([
        0x1b,
        0x61,
        0x02
    ]),
    // Tamanho do texto
    TEXT_NORMAL: Buffer.from([
        0x1b,
        0x21,
        0x00
    ]),
    TEXT_DOUBLE_HEIGHT: Buffer.from([
        0x1b,
        0x21,
        0x10
    ]),
    TEXT_DOUBLE_WIDTH: Buffer.from([
        0x1b,
        0x21,
        0x20
    ]),
    TEXT_DOUBLE: Buffer.from([
        0x1b,
        0x21,
        0x30
    ]),
    // Negrito
    BOLD_ON: Buffer.from([
        0x1b,
        0x45,
        0x01
    ]),
    BOLD_OFF: Buffer.from([
        0x1b,
        0x45,
        0x00
    ]),
    // Linha em branco
    LINE_FEED: Buffer.from([
        0x0a
    ]),
    // Beep
    BEEP: Buffer.from([
        0x1b,
        0x42,
        0x05,
        0x09
    ]),
    // Abertura de gaveta
    DRAWER_OPEN: Buffer.from([
        0x1b,
        0x70,
        0x00,
        0x19,
        0x19
    ])
};
class ThermalPrinterService {
    // Detectar impressoras no sistema
    async detectPrinters() {
        const printers = [];
        const platform = __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].platform();
        try {
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            else {
                // Linux - verificar impressoras USB e seriais
                try {
                    const { stdout } = await execAsync('ls /dev/usb/lp* 2>/dev/null || true');
                    if (stdout) {
                        const devices = stdout.trim().split('\n').filter(Boolean);
                        devices.forEach((dev)=>{
                            printers.push({
                                name: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].basename(dev),
                                port: dev,
                                type: 'usb'
                            });
                        });
                    }
                } catch  {}
                // Verificar portas seriais
                try {
                    const { stdout: serial } = await execAsync('ls /dev/ttyUSB* /dev/ttyS* 2>/dev/null || true');
                    if (serial) {
                        const devices = serial.trim().split('\n').filter(Boolean);
                        devices.forEach((dev)=>{
                            printers.push({
                                name: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].basename(dev),
                                port: dev,
                                type: 'serial'
                            });
                        });
                    }
                } catch  {}
            }
        } catch (error) {
            console.error('Erro ao detectar impressoras:', error);
        }
        return printers;
    }
    // Enviar dados para impressora via rede
    async printToNetwork(ip, port, data) {
        return new Promise((resolve)=>{
            const client = new __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__["default"].Socket();
            const timeout = setTimeout(()=>{
                client.destroy();
                resolve(false);
            }, 5000); // 5 segundos de timeout
            client.connect(port, ip, ()=>{
                clearTimeout(timeout);
                client.write(data);
                client.end();
            });
            client.on('error', ()=>{
                clearTimeout(timeout);
                resolve(false);
            });
            client.on('close', ()=>{
                clearTimeout(timeout);
                resolve(true);
            });
        });
    }
    // Criar comando de teste de impressão
    createTestPrint() {
        const commands = [];
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
    createOrderPrint(order) {
        const commands = [];
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
        order.items?.forEach((item)=>{
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
    async testPrinterConnection(ip, port = 9100) {
        return new Promise((resolve)=>{
            const client = new __TURBOPACK__imported__module__$5b$externals$5d2f$net__$5b$external$5d$__$28$net$2c$__cjs$29$__["default"].Socket();
            const timeout = setTimeout(()=>{
                client.destroy();
                resolve(false);
            }, 2000);
            client.connect(port, ip, ()=>{
                clearTimeout(timeout);
                client.end();
                resolve(true);
            });
            client.on('error', ()=>{
                clearTimeout(timeout);
                resolve(false);
            });
        });
    }
    // Enviar comandos ESC/POS para impressora local Windows
    async printToLocalWindows(printerName, data) {
        try {
            const platform = __TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].platform();
            if ("TURBOPACK compile-time truthy", 1) {
                console.error('Este método só funciona no Windows');
                return false;
            }
            //TURBOPACK unreachable
            ;
            // Sanitizar nome da impressora
            const safePrinterName = undefined;
            // Criar arquivo temporário com dados binários ESC/POS
            const tempDir = undefined;
            const fileName = undefined;
            const filePath = undefined;
        } catch (error) {
            console.error('Erro ao imprimir localmente:', error);
            return false;
        }
    }
    // Método unificado para enviar impressão
    async print(printer, data) {
        console.log('🖨️ Iniciando impressão para:', printer.name);
        // Se for impressora local
        if (printer.is_local) {
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$os__$5b$external$5d$__$28$os$2c$__cjs$29$__["default"].platform() === 'win32') //TURBOPACK unreachable
            ;
            else {
                console.log('⚠️ Impressão local só funciona no Windows');
                return false;
            }
        }
        // Se for impressora de rede
        if (printer.ip_address && printer.ip_address !== 'LOCAL') {
            console.log(`🌐 Tentando impressão via rede: ${printer.ip_address}:${printer.port || 9100}`);
            const success = await this.printToNetwork(printer.ip_address, parseInt(printer.port) || 9100, data);
            if (success) {
                console.log('✅ Impressão via rede bem-sucedida');
                return true;
            }
        }
        console.log('❌ Falha ao imprimir');
        return false;
    }
}
const printerService = new ThermalPrinterService();
}),
"[project]/app/api/mobile/order/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$printer$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/printer-service.ts [app-route] (ecmascript)");
;
;
;
// Instância do serviço de impressão
const printerService = new __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$printer$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ThermalPrinterService"]();
async function POST(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const data = await request.json();
        const { table_number, items, mode, device_id } = data;
        if (!items || items.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Nenhum item no pedido'
            }, {
                status: 400
            });
        }
        // Buscar ou criar sessão da mesa
        let session = null;
        if (table_number) {
            // Buscar mesa
            const { data: table } = await supabase.from('restaurant_tables').select('*').eq('number', table_number).single();
            if (table) {
                // Buscar sessão ativa
                const { data: activeSession } = await supabase.from('tablet_sessoes').select('*').eq('mesa_id', table.id).eq('status', 'ativa').single();
                if (activeSession) {
                    session = activeSession;
                } else {
                    // Criar nova sessão
                    const { data: newSession } = await supabase.from('tablet_sessoes').insert({
                        mesa_id: table.id,
                        status: 'ativa',
                        inicio_atendimento: new Date().toISOString(),
                        valor_total: 0,
                        valor_desconto: 0
                    }).select().single();
                    session = newSession;
                }
            }
        }
        // Calcular total do pedido
        const total = items.reduce((sum, item)=>{
            return sum + parseFloat(item.price) * item.quantity;
        }, 0);
        // Criar pedido com status pendente (enviado para cozinha)
        const { data: order, error: orderError } = await supabase.from('tablet_pedidos').insert({
            sessao_id: session?.id || null,
            numero: `PED-${Date.now()}`,
            status: 'pendente',
            valor_total: total,
            observacoes: `Origem: tablet${device_id ? ` - Device: ${device_id}` : ''}`,
            created_at: new Date().toISOString()
        }).select().single();
        if (orderError) throw orderError;
        // Adicionar itens do pedido e agrupar por impressora
        const orderItems = [];
        const itemsByPrinter = new Map();
        // Buscar IDs das impressoras
        const { data: printers } = await supabase.from('printers').select('id, name, ip_address, port, active').eq('active', true);
        const barPrinter = printers?.find((p)=>p.name === 'BAR');
        const kitchenPrinter = printers?.find((p)=>p.name === 'COZINHA');
        for (const item of items){
            const { data: orderItem } = await supabase.from('tablet_pedido_itens').insert({
                pedido_id: order.id,
                item_id: item.product_id,
                quantidade: item.quantity,
                preco_unitario: item.price,
                preco_total: item.price * item.quantity,
                observacoes: item.observation || null
            }).select().single();
            orderItems.push(orderItem);
            // Buscar produto com informações completas incluindo grupo através da categoria
            const { data: product } = await supabase.from('items').select(`
          *,
          categories!inner(
            name,
            group_id,
            groups!inner(
              name,
              type
            )
          )
        `).eq('id', item.product_id).single();
            if (product) {
                // Determinar impressora baseada no tipo de grupo
                let targetPrinter = null;
                // Se o grupo for bebidas, enviar para BAR, senão para COZINHA
                const groupType = product.categories?.groups?.type;
                if (groupType === 'bebidas' && barPrinter) {
                    targetPrinter = barPrinter;
                    console.log(`Item ${product.name} routed to BAR printer (bebidas)`);
                } else if (kitchenPrinter) {
                    targetPrinter = kitchenPrinter;
                    console.log(`Item ${product.name} routed to COZINHA printer (${groupType || 'food'})`);
                }
                if (targetPrinter) {
                    // Agrupar itens por impressora para otimizar impressão
                    if (!itemsByPrinter.has(targetPrinter.id)) {
                        itemsByPrinter.set(targetPrinter.id, {
                            printer: targetPrinter,
                            items: []
                        });
                    }
                    itemsByPrinter.get(targetPrinter.id).items.push({
                        orderItem,
                        product,
                        quantity: item.quantity,
                        observation: item.observation,
                        category: product.categories?.name || 'Geral'
                    });
                }
            }
        }
        // Criar jobs de impressão para cada impressora
        const printJobs = [];
        for (const [printerId, printerData] of itemsByPrinter){
            // Formatar dados do pedido para impressão no formato esperado pelo virtual printer
            const orderData = {
                id: order.numero,
                table: table_number ? `Mesa ${table_number}` : 'S/Mesa',
                numero_pedido: order.numero,
                mesa: table_number || 'S/N',
                modo: mode === 'rodizio' ? 'RODÍZIO' : 'À LA CARTE',
                items: printerData.items.map((item)=>({
                        quantidade: item.quantity,
                        nome: item.product.name,
                        observacao: item.observation || '',
                        categoria: item.category,
                        preco: item.product.price
                    })),
                hora: new Date().toLocaleTimeString('pt-BR'),
                data: new Date().toLocaleDateString('pt-BR'),
                atendente: 'Tablet',
                observacoes_gerais: `Pedido via Tablet${device_id ? ` - Device: ${device_id}` : ''}`,
                total: printerData.items.reduce((sum, item)=>sum + item.product.price * item.quantity, 0),
                printer_name: printerData.printer.name
            };
            // Criar job na fila de impressão
            const { data: printJob, error: printError } = await supabase.from('printer_queue').insert({
                printer_id: printerId,
                document_type: 'order',
                document_data: orderData,
                priority: mode === 'rodizio' ? 'high' : 'normal',
                status: 'pending',
                copies: 1,
                created_at: new Date().toISOString()
            }).select().single();
            if (printJob && !printError) {
                printJobs.push(printJob);
                console.log(`Print job criado: ID ${printJob.id} para impressora ${printerData.printer.name}`);
                // Tentar enviar para impressora física se estiver ativa
                if (printerData.printer?.active && printerData.printer?.ip_address && printerData.printer?.port) {
                    try {
                        // Usar o método correto createOrderPrint
                        const printData = printerService.createOrderPrint(orderData);
                        await printerService.print(printerData.printer.ip_address, parseInt(printerData.printer.port), printData);
                        // Atualizar status do job para printed
                        await supabase.from('printer_queue').update({
                            status: 'printed',
                            printed_at: new Date().toISOString()
                        }).eq('id', printJob.id);
                        console.log(`Print job ${printJob.id} enviado com sucesso para impressora física`);
                    } catch (printError) {
                        console.error('Erro ao enviar para impressora física:', printError);
                    // Job permanece como pending para retry posterior - será visível no virtual printer
                    }
                }
            } else if (printError) {
                console.error('Erro ao criar print job:', printError);
            }
        }
        // Atualizar total da sessão se houver
        if (session) {
            const newTotal = (session.valor_total || 0) + total;
            await supabase.from('tablet_sessoes').update({
                valor_total: newTotal
            }).eq('id', session.id);
        }
        // Preparar resposta com informações de impressão
        const printStatus = printJobs.length > 0 ? 'sent_to_kitchen' : 'no_printer_configured';
        const message = printJobs.length > 0 ? `Pedido enviado para cozinha! ${printJobs.length} impressora(s) notificada(s).` : 'Pedido criado! Configure impressoras para envio automático à cozinha.';
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            order: {
                id: order.id,
                numero: order.numero,
                table_number,
                total,
                items: orderItems,
                session_id: session?.id,
                created_at: order.created_at,
                status: 'pendente',
                print_jobs_count: printJobs.length,
                estimated_preparation_time: printJobs.length > 0 ? '15-20 minutos' : null
            },
            print_status: printStatus,
            print_jobs: printJobs.map((job)=>({
                    id: job.id,
                    printer_id: job.printer_id,
                    status: job.status,
                    created_at: job.created_at
                })),
            message
        });
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Erro ao criar pedido',
            message: error.message
        }, {
            status: 500
        });
    }
}
async function PATCH(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const data = await request.json();
        const { order_id, status } = data;
        const validStatuses = [
            'enviado_cozinha',
            'em_preparacao',
            'pronto',
            'entregue',
            'cancelado'
        ];
        if (!order_id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'ID do pedido não fornecido'
            }, {
                status: 400
            });
        }
        if (!validStatuses.includes(status)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Status inválido'
            }, {
                status: 400
            });
        }
        // Atualizar status do pedido
        const { data: updatedOrder, error } = await supabase.from('tablet_pedidos').update({
            status,
            updated_at: new Date().toISOString()
        }).eq('id', order_id).select().single();
        if (error) throw error;
        // Se o status for "pronto", enviar notificação (futura implementação)
        if (status === 'pronto') {
            console.log(`Pedido ${order_id} está pronto para entrega`);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            order: updatedOrder,
            message: `Status atualizado para: ${status}`
        });
    } catch (error) {
        console.error('Erro ao atualizar status do pedido:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Erro ao atualizar status do pedido',
            message: error.message
        }, {
            status: 500
        });
    }
}
async function GET(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const searchParams = request.nextUrl.searchParams;
        const table_number = searchParams.get('table_number');
        const device_id = searchParams.get('device_id');
        const session_id = searchParams.get('session_id');
        const status = searchParams.get('status');
        let query = supabase.from('tablet_pedidos').select(`
        *,
        tablet_pedido_itens(
          *,
          items(name, price, image)
        )
      `).order('created_at', {
            ascending: false
        }).limit(50);
        // Filtrar por sessão se especificado
        if (session_id) {
            query = query.eq('sessao_id', session_id);
        }
        // Filtrar por status se especificado
        if (status) {
            query = query.eq('status', status);
        }
        // Filtrar por device_id se especificado
        if (device_id) {
            query = query.ilike('observacoes', `%Device: ${device_id}%`);
        }
        const { data: orders, error } = await query;
        if (error) throw error;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            orders: orders || [],
            total: orders?.length || 0
        });
    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Erro ao buscar pedidos',
            message: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0e354935._.js.map