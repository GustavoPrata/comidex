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
"[project]/app/api/admin/populate-database/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/client.ts [app-route] (ecmascript)");
;
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
async function POST(request) {
    console.log('🚀 Iniciando população do banco Supabase...');
    try {
        // 1. Verificar se já temos produtos
        const { data: existingItems, error: checkError } = await supabase.from('items').select('id').eq('group_id', 1);
        if (checkError) {
            console.error('Erro ao verificar produtos:', checkError);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: checkError.message
            }, {
                status: 500
            });
        }
        console.log(`📦 Produtos existentes no grupo 1: ${existingItems?.length || 0}`);
        let addedCount = 0;
        // 2. Adicionar produtos faltantes do Niguiri
        const niguiriProducts = [
            {
                name: 'Niguiri Peixe Branco',
                description: 'Fatia de peixe branco sobre arroz'
            },
            {
                name: 'Niguiri Tilápia',
                description: 'Fatia de tilápia sobre arroz'
            },
            {
                name: 'Niguiri Skin',
                description: 'Pele de salmão crocante sobre arroz'
            }
        ];
        // Buscar ID da categoria Niguiri
        const { data: niguiriCat } = await supabase.from('categories').select('id').eq('name', 'Niguiri').eq('group_id', 1).single();
        if (niguiriCat) {
            for (const product of niguiriProducts){
                const { data: existing } = await supabase.from('items').select('id').eq('name', product.name).eq('category_id', niguiriCat.id).single();
                if (!existing) {
                    const { error } = await supabase.from('items').insert({
                        ...product,
                        price: 0,
                        category_id: niguiriCat.id,
                        group_id: 1,
                        active: true,
                        available: true
                    });
                    if (!error) {
                        addedCount++;
                        console.log(`✅ Adicionado: ${product.name}`);
                    }
                }
            }
        }
        // 3. Adicionar produtos do Uramaki
        const uramakiProducts = [
            {
                name: 'Uramaki Skin',
                description: 'Pele de salmão crocante, cream cheese'
            },
            {
                name: 'Uramaki Doritos',
                description: 'Doritos, cream cheese, salmão'
            },
            {
                name: 'Uramaki Morango',
                description: 'Morango, cream cheese, salmão'
            }
        ];
        const { data: uramakiCat } = await supabase.from('categories').select('id').eq('name', 'Uramaki').eq('group_id', 1).single();
        if (uramakiCat) {
            for (const product of uramakiProducts){
                const { data: existing } = await supabase.from('items').select('id').eq('name', product.name).eq('category_id', uramakiCat.id).single();
                if (!existing) {
                    const { error } = await supabase.from('items').insert({
                        ...product,
                        price: 0,
                        category_id: uramakiCat.id,
                        group_id: 1,
                        active: true,
                        available: true
                    });
                    if (!error) {
                        addedCount++;
                        console.log(`✅ Adicionado: ${product.name}`);
                    }
                }
            }
        }
        // 4. Adicionar produtos do Temaki
        const temakiProducts = [
            {
                name: 'Temaki Skin Fry',
                description: 'Pele de salmão crocante empanada'
            },
            {
                name: 'Temaki Hot Roll',
                description: 'Salmão empanado com cream cheese'
            }
        ];
        const { data: temakiCat } = await supabase.from('categories').select('id').eq('name', 'Temaki').eq('group_id', 1).single();
        if (temakiCat) {
            for (const product of temakiProducts){
                const { data: existing } = await supabase.from('items').select('id').eq('name', product.name).eq('category_id', temakiCat.id).single();
                if (!existing) {
                    const { error } = await supabase.from('items').insert({
                        ...product,
                        price: 0,
                        category_id: temakiCat.id,
                        group_id: 1,
                        active: true,
                        available: true
                    });
                    if (!error) {
                        addedCount++;
                        console.log(`✅ Adicionado: ${product.name}`);
                    }
                }
            }
        }
        // 5. Adicionar produtos do Joe, Na Chapa, Hot Roll, etc
        const otherProducts = [
            {
                category: 'Joe',
                products: [
                    {
                        name: 'Joe Geleia Framboesa',
                        description: 'Salmão com geleia de framboesa'
                    },
                    {
                        name: 'Joe Sugar',
                        description: 'Salmão com açúcar cristal'
                    },
                    {
                        name: 'Joe Couve Fry',
                        description: 'Salmão com couve crocante'
                    },
                    {
                        name: 'Joe Shimeji',
                        description: 'Salmão com shimeji grelhado'
                    }
                ]
            },
            {
                category: 'Na Chapa',
                products: [
                    {
                        name: 'Chapa Shimeji',
                        description: 'Shimeji grelhado na chapa'
                    },
                    {
                        name: 'Chapa Shitake',
                        description: 'Shitake grelhado na chapa'
                    },
                    {
                        name: 'Chapa Mista',
                        description: 'Mix de cogumelos na chapa'
                    },
                    {
                        name: 'Chapa Polvo',
                        description: 'Polvo grelhado na chapa'
                    }
                ]
            },
            {
                category: 'Hot Roll',
                products: [
                    {
                        name: 'Hot Roll Shimeji',
                        description: 'Shimeji empanado, cream cheese'
                    },
                    {
                        name: 'Hot Roll Filadelfia',
                        description: 'Salmão, cream cheese empanado'
                    },
                    {
                        name: 'Hot Roll Doritos',
                        description: 'Doritos, salmão, cream cheese'
                    }
                ]
            },
            {
                category: 'Harumaki',
                products: [
                    {
                        name: 'Harumaki Queijo',
                        description: 'Massa crocante com queijo'
                    },
                    {
                        name: 'Harumaki Legumes',
                        description: 'Massa crocante com legumes'
                    }
                ]
            },
            {
                category: 'Hossomaki',
                products: [
                    {
                        name: 'Hossomaki Salmão',
                        description: 'Rolo fino de salmão'
                    },
                    {
                        name: 'Hossomaki Atum',
                        description: 'Rolo fino de atum'
                    },
                    {
                        name: 'Hossomaki Pepino',
                        description: 'Rolo fino de pepino'
                    },
                    {
                        name: 'Hossomaki Kanikama',
                        description: 'Rolo fino de kanikama'
                    }
                ]
            },
            {
                category: 'Sobremesa',
                products: [
                    {
                        name: 'Abacaxi Flambado',
                        description: 'Abacaxi caramelizado no açúcar'
                    },
                    {
                        name: 'Banana Flambada',
                        description: 'Banana caramelizada com canela'
                    },
                    {
                        name: 'Banana com Chocolate',
                        description: 'Banana com calda de chocolate'
                    },
                    {
                        name: 'Morango com Chocolate',
                        description: 'Morangos frescos com chocolate'
                    }
                ]
            },
            {
                category: 'Kids',
                products: [
                    {
                        name: 'Kids Temaki',
                        description: 'Mini temaki de salmão'
                    },
                    {
                        name: 'Kids Salmão',
                        description: 'Bolinhos de salmão empanados'
                    },
                    {
                        name: 'Kids Kanikama',
                        description: 'Bolinhos de kanikama'
                    }
                ]
            }
        ];
        for (const categoryData of otherProducts){
            const { data: category } = await supabase.from('categories').select('id').eq('name', categoryData.category).eq('group_id', 1).single();
            if (category) {
                for (const product of categoryData.products){
                    const { data: existing } = await supabase.from('items').select('id').eq('name', product.name).eq('category_id', category.id).single();
                    if (!existing) {
                        const { error } = await supabase.from('items').insert({
                            ...product,
                            price: 0,
                            category_id: category.id,
                            group_id: 1,
                            active: true,
                            available: true
                        });
                        if (!error) {
                            addedCount++;
                            console.log(`✅ Adicionado: ${product.name}`);
                        }
                    }
                }
            }
        }
        // 6. Configurar group_item_settings para Rodízio Tradicional
        console.log('\n📋 Configurando Rodízio Tradicional...');
        // Limpar configurações antigas
        await supabase.from('group_item_settings').delete().eq('group_id', 2);
        // Buscar todos os produtos não-premium
        const premiumNames = [
            'Vinagrete de Camarão',
            'Ceviche Especial',
            'Sashimi Polvo',
            'Sashimi Camarão',
            'Carpaccio Salmão Trufado',
            'Carpaccio Polvo Trufado',
            'Carpaccio Camarão Trufado',
            'Carpaccio Misto Trufado',
            'Niguiri Camarão',
            'Niguiri Polvo',
            'Niguiri Salmão Especial',
            'Niguiri Salmão Fry Ouro',
            'Uramaki Camarão',
            'Uramaki Salmão Fry Ouro',
            'Uramaki Camarão Fry Ouro',
            'Uramaki Salmão Mel Fry',
            'Acelgamaki Salmão Fry',
            'Joe Camarão',
            'Joe California',
            'Chapa Mista',
            'Chapa Polvo',
            'Chapa Camarão',
            'Hot Roll Camarão',
            'Harumaki Camarão',
            'Pastel Camarão',
            'Pastel Bacalhau',
            'Salmão MAAD',
            'Camarão MAAD',
            'Atum MAAD',
            'Kaka MAAD',
            'Ebi Hot Shake MAAD',
            'Dubai MAAD',
            'Lula Com Salmão',
            'Polvo no gelo',
            'Yakissoba Frutos do Mar',
            'Tempura Camarão',
            'Roru Tomato',
            'Camarão Na Chapa',
            'Atum Na Chapa',
            'Salmão Especial'
        ];
        const { data: itemsForTradicional } = await supabase.from('items').select('id, name').eq('group_id', 1);
        if (itemsForTradicional) {
            const nonPremiumItems = itemsForTradicional.filter((item)=>!premiumNames.includes(item.name));
            const settings = nonPremiumItems.map((item)=>({
                    group_id: 2,
                    item_id: item.id,
                    is_available: true,
                    sort_order: 0
                }));
            // Inserir em lotes
            const batchSize = 50;
            for(let i = 0; i < settings.length; i += batchSize){
                const batch = settings.slice(i, i + batchSize);
                await supabase.from('group_item_settings').insert(batch);
            }
            console.log(`✅ Rodízio Tradicional configurado com ${settings.length} produtos`);
        }
        // 7. Configurar À la Carte com preços
        console.log('\n💰 Configurando À la Carte com preços...');
        // Limpar configurações antigas
        await supabase.from('group_item_settings').delete().eq('group_id', 3);
        // Buscar todos os produtos para À la Carte
        const { data: allItems } = await supabase.from('items').select('id, name, category_id').eq('group_id', 1);
        const { data: categories } = await supabase.from('categories').select('id, name');
        const categoryMap = new Map(categories?.map((c)=>[
                c.id,
                c.name
            ]));
        if (allItems) {
            const alaCarteSettings = allItems.map((item)=>{
                const categoryName = categoryMap.get(item.category_id);
                let price = 25.90; // Preço padrão
                // Definir preços baseados na categoria e nome do produto
                if (categoryName === 'Entradas') {
                    price = item.name.includes('Especial') ? 28.90 : item.name.includes('Vinagrete') ? 24.90 : 18.90 + Math.random() * 6;
                } else if (categoryName === 'Sashimi') {
                    price = item.name.includes('Polvo') ? 42.90 : item.name.includes('Atum') ? 38.90 : item.name.includes('Salmão') ? 34.90 : 28.90 + Math.random() * 10;
                } else if (categoryName === 'Carpaccio') {
                    price = 45.90 + Math.random() * 10;
                } else if (categoryName === 'Niguiri') {
                    price = item.name.includes('Camarão') || item.name.includes('Polvo') ? 22.90 : item.name.includes('Especial') || item.name.includes('Ouro') ? 24.90 : 16.90 + Math.random() * 6;
                } else if (categoryName === 'Uramaki') {
                    price = item.name.includes('Camarão') ? 38.90 : item.name.includes('Ouro') || item.name.includes('Mel') ? 42.90 : 28.90 + Math.random() * 10;
                } else if (categoryName === 'Temaki') {
                    price = item.name.includes('Camarão') ? 26.90 : 19.90 + Math.random() * 6;
                } else if (categoryName === 'Joe') {
                    price = item.name.includes('Camarão') ? 34.90 : 24.90 + Math.random() * 8;
                } else if (categoryName === 'Na Chapa') {
                    price = item.name.includes('Camarão') || item.name.includes('Polvo') ? 48.90 : item.name.includes('Mista') ? 42.90 : 32.90 + Math.random() * 10;
                } else if (categoryName === 'Hot Roll') {
                    price = item.name.includes('Camarão') ? 36.90 : 26.90 + Math.random() * 8;
                } else if (categoryName === 'Sobremesa') {
                    price = item.name.includes('Nutella') ? 22.90 : item.name.includes('Flambad') ? 19.90 : 14.90 + Math.random() * 8;
                } else if (categoryName === 'Kids') {
                    price = item.name.includes('Prato') ? 24.90 : item.name.includes('Porção') ? 18.90 : 14.90 + Math.random() * 6;
                }
                return {
                    group_id: 3,
                    item_id: item.id,
                    price_override: parseFloat(price.toFixed(2)),
                    is_available: true,
                    sort_order: 0
                };
            });
            // Dividir em lotes menores para evitar timeout
            const batchSize = 50;
            for(let i = 0; i < alaCarteSettings.length; i += batchSize){
                const batch = alaCarteSettings.slice(i, i + batchSize);
                await supabase.from('group_item_settings').insert(batch);
                console.log(`✅ Lote ${i / batchSize + 1} inserido (${batch.length} produtos)`);
            }
            console.log(`✅ À la Carte configurado com ${alaCarteSettings.length} produtos com preços`);
        }
        // 8. Verificar resultado final
        const { count: finalCount } = await supabase.from('items').select('*', {
            count: 'exact',
            head: true
        }).eq('group_id', 1);
        const { count: traditionalCount } = await supabase.from('group_item_settings').select('*', {
            count: 'exact',
            head: true
        }).eq('group_id', 2);
        const { count: alaCarteCount } = await supabase.from('group_item_settings').select('*', {
            count: 'exact',
            head: true
        }).eq('group_id', 3);
        const result = {
            success: true,
            message: 'Banco de dados populado com sucesso!',
            stats: {
                newProducts: addedCount,
                rodizio_premium: finalCount || 0,
                rodizio_tradicional: traditionalCount || 0,
                a_la_carte: alaCarteCount || 0
            }
        };
        console.log('\n📊 Resultado Final:', result);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (error) {
        console.error('❌ Erro ao popular banco:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Erro ao popular banco de dados',
            details: error
        }, {
            status: 500
        });
    }
}
async function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        message: "Use POST para popular o banco de dados"
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c96adac3._.js.map