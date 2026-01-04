import { SourceAdapter } from "./base";
import { UnifiedEvent, SourceType } from "../../types";

export class EndpointAdapter extends SourceAdapter {
    source: SourceType = "endpoint";

    normalize(rawLog: any): Omit<UnifiedEvent, "id" | "ingestedAt"> {
        const timestamp = new Date(rawLog.timestamp || Date.now());
        const eventType = rawLog.event_type || "PROCESS_START";

        const event = this.createBaseEvent(timestamp, eventType, rawLog);

        event.actor = {
            user: rawLog.user || undefined,
            process: rawLog.process || rawLog.process_name || undefined,
        };

        event.metadata = {
            ...rawLog,
            hash: rawLog.hash || undefined,
            parentProcess: rawLog.parent_process || undefined,
        };

        if (rawLog.suspicious) {
            event.severityHint = "high";
            event.confidenceHint = 0.8;
        }

        return event;
    }
}
