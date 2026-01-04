"use client";

import { useState } from "react";
import { Terminal, Play, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { getApiUrl } from "@/lib/api";

interface RemediationTerminalProps {
    alertId: string;
    actions: string[];
}

export function RemediationTerminal({ alertId, actions }: RemediationTerminalProps) {
    const [executing, setExecuting] = useState<string | null>(null);
    const [results, setResults] = useState<{ [key: string]: string }>({});

    const runAction = async (action: string) => {
        setExecuting(action);
        try {
            const res = await fetch(`${getApiUrl()}/api/alerts/${alertId}/remediate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, user: "Analyst-Alpha" }),
            });
            const data = await res.json();
            setResults(prev => ({ ...prev, [action]: data.message }));
        } catch (error) {
            setResults(prev => ({ ...prev, [action]: "Failed to initiate remediation action." }));
        } finally {
            setExecuting(null);
        }
    };

    return (
        <div className="glass-panel overflow-hidden border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <div className="bg-blue-500/10 px-4 py-2 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Response Orchestrator</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                </div>
            </div>

            <div className="p-4 flex flex-col gap-3">
                {actions.map((action, i) => (
                    <div key={i} className="flex flex-col gap-2 p-3 bg-black/40 rounded-lg border border-white/5 hover:border-blue-500/30 transition-colors">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/80 font-mono italic">{action}</span>
                            <button
                                onClick={() => runAction(action)}
                                disabled={!!executing || !!results[action]}
                                className={`flex items-center gap-2 px-3 py-1 rounded text-[10px] font-bold uppercase transition-all ${results[action]
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                        : executing === action
                                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 cursor-wait"
                                            : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                                    }`}
                            >
                                {executing === action ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        In Progress
                                    </>
                                ) : results[action] ? (
                                    <>
                                        <CheckCircle2 className="w-3 h-3" />
                                        Executed
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-3 h-3 fill-current" />
                                        Execute
                                    </>
                                )}
                            </button>
                        </div>
                        {results[action] && (
                            <div className="text-[10px] text-emerald-400/70 border-t border-white/5 pt-2 font-mono flex items-start gap-2">
                                <span className="opacity-40">{">"}</span>
                                {results[action]}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
