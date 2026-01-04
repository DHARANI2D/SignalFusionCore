import { UnifiedEvent, Detector, Detection } from "../../types";
import { SecurityPolicy } from "../../config/policy";

export class ThreatIntelDetector implements Detector {
    name = "ThreatIntelDetector";
    description = "Matches events against known malicious indicators (IPs, processes, etc.)";

    // Managed via SecurityPolicy
    private maliciousIps = new Set(SecurityPolicy.threatIntel.maliciousIps);
    private suspiciousProcessNames = new Set(SecurityPolicy.threatIntel.suspiciousProcesses);

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];

        // We check each event for matches
        for (const event of events) {
            const matchedSignals: string[] = [];
            const reasoning: string[] = [];

            // Check Source IP
            if (event.network.sourceIp && this.maliciousIps.has(event.network.sourceIp)) {
                matchedSignals.push("intel_malicious_ip");
                reasoning.push(`Matched known malicious IP: ${event.network.sourceIp}`);
            }

            // Check Process Name
            if (event.actor.process) {
                const procLower = event.actor.process.toLowerCase();
                for (const badProc of this.suspiciousProcessNames) {
                    if (procLower.includes(badProc)) {
                        matchedSignals.push("intel_suspicious_process");
                        reasoning.push(`Detected suspicious process execution: ${event.actor.process}`);
                        break;
                    }
                }
            }

            if (matchedSignals.length > 0) {
                detections.push({
                    detector: this.name,
                    matchedEvents: [event],
                    signals: matchedSignals,
                    confidence: 0.9, // Threat intel matches are usually high confidence
                    mitreTactics: ["Command and Control", "Initial Access"],
                    mitreTechniques: ["T1071 - Application Layer Protocol", "T1190 - Exploit Public-Facing Application"],
                    reasoning: reasoning,
                });
            }
        }

        return detections;
    }
}
