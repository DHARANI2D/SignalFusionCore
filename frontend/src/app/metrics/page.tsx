import { getApiUrl } from "@/lib/api";
import { BarChart3, TrendingUp, ShieldCheck, Zap, ArrowUpRight, User, AlertTriangle } from "lucide-react";
import { AutoRefresh } from "@/components/AutoRefresh";

export default async function MetricsPage() {
    const res = await fetch(`${getApiUrl()}/api/analytics`, { cache: 'no-store' });
    const data = await res.json();

    return (
        <div className="flex flex-col gap-8 flex-1 max-w-7xl mx-auto w-full">
            <AutoRefresh intervalMs={1000} />
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Security Analytics</h1>
                <p className="text-white/40 text-sm mt-1">Real-time performance metrics and threat trends</p>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="w-24 h-24 -mr-8 -mt-8" />
                    </div>
                    <div className="flex items-center justify-between text-white/40">
                        <span className="text-xs font-bold uppercase tracking-widest">MTTR</span>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{data.performance.mttr || "--"}</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">Mean Time To Respond</p>
                </div>

                <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ShieldCheck className="w-24 h-24 -mr-8 -mt-8" />
                    </div>
                    <div className="flex items-center justify-between text-white/40">
                        <span className="text-xs font-bold uppercase tracking-widest">Coverage</span>
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{data.performance.coverage}</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">Active Detection Rules</p>
                </div>

                <div className="glass-panel p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap className="w-24 h-24 -mr-8 -mt-8" />
                    </div>
                    <div className="flex items-center justify-between text-white/40">
                        <span className="text-xs font-bold uppercase tracking-widest">Precision</span>
                        <Zap className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        {/* Precision is inverse of FPR approximately for this view */}
                        <span className="text-3xl font-bold">{data.performance.falsePositiveRate === "0.0%" ? "100%" : `${100 - parseFloat(data.performance.falsePositiveRate)}%`}</span>
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">Alert Confidence Score</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Volume Trends */}
                <div className="lg:col-span-2 glass-panel p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                            Alert Volume Trends
                        </h2>
                        <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Last 10 Days</span>
                    </div>
                    <div className="h-64 flex items-end gap-3 px-2 pt-4">
                        {data.volumeTrends.map((v: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                                <div className="absolute bottom-full mb-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                    {v.count} alerts
                                </div>
                                <div
                                    className="w-full bg-blue-500/20 border-t border-x border-blue-500/30 rounded-t group-hover:bg-blue-500/40 transition-all duration-300 relative after:absolute after:inset-0 after:bg-gradient-to-t after:from-blue-500/20 after:to-transparent"
                                    style={{ height: `${Math.max(10, (v.count / Math.max(...data.volumeTrends.map((x: any) => x.count))) * 100)}%` }}
                                />
                                <span className="text-[8px] text-white/20 whitespace-nowrap rotate-45 mt-4 origin-left font-medium">
                                    {v.date.split('-').slice(1).join('/')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Severity Circular Distribution (CSS based) */}
                <div className="glass-panel p-6 flex flex-col gap-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Severity Distribution
                    </h2>
                    <div className="flex-1 flex flex-col items-center justify-center gap-8">
                        <div className="relative w-32 h-32 rounded-full border-[12px] border-white/5 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-bold">{data.severityDistribution.reduce((acc: number, cur: any) => acc + cur.value, 0)}</span>
                                <span className="text-[10px] text-white/30 font-bold uppercase">Total</span>
                            </div>
                            {/* Simple CSS Overlay sectors would go here, for now using stylized list */}
                        </div>
                        <div className="w-full flex flex-col gap-3">
                            {data.severityDistribution.map((s: any, i: number) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                        <span className="text-xs text-white/60">{s.name}</span>
                                    </div>
                                    <span className="text-xs font-bold">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Targeted Assets */}
                <div className="glass-panel p-6 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-500" />
                        Top Targeted Assets
                    </h2>
                    <div className="flex flex-col gap-1 mt-2">
                        {data.topTargetedAssets.map((asset: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
                                        #{i + 1}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-white/80">{asset.name}</span>
                                        <span className="text-[10px] text-white/30">User Account</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white/60">{asset.hits} hits</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Detector Performance */}
                <div className="glass-panel p-6 flex flex-col gap-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        Detector Efficacy
                    </h2>
                    <div className="flex flex-col gap-6 mt-4">
                        {data.topDetectors.map((d: any, i: number) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span className="text-white/70">{d.name} Engine</span>
                                    <span className="text-blue-400">{d.value} detections</span>
                                </div>
                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[2px]">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"
                                        style={{ width: `${(d.value / Math.max(...data.topDetectors.map((x: any) => x.value))) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto pt-8 flex justify-center">
                        <button className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/20 hover:bg-blue-500/10 transition-colors">
                            View Detailed Coverage Report <ArrowUpRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
