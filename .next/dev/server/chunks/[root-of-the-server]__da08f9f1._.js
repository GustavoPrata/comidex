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
"[project]/lib/console-prompt-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Serviço de Console Prompt interno ao Next.js
// Simula o comportamento do workflow externo mas roda dentro do próprio servidor
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "getConsolePromptService",
    ()=>getConsolePromptService
]);
class ConsolePromptService {
    messages = [];
    isEnabled = true;
    constructor(){
        // Limpar console ao iniciar
        this.clearConsole();
        this.printHeader();
    }
    clearConsole() {
        if (typeof process !== 'undefined' && process.stdout) {
            // Limpar console completamente
            process.stdout.write('\x1Bc');
            process.stdout.write('\x1b[0;0H');
        }
    }
    printHeader() {
        console.log('╔════════════════════════════════════════════╗');
        console.log('║     Console Prompt Service (Interno)      ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log('\n🚀 Serviço integrado ao Next.js');
        console.log('📝 Aguardando prompts...\n');
    }
    handlePrompt(prompt, images) {
        if (!this.isEnabled) return;
        // Limpar console antes de mostrar novo prompt
        this.clearConsole();
        if (prompt) {
            console.log('================== PROMPT ==================');
            console.log(prompt);
            console.log('============================================');
            this.messages.push({
                type: 'prompt',
                content: prompt,
                timestamp: new Date().toISOString()
            });
        }
        if (images && images.length > 0) {
            console.log('\n📎 Imagens anexadas:');
            images.forEach((path, index)=>{
                console.log(`  ${index + 1}. ${path}`);
            });
            this.messages.push({
                type: 'image',
                images,
                timestamp: new Date().toISOString()
            });
        }
    }
    clear() {
        this.clearConsole();
        this.messages = [];
        console.log('✨ Console Prompt Service limpo');
        this.messages.push({
            type: 'clear',
            timestamp: new Date().toISOString()
        });
    }
    getMessages() {
        return this.messages;
    }
    setEnabled(enabled) {
        this.isEnabled = enabled;
    }
    isServiceEnabled() {
        return this.isEnabled;
    }
}
// Singleton instance
let serviceInstance = null;
function getConsolePromptService() {
    if (!serviceInstance) {
        serviceInstance = new ConsolePromptService();
    }
    return serviceInstance;
}
const __TURBOPACK__default__export__ = getConsolePromptService;
}),
"[project]/app/api/prompt-message/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$console$2d$prompt$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/console-prompt-service.ts [app-route] (ecmascript)");
;
;
// Configurações dos servidores de console
const CONSOLE_SERVERS = [
    {
        name: 'Prompt Console (TypeScript)',
        port: 3456,
        endpoints: {
            message: 'http://localhost:3456/prompt-message',
            health: 'http://localhost:3456/health'
        }
    },
    {
        name: 'Console Prompt Workflow (JavaScript)',
        port: 3001,
        endpoints: {
            message: 'http://localhost:3001/console-prompt',
            health: 'http://localhost:3001/console-prompt'
        }
    }
];
// Tenta conectar com os servidores externos na ordem de prioridade
async function tryExternalServers(method, body) {
    // Primeiro tenta o server TypeScript na porta 3456
    for (const server of CONSOLE_SERVERS){
        try {
            const endpoint = method === 'POST' || method === 'DELETE' ? server.endpoints.message : server.endpoints.health;
            const response = await fetch(endpoint, {
                method: method === 'DELETE' && server.port === 3001 ? 'DELETE' : method === 'DELETE' ? 'POST' : method,
                headers: body ? {
                    'Content-Type': 'application/json'
                } : undefined,
                body: body ? JSON.stringify(body) : undefined,
                signal: AbortSignal.timeout(500) // timeout rápido
            });
            if (response.ok) {
                return {
                    response,
                    server: server.name
                };
            }
        } catch (error) {
            continue;
        }
    }
    return {
        response: null,
        server: ''
    };
}
async function POST(request) {
    try {
        const body = await request.json();
        // Se for comando de limpar
        if (body.clear) {
            // Para o servidor TypeScript (3456), enviamos como POST com { clear: true }
            const { response: externalResponse, server } = await tryExternalServers('POST', {
                clear: true
            });
            if (externalResponse && externalResponse.ok) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    server,
                    port: server.includes('TypeScript') ? 3456 : 3001
                });
            }
            // Usar serviço interno como fallback
            const service = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$console$2d$prompt$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
            service.clear();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                server: 'Console Prompt Service (Interno)',
                note: 'Para usar o Console Prompt colorido, execute: tsx server/prompt-console.ts'
            });
        }
        // Enviar mensagem normal
        const { message, imageId } = body;
        // Preparar payload para o servidor TypeScript
        const payload = {};
        if (message) {
            payload.message = message;
        }
        if (imageId) {
            payload.imageId = imageId;
            // Adiciona caminho da imagem na mensagem  
            payload.message = (payload.message || '') + ` [Imagem: attachments/${imageId}.jpg]`;
        }
        // Tentar servidores externos primeiro
        const { response: externalResponse, server } = await tryExternalServers('POST', payload);
        if (externalResponse && externalResponse.ok) {
            const result = await externalResponse.json();
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: true,
                server,
                port: server.includes('TypeScript') ? 3456 : 3001,
                ...result
            });
        }
        // Usar serviço interno como fallback
        const service = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$console$2d$prompt$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
        const images = imageId ? [
            `attachments/${imageId}.jpg`
        ] : [];
        service.handlePrompt(message || '', images);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            server: 'Console Prompt Service (Interno)',
            message: 'Prompt exibido no console do servidor Next.js',
            note: 'Para usar o Console Prompt colorido, execute: tsx server/prompt-console.ts'
        });
    } catch (error) {
        console.error('Erro ao processar requisição:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Erro ao processar requisição',
            details: error.message
        }, {
            status: 500
        });
    }
}
async function GET() {
    const status = {
        servers: [],
        activeServer: null,
        instructions: {
            typescript: 'tsx server/prompt-console.ts',
            javascript: 'node console-prompt-workflow.js'
        }
    };
    // Verificar cada servidor
    for (const server of CONSOLE_SERVERS){
        try {
            const response = await fetch(server.endpoints.health, {
                method: 'GET',
                signal: AbortSignal.timeout(500)
            });
            if (response.ok) {
                const data = await response.json();
                status.servers.push({
                    name: server.name,
                    port: server.port,
                    status: 'online',
                    ...data
                });
                if (!status.activeServer) {
                    status.activeServer = server.name;
                }
            } else {
                status.servers.push({
                    name: server.name,
                    port: server.port,
                    status: 'offline'
                });
            }
        } catch (error) {
            status.servers.push({
                name: server.name,
                port: server.port,
                status: 'offline'
            });
        }
    }
    // Verificar serviço interno
    const service = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$console$2d$prompt$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"])();
    if (service.isServiceEnabled()) {
        status.servers.push({
            name: 'Console Prompt Service (Interno)',
            status: 'online',
            internal: true,
            messages: service.getMessages()
        });
        if (!status.activeServer) {
            status.activeServer = 'Console Prompt Service (Interno)';
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ...status,
        connected: status.activeServer !== null
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__da08f9f1._.js.map