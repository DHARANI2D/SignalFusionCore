import { prisma } from "../lib/db";
import { UnifiedEvent } from "../types";
import { AuthAdapter } from "./adapters/authAdapter";
import { EndpointAdapter } from "./adapters/endpointAdapter";
import { NetworkAdapter } from "./adapters/networkAdapter";
import { CloudAdapter } from "./adapters/cloudAdapter";
import { SourceType } from "../types";

export class IngestionService {
    private adapters = {
        auth: new AuthAdapter(),
        endpoint: new EndpointAdapter(),
        network: new NetworkAdapter(),
        cloud: new CloudAdapter(),
    };

    async ingestRawLog(source: SourceType, rawLog: any) {
        const adapter = this.adapters[source];
        if (!adapter) throw new Error(`No adapter found for source: ${source}`);

        const normalized = adapter.normalize(rawLog);

        return await prisma.event.create({
            data: {
                timestamp: normalized.timestamp,
                source: normalized.source,
                eventType: normalized.eventType,
                user: normalized.actor.user,
                process: normalized.actor.process,
                service: normalized.actor.service,
                sourceIp: normalized.network.sourceIp,
                destIp: normalized.network.destIp,
                geo: normalized.network.geo,
                severityHint: normalized.severityHint,
                confidenceHint: normalized.confidenceHint,
                metadata: JSON.stringify(normalized.metadata),
            },
        });
    }

    async ingestBatch(source: SourceType, rawLogs: any[]) {
        const results = [];
        for (const log of rawLogs) {
            results.push(await this.ingestRawLog(source, log));
        }
        return results;
    }
}

export const ingestionService = new IngestionService();
