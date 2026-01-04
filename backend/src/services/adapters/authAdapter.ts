import { SourceAdapter } from "./base";
import { UnifiedEvent, SourceType } from "../../types";

export class AuthAdapter extends SourceAdapter {
    source: SourceType = "auth";

    normalize(rawLog: any): Omit<UnifiedEvent, "id" | "ingestedAt"> {
        const timestamp = new Date(rawLog.timestamp || Date.now());
        const eventType = rawLog.result === "FAILED" ? "LOGIN_FAIL" : "LOGIN_SUCCESS";

        const event = this.createBaseEvent(timestamp, eventType, rawLog);

        event.actor = {
            user: rawLog.user || rawLog.username || "unknown",
        };

        event.network = {
            sourceIp: rawLog.source_ip || rawLog.ip || undefined,
            geo: rawLog.geo_location || undefined,
        };

        if (eventType === "LOGIN_FAIL") {
            event.severityHint = "medium";
        }

        return event;
    }
}
