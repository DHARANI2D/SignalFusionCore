"use client";

import { addAlertNote } from "@/services/actions";
import { useState, useTransition } from "react";
import { MessageSquare, Send } from "lucide-react";

export function NoteForm({ alertId }: { alertId: string }) {
    const [content, setContent] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        startTransition(async () => {
            await addAlertNote(alertId, content, "Analyst"); // Hardcoded user for now
            setContent("");
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a triage note..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500/50 min-h-[100px] resize-none"
                    disabled={isPending}
                />
            </div>
            <button
                type="submit"
                disabled={isPending || !content.trim()}
                className="self-end px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-xs font-bold rounded-lg transition-colors flex items-center gap-2"
            >
                {isPending ? "Adding..." : "Add Note"}
                <Send className="w-3 h-3" />
            </button>
        </form>
    );
}

export function StatusButtons({ alertId, currentStatus }: { alertId: string, currentStatus: string }) {
    const [isPending, startTransition] = useTransition();

    const handleUpdate = (status: string) => {
        startTransition(async () => {
            const { updateAlertStatus } = await import("@/services/actions");
            await updateAlertStatus(alertId, status, "Analyst");
        });
    };

    const statusFlow = {
        "New": { next: "Triage", label: "Start Triage", icon: Clock, color: "bg-blue-600 hover:bg-blue-500" },
        "Triage": { next: "In Progress", label: "Begin Investigation", icon: Activity, color: "bg-amber-600 hover:bg-amber-500" },
        "In Progress": { next: "Closed", label: "Mark Resolved", icon: CheckCircle2, color: "bg-emerald-600 hover:bg-emerald-500" },
    };

    const currentFlow = statusFlow[currentStatus as keyof typeof statusFlow];

    return (
        <div className="flex flex-col gap-2">
            {/* Primary action - next step in workflow */}
            {currentFlow && (
                <button
                    onClick={() => handleUpdate(currentFlow.next)}
                    disabled={isPending}
                    className={`w-full py-2 ${currentFlow.color} disabled:opacity-50 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2`}
                >
                    <currentFlow.icon className="w-4 h-4" />
                    {isPending ? "Processing..." : currentFlow.label}
                </button>
            )}

            {/* Quick close option (always available except when closed) */}
            {currentStatus !== "Closed" && currentStatus !== "In Progress" && (
                <button
                    onClick={() => handleUpdate("Closed")}
                    disabled={isPending}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {isPending ? "Closing..." : "Quick Close"}
                </button>
            )}

            {/* Re-open option when closed */}
            {currentStatus === "Closed" && (
                <button
                    onClick={() => handleUpdate("Triage")}
                    disabled={isPending}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Activity className="w-4 h-4 text-blue-500" />
                    Re-open Alert
                </button>
            )}

            {/* Status indicator */}
            <div className="mt-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">Current Status</span>
                    <span className={`px-2 py-1 rounded font-bold ${currentStatus === "New" ? "bg-blue-500/20 text-blue-400" :
                            currentStatus === "Triage" ? "bg-amber-500/20 text-amber-400" :
                                currentStatus === "In Progress" ? "bg-purple-500/20 text-purple-400" :
                                    "bg-emerald-500/20 text-emerald-400"
                        }`}>
                        {currentStatus}
                    </span>
                </div>
            </div>
        </div>
    );
}

import { Clock, CheckCircle2, Activity } from "lucide-react";
