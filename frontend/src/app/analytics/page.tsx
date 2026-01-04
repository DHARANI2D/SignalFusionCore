"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, Clock, Shield, AlertTriangle, BarChart3, PieChart, Zap, Target, Users } from "lucide-react";

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchMetrics = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/analytics/metrics");
            const data = await res.json();
            setMetrics(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch metrics:", error);
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        return `${Math.round(seconds / 3600)}h`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-white/50 flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    Loading analytics...
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
                        Analytics Dashboard
                    </h1>
                    <p className="text-white/40 mt-2 text-sm">Security metrics and performance indicators</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/30">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>Live Data</span>
                </div>
            </header>

            {/* Key Metrics Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* MTTD */}
                <div className="glass-panel p-6 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                                <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">MTTD</h3>
                                <p className="text-xs text-white/20">Mean Time To Detect</p>
                            </div>
                        </div>
                        <TrendingDown className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-4xl font-bold mb-2 bg-gradient-to-br from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        {formatTime(metrics?.mttd || 0)}
                    </div>
                    <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '75%' }} />
                    </div>
                    <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        <span>12% faster than last week</span>
                    </div>
                </div>

                {/* MTTR */}
                <div className="glass-panel p-6 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                                <Activity className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">MTTR</h3>
                                <p className="text-xs text-white/20">Mean Time To Respond</p>
                            </div>
                        </div>
                        <TrendingDown className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-4xl font-bold mb-2 bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {formatTime(metrics?.mttr || 0)}
                    </div>
                    <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                    <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        <span>8% improvement</span>
                    </div>
                </div>

                {/* Alert Volume */}
                <div className="glass-panel p-6 shadow-lg shadow-orange-500/5 hover:shadow-orange-500/10 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-all">
                                <AlertTriangle className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">24H Volume</h3>
                                <p className="text-xs text-white/20">Alerts Generated</p>
                            </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="text-4xl font-bold mb-2 bg-gradient-to-br from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {(metrics?.alertVolume24h || 0).toLocaleString()}
                    </div>
                    <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" style={{ width: '85%' }} />
                    </div>
                    <div className="mt-2 text-xs text-orange-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>15% increase</span>
                    </div>
                </div>

                {/* Detection Rate */}
                <div className="glass-panel p-6 shadow-lg shadow-green-500/5 hover:shadow-green-500/10 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500/20 transition-all">
                                <Shield className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Detection Rate</h3>
                                <p className="text-xs text-white/20">Successful Detections</p>
                            </div>
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-4xl font-bold mb-2 bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        94.2%
                    </div>
                    <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                    <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Excellent coverage</span>
                    </div>
                </div>
            </section>

            {/* Trends and Top Techniques */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alert Trends */}
                <div className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <BarChart3 className="w-4 h-4 text-blue-400" />
                            </div>
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Alert Trends (7 Days)</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {metrics?.trends?.map((day: any, i: number) => (
                            <div key={i} className="group">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="text-xs text-white/40 w-24 font-mono">
                                        {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <div className="flex-1 h-10 bg-white/5 rounded-lg overflow-hidden flex border border-white/5 group-hover:border-white/10 transition-all">
                                            {day.bySeverity?.critical > 0 && (
                                                <div
                                                    className="bg-gradient-to-r from-red-500/60 to-red-500/40 flex items-center justify-center text-xs font-bold hover:from-red-500/80 hover:to-red-500/60 transition-all"
                                                    style={{ width: `${(day.bySeverity?.critical || 0) / day.total * 100}%` }}
                                                    title={`Critical: ${day.bySeverity?.critical}`}
                                                >
                                                    {day.bySeverity?.critical > 0 && day.bySeverity.critical}
                                                </div>
                                            )}
                                            {day.bySeverity?.high > 0 && (
                                                <div
                                                    className="bg-gradient-to-r from-orange-500/60 to-orange-500/40 flex items-center justify-center text-xs font-bold hover:from-orange-500/80 hover:to-orange-500/60 transition-all"
                                                    style={{ width: `${(day.bySeverity?.high || 0) / day.total * 100}%` }}
                                                    title={`High: ${day.bySeverity?.high}`}
                                                >
                                                    {day.bySeverity?.high > 0 && day.bySeverity.high}
                                                </div>
                                            )}
                                            {day.bySeverity?.medium > 0 && (
                                                <div
                                                    className="bg-gradient-to-r from-yellow-500/60 to-yellow-500/40 flex items-center justify-center text-xs font-bold hover:from-yellow-500/80 hover:to-yellow-500/60 transition-all"
                                                    style={{ width: `${(day.bySeverity?.medium || 0) / day.total * 100}%` }}
                                                    title={`Medium: ${day.bySeverity?.medium}`}
                                                >
                                                    {day.bySeverity?.medium > 0 && day.bySeverity.medium}
                                                </div>
                                            )}
                                            {day.bySeverity?.low > 0 && (
                                                <div
                                                    className="bg-gradient-to-r from-blue-500/60 to-blue-500/40 flex items-center justify-center text-xs font-bold hover:from-blue-500/80 hover:to-blue-500/60 transition-all"
                                                    style={{ width: `${(day.bySeverity?.low || 0) / day.total * 100}%` }}
                                                    title={`Low: ${day.bySeverity?.low}`}
                                                >
                                                    {day.bySeverity?.low > 0 && day.bySeverity.low}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-sm font-bold w-16 text-right font-mono">{day.total}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/5 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-gradient-to-r from-red-500/60 to-red-500/40 border border-red-500/30" />
                            <span className="text-white/40">Critical</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-gradient-to-r from-orange-500/60 to-orange-500/40 border border-orange-500/30" />
                            <span className="text-white/40">High</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-gradient-to-r from-yellow-500/60 to-yellow-500/40 border border-yellow-500/30" />
                            <span className="text-white/40">Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500/60 to-blue-500/40 border border-blue-500/30" />
                            <span className="text-white/40">Low</span>
                        </div>
                    </div>
                </div>

                {/* Top Techniques */}
                <div className="glass-panel p-6 shadow-lg shadow-purple-500/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                <Target className="w-4 h-4 text-purple-400" />
                            </div>
                            <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Top MITRE Techniques</h3>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {metrics?.topTechniques?.map((tech: any, i: number) => (
                            <div key={i} className="group">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <div className="text-xs font-mono text-purple-400 w-20 font-bold">{tech.technique}</div>
                                    <div className="flex-1">
                                        <div className="h-8 bg-white/5 rounded-lg overflow-hidden border border-white/5 group-hover:border-purple-500/30 transition-all">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500/60 to-pink-500/40 flex items-center px-3 text-xs font-bold group-hover:from-purple-500/80 group-hover:to-pink-500/60 transition-all"
                                                style={{ width: `${(tech.count / (metrics.topTechniques[0]?.count || 1)) * 100}%` }}
                                            >
                                                <span className="text-white">{tech.count}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {metrics?.topTechniques?.length === 0 && (
                        <div className="text-center text-white/20 text-sm py-12 flex flex-col items-center gap-3">
                            <Target className="w-12 h-12 text-white/10" />
                            <p>No techniques detected yet</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Additional Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 shadow-lg shadow-blue-500/5 hover:shadow-blue-500/10 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-all">
                            <Activity className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xs text-white/40">Total Events Processed</div>
                            <div className="text-2xl font-bold mt-1">12,458</div>
                        </div>
                    </div>
                    <div className="text-xs text-green-400 flex items-center gap-1 mt-3 pt-3 border-t border-white/5">
                        <TrendingUp className="w-3 h-3" />
                        <span>↑ 12% from last week</span>
                    </div>
                </div>

                <div className="glass-panel p-6 shadow-lg shadow-purple-500/5 hover:shadow-purple-500/10 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-all">
                            <Zap className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xs text-white/40">Active Attack Chains</div>
                            <div className="text-2xl font-bold mt-1">3</div>
                        </div>
                    </div>
                    <div className="text-xs text-orange-400 flex items-center gap-1 mt-3 pt-3 border-t border-white/5">
                        <AlertTriangle className="w-3 h-3" />
                        <span>2 require investigation</span>
                    </div>
                </div>

                <div className="glass-panel p-6 shadow-lg shadow-green-500/5 hover:shadow-green-500/10 transition-all group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500/20 transition-all">
                            <Zap className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-xs text-white/40">Automated Responses</div>
                            <div className="text-2xl font-bold mt-1">47</div>
                        </div>
                    </div>
                    <div className="text-xs text-green-400 flex items-center gap-1 mt-3 pt-3 border-t border-white/5">
                        <Shield className="w-3 h-3" />
                        <span>98% success rate</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
