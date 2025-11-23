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
"[project]/app/api/admin/menu-structure/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
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
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$29$__["Pool"]({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : {
        rejectUnauthorized: false
    }
});
async function GET(request) {
    try {
        // Buscar grupos com suas categorias
        const groupsQuery = `
      SELECT 
        g.id,
        g.name,
        g.description,
        g.type,
        g.price,
        g.half_price,
        g.active,
        g.sort_order,
        g.icon,
        g.created_at,
        g.updated_at
      FROM groups g
      ORDER BY g.sort_order, g.id
    `;
        const categoriesQuery = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.image,
        c.active,
        c.sort_order,
        c.group_id,
        c.created_at,
        c.updated_at,
        COUNT(i.id) as item_count
      FROM categories c
      LEFT JOIN items i ON i.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order, c.id
    `;
        const [groupsResult, categoriesResult] = await Promise.all([
            pool.query(groupsQuery),
            pool.query(categoriesQuery)
        ]);
        const groups = groupsResult.rows;
        const categories = categoriesResult.rows;
        // Organizar categorias por grupo
        const groupsWithCategories = groups.map((group)=>{
            const groupCategories = categories.filter((cat)=>cat.group_id === group.id).map((cat)=>({
                    ...cat,
                    itemCount: parseInt(cat.item_count || 0)
                }));
            const itemCount = groupCategories.reduce((sum, cat)=>sum + cat.itemCount, 0);
            return {
                ...group,
                categories: groupCategories,
                itemCount
            };
        });
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            groups: groupsWithCategories
        });
    } catch (error) {
        console.error('Erro ao carregar estrutura do menu:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Erro ao carregar estrutura do menu'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { type, data } = body;
        if (type === 'group') {
            const { name, description, type: groupType, price, half_price, active, sort_order, icon } = data;
            const query = `
        INSERT INTO groups (name, description, type, price, half_price, active, sort_order, icon)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
            const result = await pool.query(query, [
                name,
                description || null,
                groupType || 'a_la_carte',
                price || null,
                half_price || null,
                active !== false,
                sort_order || 0,
                icon || null
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                group: result.rows[0]
            });
        }
        if (type === 'category') {
            const { name, description, image, group_id, active, sort_order } = data;
            const query = `
        INSERT INTO categories (name, description, image, group_id, active, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
            const result = await pool.query(query, [
                name,
                description || null,
                image || null,
                group_id,
                active !== false,
                sort_order || 0
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                category: result.rows[0]
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Tipo inválido'
        }, {
            status: 400
        });
    } catch (error) {
        console.error('Erro ao criar item:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Erro ao criar item'
        }, {
            status: 500
        });
    }
}
async function PUT(request) {
    try {
        const body = await request.json();
        const { type, id, data } = body;
        if (type === 'group') {
            const { name, description, type: groupType, price, half_price, active, sort_order, icon } = data;
            const query = `
        UPDATE groups 
        SET name = $2, description = $3, type = $4, price = $5, half_price = $6, 
            active = $7, sort_order = $8, icon = $9, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
            const result = await pool.query(query, [
                id,
                name,
                description || null,
                groupType || 'a_la_carte',
                price || null,
                half_price || null,
                active !== false,
                sort_order || 0,
                icon || null
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                group: result.rows[0]
            });
        }
        if (type === 'category') {
            const { name, description, image, group_id, active, sort_order } = data;
            const query = `
        UPDATE categories 
        SET name = $2, description = $3, image = $4, group_id = $5, 
            active = $6, sort_order = $7, updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
            const result = await pool.query(query, [
                id,
                name,
                description || null,
                image || null,
                group_id,
                active !== false,
                sort_order || 0
            ]);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                category: result.rows[0]
            });
        }
        if (type === 'reorder') {
            const { items, itemType } = data;
            const table = itemType === 'group' ? 'groups' : 'categories';
            // Atualizar sort_order para cada item
            for(let i = 0; i < items.length; i++){
                await pool.query(`UPDATE ${table} SET sort_order = $2 WHERE id = $1`, [
                    items[i].id,
                    i
                ]);
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Tipo inválido'
        }, {
            status: 400
        });
    } catch (error) {
        console.error('Erro ao atualizar item:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Erro ao atualizar item'
        }, {
            status: 500
        });
    }
}
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const id = searchParams.get('id');
        if (!type || !id) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Parâmetros inválidos'
            }, {
                status: 400
            });
        }
        if (type === 'group') {
            // Deletar grupo e suas categorias
            await pool.query('DELETE FROM categories WHERE group_id = $1', [
                id
            ]);
            await pool.query('DELETE FROM groups WHERE id = $1', [
                id
            ]);
        } else if (type === 'category') {
            // Deletar categoria
            await pool.query('DELETE FROM categories WHERE id = $1', [
                id
            ]);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error('Erro ao deletar item:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Erro ao deletar item'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3d362705._.js.map