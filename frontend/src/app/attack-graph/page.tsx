"use client";

import { useState, useEffect } from "react";
import { Network, AlertCircle, Users, Server, Activity, Shield } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import GraphViewer to avoid SSR issues with Cytoscape
const GraphViewer = dynamic(
    () => import("@/components/GraphViewer").then(mod => mod.GraphViewer),
    { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-white/50">Loading graph...</div> }
);

export default function AttackGraphPage() {
    const [chains, setChains] = useState<any[]>([]);
    const [graphData, setGraphData] = useState<any>(null);
    const [selectedChain, setSelectedChain] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChains();
        fetchGraph();
    }, []);

    const fetchChains = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/attack-graph/chains");
            const data = await res.json();
            setChains(data.chains || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch chains:", error);
            setLoading(false);
        }
    };

    const fetchGraph = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/attack-graph/export?format=cytoscape");
            const data = await res.json();
            setGraphData(data);
        } catch (error) {
            console.error("Failed to fetch graph:", error);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
            case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
            case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
            default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-white/50 flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Loading attack graph...
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 flex-1 max-w-7xl mx-auto w-full">
            {/* Header */}
            <header className="flex justify-between items-end border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                        Attack Graph
                    </h1>
                    <p className="text-white/40 mt-2 text-sm">Visualize attack chains and lateral movement</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live Data</span>
                </div>
            </header>

            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                            <Network className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xs text-white/40">Attack Chains</div>
                            <div className="text-2xl font-bold mt-1">{chains.length}</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 shadow-lg shadow-orange-500/5 hover:shadow-orange-500/10 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
                            <AlertCircle className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <div className="text-xs text-white/40">Active Chains</div>
                            <div className="text-2xl font-bold mt-1">{chains.filter(c => c.status === 'active').length}</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                            <Users className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xs text-white/40">Affected Users</div>
                            <div className="text-2xl font-bold mt-1">
                                {new Set(chains.flatMap(c => c.users ? JSON.parse(c.users) : [])).size || 0}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 shadow-lg shadow-green-500/5 hover:shadow-green-500/10 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500/20 transition-all">
                            <Server className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-xs text-white/40">Affected Hosts</div>
                            <div className="text-2xl font-bold mt-1">
                                {new Set(chains.flatMap(c => c.hosts ? JSON.parse(c.hosts) : [])).size || 0}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Graph Visualization */}
            <section className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Network className="w-4 h-4 text-blue-400" />
                        </div>
                        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Interactive Graph</h3>
                    </div>
                </div>

                <div className="h-[600px] rounded-lg overflow-hidden">
                    {graphData ? (
                        <GraphViewer graphData={graphData} />
                    ) : (
                        <div className="flex items-center justify-center h-full bg-black/20 rounded-lg border border-white/10">
                            <div className="text-white/40">Loading graph data...</div>
                        </div>
                    )}
                </div>
            </section>

            {/* Attack Chains List */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chain List */}
                <div className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-blue-400" />
                            </div>
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Detected Chains</h3>
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                        {chains.length === 0 ? (
                            <div className="text-center text-white/20 text-sm py-12 flex flex-col items-center gap-3">
                                <Network className="w-12 h-12 text-white/10" />
                                <p>No attack chains detected</p>
                            </div>
                        ) : (
                            chains.map((chain) => (
                                <div
                                    key={chain.id}
                                    onClick={() => setSelectedChain(chain)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedChain?.id === chain.id
                                            ? 'bg-blue-500/20 border-blue-500/50'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="font-medium">{chain.name}</div>
                                        <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(chain.severity)}`}>
                                            {chain.severity}
                                        </span>
                                    </div>

                                    <div className="text-xs text-white/40 mb-3">{chain.description}</div>

                                    <div className="flex items-center gap-4 text-xs">
                                        <div className="flex items-center gap-1">
                                            <Activity className="w-3 h-3 text-white/40" />
                                            <span className="text-white/60">{JSON.parse(chain.nodeIds).length} events</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Shield className="w-3 h-3 text-white/40" />
                                            <span className="text-white/60">Risk: {Math.round(chain.riskScore || 0)}</span>
                                        </div>
                                    </div>

                                    {/* Tactics */}
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {JSON.parse(chain.tactics).slice(0, 3).map((tactic: string, i: number) => (
                                            <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                                                {tactic}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chain Details */}
                <div className="glass-panel p-6 shadow-lg shadow-purple-500/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <Network className="w-4 h-4 text-purple-400" />
                            </div>
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Chain Details</h3>
                        </div>
                    </div>

                    {!selectedChain ? (
                        <div className="text-center text-white/20 text-sm py-20 flex flex-col items-center gap-3">
                            <Shield className="w-16 h-16 text-white/10" />
                            <p>Select a chain to view details</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Timeline */}
                            <div>
                                <div className="text-xs text-white/40 mb-2">Timeline</div>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <div className="text-white/40 text-xs">Start</div>
                                            <div className="font-mono text-xs mt-1">{new Date(selectedChain.startTime).toLocaleString()}</div>
                                        </div>
                                        <div className="text-white/40">→</div>
                                        <div>
                                            <div className="text-white/40 text-xs">End</div>
                                            <div className="font-mono text-xs mt-1">
                                                {selectedChain.endTime
                                                    ? new Date(selectedChain.endTime).toLocaleString()
                                                    : 'Ongoing'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MITRE Coverage */}
                            <div>
                                <div className="text-xs text-white/40 mb-2">MITRE ATT&CK Coverage</div>
                                <div className="space-y-2">
                                    <div>
                                        <div className="text-xs text-white/50 mb-1">Tactics</div>
                                        <div className="flex flex-wrap gap-1">
                                            {JSON.parse(selectedChain.tactics).map((tactic: string, i: number) => (
                                                <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30">
                                                    {tactic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-white/50 mb-1">Techniques</div>
                                        <div className="flex flex-wrap gap-1">
                                            {JSON.parse(selectedChain.techniques).map((tech: string, i: number) => (
                                                <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30 font-mono">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Assessment */}
                            <div>
                                <div className="text-xs text-white/40 mb-2">Risk Assessment</div>
                                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm">Risk Score</span>
                                        <span className="text-lg font-bold">{Math.round(selectedChain.riskScore || 0)}/100</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                                            style={{ width: `${selectedChain.riskScore || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-white/5">
                                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all">
                                    Investigate
                                </button>
                                <button className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all">
                                    Mark Resolved
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
