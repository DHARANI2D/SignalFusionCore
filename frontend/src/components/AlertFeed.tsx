"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import Link from "next/link";

export function AlertFeed() {
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/alerts", { cache: 'no-store' });
            const data = await res.json();
            setAlerts(data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="glass-panel p-12 flex flex-col items-center justify-center text-center opacity-50">
                <p className="text-lg">Loading alerts...</p>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="glass-panel p-12 flex flex-col items-center justify-center text-center opacity-50">
                <p className="text-lg">No alerts generated yet</p>
                <p className="text-sm">Run a simulation script to ingest logs and trigger detections.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {alerts.map((alert: any) => (
                <Link
                    key={alert.id}
                    href={`/alerts/${alert.id}`}
                    className={`glass-panel p-4 flex items-center justify-between severity-${alert.severity.toLowerCase()} hover:bg-white/[0.05] transition-colors cursor-pointer`}
                >
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-white/10 ${alert.severity === 'High' ? 'text-red-500' :
                                alert.severity === 'Medium' ? 'text-amber-500' :
                                    'text-blue-500'
                                }`}>
                                {alert.severity}
                            </span>
                            <h3 className="font-medium">{alert.summary}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-white/40">
                            <span>Alert ID: {alert.id.slice(0, 8)}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(alert.createdAt))} ago</span>
                            <span>•</span>
                            <span>Confidence: {Math.round((alert.confidence ?? 0) * 100)}%</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] uppercase font-bold text-white/30 tracking-wider">Status</span>
                            <span className={`text-sm font-medium ${alert.status === 'Closed' ? 'text-emerald-500' :
                                alert.status === 'Triage' ? 'text-blue-400' : 'text-white/70'
                                }`}>{alert.status}</span>
                        </div>
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">
                            {Math.round((alert.score ?? alert.riskScore ?? 0))}
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
