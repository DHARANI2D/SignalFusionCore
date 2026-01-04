"use client";

import { useEffect, useRef, useState } from "react";
import cytoscape from "cytoscape";
// @ts-ignore
import coseBilkent from "cytoscape-cose-bilkent";

cytoscape.use(coseBilkent);

interface GraphViewerProps {
    graphData: any;
}

export function GraphViewer({ graphData }: GraphViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<any>(null);
    const [selectedNode, setSelectedNode] = useState<any>(null);

    useEffect(() => {
        if (!containerRef.current || !graphData) return;

        // Initialize Cytoscape
        const cy = cytoscape({
            container: containerRef.current,
            elements: graphData.elements || { nodes: [], edges: [] },
            style: [
                {
                    selector: "node",
                    style: {
                        "background-color": (ele: any) => {
                            const type = ele.data("type");
                            if (type === "alert") return "#EF4444"; // Vibrant Red
                            if (type === "entity") return "#3B82F6"; // Bright Blue
                            if (type === "technique") return "#A855F7"; // Purple
                            return "#9CA3AF";
                        },
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
                        "width": (ele: any) => {
                            const type = ele.data("type");
                            return type === "alert" ? 50 : 40;
                        },
                        "height": (ele: any) => {
                            const type = ele.data("type");
                            return type === "alert" ? 50 : 40;
                        },
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
            } as any,
            minZoom: 0.1,
            maxZoom: 5,
            wheelSensitivity: 0.1
        });

        // Ensure graph fits container initially and after layout
        cy.on("layoutstop", () => {
            cy.fit(undefined as any, 100);
        });

        // Event handlers
        cy.on("tap", "node", (evt: any) => {
            const node = evt.target;
            setSelectedNode(node.data());
        });

        cy.on("tap", (evt: any) => {
            if (evt.target === cy) {
                setSelectedNode(null);
            }
        });

        cyRef.current = cy;

        // Final fit after small delay to handle parent container sizing
        setTimeout(() => cy.fit(undefined as any, 100), 500);

        return () => {
            cy.destroy();
        };
    }, [graphData]);

    return (
        <div className="relative w-full h-full">
            <div ref={containerRef} className="w-full h-full bg-black/20 rounded-lg border border-white/10" />

            {/* Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                    onClick={() => cyRef.current?.fit(50)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 text-xs font-medium transition-all"
                >
                    Fit View
                </button>
                <button
                    onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 1.2)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 text-xs font-medium transition-all"
                >
                    Zoom In
                </button>
                <button
                    onClick={() => cyRef.current?.zoom(cyRef.current.zoom() * 0.8)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg border border-white/10 text-xs font-medium transition-all"
                >
                    Zoom Out
                </button>
            </div>

            {/* Node Info Panel */}
            {selectedNode && (
                <div className="absolute bottom-4 left-4 right-4 glass-panel p-4 max-w-md">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="text-sm font-bold">{selectedNode.label}</div>
                            <div className="text-xs text-white/40 mt-1">Type: {selectedNode.type}</div>
                        </div>
                        <button
                            onClick={() => setSelectedNode(null)}
                            className="text-white/40 hover:text-white text-xs"
                        >
                            ✕
                        </button>
                    </div>
                    {selectedNode.severity && (
                        <div className="text-xs">
                            <span className="text-white/40">Severity: </span>
                            <span className={`font-bold ${selectedNode.severity === "critical" ? "text-red-400" :
                                selectedNode.severity === "high" ? "text-orange-400" :
                                    selectedNode.severity === "medium" ? "text-yellow-400" :
                                        "text-blue-400"
                                }`}>
                                {selectedNode.severity}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Legend */}
            <div className="absolute top-4 left-4 glass-panel p-3">
                <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2">Legend</div>
                <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-600" />
                        <span className="text-white/60">Alert</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-blue-600" />
                        <span className="text-white/60">Entity</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-purple-600" />
                        <span className="text-white/60">Technique</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
