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
"[project]/lib/supabase/client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$fallback$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/fallback-client.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$auto$2d$detect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/auto-detect.ts [app-route] (ecmascript)");
;
;
;
function createClient() {
    // Detecta automaticamente a configuração correta
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$auto$2d$detect$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getSupabaseConfig"])();
    if (!config.configured || !config.url || !config.anonKey) {
        console.warn('⚠️ Supabase não configurado - usando dados locais');
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$fallback$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFallbackClient"])();
    }
    try {
        // Conectar com as variáveis detectadas automaticamente
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createBrowserClient"])(config.url, config.anonKey);
    } catch (error) {
        console.error('❌ Erro ao conectar com Supabase:', error);
        console.log('   Usando dados locais como fallback');
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$fallback$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createFallbackClient"])();
    }
}
}),
"[project]/app/api/templates/[type]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/client.ts [app-route] (ecmascript)");
;
;
// Default templates
const defaultTemplates = {
    receipt: {
        header: `{{company_name}}
{{company_address}}
Tel: {{company_phone}}
--------------------------------
       CUPOM FISCAL
--------------------------------
Data: {{date}}  Hora: {{time}}
Pedido: #{{order_number}}
Mesa: {{table_number}}
--------------------------------`,
        items: `QTD  DESCRIÇÃO         VALOR
--------------------------------
{{#each items}}
{{quantity}}x   {{name}}
                    R$ {{price}}
{{/each}}`,
        footer: `--------------------------------
Subtotal:         R$ {{subtotal}}
Desconto:         R$ {{discount}}
--------------------------------
TOTAL:            R$ {{total}}
--------------------------------
Pagamento: {{payment_method}}
--------------------------------
    Obrigado pela preferência!
        Volte sempre!
--------------------------------`
    },
    kitchen: {
        header: `================================
       PEDIDO COZINHA
================================
Mesa: {{table_number}}
Pedido: #{{order_number}}
Hora: {{time}}
================================`,
        items: `{{#each items}}
{{quantity}}x {{name}}
   {{#if observation}}
   OBS: {{observation}}
   {{/if}}
--------------------------------
{{/each}}`,
        footer: `================================
Atendente: {{customer_name}}
================================`
    },
    bill: {
        header: `{{company_name}}
--------------------------------
           CONTA
--------------------------------
Mesa: {{table_number}}
Cliente: {{customer_name}}
Data: {{date}}  Hora: {{time}}
--------------------------------`,
        items: `ITEM                     VALOR
--------------------------------
{{#each items}}
{{quantity}}x {{name}}
                    R$ {{price}}
{{/each}}`,
        footer: `--------------------------------
SUBTOTAL:         R$ {{subtotal}}
TAXA SERVIÇO:     R$ {{service_fee}}
--------------------------------
TOTAL A PAGAR:    R$ {{total}}
--------------------------------
        Obrigado!`
    },
    order: {
        header: `================================
         PEDIDO MESA
================================
Mesa: {{table_number}}
Atendente: {{customer_name}}
Pedido: #{{order_number}}
--------------------------------`,
        items: `{{#each items}}
[ ] {{quantity}}x {{name}}
    {{#if observation}}
    OBS: {{observation}}
    {{/if}}
{{/each}}`,
        footer: `--------------------------------
Hora: {{time}}
================================`
    }
};
async function GET(request, { params }) {
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
    const { type } = await params;
    console.log('✅ Getting template for type:', type);
    try {
        // Para itens de pedido, usar template kitchen
        let templateType = type;
        if (!templateType || templateType === 'undefined') {
            templateType = 'kitchen'; // Default para kitchen
        }
        if (templateType === 'order' || templateType === 'items') {
            templateType = 'kitchen';
        }
        // Buscar template do banco
        const { data, error } = await supabase.from('print_templates').select('*').eq('template_type', templateType).single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching template:', error);
            // Se houver erro, retornar template padrão
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                template: defaultTemplates[templateType] || defaultTemplates.kitchen,
                isDefault: true
            });
        }
        // Se encontrou template customizado
        if (data) {
            const template = {
                header: data.custom_header || defaultTemplates[templateType]?.header || '',
                items: data.items_content || defaultTemplates[templateType]?.items || '',
                footer: data.custom_footer || defaultTemplates[templateType]?.footer || ''
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                template,
                isDefault: false
            });
        }
        // Se não encontrou, retornar template padrão
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            template: defaultTemplates[templateType] || defaultTemplates.kitchen,
            isDefault: true
        });
    } catch (error) {
        console.error('Error in template route:', error);
        // Em caso de erro, retornar template padrão
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            template: defaultTemplates.kitchen,
            isDefault: true
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4aa7fab6._.js.map