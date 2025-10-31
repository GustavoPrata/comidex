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
"[externals]/pg [external] (pg, esm_import)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

const mod = await __turbopack_context__.y("pg");

__turbopack_context__.n(mod);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, true);}),
"[project]/lib/database/config.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Configuração da conexão PostgreSQL
// Você pode editar a URL abaixo com suas credenciais
__turbopack_context__.s([
    "DATABASE_CONFIG",
    ()=>DATABASE_CONFIG,
    "validateConnectionString",
    ()=>validateConnectionString
]);
const DATABASE_CONFIG = {
    // Cole sua URL de conexão PostgreSQL aqui:
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres.wlqvqrgjqowervexcosv:ds4ad456sad546as654d@aws-1-us-east-1.pooler.supabase.com:5432/postgres',
    // Configurações do pool de conexões
    poolConfig: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000
    }
};
function validateConnectionString(url) {
    try {
        // Verifica se é uma URL PostgreSQL válida
        return url.startsWith('postgresql://') || url.startsWith('postgres://');
    } catch  {
        return false;
    }
}
}),
"[project]/app/api/db/[table]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/database/config.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
// Conexão PostgreSQL usando a configuração centralizada
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DATABASE_CONFIG"].connectionString,
    ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$database$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["DATABASE_CONFIG"].poolConfig
});
async function GET(request, { params }) {
    const { table } = await params;
    const searchParams = request.nextUrl.searchParams;
    const columns = searchParams.get('columns') || '*';
    const limit = searchParams.get('limit');
    const single = searchParams.get('single') === 'true';
    const order = searchParams.get('order');
    try {
        let query = `SELECT ${columns} FROM ${table}`;
        const values = [];
        let paramCount = 1;
        // Adicionar filtros WHERE
        const whereConditions = [];
        for (const [key, value] of searchParams.entries()){
            if (key !== 'columns' && key !== 'limit' && key !== 'single' && key !== 'order') {
                if (key.endsWith('_in')) {
                    const column = key.replace('_in', '');
                    const inValues = value.split(',');
                    const placeholders = inValues.map(()=>`$${paramCount++}`).join(',');
                    whereConditions.push(`${column} IN (${placeholders})`);
                    values.push(...inValues);
                } else {
                    whereConditions.push(`${key} = $${paramCount++}`);
                    values.push(value);
                }
            }
        }
        if (whereConditions.length > 0) {
            query += ` WHERE ${whereConditions.join(' AND ')}`;
        }
        // Adicionar ORDER BY
        if (order) {
            const [column, direction] = order.split('.');
            query += ` ORDER BY ${column} ${direction === 'desc' ? 'DESC' : 'ASC'}`;
        } else {
            query += ` ORDER BY id`;
        }
        // Adicionar LIMIT
        if (single) {
            query += ` LIMIT 1`;
        } else if (limit) {
            query += ` LIMIT $${paramCount++}`;
            values.push(parseInt(limit));
        }
        const result = await pool.query(query, values);
        const data = single ? result.rows[0] || null : result.rows;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data,
            error: null
        });
    } catch (error) {
        console.error(`Error fetching from ${table}:`, error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: null,
            error: {
                message: error.message
            }
        }, {
            status: 500
        });
    }
}
async function POST(request, { params }) {
    const { table } = await params;
    try {
        const body = await request.json();
        const items = Array.isArray(body) ? body : [
            body
        ];
        const results = [];
        for (const item of items){
            const keys = Object.keys(item);
            const values = Object.values(item);
            const placeholders = keys.map((_, i)=>`$${i + 1}`).join(', ');
            const query = `
        INSERT INTO ${table} (${keys.join(', ')}) 
        VALUES (${placeholders}) 
        RETURNING *
      `;
            const result = await pool.query(query, values);
            results.push(result.rows[0]);
        }
        const data = Array.isArray(body) ? results : results[0];
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data,
            error: null
        });
    } catch (error) {
        console.error(`Error inserting into ${table}:`, error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: null,
            error: {
                message: error.message
            }
        }, {
            status: 500
        });
    }
}
async function PUT(request, { params }) {
    const { table } = await params;
    try {
        const { data, where } = await request.json();
        const dataKeys = Object.keys(data);
        const dataValues = Object.values(data);
        const whereKey = Object.keys(where)[0];
        const whereValue = where[whereKey];
        const setClause = dataKeys.map((key, i)=>`${key} = $${i + 2}`).join(', ');
        const query = `
      UPDATE ${table} 
      SET ${setClause}, updated_at = NOW()
      WHERE ${whereKey} = $1 
      RETURNING *
    `;
        const result = await pool.query(query, [
            whereValue,
            ...dataValues
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: result.rows,
            error: null
        });
    } catch (error) {
        console.error(`Error updating ${table}:`, error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: null,
            error: {
                message: error.message
            }
        }, {
            status: 500
        });
    }
}
async function DELETE(request, { params }) {
    const { table } = await params;
    try {
        const { where } = await request.json();
        const whereKey = Object.keys(where)[0];
        const whereValue = where[whereKey];
        const query = `DELETE FROM ${table} WHERE ${whereKey} = $1 RETURNING *`;
        const result = await pool.query(query, [
            whereValue
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: result.rows,
            error: null
        });
    } catch (error) {
        console.error(`Error deleting from ${table}:`, error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            data: null,
            error: {
                message: error.message
            }
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cb3e3453._.js.map