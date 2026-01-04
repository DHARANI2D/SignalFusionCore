"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileJson, Server, Activity, AlertCircle, CheckCircle, XCircle, Play, Square } from "lucide-react";

// Global simulator state stored in localStorage
const SIMULATOR_KEY = 'signalFusion_simulator';
const SIMULATOR_INTERVAL_KEY = 'signalFusion_simulator_interval';

export default function IngestPage() {
    const [source, setSource] = useState("endpoint");
    const [eventType, setEventType] = useState("PROCESS_START");
    const [jsonData, setJsonData] = useState(`{
  "timestamp": "${new Date().toISOString()}",
  "process": "mimikatz.exe",
  "parent_process": "powershell.exe",
  "user": "admin",
  "hostname": "WORKSTATION-042",
  "command_line": "mimikatz.exe sekurlsa::logonpasswords",
  "pid": 4892
}`);
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [isSimulating, setIsSimulating] = useState(false);
    const [simulatorStats, setSimulatorStats] = useState({
        totalSent: 0,
        successful: 0,
        failed: 0,
        alertsGenerated: 0
    });
    const [recentLogs, setRecentLogs] = useState<any[]>([]);
    const simulatorInterval = useRef<NodeJS.Timeout | null>(null);
    const workerInterval = useRef<NodeJS.Timeout | null>(null);

    // Load simulator state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem(SIMULATOR_KEY);
        if (savedState) {
            const state = JSON.parse(savedState);
            setSimulatorStats(state.stats || { totalSent: 0, successful: 0, failed: 0, alertsGenerated: 0 });
            setRecentLogs(state.logs || []);
            setIsSimulating(state.isRunning || false);

            // Resume simulator if it was running
            if (state.isRunning && state.stats.totalSent < 100) {
                resumeSimulator();
            }
        }

        // Check for running simulator every second
        workerInterval.current = setInterval(() => {
            const savedState = localStorage.getItem(SIMULATOR_KEY);
            if (savedState) {
                const state = JSON.parse(savedState);
                setSimulatorStats(state.stats || simulatorStats);
                setRecentLogs(state.logs || []);
                setIsSimulating(state.isRunning || false);
            }
        }, 1000);

        return () => {
            if (workerInterval.current) clearInterval(workerInterval.current);
        };
    }, []);

    const handleIngest = async () => {
        setLoading(true);
        setResponse(null);
        try {
            const parsedData = JSON.parse(jsonData);
            const payload = { source, log: { eventType, ...parsedData } };
            const res = await fetch("http://localhost:8001/api/ingest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            setResponse(result);
        } catch (error: any) {
            setResponse({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    const generateRandomLog = () => {
        const sources = ["auth", "endpoint", "network", "cloud"];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        const isMalicious = Math.random() < 0.3;

        const normalScenarios: any = {
            auth: [{ eventType: "LOGIN_SUCCESS", user: "alice.smith", source_ip: "10.0.1.50", type: "normal" }],
            endpoint: [{ eventType: "PROCESS_START", process: "chrome.exe", user: "alice", hostname: "DESK-001", type: "normal" }],
            network: [{ eventType: "CONNECTION", source_ip: "10.0.1.50", dest_ip: "8.8.8.8", port: 443, type: "normal" }],
            cloud: [{ eventType: "S3_ACCESS", resource: "s3://docs/report.pdf", user: "alice", action: "READ", type: "normal" }]
        };

        const maliciousScenarios: any = {
            auth: [{ eventType: "BRUTE_FORCE", user: "root", source_ip: "185.220.101.45", attempts: 50, type: "malicious" }],
            endpoint: [{ eventType: "PROCESS_START", process: "mimikatz.exe", user: "admin", hostname: "DESK-001", type: "malicious" }],
            network: [{ eventType: "CONNECTION", source_ip: "10.0.0.50", dest_ip: "185.220.101.45", port: 443, type: "malicious" }],
            cloud: [{ eventType: "S3_ACCESS", resource: "s3://sensitive/creds.zip", user: "svc", action: "DOWNLOAD", type: "malicious" }]
        };

        const scenarios = isMalicious ? maliciousScenarios : normalScenarios;
        const logs = scenarios[randomSource];
        const randomLog = logs[Math.floor(Math.random() * logs.length)];
        return { source: randomSource, log: randomLog, isMalicious };
    };

    const saveSimulatorState = (stats: any, logs: any[], isRunning: boolean) => {
        localStorage.setItem(SIMULATOR_KEY, JSON.stringify({
            stats,
            logs,
            isRunning,
            lastUpdate: new Date().toISOString()
        }));
    };

    const resumeSimulator = () => {
        if (simulatorInterval.current) return; // Already running

        simulatorInterval.current = setInterval(async () => {
            const savedState = localStorage.getItem(SIMULATOR_KEY);
            if (!savedState) return;

            const state = JSON.parse(savedState);
            if (!state.isRunning || state.stats.totalSent >= 100) {
                if (simulatorInterval.current) {
                    clearInterval(simulatorInterval.current);
                    simulatorInterval.current = null;
                }
                saveSimulatorState(state.stats, state.logs, false);
                return;
            }

            const { source, log } = generateRandomLog();
            try {
                const res = await fetch("http://localhost:8001/api/ingest", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ source, log })
                });
                const result = await res.json();

                const newStats = {
                    totalSent: state.stats.totalSent + 1,
                    successful: state.stats.successful + 1,
                    failed: state.stats.failed,
                    alertsGenerated: state.stats.alertsGenerated + (result.alertsGenerated || 0)
                };

                const newLog = {
                    timestamp: new Date().toISOString(),
                    source,
                    eventType: log.eventType,
                    status: "success",
                    alerts: result.alertsGenerated || 0,
                    isMalicious: log.type === "malicious",
                    details: log.user || log.process || log.domain || log.resource || ""
                };

                const newLogs = [newLog, ...state.logs.slice(0, 19)];
                const isStillRunning = newStats.totalSent < 100;

                saveSimulatorState(newStats, newLogs, isStillRunning);

                if (!isStillRunning && simulatorInterval.current) {
                    clearInterval(simulatorInterval.current);
                    simulatorInterval.current = null;
                }
            } catch (error) {
                const newStats = {
                    ...state.stats,
                    totalSent: state.stats.totalSent + 1,
                    failed: state.stats.failed + 1
                };
                saveSimulatorState(newStats, state.logs, state.stats.totalSent + 1 < 100);
            }
        }, 1500);
    };

    const startSimulator = () => {
        const initialStats = { totalSent: 0, successful: 0, failed: 0, alertsGenerated: 0 };
        saveSimulatorState(initialStats, [], true);
        setIsSimulating(true);
        setSimulatorStats(initialStats);
        setRecentLogs([]);
        resumeSimulator();
    };

    const stopSimulator = () => {
        saveSimulatorState(simulatorStats, recentLogs, false);
        setIsSimulating(false);
        if (simulatorInterval.current) {
            clearInterval(simulatorInterval.current);
            simulatorInterval.current = null;
        }
    };

    useEffect(() => {
        return () => {
            if (simulatorInterval.current) {
                clearInterval(simulatorInterval.current);
            }
        };
    }, []);

    const templates = {
        auth: `{
  "timestamp": "${new Date().toISOString()}",
  "user": "admin",
  "source_ip": "185.220.101.45",
  "result": "FAILED",
  "attempts": 15,
  "geo_location": "TOR_EXIT_NODE"
}`,
        endpoint: `{
  "timestamp": "${new Date().toISOString()}",
  "process": "mimikatz.exe",
  "parent_process": "powershell.exe",
  "user": "admin",
  "hostname": "WORKSTATION-042",
  "command_line": "mimikatz.exe sekurlsa::logonpasswords",
  "pid": 4892
}`,
        network: `{
  "timestamp": "${new Date().toISOString()}",
  "source_ip": "10.0.0.50",
  "dest_ip": "185.220.101.45",
  "port": 443,
  "protocol": "HTTPS",
  "bytes_transferred": 1048576,
  "domain": "suspicious-c2-server.com"
}`,
        cloud: `{
  "timestamp": "${new Date().toISOString()}",
  "resource": "s3://company-secrets/credentials.zip",
  "user": "compromised-service-account",
  "action": "DOWNLOAD",
  "size": 52428800,
  "region": "us-east-1"
}`
    };

    return (
        <div className="flex flex-col gap-8 flex-1 max-w-7xl mx-auto w-full">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Log Ingestion</h1>
                    <p className="text-white/50 mt-1">Manual and automated security log ingestion</p>
                </div>
            </header>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Simulator & Live Feed */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Simulator Control */}
                    <div className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Activity className={`w-4 h-4 ${isSimulating ? 'text-green-500' : 'text-white/40'}`} />
                                <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">Data Simulator</h3>
                                {isSimulating && <span className="text-xs text-green-400">● Running (stops at 100)</span>}
                            </div>
                            <button
                                onClick={isSimulating ? stopSimulator : startSimulator}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${isSimulating
                                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                    }`}
                            >
                                {isSimulating ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                {isSimulating ? "Stop" : "Start"}
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <div className="text-xs text-white/40 mb-1">Total</div>
                                <div className="text-2xl font-bold">{simulatorStats.totalSent || 0}<span className="text-sm text-white/30">/100</span></div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <div className="text-xs text-white/40 mb-1">Success</div>
                                <div className="text-2xl font-bold text-green-400">{simulatorStats.successful || 0}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <div className="text-xs text-white/40 mb-1">Failed</div>
                                <div className="text-2xl font-bold text-red-400">{simulatorStats.failed || 0}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                <div className="text-xs text-white/40 mb-1">Alerts</div>
                                <div className="text-2xl font-bold text-orange-400">{simulatorStats.alertsGenerated || 0}</div>
                            </div>
                        </div>
                    </div>

                    {/* Live Feed */}
                    <div className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">Live Activity Feed</h3>
                            <span className="text-xs text-white/30">{recentLogs.length}/20 events</span>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {recentLogs.length === 0 ? (
                                <div className="text-center text-white/30 text-sm py-8">
                                    Start simulator to see activity
                                </div>
                            ) : (
                                recentLogs.map((log, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${log.isMalicious
                                            ? 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                    >
                                        {log.status === "success" ? (
                                            <CheckCircle className={`w-4 h-4 flex-shrink-0 ${log.isMalicious ? 'text-orange-400' : 'text-green-400'}`} />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-white/40 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                <span className={`font-medium ${log.source === 'auth' ? 'text-blue-400' :
                                                    log.source === 'endpoint' ? 'text-purple-400' :
                                                        log.source === 'network' ? 'text-cyan-400' : 'text-green-400'
                                                    }`}>{log.source}</span>
                                                <span className="text-white/60 text-xs">{log.eventType}</span>
                                                {log.isMalicious && <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded">Suspicious</span>}
                                            </div>
                                            {log.alerts > 0 && (
                                                <div className="flex items-center gap-1 text-xs text-orange-400 mt-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {log.alerts} alert{log.alerts > 1 ? 's' : ''} generated
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Manual Ingest & Enterprise */}
                <div className="flex flex-col gap-6">
                    {/* Manual Ingest */}
                    <div className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                        <div className="flex items-center gap-2 mb-4">
                            <FileJson className="w-4 h-4 text-blue-400" />
                            <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">Manual Ingest</h3>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-white/40 mb-1.5">Source</label>
                                <select
                                    value={source}
                                    onChange={(e) => { setSource(e.target.value); setJsonData(templates[e.target.value as keyof typeof templates]); }}
                                    className="w-full bg-white/5 text-white rounded-lg px-3 py-2 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                >
                                    <option value="auth">Authentication</option>
                                    <option value="endpoint">Endpoint</option>
                                    <option value="network">Network</option>
                                    <option value="cloud">Cloud</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-white/40 mb-1.5">Event Type</label>
                                <input
                                    type="text"
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    className="w-full bg-white/5 text-white rounded-lg px-3 py-2 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                                    placeholder="e.g., LOGIN_FAIL"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-white/40 mb-1.5">Event Data (JSON)</label>
                                <textarea
                                    value={jsonData}
                                    onChange={(e) => setJsonData(e.target.value)}
                                    rows={8}
                                    className="w-full bg-white/5 text-white rounded-lg px-3 py-2 border border-white/10 text-sm font-mono focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
                                />
                            </div>

                            <button
                                onClick={handleIngest}
                                disabled={loading}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                            >
                                <Upload className="w-4 h-4" />
                                {loading ? "Ingesting..." : "Ingest Event"}
                            </button>
                        </div>

                        {response && (
                            <div className="mt-4 bg-white/5 rounded-lg p-3 border border-white/10">
                                <div className="text-xs text-white/40 mb-2">Response</div>
                                <pre className="text-xs text-white/60 overflow-auto max-h-32 font-mono">
                                    {JSON.stringify(response, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Enterprise Methods */}
                    <div className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                        <div className="flex items-center gap-2 mb-4">
                            <Server className="w-4 h-4 text-purple-400" />
                            <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">Enterprise API</h3>
                        </div>

                        <div className="space-y-2 text-xs">
                            <div className="bg-white/5 rounded p-2 border border-white/10">
                                <div className="text-white/60 font-medium mb-0.5">Batch Ingestion</div>
                                <code className="text-blue-400 text-xs">POST /api/enterprise/ingest/batch</code>
                                <div className="text-white/30 mt-1">JSON arrays • Bulk processing</div>
                            </div>

                            <div className="bg-white/5 rounded p-2 border border-white/10">
                                <div className="text-white/60 font-medium mb-0.5">Syslog Receiver</div>
                                <code className="text-cyan-400 text-xs">POST /api/enterprise/ingest/syslog</code>
                                <div className="text-white/30 mt-1">CEF/LEEF • Firewall logs</div>
                            </div>

                            <div className="bg-white/5 rounded p-2 border border-white/10">
                                <div className="text-white/60 font-medium mb-0.5">Webhook Integration</div>
                                <code className="text-purple-400 text-xs">POST /api/enterprise/ingest/webhook</code>
                                <div className="text-white/30 mt-1">Splunk • Elastic • Sentinel</div>
                            </div>

                            <div className="bg-white/5 rounded p-2 border border-white/10">
                                <div className="text-white/60 font-medium mb-0.5">SIEM Polling</div>
                                <code className="text-green-400 text-xs">POST /api/enterprise/ingest/poll</code>
                                <div className="text-white/30 mt-1">Scheduled queries • Cron jobs</div>
                            </div>

                            <div className="bg-white/5 rounded p-2 border border-white/10">
                                <div className="text-white/60 font-medium mb-0.5">File Watcher</div>
                                <code className="text-orange-400 text-xs">POST /api/enterprise/ingest/watch</code>
                                <div className="text-white/30 mt-1">Directory monitoring</div>
                            </div>

                            <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                                <div className="text-blue-300 text-xs">
                                    📚 <code className="bg-white/10 px-1 rounded">ENTERPRISE_INGESTION.md</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
