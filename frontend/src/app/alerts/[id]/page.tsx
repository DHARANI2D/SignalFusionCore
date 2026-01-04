import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import { ChevronLeft, Info, Activity, ShieldAlert, History, MessageSquare, Shield, Target, Zap, Network as NetworkIcon } from "lucide-react";
import Link from "next/link";
import { StatusButtons, NoteForm } from "@/components/TriageControls";
import { RemediationTerminal } from "@/components/RemediationTerminal";

import { getApiUrl } from "@/lib/api";

export default async function AlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await fetch(`${getApiUrl()}/api/alerts/${id}`, { cache: 'no-store' });
    if (!res.ok) notFound();
    const alert = await res.json();

    // Safe JSON parsing with fallbacks
    const safeJsonParse = <T,>(str: string | null | undefined, fallback: T): T => {
        if (!str) return fallback;
        try {
            return JSON.parse(str);
        } catch (e) {
            return fallback;
        }
    };

    const signals = safeJsonParse<any[]>(alert.signals, []);
    const reasoning = safeJsonParse<any[]>(alert.reasoning, []);
    const recommendedActions = safeJsonParse<any[]>(alert.recommendedActions, []);
    const mitreTactics = safeJsonParse<string[]>(alert.mitreTactics, []);
    const mitreTechniques = safeJsonParse<string[]>(alert.mitreTechniques, []);

    // Combine notes and audit logs for activity timeline
    const activity = [
        ...alert.notes.map((n: any) => ({ ...n, type: 'note' as const, date: new Date(n.createdAt) })),
        ...alert.auditLogs.map((a: any) => ({ ...a, type: 'audit' as const, date: new Date(a.timestamp) }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
        <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
            <header className="flex items-center gap-4">
                <Link href="/" className="p-2 glass-panel hover:bg-white/10 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{alert.summary}</h1>
                    <div className="flex items-center gap-3">
                        <p className="text-white/40 text-sm font-mono uppercase tracking-tighter">Alert-Ref: {alert.id.split('-')[0]}</p>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${alert.severity === 'High' ? 'bg-red-500/20 text-red-500 border border-red-500/20' :
                            alert.severity === 'Medium' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' :
                                'bg-blue-500/20 text-blue-500 border border-blue-500/20'
                            }`}>
                            {alert.severity} Priority
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    {/* Attack Path Visualization */}
                    <div className="glass-panel p-6 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <Target className="w-64 h-64 text-red-500" />
                        </div>
                        <div className="flex items-center gap-2 mb-8">
                            <Zap className="w-5 h-5 text-amber-500" />
                            <h2 className="text-lg font-semibold uppercase tracking-wider text-white/90">Attack Path Reconstruction</h2>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 relative">
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-y-1/2 pointer-events-none" />

                            {[
                                {
                                    icon: Shield,
                                    label: "Initial Access",
                                    active: mitreTactics.some((t: string) => t.includes("Initial Access") || t.includes("Command and Control")),
                                    color: "emerald-500"
                                },
                                {
                                    icon: NetworkIcon,
                                    label: "Discovery",
                                    active: mitreTactics.some((t: string) => t.includes("Discovery") || t.includes("Reconnaissance")),
                                    color: "blue-500"
                                },
                                {
                                    icon: Target,
                                    label: "Persistence",
                                    active: mitreTactics.some((t: string) => t.includes("Persistence") || t.includes("Privilege Escalation") || t.includes("Execution")),
                                    color: "purple-500"
                                },
                                {
                                    icon: ShieldAlert,
                                    label: "Exfiltration",
                                    active: mitreTactics.some((t: string) => t.includes("Exfiltration") || t.includes("Collection") || t.includes("Impact")),
                                    color: "red-500"
                                }
                            ].map((step, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 relative z-10 w-full md:w-auto">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${step.active
                                        ? `bg-black/50 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]`
                                        : "bg-white/5 text-white/10 border-white/5"
                                        }`}>
                                        <step.icon className={`w-6 h-6 ${step.active ? "animate-pulse" : ""}`} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${step.active ? "text-white" : "text-white/20"}`}>
                                        {step.label}
                                    </span>
                                    {step.active && (
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500 animate-ping" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MITRE ATT&CK Context */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6">
                            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Target className="w-3 h-3" /> Targeted MITRE Tactics
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {mitreTactics.length > 0 ? mitreTactics.map(t => (
                                    <span key={t} className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20">
                                        {t}
                                    </span>
                                )) : <span className="text-xs text-white/30 italic">No direct tactic mapping</span>}
                            </div>
                        </div>
                        <div className="glass-panel p-6">
                            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Target className="w-3 h-3" /> MITRE Techniques
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {mitreTechniques.length > 0 ? mitreTechniques.map(t => (
                                    <span key={t} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20">
                                        {t}
                                    </span>
                                )) : <span className="text-xs text-white/30 italic">Generic profiling</span>}
                            </div>
                        </div>
                    </div>

                    {/* Reasoning Panel */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-5 h-5 text-blue-500" />
                            <h2 className="text-lg font-semibold">Detection Logic & Evidence</h2>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {signals.map(s => (
                                <span key={s} className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                                    {s}
                                </span>
                            ))}
                        </div>
                        <ul className="flex flex-col gap-3">
                            {reasoning.map((r, i) => (
                                <li key={i} className="flex gap-3 text-sm text-white/80 leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Event Timeline Visualization */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="w-5 h-5 text-purple-500" />
                            <h2 className="text-lg font-semibold">Correlated Signal Timeline</h2>
                        </div>
                        <div className="flex flex-col gap-6 ml-4 border-l border-white/10 pl-10 relative">
                            {(alert.events || []).sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((event: any, i: number) => {
                                const metadata = safeJsonParse(event.metadata, {});
                                return (
                                    <div key={event.id} className="relative group">
                                        <div className="absolute -left-[49px] top-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-black group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(59,130,246,0.5)]" />

                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{event.source}</span>
                                                    <span className="text-sm font-bold text-blue-400">{event.eventType}</span>
                                                </div>
                                                <span className="text-[10px] text-white/30 font-mono">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 p-4 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">Actor</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-emerald-400">{event.user || 'system'}</span>
                                                        {event.process && <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded italic">proc: {event.process}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 text-right md:text-left">
                                                    <span className="text-[10px] text-white/20 uppercase font-bold tracking-tighter">Network</span>
                                                    <div className="flex items-center gap-2 justify-end md:justify-start">
                                                        <span className="text-xs font-mono text-amber-400">{event.sourceIp || 'local'}</span>
                                                        {event.geo && <span className="text-[10px] text-white/40 italic">({event.geo})</span>}
                                                    </div>
                                                </div>
                                                <div className="col-span-1 md:col-span-2 mt-2">
                                                    <details className="cursor-pointer group/details">
                                                        <summary className="text-[10px] text-blue-400/60 hover:text-blue-400 font-bold uppercase flex items-center gap-1 list-none">
                                                            <ChevronLeft className="w-3 h-3 -rotate-90 group-open/details:rotate-90 transition-transform" />
                                                            View Raw Metadata
                                                        </summary>
                                                        <div className="mt-2 text-[10px] bg-black/40 p-3 rounded font-mono text-white/40 border border-white/5 overflow-x-auto">
                                                            <pre>{JSON.stringify(metadata, null, 2)}</pre>
                                                        </div>
                                                    </details>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Activity & Notes Section */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <History className="w-5 h-5 text-emerald-500" />
                            <h2 className="text-lg font-semibold">Activity & Notes</h2>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Add Note</h3>
                            <NoteForm alertId={alert.id} />
                        </div>

                        <div className="flex flex-col gap-6">
                            {activity.length === 0 ? (
                                <p className="text-sm text-white/30 italic text-center py-8">No activity recorded yet.</p>
                            ) : (
                                activity.map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="shrink-0 mt-1">
                                            {item.type === 'note' ? (
                                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                    <MessageSquare className="w-4 h-4 text-blue-400" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                    <History className="w-4 h-4 text-emerald-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1 flex-1">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-xs font-bold text-white/70">{item.user}</span>
                                                <span className="text-[10px] text-white/30">{formatDistanceToNow(item.date, { addSuffix: true })}</span>
                                            </div>
                                            {item.type === 'note' ? (
                                                <p className="text-sm text-white/80 bg-white/5 p-3 rounded-lg border border-white/5">
                                                    {(item as any).content}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-white/50">
                                                    <span className="font-semibold text-emerald-400">{(item as any).action}</span>
                                                    {(item as any).previousState && (item as any).newState && (
                                                        <span> : {(item as any).previousState} → {(item as any).newState}</span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar Controls */}
                    <div className="flex flex-col gap-6">
                        {/* Remediation Terminal */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest pl-2">Response Orchestration</h3>
                            <RemediationTerminal alertId={alert.id} actions={recommendedActions} />
                        </div>

                        <div className="glass-panel p-6">
                            <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-4">Risk Profile</h3>
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-white/60">Final Score</span>
                                <span className="text-2xl font-bold text-blue-500">{Math.round(alert.score)}/100</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-6">
                                <div
                                    className="h-full bg-blue-500"
                                    style={{ width: `${alert.score}%` }}
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40">Severity</span>
                                    <span className={
                                        alert.severity === 'High' ? 'text-red-500' :
                                            alert.severity === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                                    }>{alert.severity}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40">Confidence</span>
                                    <span>{Math.round(alert.confidence * 100)}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40">Status</span>
                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-emerald-400">{alert.status}</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6">
                            <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-4">Triage Controls</h3>
                            <StatusButtons alertId={alert.id} currentStatus={alert.status} />
                        </div>

                        {/* Mini Activity Feed */}
                        <div className="glass-panel p-6">
                            <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-6">Recent History</h3>
                            <div className="flex flex-col gap-6">
                                {activity.slice(0, 5).map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="shrink-0 mt-1">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-white/5`}>
                                                {item.type === 'note' ? <MessageSquare className="w-3 h-3 text-blue-400" /> : <History className="w-3 h-3 text-emerald-400" />}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <span className="text-[10px] font-bold text-white/50 truncate pr-2">{item.user}</span>
                                                <span className="text-[8px] text-white/20 whitespace-nowrap">{formatDistanceToNow(item.date, { addSuffix: true })}</span>
                                            </div>
                                            <p className="text-[10px] text-white/70 line-clamp-2 italic min-h-[1.5em]">
                                                {item.type === 'note' ? (item as any).content : (item as any).action}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
