import { AlertCircle, TrendingUp, ShieldCheck, Clock, Target } from "lucide-react";
import { AlertFeed } from "@/components/AlertFeed";
import { StatsCard } from "@/components/StatsCard";
import { SimulatorControl } from "@/components/SimulatorControl";
import { getApiUrl } from "@/lib/api";
import { AutoRefresh } from "@/components/AutoRefresh";

export default async function DashboardPage() {
    const [statsRes, analyticsRes] = await Promise.all([
        fetch(`${getApiUrl()}/api/stats`, { cache: 'no-store' }),
        fetch(`${getApiUrl()}/api/analytics`, { cache: 'no-store' })
    ]);

    const stats = await statsRes.json();
    const analytics = await analyticsRes.json();

    return (
        <div className="flex flex-col gap-8 flex-1 max-w-7xl mx-auto w-full">
            <AutoRefresh intervalMs={1000} />
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">SOC Dashboard</h1>
                    <p className="text-white/50 mt-1">Real-time threat signals and correlated alerts</p>
                </div>
                <div className="flex gap-2 text-sm">
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Alerts"
                    value={stats.totalAlerts.toString()}
                    icon={AlertCircle}
                />
                <StatsCard
                    title="High Severity"
                    value={stats.highSeverity.toString()}
                    icon={TrendingUp}
                    color="text-red-500"
                />
                <StatsCard
                    title="Under Triage"
                    value={stats.triageInProgress.toString()}
                    icon={Clock}
                    color="text-amber-500"
                />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">Active Alert Feed</h2>
                            <button className="text-sm text-blue-500 hover:text-blue-400 font-medium">View all alerts</button>
                        </div>
                        <AlertFeed />
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <SimulatorControl />

                    <div className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                        <div className="flex items-center gap-2 mb-6">
                            <Target className="w-4 h-4 text-red-500" />
                            <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">Threat Landscape</h3>
                        </div>

                        <div className="flex flex-col gap-5">
                            {analytics.mitreDistribution.length > 0 ? analytics.mitreDistribution.map((item: any) => (
                                <div key={item.name} className="flex flex-col gap-2 group">
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                                        <span className="text-white/60 group-hover:text-white transition-colors">{item.name}</span>
                                        <span className="text-red-400 font-mono">{Math.round((item.value / stats.totalAlerts) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-500/50 to-red-500 transition-all duration-1000 group-hover:shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                            style={{ width: `${(item.value / stats.totalAlerts) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-xs text-white/20 italic text-center py-4">No tactical data mapped yet</div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <h4 className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">Top Targeted Assets</h4>
                            <div className="flex flex-col gap-2">
                                {analytics.topTargetedAssets.slice(0, 3).map((asset: any) => (
                                    <div key={asset.name} className="flex justify-between items-center bg-white/5 p-2 rounded border border-transparent hover:border-white/10 transition-all">
                                        <span className="text-xs font-mono text-emerald-400">@{asset.name}</span>
                                        <span className="text-[10px] text-white/30 font-bold">{asset.hits} hits</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-6">Severity Distribution</h3>
                        <div className="flex flex-col gap-4">
                            {[
                                { label: 'High', count: stats.highSeverity, color: 'bg-red-500' },
                                { label: 'Medium', count: stats.mediumSeverity, color: 'bg-amber-500' },
                                { label: 'Low', count: stats.lowSeverity, color: 'bg-blue-500' }
                            ].map(item => (
                                <div key={item.label} className="flex flex-col gap-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-white/60">{item.label}</span>
                                        <span className="font-mono">{item.count}</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${item.color} transition-all duration-500 shadow-[0_0_8px_rgba(255,255,255,0.1)]`}
                                            style={{ width: `${stats.totalAlerts > 0 ? (item.count / stats.totalAlerts) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
