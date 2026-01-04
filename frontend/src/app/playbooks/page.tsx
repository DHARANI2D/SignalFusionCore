"use client";

import { useState, useEffect } from "react";
import { Zap, Play, Clock, CheckCircle, XCircle, Plus } from "lucide-react";

interface PlaybookAction {
    name: string;
    actionType: string;
    parameters: Record<string, any>;
}

export default function PlaybooksPage() {
    const [playbooks, setPlaybooks] = useState<any[]>([]);
    const [executions, setExecutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [alerts, setAlerts] = useState<any[]>([]);
    const [newPlaybook, setNewPlaybook] = useState({
        name: "",
        description: "",
        trigger: { severity: "High", riskScore: 70 },
        actions: [
            { name: "Notify Security Team", actionType: "notify_slack", parameters: { channel: "#soc-alerts", message: "High severity alert detected" } }
        ] as PlaybookAction[],
        retroactive: false
    });
    const [simulationResult, setSimulationResult] = useState<any>(null);
    const [simAlertId, setSimAlertId] = useState("");

    useEffect(() => {
        fetchPlaybooks();
        fetchExecutions();
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/alerts");
            const data = await res.json();
            setAlerts(data || []);
            if (data && data.length > 0) setSimAlertId(data[0].id);
        } catch (error) {
            console.error("Failed to fetch alerts:", error);
        }
    };

    const fetchPlaybooks = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/playbooks");
            const data = await res.json();
            setPlaybooks(data.playbooks || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch playbooks:", error);
            setLoading(false);
        }
    };

    const fetchExecutions = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/playbooks/executions");
            const data = await res.json();
            setExecutions(data.executions || []);
        } catch (error) {
            console.error("Failed to fetch executions:", error);
        }
    };

    const handleCreatePlaybook = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/playbooks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newPlaybook)
            });
            const data = await res.json();
            if (data.success) {
                if (newPlaybook.retroactive) {
                    await fetch(`http://localhost:8001/api/playbooks/${data.playbook.id}/retroactive`, {
                        method: "POST"
                    });
                }
                fetchPlaybooks();
                fetchExecutions();
                setIsCreateModalOpen(false);
            }
        } catch (error) {
            console.error("Failed to create playbook:", error);
        }
    };

    const handleSimulate = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/playbooks/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ playbook: newPlaybook, alertId: simAlertId })
            });
            const data = await res.json();
            setSimulationResult(data);
        } catch (error) {
            console.error("Failed to simulate playbook:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-400 bg-green-500/20';
            case 'running': return 'text-blue-400 bg-blue-500/20';
            case 'failed': return 'text-red-400 bg-red-500/20';
            default: return 'text-yellow-400 bg-yellow-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-white/50">Loading playbooks...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 flex-1 max-w-7xl mx-auto w-full">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Response Playbooks</h1>
                    <p className="text-white/50 mt-1">Automated incident response workflows</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Create Playbook
                </button>
            </header>

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Create New Playbook</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-white/40 hover:text-white">✕</button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newPlaybook.name}
                                        onChange={e => setNewPlaybook({ ...newPlaybook, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 outline-none transition-all"
                                        placeholder="e.g. Isolate Ransomware"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-white/40 uppercase mb-2">Trigger Severity</label>
                                    <select
                                        value={newPlaybook.trigger.severity}
                                        onChange={e => setNewPlaybook({ ...newPlaybook, trigger: { ...newPlaybook.trigger, severity: e.target.value } })}
                                        className="w-full bg-[#0a0a0c] border border-white/10 rounded-lg px-4 py-2 text-sm focus:border-blue-500/50 outline-none transition-all"
                                    >
                                        <option value="Critical">Critical</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Description</label>
                                <textarea
                                    value={newPlaybook.description}
                                    onChange={e => setNewPlaybook({ ...newPlaybook, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm h-20 focus:border-blue-500/50 outline-none transition-all"
                                    placeholder="What does this playbook do?"
                                />
                            </div>

                            {/* Actions Section */}
                            <div>
                                <label className="block text-xs font-bold text-white/40 uppercase mb-2">Actions</label>
                                <div className="space-y-2">
                                    {newPlaybook.actions.map((action, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center text-sm">
                                            <span>{action.name} ({action.actionType})</span>
                                            <button onClick={() => {
                                                const actions = [...newPlaybook.actions];
                                                actions.splice(i, 1);
                                                setNewPlaybook({ ...newPlaybook, actions });
                                            }} className="text-red-400">Remove</button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setNewPlaybook({
                                            ...newPlaybook,
                                            actions: [...newPlaybook.actions, { name: "New Action", actionType: "isolate_host", parameters: {} }]
                                        })}
                                        className="w-full py-2 border border-dashed border-white/20 rounded-lg text-xs text-white/40 hover:text-white/60 transition-all"
                                    >
                                        + Add Action
                                    </button>
                                </div>
                            </div>

                            {/* Retroactive Toggle */}
                            <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="retro"
                                    checked={newPlaybook.retroactive}
                                    onChange={e => setNewPlaybook({ ...newPlaybook, retroactive: e.target.checked })}
                                    className="w-4 h-4 rounded"
                                />
                                <label htmlFor="retro" className="text-sm font-medium">
                                    Retroactive Execution: Run on existing alerts matching criteria
                                </label>
                            </div>

                            {/* Simulator Section */}
                            <div className="border-t border-white/5 pt-6">
                                <h3 className="text-sm font-bold text-white/60 mb-4">PLAYBOOK SIMULATOR</h3>
                                <div className="flex gap-4 mb-4">
                                    <select
                                        value={simAlertId}
                                        onChange={e => setSimAlertId(e.target.value)}
                                        className="flex-1 bg-[#0a0a0c] border border-white/10 rounded-lg px-4 py-2 text-sm"
                                    >
                                        {alerts.map(a => <option key={a.id} value={a.id}>{a.summary.slice(0, 50)}...</option>)}
                                    </select>
                                    <button
                                        onClick={handleSimulate}
                                        className="px-6 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-bold hover:bg-purple-500/30 transition-all"
                                    >
                                        Simulate
                                    </button>
                                </div>

                                {simulationResult && (
                                    <div className={`p-4 rounded-lg border ${simulationResult.matched ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-sm">Result: {simulationResult.matched ? 'MATCH' : 'NO MATCH'}</span>
                                            <span className="text-xs">{simulationResult.predictedOutcome}</span>
                                        </div>
                                        <div className="text-xs text-white/40">Alert: {simulationResult.alertSummary} ({simulationResult.alertSeverity})</div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-white/5">
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreatePlaybook}
                                    className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Create & Enable
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                    <div className="text-sm text-white/40 mb-2">Total Playbooks</div>
                    <div className="text-3xl font-bold">{playbooks.length}</div>
                </div>
                <div className="glass-panel p-6 shadow-lg shadow-green-500/5">
                    <div className="text-sm text-white/40 mb-2">Enabled</div>
                    <div className="text-3xl font-bold text-green-400">
                        {playbooks.filter(p => p.enabled).length}
                    </div>
                </div>
                <div className="glass-panel p-6 shadow-lg shadow-purple-500/5">
                    <div className="text-sm text-white/40 mb-2">Total Executions</div>
                    <div className="text-3xl font-bold text-purple-400">
                        {playbooks.reduce((sum, p) => sum + (p.executionCount || 0), 0)}
                    </div>
                </div>
                <div className="glass-panel p-6 shadow-lg shadow-orange-500/5">
                    <div className="text-sm text-white/40 mb-2">Success Rate</div>
                    <div className="text-3xl font-bold text-green-400">
                        {playbooks.length > 0
                            ? Math.round(
                                (playbooks.reduce((sum, p) => sum + (p.successCount || 0), 0) /
                                    Math.max(playbooks.reduce((sum, p) => sum + (p.executionCount || 0), 0), 1)) *
                                100
                            )
                            : 0}%
                    </div>
                </div>
            </section>

            {/* Playbooks List */}
            <section className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">Active Playbooks</h3>
                </div>

                <div className="space-y-3">
                    {playbooks.length === 0 ? (
                        <div className="text-center text-white/30 text-sm py-8">
                            No playbooks configured
                        </div>
                    ) : (
                        playbooks.map((playbook) => (
                            <div key={playbook.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-medium">{playbook.name}</span>
                                            <span className={`text-xs px-2 py-1 rounded ${playbook.enabled ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {playbook.enabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                            {playbook.autoExecute && (
                                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                                    Auto
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-white/40">{playbook.description || 'No description'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold">{playbook.executionCount}</div>
                                        <div className="text-xs text-white/40">executions</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1">
                                        <Play className="w-3 h-3 text-white/40" />
                                        <span className="text-white/60">{playbook.actions?.length || 0} actions</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3 text-green-400" />
                                        <span className="text-white/60">{playbook.successCount} success</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <XCircle className="w-3 h-3 text-red-400" />
                                        <span className="text-white/60">{playbook.failureCount} failed</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Zap className="w-3 h-3 text-purple-400" />
                                        <span className="text-white/60">Priority: {playbook.priority}</span>
                                    </div>
                                </div>

                                {/* Actions Preview */}
                                {playbook.actions && playbook.actions.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {playbook.actions.slice(0, 4).map((action: any, i: number) => (
                                            <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                                {action.actionType.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                        {playbook.actions.length > 4 && (
                                            <span className="text-xs text-white/40">+{playbook.actions.length - 4} more</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Recent Executions */}
            <section className="glass-panel p-6 shadow-lg shadow-purple-500/5">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">Recent Executions</h3>
                </div>

                <div className="space-y-2">
                    {executions.length === 0 ? (
                        <div className="text-center text-white/30 text-sm py-8">
                            No executions yet
                        </div>
                    ) : (
                        executions.map((execution) => (
                            <div key={execution.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-sm">{execution.playbook?.name}</span>
                                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(execution.status)}`}>
                                            {execution.status}
                                        </span>
                                    </div>
                                    <div className="text-xs text-white/40">
                                        {new Date(execution.startTime).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-white/40">
                                    <span>Triggered by: {execution.triggeredBy}</span>
                                    {execution.duration && <span>Duration: {execution.duration}s</span>}
                                    {execution.alertId && <span>Alert: {execution.alertId.slice(0, 8)}...</span>}
                                </div>

                                {execution.error && (
                                    <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded p-2">
                                        Error: {execution.error}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

