import { SourceAdapter } from "./base";
import { UnifiedEvent, SourceType } from "../../types";

export class CloudAdapter extends SourceAdapter {
    source: SourceType = "cloud";

    normalize(rawLog: any): Omit<UnifiedEvent, "id" | "ingestedAt"> {
        const timestamp = new Date(rawLog.timestamp || Date.now());
        const eventType = rawLog.action || "CLOUD_ACTION";

        const event = this.createBaseEvent(timestamp, eventType, rawLog);

        event.actor = {
            user: rawLog.user || undefined,
            service: rawLog.resource || undefined,
        };

        event.metadata = {
            ...rawLog,
            status: rawLog.status || "SUCCESS",
        };

        if (rawLog.status === "DENIED") {
            event.severityHint = "medium";
        }

        return event;
    }
}
