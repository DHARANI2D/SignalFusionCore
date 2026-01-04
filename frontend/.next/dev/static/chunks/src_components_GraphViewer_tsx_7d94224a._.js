(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/GraphViewer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GraphViewer",
    ()=>GraphViewer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cytoscape$2f$dist$2f$cytoscape$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cytoscape/dist/cytoscape.esm.mjs [app-client] (ecmascript)");
// @ts-ignore
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cytoscape$2d$cose$2d$bilkent$2f$cytoscape$2d$cose$2d$bilkent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/cytoscape-cose-bilkent/cytoscape-cose-bilkent.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cytoscape$2f$dist$2f$cytoscape$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].use(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cytoscape$2d$cose$2d$bilkent$2f$cytoscape$2d$cose$2d$bilkent$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
function GraphViewer({ graphData }) {
    _s();
    const containerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const cyRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [selectedNode, setSelectedNode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GraphViewer.useEffect": ()=>{
            if (!containerRef.current || !graphData) return;
            // Initialize Cytoscape
            const cy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$cytoscape$2f$dist$2f$cytoscape$2e$esm$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])({
                container: containerRef.current,
                elements: graphData.elements || {
                    nodes: [],
                    edges: []
                },
                style: [
                    {
                        selector: "node",
                        style: {
                            "background-color": {
                                "GraphViewer.useEffect.cy": (ele)=>{
                                    const type = ele.data("type");
                                    if (type === "alert") return "#EF4444"; // Vibrant Red
                                    if (type === "entity") return "#3B82F6"; // Bright Blue
                                    if (type === "technique") return "#A855F7"; // Purple
                                    return "#9CA3AF";
                                }
                            }["GraphViewer.useEffect.cy"],
                            "border-width": 3,
                            "border-color": "#FFFFFF",
                            "border-opacity": 0.2,
                            "label": "data(label)",
                            "color": "#FFFFFF",
                            "text-valign": "bottom",
                            "text-halign": "center",
                            "text-margin-y": 8,
                            "font-size": "12px",
                            "font-family": "Inter, system-ui, sans-serif",
                            "font-weight": "bold",
                            "text-outline-width": 2,
                            "text-outline-color": "#0F172A",
                            "width": {
                                "GraphViewer.useEffect.cy": (ele)=>{
                                    const type = ele.data("type");
                                    return type === "alert" ? 50 : 40;
                                }
                            }["GraphViewer.useEffect.cy"],
                            "height": {
                                "GraphViewer.useEffect.cy": (ele)=>{
                                    const type = ele.data("type");
                                    return type === "alert" ? 50 : 40;
                                }
                            }["GraphViewer.useEffect.cy"],
                            "z-index": 10
                        }
                    },
                    {
                        selector: "edge",
                        style: {
                            "width": 3,
                            "line-color": "#334155",
                            "target-arrow-color": "#334155",
                            "target-arrow-shape": "triangle",
                            "curve-style": "bezier",
                            "opacity": 0.8,
                            "arrow-scale": 1.5
                        }
                    },
                    {
                        selector: "node:selected",
                        style: {
                            "border-width": 6,
                            "border-color": "#60A5FA",
                            "background-color": "#2563EB",
                            "text-outline-color": "#2563EB"
                        }
                    }
                ],
                layout: {
                    name: "cose-bilkent",
                    animate: true,
                    animationDuration: 1500,
                    nodeDimensionsIncludeLabels: true,
                    idealEdgeLength: 150,
                    nodeRepulsion: 12000,
                    gravity: 0.1,
                    numIter: 3000,
                    initialTemp: 500,
                    coolingFactor: 0.98,
                    minTemp: 1.0,
                    padding: 100,
                    fit: true
                },
                minZoom: 0.1,
                maxZoom: 5,
                wheelSensitivity: 0.1
            });
            // Ensure graph fits container initially and after layout
            cy.on("layoutstop", {
                "GraphViewer.useEffect": ()=>{
                    cy.fit(undefined, 100);
                }
            }["GraphViewer.useEffect"]);
            // Event handlers
            cy.on("tap", "node", {
                "GraphViewer.useEffect": (evt)=>{
                    const node = evt.target;
                    setSelectedNode(node.data());
                }
            }["GraphViewer.useEffect"]);
            cy.on("tap", {
                "GraphViewer.useEffect": (evt)=>{
                    if (evt.target === cy) {
                        setSelectedNode(null);
                    }
                }
            }["GraphViewer.useEffect"]);
            cyRef.current = cy;
            // Final fit after small delay to handle parent container sizing
            setTimeout({
                "GraphViewer.useEffect": ()=>cy.fit(undefined, 100)
            }["GraphViewer.useEffect"], 500);
            return ({
                "GraphViewer.useEffect": ()=>{
                    cy.destroy();
                }
            })["GraphViewer.useEffect"];
        }
    }["GraphViewer.useEffect"], [
        graphData
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative w-full h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: containerRef,
                className: "w-full h-full bg-black/20 rounded-lg border border-white/10"
            }, void 0, false, {
                fileName: "[project]/src/components/GraphViewer.tsx",
                lineNumber: 132,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 right-4 flex flex-col gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>cyRef.current?.fit(50),
                        className: "px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 text-xs font-medium transition-all",
                        children: "Fit View"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GraphViewer.tsx",
                        lineNumber: 136,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>cyRef.current?.zoom(cyRef.current.zoom() * 1.2),
                        className: "px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 text-xs font-medium transition-all",
                        children: "Zoom In"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GraphViewer.tsx",
                        lineNumber: 142,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>cyRef.current?.zoom(cyRef.current.zoom() * 0.8),
                        className: "px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 text-xs font-medium transition-all",
                        children: "Zoom Out"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GraphViewer.tsx",
                        lineNumber: 148,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GraphViewer.tsx",
                lineNumber: 135,
                columnNumber: 13
            }, this),
            selectedNode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-4 left-4 right-4 glass-panel p-4 max-w-md",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start justify-between mb-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm font-bold",
                                        children: selectedNode.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GraphViewer.tsx",
                                        lineNumber: 161,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-white/40 mt-1",
                                        children: [
                                            "Type: ",
                                            selectedNode.type
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/GraphViewer.tsx",
                                        lineNumber: 162,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GraphViewer.tsx",
                                lineNumber: 160,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSelectedNode(null),
                                className: "text-white/40 hover:text-white text-xs",
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GraphViewer.tsx",
                                lineNumber: 164,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GraphViewer.tsx",
                        lineNumber: 159,
                        columnNumber: 21
                    }, this),
                    selectedNode.severity && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-white/40",
                                children: "Severity: "
                            }, void 0, false, {
                                fileName: "[project]/src/components/GraphViewer.tsx",
                                lineNumber: 173,
                                columnNumber: 29
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: `font-bold ${selectedNode.severity === "critical" ? "text-red-400" : selectedNode.severity === "high" ? "text-orange-400" : selectedNode.severity === "medium" ? "text-yellow-400" : "text-blue-400"}`,
                                children: selectedNode.severity
                            }, void 0, false, {
                                fileName: "[project]/src/components/GraphViewer.tsx",
                                lineNumber: 174,
                                columnNumber: 29
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GraphViewer.tsx",
                        lineNumber: 172,
                        columnNumber: 25
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GraphViewer.tsx",
                lineNumber: 158,
                columnNumber: 17
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-4 glass-panel p-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2",
                        children: "Legend"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GraphViewer.tsx",
                        lineNumber: 188,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-2 text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-4 h-4 rounded-full bg-red-500 border-2 border-red-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GraphViewer.tsx",
                                        lineNumber: 191,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-white/60",
                                        children: "Alert"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GraphViewer.tsx",
                                        lineNumber: 192,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GraphViewer.tsx",
                                lineNumber: 190,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GraphViewer.tsx",
                                        lineNumber: 195,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-white/60",
                                        children: "Entity"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GraphViewer.tsx",
                                        lineNumber: 196,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GraphViewer.tsx",
                                lineNumber: 194,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-4 h-4 rounded-full bg-purple-500 border-2 border-purple-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GraphViewer.tsx",
                                        lineNumber: 199,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-white/60",
                                        children: "Technique"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GraphViewer.tsx",
                                        lineNumber: 200,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/GraphViewer.tsx",
                                lineNumber: 198,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GraphViewer.tsx",
                        lineNumber: 189,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GraphViewer.tsx",
                lineNumber: 187,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/GraphViewer.tsx",
        lineNumber: 131,
        columnNumber: 9
    }, this);
}
_s(GraphViewer, "OkTvMpcf8+LYMUI8pBqvnFUlzjc=");
_c = GraphViewer;
var _c;
__turbopack_context__.k.register(_c, "GraphViewer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/GraphViewer.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/GraphViewer.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_components_GraphViewer_tsx_7d94224a._.js.map