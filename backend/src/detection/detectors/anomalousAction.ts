import { Detector, Detection, UnifiedEvent } from "../../types";

export class AnomalousActionDetector implements Detector {
    name = "Anomalous Action Detector";
    description = "Detects suspicious sequences of events within a short timeframe (e.g., suspicious process execution after discovery commands).";

    private SUSPICIOUS_SEQUENCES = [
        ["DISCOVERY", "PERSISTENCE"],
        ["LOGIN_SUCCESS", "DISCOVERY", "EXFILTRATION"],
        ["PROCESS_START", "NETWORK_CONN_OUTBOUND"], // Very generic, but can be refined
    ];

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];
        const eventsByUser: Record<string, UnifiedEvent[]> = {};

        // Group by user
        events.filter(e => e.actor.user).forEach(e => {
            const user = e.actor.user!;
            if (!eventsByUser[user]) eventsByUser[user] = [];
            eventsByUser[user].push(e);
        });

        for (const [user, userEvents] of Object.entries(eventsByUser)) {
            const sorted = [...userEvents].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            // Sliding window or sequence matching
            // Using a simple sequence matcher for now
            for (let i = 0; i < sorted.length - 1; i++) {
                const e1 = sorted[i];
                const e2 = sorted[i + 1];

                // Check for DISCOVERY followed by something suspicious
                if (e1.eventType === "PROCESS_START" && this.isDiscoveryProcess(e1.actor.process || "")) {
                    if (e2.eventType === "PROCESS_START" && this.isSuspiciousNextStep(e2.actor.process || "")) {
                        detections.push({
                            detector: this.name,
                            matchedEvents: [e1, e2],
                            signals: ["discovery_followed_by_suspicious_action", "lateral_movement_prep"],
                            confidence: 0.7,
                            mitreTactics: ["Discovery", "Execution"],
                            mitreTechniques: ["T1087 - Account Discovery", "T1059 - Command and Scripting Interpreter"],
                            reasoning: [
                                `User ${user} executed discovery process '${e1.actor.process}' followed by suspicious process '${e2.actor.process}'.`,
                                `Time gap: ${Math.round((e2.timestamp.getTime() - e1.timestamp.getTime()) / 1000)}s`
                            ],
                        });
                    }
                }
            }
        }

        return detections;
    }

    private isDiscoveryProcess(process: string): boolean {
        const discovery = ["whoami", "net user", "ipconfig", "systeminfo", "tasklist", "quser"];
        return discovery.some(d => process.toLowerCase().includes(d));
    }

    private isSuspiciousNextStep(process: string): boolean {
        const suspicious = ["powershell", "cmd.exe", "schtasks", "reg.exe", "bitsadmin", "certutil"];
        return suspicious.some(s => process.toLowerCase().includes(s));
    }
}
