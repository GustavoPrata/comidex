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
"[project]/lib/mock-data.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Mock data para funcionamento sem Supabase
__turbopack_context__.s([
    "mockCategories",
    ()=>mockCategories,
    "mockDatabase",
    ()=>mockDatabase,
    "mockGroups",
    ()=>mockGroups,
    "mockItems",
    ()=>mockItems,
    "mockOrders",
    ()=>mockOrders,
    "mockPrinters",
    ()=>mockPrinters,
    "mockSessions",
    ()=>mockSessions,
    "mockTables",
    ()=>mockTables
]);
const mockGroups = [
    {
        id: '1',
        name: 'Rodízio Premium',
        description: 'Cardápio completo com pratos especiais',
        price: 189.00,
        type: 'rodizio',
        active: true,
        sort_order: 1,
        icon_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Rodízio Tradicional',
        description: 'Cardápio tradicional',
        price: 129.00,
        type: 'rodizio',
        active: true,
        sort_order: 2,
        icon_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        name: 'À la Carte',
        description: 'Pedidos individuais',
        price: null,
        type: 'a_la_carte',
        active: true,
        sort_order: 3,
        icon_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '4',
        name: 'Bebidas',
        description: 'Bebidas e drinks',
        price: null,
        type: 'bebidas',
        active: true,
        sort_order: 4,
        icon_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
const mockCategories = [
    {
        id: '1',
        name: 'Entradas',
        description: 'Pratos de entrada',
        active: true,
        sort_order: 1,
        group_id: '1',
        image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Sashimis',
        description: 'Peixes crus fatiados',
        active: true,
        sort_order: 2,
        group_id: '1',
        image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Niguiris',
        description: 'Bolinhos de arroz com peixe',
        active: true,
        sort_order: 3,
        group_id: '1',
        image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '4',
        name: 'Uramakis',
        description: 'Rolos invertidos',
        active: true,
        sort_order: 4,
        group_id: '1',
        image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '5',
        name: 'Hot Rolls',
        description: 'Rolos empanados e fritos',
        active: true,
        sort_order: 5,
        group_id: '1',
        image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '6',
        name: 'Temakis',
        description: 'Cones de alga com recheio',
        active: true,
        sort_order: 6,
        group_id: '3',
        image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '7',
        name: 'Bebidas',
        description: 'Refrigerantes e sucos',
        active: true,
        sort_order: 7,
        group_id: '4',
        image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '8',
        name: 'Sobremesas',
        description: 'Doces e sobremesas',
        active: true,
        sort_order: 8,
        group_id: '3',
        image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
const mockItems = [
    // Entradas
    {
        id: '1',
        name: 'Gyoza',
        description: 'Pastel japonês com recheio de carne suína',
        quantity: '6 unidades',
        price: null,
        category_id: '1',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Sunomono',
        description: 'Salada de pepino agridoce',
        quantity: 'Porção',
        price: null,
        category_id: '1',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Harumaki',
        description: 'Rolinho primavera com legumes',
        quantity: '4 unidades',
        price: null,
        category_id: '1',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    // Sashimis
    {
        id: '4',
        name: 'Sashimi de Salmão',
        description: 'Fatias de salmão fresco',
        quantity: '10 fatias',
        price: null,
        category_id: '2',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '5',
        name: 'Sashimi de Atum',
        description: 'Fatias de atum fresco',
        quantity: '10 fatias',
        price: null,
        category_id: '2',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '6',
        name: 'Sashimi de Peixe Branco',
        description: 'Fatias de peixe branco',
        quantity: '10 fatias',
        price: null,
        category_id: '2',
        group_id: '1',
        active: true,
        available: false,
        spicy: false,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    // Niguiris
    {
        id: '7',
        name: 'Niguiri de Salmão',
        description: 'Arroz com salmão',
        quantity: '2 unidades',
        price: null,
        category_id: '3',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '8',
        name: 'Niguiri de Atum',
        description: 'Arroz com atum',
        quantity: '2 unidades',
        price: null,
        category_id: '3',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '9',
        name: 'Niguiri de Camarão',
        description: 'Arroz com camarão',
        quantity: '2 unidades',
        price: null,
        category_id: '3',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    // Uramakis
    {
        id: '10',
        name: 'Uramaki Califórnia',
        description: 'Kani, pepino, manga e cream cheese',
        quantity: '8 peças',
        price: null,
        category_id: '4',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '11',
        name: 'Uramaki Philadelphia',
        description: 'Salmão e cream cheese',
        quantity: '8 peças',
        price: null,
        category_id: '4',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '12',
        name: 'Uramaki Especial ComideX',
        description: 'Salmão flambado com molho especial',
        quantity: '10 peças',
        price: null,
        category_id: '4',
        group_id: '1',
        active: true,
        available: true,
        spicy: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    // Hot Rolls
    {
        id: '13',
        name: 'Hot Philadelphia',
        description: 'Salmão, cream cheese, empanado e frito',
        quantity: '10 peças',
        price: null,
        category_id: '5',
        group_id: '1',
        active: true,
        available: true,
        spicy: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '14',
        name: 'Hot Banana',
        description: 'Banana, doce de leite, empanado',
        quantity: '8 peças',
        price: null,
        category_id: '5',
        group_id: '1',
        active: true,
        available: true,
        spicy: false,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '15',
        name: 'Hot Especial',
        description: 'Atum, cream cheese, empanado com doritos',
        quantity: '10 peças',
        price: null,
        category_id: '5',
        group_id: '1',
        active: true,
        available: true,
        spicy: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    // Temakis (À la carte)
    {
        id: '16',
        name: 'Temaki de Salmão',
        description: 'Cone com salmão e cream cheese',
        quantity: '1 unidade',
        price: 28.90,
        category_id: '6',
        group_id: '3',
        active: true,
        available: true,
        spicy: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '17',
        name: 'Temaki de Atum',
        description: 'Cone com atum picante',
        quantity: '1 unidade',
        price: 32.90,
        category_id: '6',
        group_id: '3',
        active: true,
        available: true,
        spicy: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '18',
        name: 'Temaki Califórnia',
        description: 'Cone com kani e manga',
        quantity: '1 unidade',
        price: 26.90,
        category_id: '6',
        group_id: '3',
        active: true,
        available: true,
        spicy: false,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    // Bebidas
    {
        id: '19',
        name: 'Coca-Cola',
        description: 'Lata 350ml',
        quantity: '350ml',
        price: 8.00,
        category_id: '7',
        group_id: '4',
        active: true,
        available: true,
        spicy: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '20',
        name: 'Água Mineral',
        description: 'Garrafa 500ml',
        quantity: '500ml',
        price: 5.00,
        category_id: '7',
        group_id: '4',
        active: true,
        available: true,
        spicy: false,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '21',
        name: 'Suco Natural',
        description: 'Laranja ou Limão',
        quantity: '300ml',
        price: 12.00,
        category_id: '7',
        group_id: '4',
        active: true,
        available: true,
        spicy: false,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '22',
        name: 'Sake',
        description: 'Dose tradicional',
        quantity: '50ml',
        price: 18.00,
        category_id: '7',
        group_id: '4',
        active: true,
        available: true,
        spicy: false,
        sort_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    // Sobremesas
    {
        id: '23',
        name: 'Petit Gateau',
        description: 'Bolinho de chocolate com sorvete',
        quantity: '1 unidade',
        price: 22.00,
        category_id: '8',
        group_id: '3',
        active: true,
        available: true,
        spicy: false,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '24',
        name: 'Tempurá de Sorvete',
        description: 'Sorvete empanado e frito',
        quantity: '1 unidade',
        price: 24.00,
        category_id: '8',
        group_id: '3',
        active: true,
        available: true,
        spicy: false,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '25',
        name: 'Dorayaki',
        description: 'Panqueca japonesa com doce de feijão',
        quantity: '1 unidade',
        price: 15.00,
        category_id: '8',
        group_id: '3',
        active: true,
        available: true,
        spicy: false,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
const mockTables = [
    {
        id: '1',
        name: 'Mesa 1',
        number: 1,
        type: 'table',
        capacity: 4,
        active: true,
        sort_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Mesa 2',
        number: 2,
        type: 'table',
        capacity: 4,
        active: true,
        sort_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Mesa 3',
        number: 3,
        type: 'table',
        capacity: 6,
        active: true,
        sort_order: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '4',
        name: 'Mesa 4',
        number: 4,
        type: 'table',
        capacity: 2,
        active: true,
        sort_order: 4,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '5',
        name: 'Mesa 5',
        number: 5,
        type: 'table',
        capacity: 4,
        active: true,
        sort_order: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '6',
        name: 'Mesa 6',
        number: 6,
        type: 'table',
        capacity: 8,
        active: true,
        sort_order: 6,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '7',
        name: 'Mesa 7',
        number: 7,
        type: 'table',
        capacity: 4,
        active: true,
        sort_order: 7,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '8',
        name: 'Mesa 8',
        number: 8,
        type: 'table',
        capacity: 6,
        active: true,
        sort_order: 8,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '9',
        name: 'Mesa 9',
        number: 9,
        type: 'table',
        capacity: 4,
        active: true,
        sort_order: 9,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '10',
        name: 'Mesa 10',
        number: 10,
        type: 'table',
        capacity: 4,
        active: true,
        sort_order: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '11',
        name: 'Mesa VIP 1',
        number: 11,
        type: 'table',
        capacity: 10,
        active: true,
        sort_order: 11,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '12',
        name: 'Mesa VIP 2',
        number: 12,
        type: 'table',
        capacity: 10,
        active: true,
        sort_order: 12,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '13',
        name: 'Balcão 1',
        number: 13,
        type: 'counter',
        capacity: 1,
        active: true,
        sort_order: 13,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '14',
        name: 'Balcão 2',
        number: 14,
        type: 'counter',
        capacity: 1,
        active: true,
        sort_order: 14,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '15',
        name: 'Balcão 3',
        number: 15,
        type: 'counter',
        capacity: 1,
        active: true,
        sort_order: 15,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
const mockPrinters = [
    {
        id: '1',
        name: 'Cozinha Principal',
        location: 'Cozinha',
        type: 'kitchen',
        ip: '192.168.1.100',
        port: 9100,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Bar',
        location: 'Bar',
        type: 'bar',
        ip: '192.168.1.101',
        port: 9100,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Caixa',
        location: 'Recepção',
        type: 'cashier',
        ip: '192.168.1.102',
        port: 9100,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '4',
        name: 'Backup',
        location: 'Escritório',
        type: 'backup',
        ip: '192.168.1.103',
        port: 9100,
        active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
let mockSessions = [];
let mockOrders = [];
const mockDatabase = {
    items: {
        getAll: ()=>mockItems,
        getById: (id)=>mockItems.find((item)=>item.id === id),
        create: (item)=>{
            const newItem = {
                ...item,
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            mockItems.push(newItem);
            return newItem;
        },
        update: (id, updates)=>{
            const index = mockItems.findIndex((item)=>item.id === id);
            if (index !== -1) {
                mockItems[index] = {
                    ...mockItems[index],
                    ...updates,
                    updated_at: new Date().toISOString()
                };
                return mockItems[index];
            }
            return null;
        },
        delete: (id)=>{
            const index = mockItems.findIndex((item)=>item.id === id);
            if (index !== -1) {
                const deleted = mockItems[index];
                mockItems.splice(index, 1);
                return deleted;
            }
            return null;
        }
    },
    tables: {
        getAll: ()=>mockTables,
        getById: (id)=>mockTables.find((table)=>table.id === id)
    },
    sessions: {
        getAll: ()=>mockSessions,
        getActive: ()=>mockSessions.filter((s)=>s.status === 'active'),
        create: (session)=>{
            const newSession = {
                ...session,
                id: Date.now().toString(),
                opened_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            mockSessions.push(newSession);
            return newSession;
        },
        update: (id, updates)=>{
            const index = mockSessions.findIndex((s)=>s.id === id);
            if (index !== -1) {
                mockSessions[index] = {
                    ...mockSessions[index],
                    ...updates,
                    updated_at: new Date().toISOString()
                };
                return mockSessions[index];
            }
            return null;
        }
    },
    orders: {
        getAll: ()=>mockOrders,
        getBySession: (sessionId)=>mockOrders.filter((o)=>o.session_id === sessionId),
        create: (order)=>{
            const newOrder = {
                ...order,
                id: Date.now().toString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            mockOrders.push(newOrder);
            return newOrder;
        },
        update: (id, updates)=>{
            const index = mockOrders.findIndex((o)=>o.id === id);
            if (index !== -1) {
                mockOrders[index] = {
                    ...mockOrders[index],
                    ...updates,
                    updated_at: new Date().toISOString()
                };
                return mockOrders[index];
            }
            return null;
        }
    },
    categories: {
        getAll: ()=>mockCategories,
        getById: (id)=>mockCategories.find((cat)=>cat.id === id)
    },
    groups: {
        getAll: ()=>mockGroups,
        getById: (id)=>mockGroups.find((group)=>group.id === id)
    },
    printers: {
        getAll: ()=>mockPrinters,
        getById: (id)=>mockPrinters.find((printer)=>printer.id === id)
    }
};
}),
"[project]/lib/supabase/mock-client.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/mock-data.ts [app-route] (ecmascript)");
;
function createClient() {
    return {
        from: (table)=>({
                select: (columns)=>({
                        eq: (column, value)=>({
                                data: null,
                                error: null,
                                single: ()=>({
                                        data: null,
                                        error: null
                                    })
                            }),
                        order: (column, options)=>({
                                data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockDatabase"][table]?.getAll?.() || [],
                                error: null
                            }),
                        single: ()=>({
                                data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockDatabase"][table]?.getAll?.()[0] || null,
                                error: null
                            }),
                        data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockDatabase"][table]?.getAll?.() || [],
                        error: null
                    }),
                insert: (data)=>({
                        select: ()=>({
                                single: ()=>({
                                        data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockDatabase"][table]?.create?.(data) || null,
                                        error: null
                                    }),
                                data: [
                                    __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockDatabase"][table]?.create?.(data)
                                ] || [],
                                error: null
                            }),
                        data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockDatabase"][table]?.create?.(data) || null,
                        error: null
                    }),
                update: (data)=>({
                        eq: (column, value)=>({
                                select: ()=>({
                                        single: ()=>({
                                                data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockDatabase"][table]?.update?.(value, data) || null,
                                                error: null
                                            })
                                    }),
                                data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockDatabase"][table]?.update?.(value, data) || null,
                                error: null
                            })
                    }),
                delete: ()=>({
                        eq: (column, value)=>({
                                data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$mock$2d$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["mockDatabase"][table]?.delete?.(value) || null,
                                error: null
                            })
                    })
            })
    };
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$mock$2d$client$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/mock-client.ts [app-route] (ecmascript)");
;
;
;
async function createClient() {
    // Usar mock client se não houver configuração do Supabase
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscXZxcmdqcW93ZXJ2ZXhjb3N2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTE5NDUsImV4cCI6MjA3NjY4Nzk0NX0.MAZpzWMLZ8_fw4eiHAp3S6D3d6v18rDewMyX4-QMCBc"), ("TURBOPACK compile-time value", "https://wlqvqrgjqowervexcosv.supabase.co"), {
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
}
}),
"[project]/app/api/items/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const group = searchParams.get('group');
        let query = supabase.from('items').select(`
        *,
        categories (name),
        groups (name)
      `).eq('active', true).order('sort_order');
        if (category) {
            query = query.eq('category_id', category);
        }
        if (group) {
            query = query.eq('group_id', group);
        }
        const { data, error } = await query;
        if (error) throw error;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data || []);
    } catch (error) {
        console.error('Error fetching items:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch items'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createClient"])();
        const body = await request.json();
        const { data, error } = await supabase.from('items').insert(body).select().single();
        if (error) throw error;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data, {
            status: 201
        });
    } catch (error) {
        console.error('Error creating item:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to create item'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ca3cf89._.js.map