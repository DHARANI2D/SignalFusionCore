"use client";

import { useState, useEffect, useRef } from "react";
import { Activity, Play, Square, TrendingUp } from "lucide-react";
import Link from "next/link";
import { startGlobalSimulator, stopGlobalSimulator } from "@/lib/simulator";

const SIMULATOR_KEY = 'signalFusion_simulator';

export function SimulatorControl() {
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatorStats, setSimulatorStats] = useState({
        totalSent: 0,
        successful: 0,
        failed: 0,
        alertsGenerated: 0
    });
    const workerInterval = useRef<NodeJS.Timeout | null>(null);

    // Sync with localStorage state
    useEffect(() => {
        const updateState = () => {
            const savedState = localStorage.getItem(SIMULATOR_KEY);
            if (savedState) {
                const state = JSON.parse(savedState);
                setSimulatorStats(state.stats || { totalSent: 0, successful: 0, failed: 0, alertsGenerated: 0 });
                setIsSimulating(state.isRunning || false);
            }
        };

        updateState();
        workerInterval.current = setInterval(updateState, 500);

        return () => {
            if (workerInterval.current) clearInterval(workerInterval.current);
        };
    }, []);

    const toggleSimulator = () => {
        const savedState = localStorage.getItem(SIMULATOR_KEY);
        const currentState = savedState ? JSON.parse(savedState) : null;

        if (currentState?.isRunning) {
            // Stop
            stopGlobalSimulator();
            localStorage.setItem(SIMULATOR_KEY, JSON.stringify({
                ...currentState,
                isRunning: false
            }));
            setIsSimulating(false);
        } else {
            // Start fresh
            const initialStats = { totalSent: 0, successful: 0, failed: 0, alertsGenerated: 0 };
            localStorage.setItem(SIMULATOR_KEY, JSON.stringify({
                stats: initialStats,
                logs: [],
                isRunning: true,
                lastUpdate: new Date().toISOString()
            }));
            setIsSimulating(true);
            setSimulatorStats(initialStats);
            startGlobalSimulator();
        }
    };

    return (
        <div className="glass-panel p-6 shadow-lg shadow-blue-500/5">
            <div className="flex items-center gap-2 mb-4">
                <Activity className={`w-4 h-4 ${isSimulating ? 'text-green-500' : 'text-white/40'}`} />
                <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">Simulator</h3>
                {isSimulating && <span className="text-xs text-green-400">● Active</span>}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-white/5 rounded p-2 border border-white/10">
                    <div className="text-xs text-white/40">Events</div>
                    <div className="text-lg font-bold">{simulatorStats.totalSent || 0}<span className="text-xs text-white/30">/100</span></div>
                </div>
                <div className="bg-white/5 rounded p-2 border border-white/10">
                    <div className="text-xs text-white/40">Alerts</div>
                    <div className="text-lg font-bold text-orange-400">{simulatorStats.alertsGenerated || 0}</div>
                </div>
            </div>

            <div className="space-y-2">
                <button
                    onClick={toggleSimulator}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isSimulating
                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        }`}
                >
                    {isSimulating ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isSimulating ? "Stop Simulator" : "Start Simulator"}
                </button>

                <Link
                    href="/ingest"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                >
                    <TrendingUp className="w-4 h-4" />
                    Full Controls
                </Link>
            </div>

            <div className="mt-4 text-xs text-white/30">
                <p>Simulates realistic security events. Auto-stops at 100 events.</p>
            </div>
        </div>
    );
}
