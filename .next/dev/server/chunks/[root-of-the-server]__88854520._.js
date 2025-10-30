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
"[project]/app/api/prompt-test/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
async function GET() {
    const tests = [];
    // Teste 1: Verificar se o workflow está respondendo
    try {
        const response = await fetch('http://localhost:3001/console-prompt', {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
            const data = await response.json();
            tests.push({
                test: 'GET /console-prompt',
                status: 'SUCCESS',
                statusCode: response.status,
                data
            });
        } else {
            tests.push({
                test: 'GET /console-prompt',
                status: 'FAILED',
                statusCode: response.status,
                error: `HTTP ${response.status}`
            });
        }
    } catch (error) {
        tests.push({
            test: 'GET /console-prompt',
            status: 'ERROR',
            error: error.message,
            cause: error.cause
        });
    }
    // Teste 2: Enviar um prompt de teste
    try {
        const response = await fetch('http://localhost:3001/console-prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: '[TESTE DE CONEXÃO] Este é um teste automático do sistema',
                images: []
            }),
            signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
            const data = await response.json();
            tests.push({
                test: 'POST /console-prompt',
                status: 'SUCCESS',
                statusCode: response.status,
                data
            });
        } else {
            tests.push({
                test: 'POST /console-prompt',
                status: 'FAILED',
                statusCode: response.status,
                error: `HTTP ${response.status}`
            });
        }
    } catch (error) {
        tests.push({
            test: 'POST /console-prompt',
            status: 'ERROR',
            error: error.message,
            cause: error.cause
        });
    }
    const allPassed = tests.every((t)=>t.status === 'SUCCESS');
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        connected: allPassed,
        workflowPort: 3001,
        timestamp: new Date().toISOString(),
        tests,
        instructions: !allPassed ? {
            command: 'node console-prompt-workflow.js',
            expectedPort: 3001,
            troubleshooting: [
                '1. Certifique-se de que o workflow está rodando',
                '2. Verifique se a porta 3001 está livre',
                '3. Execute: lsof -i :3001 para verificar se algo está usando a porta',
                '4. Se necessário, mate o processo: kill -9 <PID>'
            ]
        } : undefined
    }, {
        status: allPassed ? 200 : 503
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__88854520._.js.map