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
"[project]/lib/print-queue.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Biblioteca de Gerenciamento de Fila de Impressão
// Centraliza todas as operações de impressão do sistema
__turbopack_context__.s([
    "addPrintJob",
    ()=>addPrintJob,
    "cancelPrintJob",
    ()=>cancelPrintJob,
    "getQueueStatus",
    ()=>getQueueStatus,
    "hasOnlinePrinters",
    ()=>hasOnlinePrinters,
    "printBill",
    ()=>printBill,
    "printOrder",
    ()=>printOrder,
    "printReceipt",
    ()=>printReceipt,
    "printTest",
    ()=>printTest,
    "processQueue",
    ()=>processQueue,
    "retryPrintJob",
    ()=>retryPrintJob
]);
async function addPrintJob(params) {
    try {
        // Se não especificar impressora, buscar a padrão baseada no tipo
        let printerId = params.printer_id;
        if (!printerId) {
            // Buscar impressora padrão para o tipo de documento
            const printerMap = await getDefaultPrintersMap();
            printerId = printerMap[params.document_type] || undefined;
        }
        if (!printerId) {
            throw new Error(`Nenhuma impressora configurada para ${params.document_type}`);
        }
        const response = await fetch('/api/printer-queue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                printer_id: printerId,
                document_type: params.document_type,
                document_data: params.document_data,
                priority: params.priority || 'normal',
                copies: params.copies || 1,
                template_id: params.template_id,
                status: 'pending',
                retry_count: 0,
                max_retries: 3
            })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao adicionar job à fila');
        }
        const job = await response.json();
        return job;
    } catch (error) {
        console.error('Erro ao adicionar job à fila:', error);
        throw error;
    }
}
// Buscar mapeamento de impressoras padrão
async function getDefaultPrintersMap() {
    try {
        const response = await fetch('/api/printer-profiles');
        const profiles = await response.json();
        // Mapear tipo de documento para impressora
        const map = {
            order: null,
            receipt: null,
            bill: null,
            report: null,
            test: null
        };
        // Buscar perfil ativo e mapear impressoras
        const activeProfile = profiles.find((p)=>p.is_active);
        if (activeProfile && activeProfile.settings) {
            const settings = activeProfile.settings;
            map.order = settings.kitchen_printer_id || null;
            map.receipt = settings.receipt_printer_id || null;
            map.bill = settings.bill_printer_id || null;
            map.report = settings.report_printer_id || null;
        }
        return map;
    } catch (error) {
        console.error('Erro ao buscar impressoras padrão:', error);
        return {
            order: null,
            receipt: null,
            bill: null,
            report: null,
            test: null
        };
    }
}
async function printOrder(data) {
    return addPrintJob({
        document_type: 'order',
        document_data: {
            order_id: data.order_id,
            items: data.items,
            table_name: data.table_name,
            notes: data.notes,
            created_at: new Date().toISOString()
        },
        priority: data.priority || 'high'
    });
}
async function printBill(data) {
    return addPrintJob({
        document_type: 'bill',
        document_data: {
            order_id: data.order_id,
            table_name: data.table_name,
            items: data.items,
            subtotal: data.subtotal,
            discount: data.discount,
            tax: data.tax,
            total: data.total,
            payment_method: data.payment_method,
            customer_name: data.customer_name,
            created_at: new Date().toISOString()
        },
        priority: 'high',
        copies: 2 // Uma via para o cliente, outra para o estabelecimento
    });
}
async function printReceipt(data) {
    return addPrintJob({
        document_type: 'receipt',
        document_data: {
            order_id: data.order_id,
            table_name: data.table_name,
            total: data.total,
            payment_method: data.payment_method,
            customer_name: data.customer_name,
            created_at: new Date().toISOString()
        },
        priority: 'normal'
    });
}
async function printTest(printer_id, message) {
    return addPrintJob({
        printer_id,
        document_type: 'test',
        document_data: {
            notes: message || 'Teste de impressão',
            created_at: new Date().toISOString()
        },
        priority: 'low'
    });
}
async function getQueueStatus(printer_id) {
    try {
        const params = new URLSearchParams();
        if (printer_id) {
            params.append('printer_id', printer_id.toString());
        }
        const response = await fetch(`/api/printer-queue?${params}`);
        const jobs = await response.json();
        const stats = {
            total: jobs.length,
            pending: jobs.filter((j)=>j.status === 'pending').length,
            printing: jobs.filter((j)=>j.status === 'printing').length,
            failed: jobs.filter((j)=>j.status === 'failed').length
        };
        return {
            jobs,
            stats
        };
    } catch (error) {
        console.error('Erro ao buscar status da fila:', error);
        throw error;
    }
}
async function cancelPrintJob(jobId) {
    try {
        const response = await fetch(`/api/printer-queue?id=${jobId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'cancelled'
            })
        });
        if (!response.ok) {
            throw new Error('Erro ao cancelar job');
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao cancelar job:', error);
        throw error;
    }
}
async function retryPrintJob(jobId) {
    try {
        const response = await fetch(`/api/printer-queue?id=${jobId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'pending',
                retry_count: 0
            })
        });
        if (!response.ok) {
            throw new Error('Erro ao reenviar job');
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao reenviar job:', error);
        throw error;
    }
}
async function hasOnlinePrinters() {
    try {
        const response = await fetch('/api/printers');
        const printers = await response.json();
        return printers.some((p)=>p.status === 'online');
    } catch (error) {
        console.error('Erro ao verificar impressoras:', error);
        return false;
    }
}
async function processQueue() {
    try {
        // Buscar próximo job pendente
        const response = await fetch('/api/printer-queue?status=pending&limit=1');
        const jobs = await response.json();
        if (jobs.length === 0) {
            return null;
        }
        const job = jobs[0];
        // Marcar como imprimindo
        await fetch(`/api/printer-queue?id=${job.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'printing'
            })
        });
        // Aqui seria onde enviaria para a impressora real
        // Por enquanto, vamos simular
        await simulatePrint(job);
        // Marcar como impresso
        await fetch(`/api/printer-queue?id=${job.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'printed'
            })
        });
        return job;
    } catch (error) {
        console.error('Erro ao processar fila:', error);
        throw error;
    }
}
// Simular impressão (desenvolvimento)
async function simulatePrint(job) {
    // Simular tempo de impressão
    await new Promise((resolve)=>setTimeout(resolve, 2000));
    // 10% de chance de falha (para teste)
    if (Math.random() < 0.1) {
        throw new Error('Impressora offline');
    }
    console.log('Job impresso:', job);
}
}),
"[project]/app/api/orders/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$print$2d$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/print-queue.ts [app-route] (ecmascript)");
;
;
;
async function GET(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');
        const status = searchParams.get('status');
        let query = supabase.from('orders').select(`
        *,
        order_items (
          *,
          items (name, description)
        ),
        table_sessions (
          table_id,
          restaurant_tables (name, number)
        )
      `).order('created_at', {
            ascending: false
        });
        if (sessionId) {
            query = query.eq('session_id', sessionId);
        }
        if (status) {
            query = query.eq('status', status);
        }
        const { data, error } = await query;
        if (error) throw error;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data || []);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch orders'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const body = await request.json();
        // Buscar table_id da sessão
        let tableId = body.table_id;
        if (!tableId && body.session_id) {
            const { data: session } = await supabase.from('table_sessions').select('table_id').eq('id', body.session_id).single();
            tableId = session?.table_id;
        }
        // Create order
        const { data: order, error: orderError } = await supabase.from('orders').insert({
            table_id: tableId,
            total: body.total,
            status: 'pending',
            notes: body.notes
        }).select().single();
        if (orderError) throw orderError;
        // Create order items
        if (body.items && body.items.length > 0) {
            const orderItems = body.items.map((item)=>({
                    order_id: order.id,
                    item_id: item.item_id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    additionals_price: item.additionals_price || 0,
                    total_price: item.total_price,
                    notes: item.notes,
                    status: 'pending'
                }));
            const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
            if (itemsError) throw itemsError;
            // Adicionar pedido à fila de impressão
            try {
                // Buscar informações da mesa
                const { data: session } = await supabase.from('table_sessions').select(`
            restaurant_tables (name, number)
          `).eq('id', body.session_id).single();
                const tableName = session?.restaurant_tables?.name || `Mesa ${session?.restaurant_tables?.number || 'Desconhecida'}`;
                // Adicionar job de impressão para o pedido
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$print$2d$queue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["printOrder"])({
                    order_id: order.id,
                    items: body.items.map((item)=>({
                            name: item.name || 'Item',
                            quantity: item.quantity,
                            notes: item.notes
                        })),
                    table_name: tableName,
                    notes: body.notes,
                    priority: 'high'
                });
                console.log('Pedido adicionado à fila de impressão:', order.id);
            } catch (printError) {
                console.error('Erro ao adicionar pedido à fila de impressão:', printError);
            // Não falhar a criação do pedido se a impressão falhar
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(order, {
            status: 201
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create order'
        }, {
            status: 500
        });
    }
}
async function PATCH(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('id');
        const body = await request.json();
        if (!orderId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Order ID is required'
            }, {
                status: 400
            });
        }
        const { data, error } = await supabase.from('orders').update(body).eq('id', orderId).select().single();
        if (error) throw error;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
    } catch (error) {
        console.error('Error updating order:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to update order'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b59a2ccf._.js.map