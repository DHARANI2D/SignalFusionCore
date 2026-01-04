import { UnifiedEvent, Detector, Detection } from "../../types";
import { SecurityPolicy } from "../../config/policy";

export class FSMChainDetector implements Detector {
    name = "FSM-Chain Detector";
    description = "Tracks complex attack chains using a Finite State Machine (e.g., BRUTE_FORCE -> SUCCESS -> SENSITIVE_ACTION).";

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];
        const eventsByUser: Record<string, UnifiedEvent[]> = {};
        const sensitiveSources = SecurityPolicy.fsmChain.sensitiveSources;

        // Group events by user
        events.filter(e => e.actor.user).forEach(e => {
            const user = e.actor.user!;
            if (!eventsByUser[user]) eventsByUser[user] = [];
            eventsByUser[user].push(e);
        });

        for (const [user, userEvents] of Object.entries(eventsByUser)) {
            const sorted = [...userEvents].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            let state: "START" | "FAILED_LOGIN" | "SUCCESS_LOGIN" = "START";
            let chain: UnifiedEvent[] = [];

            for (const event of sorted) {
                if (state === "START" && event.eventType === "LOGIN_FAIL") {
                    state = "FAILED_LOGIN";
                    chain = [event];
                } else if (state === "FAILED_LOGIN" && event.eventType === "LOGIN_SUCCESS") {
                    state = "SUCCESS_LOGIN";
                    chain.push(event);
                } else if (state === "SUCCESS_LOGIN" && sensitiveSources.includes(event.source)) {
                    // Detect sensitive action after suspicious login chain
                    detections.push({
                        detector: this.name,
                        matchedEvents: [...chain, event],
                        signals: ["suspicious_login_chain", "potential_account_takeover"],
                        confidence: 0.85,
                        mitreTactics: ["Persistence", "Privilege Escalation"],
                        mitreTechniques: ["T1078 - Valid Accounts", "T1548 - Abuse Elevation Control Mechanism"],
                        reasoning: [
                            `User ${user} experienced a FAILED_LOGIN followed by a SUCCESS_LOGIN, and then performed a sensitive action in ${event.source}.`,
                            `Action: ${event.eventType} on ${event.actor.service || event.actor.process || "unknown"}.`,
                        ],
                    });
                    // Reset after detection or keep tracking? 
                    // For simplicity, reset to avoid duplicate alerts for same chain
                    state = "START";
                    chain = [];
                }
            }
        }

        return detections;
    }
}
