"use client";

import { useState } from "react";
import { Play, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface PlaybookExecutionsProps {
    alertId: string;
    executions: any[];
    approvals: any[];
}

export function PlaybookExecutions({ alertId, executions, approvals }: PlaybookExecutionsProps) {
    const [isRunning, setIsRunning] = useState(false);

    const handleApprove = async (approvalId: string) => {
        try {
            const res = await fetch(`http://localhost:8001/api/playbooks/approvals/${approvalId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approvedBy: 'analyst' })
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to approve playbook:', error);
        }
    };

    const handleReject = async (approvalId: string) => {
        try {
            const res = await fetch(`http://localhost:8001/api/playbooks/approvals/${approvalId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rejectedBy: 'analyst', reason: 'Manual rejection' })
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to reject playbook:', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'running':
                return <Clock className="w-4 h-4 text-blue-400 animate-spin" />;
            case 'failed':
                return <XCircle className="w-4 h-4 text-red-400" />;
            default:
                return <Clock className="w-4 h-4 text-yellow-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'running':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'failed':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            default:
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Pending Approvals */}
            {approvals && approvals.length > 0 && (
                <div className="glass-panel p-6 border-2 border-amber-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-bold text-amber-300 uppercase tracking-widest">
                            Pending Approval ({approvals.length})
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {approvals.map((approval: any) => (
                            <div
                                key={approval.id}
                                className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="font-bold text-amber-300 mb-1">
                                            {approval.playbook.name}
                                        </div>
                                        <div className="text-xs text-white/60">
                                            {approval.playbook.description}
                                        </div>
                                        <div className="text-xs text-white/40 mt-2">
                                            Requested {new Date(approval.requestedAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleApprove(approval.id)}
                                            className="px-3 py-1.5 rounded bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-bold transition-all"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(approval.id)}
                                            className="px-3 py-1.5 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                                <div className="text-xs text-white/50">
                                    Actions: {approval.playbook.actions?.length || 0} steps
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Execution History */}
            <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Playbook Executions
                    </h3>
                    {executions && executions.length > 0 && (
                        <span className="text-xs text-white/40">
                            {executions.length} execution{executions.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {!executions || executions.length === 0 ? (
                    <div className="text-center py-8 text-white/30 text-sm">
                        No playbook executions for this alert
                    </div>
                ) : (
                    <div className="space-y-3">
                        {executions.map((execution: any) => {
                            const results = execution.results ? JSON.parse(execution.results) : [];
                            const duration = execution.endTime
                                ? Math.round(
                                    (new Date(execution.endTime).getTime() -
                                        new Date(execution.startTime).getTime()) /
                                    1000
                                )
                                : null;

                            return (
                                <div
                                    key={execution.id}
                                    className="p-4 rounded-lg bg-white/5 border border-white/10"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-bold">{execution.playbook.name}</span>
                                                <span
                                                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${getStatusColor(
                                                        execution.status
                                                    )}`}
                                                >
                                                    {getStatusIcon(execution.status)}
                                                    {execution.status}
                                                </span>
                                                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                                    {execution.triggeredBy}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-white/40">
                                                <span>
                                                    Started: {new Date(execution.startTime).toLocaleString()}
                                                </span>
                                                {duration !== null && <span>Duration: {duration}s</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Results */}
                                    {results.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            <div className="text-xs font-bold text-white/40 uppercase">
                                                Actions Executed:
                                            </div>
                                            {results.map((result: any, i: number) => (
                                                <div
                                                    key={i}
                                                    className="flex items-center gap-3 p-2 rounded bg-white/5 text-xs"
                                                >
                                                    {result.status === 'success' ? (
                                                        <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                                                    )}
                                                    <span className="flex-1">{result.action}</span>
                                                    {result.output && (
                                                        <span className="text-white/40">
                                                            {JSON.stringify(result.output).slice(0, 50)}...
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Error Display */}
                                    {execution.error && (
                                        <div className="mt-3 p-3 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                                            <div className="font-bold mb-1">Error:</div>
                                            {execution.error}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
