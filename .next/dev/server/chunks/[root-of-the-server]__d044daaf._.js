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
    // Criar comando para item individual da fila
    createOrderItemPrint(data) {
        const commands = [];
        // Inicializar
        commands.push(ESC_POS.INIT);
        // Cabeçalho
        commands.push(ESC_POS.ALIGN_CENTER);
        commands.push(ESC_POS.TEXT_DOUBLE);
        commands.push(Buffer.from('PEDIDO COZINHA\n'));
        commands.push(ESC_POS.TEXT_NORMAL);
        commands.push(ESC_POS.LINE_FEED);
        // Mesa e hora
        commands.push(ESC_POS.ALIGN_LEFT);
        commands.push(ESC_POS.BOLD_ON);
        commands.push(Buffer.from(`MESA: ${data.tableName}\n`));
        commands.push(ESC_POS.BOLD_OFF);
        commands.push(Buffer.from(`Pedido #${data.orderId}\n`));
        commands.push(Buffer.from(`${data.timestamp}\n`));
        commands.push(ESC_POS.LINE_FEED);
        // Linha separadora
        commands.push(Buffer.from('================================\n'));
        // Item
        commands.push(ESC_POS.TEXT_DOUBLE_HEIGHT);
        commands.push(ESC_POS.BOLD_ON);
        commands.push(Buffer.from(`${data.quantity}x ${data.itemName}\n`));
        commands.push(ESC_POS.BOLD_OFF);
        commands.push(ESC_POS.TEXT_NORMAL);
        // Observações
        if (data.notes) {
            commands.push(ESC_POS.LINE_FEED);
            commands.push(Buffer.from(`OBS: ${data.notes}\n`));
        }
        // Rodapé
        commands.push(ESC_POS.LINE_FEED);
        commands.push(Buffer.from('================================\n'));
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
"[project]/app/api/printer-queue/process/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$printer$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/printer-service.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { data: pendingJobs, error: fetchError } = await supabase.from('printer_queue').select(`
        *,
        order_items (
          id,
          quantity,
          price,
          notes,
          items (
            id,
            name,
            price,
            description
          ),
          orders (
            id,
            table_id,
            restaurant_tables (
              id,
              number
            )
          )
        ),
        printers (
          id,
          name,
          ip_address,
          port,
          is_local,
          active
        )
      `).eq('status', 'pending').order('created_at', {
            ascending: true
        }).limit(10);
        if (fetchError) {
            console.error('❌ Erro ao buscar jobs pendentes:', fetchError);
            throw fetchError;
        }
        if (!pendingJobs || pendingJobs.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                message: 'Nenhum job pendente na fila',
                processed: 0
            });
        }
        let processed = 0;
        let failed = 0;
        const results = [];
        for (const job of pendingJobs){
            try {
                const printer = job.printers;
                const orderItem = job.order_items;
                const item = orderItem?.items;
                const order = orderItem?.orders;
                const table = order?.restaurant_tables;
                // Validar impressora
                if (!printer || !printer.active) {
                    await supabase.from('printer_queue').update({
                        status: 'failed',
                        error_message: 'Impressora não encontrada ou inativa'
                    }).eq('id', job.id);
                    failed++;
                    results.push({
                        id: job.id,
                        status: 'failed',
                        error: 'Impressora não encontrada'
                    });
                    continue;
                }
                // Validar se dados essenciais existem
                if (!orderItem || !item) {
                    console.error(`❌ Job ${job.id}: Dados incompletos (order_item ou item ausente)`);
                    await supabase.from('printer_queue').update({
                        status: 'failed',
                        error_message: 'Dados do pedido incompletos ou produto inexistente'
                    }).eq('id', job.id);
                    failed++;
                    results.push({
                        id: job.id,
                        status: 'failed',
                        error: 'Dados incompletos'
                    });
                    continue;
                }
                // Atualizar status para 'printing' apenas após validações
                await supabase.from('printer_queue').update({
                    status: 'printing'
                }).eq('id', job.id);
                const printData = __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$printer$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["printerService"].createOrderItemPrint({
                    itemName: item.name || 'Item',
                    quantity: orderItem.quantity || 1,
                    notes: orderItem.notes || '',
                    tableName: table?.number || 'Mesa',
                    orderId: order?.id || job.id,
                    timestamp: new Date().toLocaleString('pt-BR')
                });
                const success = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$printer$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["printerService"].print(printer, printData);
                if (success) {
                    await supabase.from('printer_queue').update({
                        status: 'printed',
                        printed_at: new Date().toISOString()
                    }).eq('id', job.id);
                    processed++;
                    results.push({
                        id: job.id,
                        status: 'printed'
                    });
                } else {
                    await supabase.from('printer_queue').update({
                        status: 'failed',
                        error_message: 'Falha ao comunicar com a impressora'
                    }).eq('id', job.id);
                    failed++;
                    results.push({
                        id: job.id,
                        status: 'failed',
                        error: 'Falha na comunicação'
                    });
                }
            } catch (error) {
                console.error(`Erro ao processar job ${job.id}:`, error);
                await supabase.from('printer_queue').update({
                    status: 'failed',
                    error_message: error.message || 'Erro desconhecido'
                }).eq('id', job.id);
                failed++;
                results.push({
                    id: job.id,
                    status: 'failed',
                    error: error.message
                });
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            message: `Processados: ${processed}, Falhas: ${failed}`,
            processed,
            failed,
            results
        });
    } catch (error) {
        console.error('Erro ao processar fila:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Erro ao processar fila'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d044daaf._.js.map