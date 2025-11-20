(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/tablet/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TabletLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
function TabletLayout({ children }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TabletLayout.useEffect": ()=>{
            // Prevenir zoom no tablet
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
            }
            // Prevenir menu de contexto (pressão longa)
            const preventContextMenu = {
                "TabletLayout.useEffect.preventContextMenu": (e)=>e.preventDefault()
            }["TabletLayout.useEffect.preventContextMenu"];
            document.addEventListener('contextmenu', preventContextMenu);
            // Prevenir seleção de texto
            const preventSelection = {
                "TabletLayout.useEffect.preventSelection": (e)=>e.preventDefault()
            }["TabletLayout.useEffect.preventSelection"];
            document.addEventListener('selectstart', preventSelection);
            // Prevenir scroll bounce no iOS
            document.body.style.overscrollBehavior = 'none';
            // Prevenir pull-to-refresh
            let lastY = 0;
            const preventPullToRefresh = {
                "TabletLayout.useEffect.preventPullToRefresh": (e)=>{
                    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
                    const deltaY = e.touches[0].pageY - lastY;
                    if (scrollY === 0 && deltaY > 0) {
                        e.preventDefault();
                    }
                    lastY = e.touches[0].pageY;
                }
            }["TabletLayout.useEffect.preventPullToRefresh"];
            document.addEventListener('touchstart', {
                "TabletLayout.useEffect": (e)=>{
                    lastY = e.touches[0].pageY;
                }
            }["TabletLayout.useEffect"]);
            document.addEventListener('touchmove', preventPullToRefresh, {
                passive: false
            });
            // Manter tela sempre ligada (Wake Lock API)
            let wakeLock = null;
            const requestWakeLock = {
                "TabletLayout.useEffect.requestWakeLock": async ()=>{
                    try {
                        if ('wakeLock' in navigator) {
                            wakeLock = await navigator.wakeLock.request('screen');
                        }
                    } catch (err) {
                        console.log('Wake Lock não disponível');
                    }
                }
            }["TabletLayout.useEffect.requestWakeLock"];
            requestWakeLock();
            // Re-adquirir wake lock quando a página ficar visível novamente
            document.addEventListener('visibilitychange', {
                "TabletLayout.useEffect": ()=>{
                    if (document.visibilityState === 'visible') {
                        requestWakeLock();
                    }
                }
            }["TabletLayout.useEffect"]);
            return ({
                "TabletLayout.useEffect": ()=>{
                    document.removeEventListener('contextmenu', preventContextMenu);
                    document.removeEventListener('selectstart', preventSelection);
                    document.removeEventListener('touchmove', preventPullToRefresh);
                    if (wakeLock) {
                        wakeLock.release();
                    }
                }
            })["TabletLayout.useEffect"];
        }
    }["TabletLayout.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-950 text-white overflow-hidden",
        children: children
    }, void 0, false, {
        fileName: "[project]/app/tablet/layout.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(TabletLayout, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = TabletLayout;
var _c;
__turbopack_context__.k.register(_c, "TabletLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_tablet_layout_tsx_305f48c8._.js.map