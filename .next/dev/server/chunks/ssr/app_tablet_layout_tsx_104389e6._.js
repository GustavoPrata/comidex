module.exports = [
"[project]/app/tablet/layout.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TabletLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function TabletLayout({ children }) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Prevenir zoom no tablet
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        // Prevenir menu de contexto (pressão longa)
        const preventContextMenu = (e)=>e.preventDefault();
        document.addEventListener('contextmenu', preventContextMenu);
        // Prevenir seleção de texto
        const preventSelection = (e)=>e.preventDefault();
        document.addEventListener('selectstart', preventSelection);
        // Prevenir scroll bounce no iOS
        document.body.style.overscrollBehavior = 'none';
        // Prevenir pull-to-refresh
        let lastY = 0;
        const preventPullToRefresh = (e)=>{
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const deltaY = e.touches[0].pageY - lastY;
            if (scrollY === 0 && deltaY > 0) {
                e.preventDefault();
            }
            lastY = e.touches[0].pageY;
        };
        document.addEventListener('touchstart', (e)=>{
            lastY = e.touches[0].pageY;
        });
        document.addEventListener('touchmove', preventPullToRefresh, {
            passive: false
        });
        // Manter tela sempre ligada (Wake Lock API)
        let wakeLock = null;
        const requestWakeLock = async ()=>{
            try {
                if ('wakeLock' in navigator) {
                    wakeLock = await navigator.wakeLock.request('screen');
                }
            } catch (err) {
                console.log('Wake Lock não disponível');
            }
        };
        requestWakeLock();
        // Re-adquirir wake lock quando a página ficar visível novamente
        document.addEventListener('visibilitychange', ()=>{
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        });
        return ()=>{
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('selectstart', preventSelection);
            document.removeEventListener('touchmove', preventPullToRefresh);
            if (wakeLock) {
                wakeLock.release();
            }
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gray-950 text-white overflow-hidden",
        children: children
    }, void 0, false, {
        fileName: "[project]/app/tablet/layout.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=app_tablet_layout_tsx_104389e6._.js.map