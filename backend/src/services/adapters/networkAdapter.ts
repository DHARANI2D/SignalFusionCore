import { SourceAdapter } from "./base";
import { UnifiedEvent, SourceType } from "../../types";

export class NetworkAdapter extends SourceAdapter {
    source: SourceType = "network";

    normalize(rawLog: any): Omit<UnifiedEvent, "id" | "ingestedAt"> {
        const timestamp = new Date(rawLog.timestamp || Date.now());
        const eventType = rawLog.event_type || "CONN_ESTABLISHED";

        const event = this.createBaseEvent(timestamp, eventType, rawLog);

        event.network = {
            sourceIp: rawLog.src_ip || undefined,
            destIp: rawLog.dst_ip || undefined,
        };

        event.metadata = {
            ...rawLog,
            port: rawLog.port || undefined,
            protocol: rawLog.protocol || undefined,
            bytesSent: rawLog.bytes_sent || 0,
        };

        return event;
    }
}
