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
        console.log('✅ Supabase configurado corretamente!');
        console.log('   URL:', supabaseUrl.substring(0, 40) + '...');
        console.log('   Key:', supabaseKey.substring(0, 20) + '...');
        return {
            url: supabaseUrl,
            anonKey: supabaseKey,
            configured: true
        };
    } else {
        console.warn('⚠️ Supabase não configurado ou variáveis inválidas');
        console.log('   ENV1:', env1.substring(0, 30));
        console.log('   ENV2:', env2.substring(0, 30));
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
        console.log('✅ [Server] Conectando ao Supabase real...');
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
"[project]/app/api/icons/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        // Usar função SQL em vez de acessar a tabela diretamente
        const { data: icons, error } = await supabase.rpc('get_all_icons');
        if (error) {
            console.error('Error fetching icons:', error);
            // Se houver qualquer erro, retornar os ícones hardcoded
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(getHardcodedIcons());
        }
        // Se não houver ícones, retornar os hardcoded
        if (!icons || icons.length === 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(getHardcodedIcons());
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(icons);
    } catch (error) {
        console.error('Error in GET /api/icons:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(getHardcodedIcons());
    }
}
function getHardcodedIcons() {
    return [
        // Japanese
        {
            id: 'sushi',
            name: 'Sushi',
            category: 'japanese',
            emoji: '🍣'
        },
        {
            id: 'rice-cooker',
            name: 'Arroz',
            category: 'japanese',
            emoji: '🍚'
        },
        {
            id: 'noodles',
            name: 'Lámen',
            category: 'japanese',
            emoji: '🍜'
        },
        {
            id: 'rice-bowl',
            name: 'Tigela de Arroz',
            category: 'japanese',
            emoji: '🍚'
        },
        {
            id: 'chopsticks',
            name: 'Hashi',
            category: 'japanese',
            emoji: '🥢'
        },
        {
            id: 'teapot',
            name: 'Bule de Chá',
            category: 'japanese',
            emoji: '🍵'
        },
        {
            id: 'dumpling',
            name: 'Gyoza',
            category: 'japanese',
            emoji: '🥟'
        },
        {
            id: 'boba',
            name: 'Bubble Tea',
            category: 'japanese',
            emoji: '🧋'
        },
        {
            id: 'bowl-spiral',
            name: 'Ramen Bowl',
            category: 'japanese',
            emoji: '🍜'
        },
        {
            id: 'fish-cooked',
            name: 'Peixe Grelhado',
            category: 'japanese',
            emoji: '🐟'
        },
        {
            id: 'fish-bucket',
            name: 'Balde de Peixe',
            category: 'japanese',
            emoji: '🪣'
        },
        // Seafood
        {
            id: 'fish',
            name: 'Peixe',
            category: 'seafood',
            emoji: '🐟'
        },
        {
            id: 'octopus',
            name: 'Polvo',
            category: 'seafood',
            emoji: '🐙'
        },
        {
            id: 'shrimp',
            name: 'Camarão',
            category: 'seafood',
            emoji: '🦐'
        },
        {
            id: 'crab',
            name: 'Caranguejo',
            category: 'seafood',
            emoji: '🦀'
        },
        {
            id: 'salmon',
            name: 'Salmão',
            category: 'seafood',
            emoji: '🐟'
        },
        {
            id: 'squid',
            name: 'Lula',
            category: 'seafood',
            emoji: '🦑'
        },
        {
            id: 'oyster',
            name: 'Ostra',
            category: 'seafood',
            emoji: '🦪'
        },
        {
            id: 'lobster',
            name: 'Lagosta',
            category: 'seafood',
            emoji: '🦞'
        },
        // Drinks
        {
            id: 'wine',
            name: 'Vinho',
            category: 'drinks',
            emoji: '🍷'
        },
        {
            id: 'coffee',
            name: 'Café',
            category: 'drinks',
            emoji: '☕'
        },
        {
            id: 'beer',
            name: 'Cerveja',
            category: 'drinks',
            emoji: '🍺'
        },
        {
            id: 'martini',
            name: 'Martini',
            category: 'drinks',
            emoji: '🍸'
        },
        {
            id: 'soda',
            name: 'Refrigerante',
            category: 'drinks',
            emoji: '🥤'
        },
        {
            id: 'milk',
            name: 'Leite',
            category: 'drinks',
            emoji: '🥛'
        },
        {
            id: 'champagne',
            name: 'Champagne',
            category: 'drinks',
            emoji: '🥂'
        },
        {
            id: 'juice',
            name: 'Suco Natural',
            category: 'drinks',
            emoji: '🧃'
        },
        // Vegetables
        {
            id: 'tomato',
            name: 'Tomate',
            category: 'vegetables',
            emoji: '🍅'
        },
        {
            id: 'mushroom',
            name: 'Cogumelo',
            category: 'vegetables',
            emoji: '🍄'
        },
        {
            id: 'garlic',
            name: 'Alho',
            category: 'vegetables',
            emoji: '🧄'
        },
        {
            id: 'chili',
            name: 'Pimenta',
            category: 'vegetables',
            emoji: '🌶️'
        },
        {
            id: 'broccoli',
            name: 'Brócolis',
            category: 'vegetables',
            emoji: '🥦'
        },
        {
            id: 'avocado',
            name: 'Abacate',
            category: 'vegetables',
            emoji: '🥑'
        },
        {
            id: 'carrot',
            name: 'Cenoura',
            category: 'vegetables',
            emoji: '🥕'
        },
        {
            id: 'salad',
            name: 'Salada',
            category: 'vegetables',
            emoji: '🥗'
        },
        {
            id: 'corn',
            name: 'Milho',
            category: 'vegetables',
            emoji: '🌽'
        },
        {
            id: 'potato',
            name: 'Batata',
            category: 'vegetables',
            emoji: '🥔'
        },
        // Fruits
        {
            id: 'coconut',
            name: 'Coco',
            category: 'fruits',
            emoji: '🥥'
        },
        {
            id: 'orange',
            name: 'Laranja',
            category: 'fruits',
            emoji: '🍊'
        },
        {
            id: 'strawberry',
            name: 'Morango',
            category: 'fruits',
            emoji: '🍓'
        },
        {
            id: 'watermelon',
            name: 'Melancia',
            category: 'fruits',
            emoji: '🍉'
        },
        {
            id: 'cherry',
            name: 'Cereja',
            category: 'fruits',
            emoji: '🍒'
        },
        {
            id: 'apple',
            name: 'Maçã',
            category: 'fruits',
            emoji: '🍎'
        },
        {
            id: 'grape',
            name: 'Uva',
            category: 'fruits',
            emoji: '🍇'
        },
        {
            id: 'banana',
            name: 'Banana',
            category: 'fruits',
            emoji: '🍌'
        },
        {
            id: 'pineapple',
            name: 'Abacaxi',
            category: 'fruits',
            emoji: '🍍'
        },
        {
            id: 'pear',
            name: 'Pera',
            category: 'fruits',
            emoji: '🍐'
        },
        {
            id: 'lemon',
            name: 'Limão',
            category: 'fruits',
            emoji: '🍋'
        },
        // Desserts
        {
            id: 'cookie',
            name: 'Biscoito',
            category: 'desserts',
            emoji: '🍪'
        },
        {
            id: 'cake',
            name: 'Bolo',
            category: 'desserts',
            emoji: '🎂'
        },
        {
            id: 'ice-cream',
            name: 'Sorvete',
            category: 'desserts',
            emoji: '🍨'
        },
        {
            id: 'croissant',
            name: 'Croissant',
            category: 'desserts',
            emoji: '🥐'
        },
        {
            id: 'candy',
            name: 'Doce',
            category: 'desserts',
            emoji: '🍬'
        },
        {
            id: 'donut',
            name: 'Donuts',
            category: 'desserts',
            emoji: '🍩'
        },
        {
            id: 'cupcake',
            name: 'Cupcake',
            category: 'desserts',
            emoji: '🧁'
        },
        {
            id: 'chocolate',
            name: 'Chocolate',
            category: 'desserts',
            emoji: '🍫'
        },
        {
            id: 'honey',
            name: 'Mel',
            category: 'desserts',
            emoji: '🍯'
        },
        {
            id: 'pretzel',
            name: 'Pretzel',
            category: 'desserts',
            emoji: '🥨'
        },
        // General
        {
            id: 'soup',
            name: 'Sopa',
            category: 'general',
            emoji: '🍲'
        },
        {
            id: 'pizza',
            name: 'Pizza',
            category: 'general',
            emoji: '🍕'
        },
        {
            id: 'beef',
            name: 'Carne',
            category: 'general',
            emoji: '🥩'
        },
        {
            id: 'sandwich',
            name: 'Sanduíche',
            category: 'general',
            emoji: '🥪'
        },
        {
            id: 'utensils',
            name: 'Talheres',
            category: 'general',
            emoji: '🍴'
        },
        {
            id: 'chef-hat',
            name: 'Chapéu de Chef',
            category: 'general',
            emoji: '👨‍🍳'
        },
        {
            id: 'egg',
            name: 'Ovo',
            category: 'general',
            emoji: '🥚'
        },
        {
            id: 'wheat',
            name: 'Trigo',
            category: 'general',
            emoji: '🌾'
        },
        {
            id: 'flame',
            name: 'Grelhado',
            category: 'general',
            emoji: '🔥'
        },
        {
            id: 'popcorn',
            name: 'Pipoca',
            category: 'general',
            emoji: '🍿'
        },
        {
            id: 'tacos',
            name: 'Tacos',
            category: 'general',
            emoji: '🌮'
        },
        {
            id: 'hot-dog',
            name: 'Hot Dog',
            category: 'general',
            emoji: '🌭'
        },
        {
            id: 'bread',
            name: 'Pão',
            category: 'general',
            emoji: '🍞'
        },
        {
            id: 'steak',
            name: 'Bife',
            category: 'general',
            emoji: '🥩'
        },
        {
            id: 'chicken-leg',
            name: 'Coxa de Frango',
            category: 'general',
            emoji: '🍗'
        },
        // Special
        {
            id: 'star',
            name: 'Estrela',
            category: 'special',
            emoji: '⭐'
        },
        {
            id: 'crown',
            name: 'Coroa Premium',
            category: 'special',
            emoji: '👑'
        },
        {
            id: 'gem',
            name: 'Diamante',
            category: 'special',
            emoji: '💎'
        },
        {
            id: 'trophy',
            name: 'Troféu',
            category: 'special',
            emoji: '🏆'
        },
        {
            id: 'medal',
            name: 'Medalha',
            category: 'special',
            emoji: '🏅'
        },
        {
            id: 'award',
            name: 'Prêmio',
            category: 'special',
            emoji: '🎖️'
        },
        {
            id: 'sparkles',
            name: 'Brilho',
            category: 'special',
            emoji: '✨'
        },
        {
            id: 'zap',
            name: 'Energia',
            category: 'special',
            emoji: '⚡'
        },
        {
            id: 'heart',
            name: 'Favorito',
            category: 'special',
            emoji: '❤️'
        },
        {
            id: 'shield',
            name: 'Qualidade',
            category: 'special',
            emoji: '🛡️'
        },
        {
            id: 'target',
            name: 'Seleção',
            category: 'special',
            emoji: '🎯'
        },
        {
            id: 'circle-check',
            name: 'Aprovado',
            category: 'special',
            emoji: '✅'
        },
        {
            id: 'badge-check',
            name: 'Certificado',
            category: 'special',
            emoji: '📛'
        },
        {
            id: 'crown-coin',
            name: 'Rodízio Premium',
            category: 'special',
            emoji: '👑'
        },
        {
            id: 'diamonds',
            name: 'Luxo',
            category: 'special',
            emoji: '💎'
        },
        {
            id: 'crystal',
            name: 'Cristal',
            category: 'special',
            emoji: '💠'
        },
        {
            id: 'round-star',
            name: 'Tradicional',
            category: 'special',
            emoji: '🌟'
        },
        {
            id: 'flame-special',
            name: 'Hot',
            category: 'special',
            emoji: '🔥'
        },
        {
            id: 'sparkle-gi',
            name: 'Especial',
            category: 'special',
            emoji: '✨'
        },
        {
            id: 'all-you-can-eat',
            name: 'Rodízio',
            category: 'special',
            emoji: '🍜'
        }
    ];
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ceab1aed._.js.map