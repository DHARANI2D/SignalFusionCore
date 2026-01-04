import { Detector, Detection, UnifiedEvent } from "../../types";

export class GeoVelocityDetector implements Detector {
    name = "Geo-Velocity Detector";
    description = "Detects impossible travel between login events from different locations.";

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];
        const loginsByUser: Record<string, UnifiedEvent[]> = {};

        // Group logins by user
        events
            .filter(e => e.eventType === "LOGIN_SUCCESS" && e.actor.user)
            .forEach(e => {
                const user = e.actor.user!;
                if (!loginsByUser[user]) loginsByUser[user] = [];
                loginsByUser[user].push(e);
            });

        for (const [user, userEvents] of Object.entries(loginsByUser)) {
            // Sort by time
            const sorted = [...userEvents].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

            for (let i = 0; i < sorted.length - 1; i++) {
                const current = sorted[i];
                const next = sorted[i + 1];

                if (current.network.geo && next.network.geo && current.network.geo !== next.network.geo) {
                    const timeDiffHours = (next.timestamp.getTime() - current.timestamp.getTime()) / (1000 * 60 * 60);

                    // Simulated distance (in real app, use a geo library)
                    // For now, assume different location means at least 1000km
                    const distance = 1000;
                    const velocity = distance / timeDiffHours;

                    if (velocity > 900 && timeDiffHours > 0) { // faster than a commercial plane
                        detections.push({
                            detector: this.name,
                            matchedEvents: [current, next],
                            signals: ["impossible_travel", "geo_anomaly"],
                            confidence: 0.9,
                            mitreTactics: ["Initial Access", "Credential Access"],
                            mitreTechniques: ["T1078 - Valid Accounts"],
                            reasoning: [
                                `User ${user} logged in from ${current.network.geo} and then ${next.network.geo} within ${timeDiffHours.toFixed(2)} hours.`,
                                `Calculated velocity ${velocity.toFixed(0)} km/h exceeds physical limits.`,
                            ],
                        });
                    }
                }
            }
        }

        return detections;
    }
}
