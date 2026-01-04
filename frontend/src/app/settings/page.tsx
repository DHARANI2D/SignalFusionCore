"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, Database, Cpu, Mail, Save, CheckCircle2, Sliders, Globe, Play, Terminal } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export default function SettingsPage() {
    const [config, setConfig] = useState<any>({
        anomalySensitivity: 75,
        realTimeCorrelation: true,
        emailAlerts: true,
        webhookActive: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Simulation State
    const [simulating, setSimulating] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        // Fetch initial config
        fetch(`${getApiUrl()}/api/config`)
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setLoading(false);
            })
            .catch(err => console.error("Failed to load config", err));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`${getApiUrl()}/api/config`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config),
            });
            setLastSaved(new Date());
        } catch (e) {
            console.error("Save failed", e);
        } finally {
            setTimeout(() => setSaving(false), 500);
        }
    };

    const runSimulation = async () => {
        setSimulating(true);
        setLogs(["🚀 Initializing Attack Cluster...", "⏳ Waiting for response..."]);
        try {
            const res = await fetch(`${getApiUrl()}/api/simulation/run`, { method: "POST" });
            const data = await res.json();
            setLogs(data.logs);
        } catch (e) {
            setLogs(prev => [...prev, "❌ Simulation Failed: Network Error"]);
        } finally {
            setSimulating(false);
        }
    };

    if (loading) return <div className="p-12 text-white/40">Loading configuration...</div>;

    return (
        <div className="flex flex-col gap-8 flex-1 max-w-6xl mx-auto w-full pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Platform Configuration</h1>
                    <p className="text-white/40 text-sm mt-1">Manage detection parameters and run system simulations</p>
                </div>
                <div className="flex items-center gap-4">
                    {lastSaved && (
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                            <CheckCircle2 className="w-3 h-3" />
                            Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-semibold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {saving ? "Syncing..." : "Save Config"}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Settings */}
                <div className="flex flex-col gap-6">
                    {/* Detector Tuning */}
                    <div className="flex flex-col gap-1">
                        <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500/10 text-blue-400 font-medium text-sm text-left border border-blue-500/20">
                            <Sliders className="w-4 h-4" /> Platform & Tuning
                        </button>
                        <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-white/60 hover:bg-white/5 transition-all text-sm text-left">
                            <Bell className="w-4 h-4" /> Notification Channels
                        </button>
                        <button
                            onClick={async () => {
                                if (confirm("ARE YOU SURE? This will wipe all alerts and logs.")) {
                                    await fetch(`${getApiUrl()}/api/reset`, { method: "DELETE" });
                                    window.location.reload();
                                }
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-white/5 transition-all text-sm text-left group"
                        >
                            <Database className="w-4 h-4 group-hover:animate-pulse" /> Reset System Data
                        </button>
                    </div>
                    <section className="glass-panel p-6 flex flex-col gap-6">
                        <div className="flex items-center gap-3 text-emerald-500">
                            <Shield className="w-5 h-5" />
                            <h2 className="text-lg font-semibold text-white">Detection Oversight</h2>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-emerald-500/20 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                            <Cpu className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">Anomalous Action Sensitivity</span>
                                            <span className="text-[11px] text-white/30">Heuristic threshold</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-500">{config.anomalySensitivity}%</span>
                                </div>
                                <input
                                    type="range"
                                    className="w-full accent-emerald-500 opacity-60 hover:opacity-100 transition-opacity"
                                    value={config.anomalySensitivity}
                                    onChange={(e) => setConfig({ ...config, anomalySensitivity: parseInt(e.target.value) })}
                                />
                            </div>

                            <div className="flex items-center justify-between p-5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-blue-500/20 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                        <Globe className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">Real-time Correlation</span>
                                        <span className="text-[11px] text-white/30">FSM State Tracking</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setConfig({ ...config, realTimeCorrelation: !config.realTimeCorrelation })}
                                    className={clsx("w-11 h-6 rounded-full relative shadow-inner p-1 transition-colors", config.realTimeCorrelation ? "bg-blue-600" : "bg-white/10")}
                                >
                                    <div className={clsx("w-4 h-4 bg-white rounded-full transition-all", config.realTimeCorrelation ? "ml-auto" : "ml-0")} />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Simulation Runner */}
                <div className="flex flex-col gap-6">
                    <section className="glass-panel p-6 flex flex-col gap-6 h-full">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-red-400">
                                <Terminal className="w-5 h-5" />
                                <h2 className="text-lg font-semibold text-white">Attack Simulation</h2>
                            </div>
                            <button
                                onClick={runSimulation}
                                disabled={simulating}
                                className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                            >
                                {simulating ? <div className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                                {simulating ? "Replaying..." : "Run Scenario"}
                            </button>
                        </div>

                        <div className="flex-1 bg-[#0a0a0c] rounded-lg border border-white/10 p-4 font-mono text-xs text-white/70 overflow-y-auto min-h-[400px] flex flex-col gap-1 shadow-inner">
                            {logs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-white/20 gap-2">
                                    <Terminal className="w-8 h-8" />
                                    <p>Ready to simulate attack vectors...</p>
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
                                        <span className="text-white/20 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                        {log.includes("❌") ? <span className="text-red-400">{log}</span> :
                                            log.includes("✅") ? <span className="text-emerald-400 font-bold">{log}</span> :
                                                log.includes("🚀") ? <span className="text-blue-400 font-bold">{log}</span> :
                                                    log.includes("---") ? <span className="text-yellow-400/80 mt-2 block border-b border-yellow-400/20 pb-1">{log}</span> :
                                                        log.includes("> POST") ? <span className="text-blue-300/60">{log}</span> :
                                                            <span className="text-white/70">{log}</span>}
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

function clsx(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ');
}
