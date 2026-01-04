import { UnifiedEvent, SourceType } from "../../types";

export abstract class SourceAdapter {
    abstract source: SourceType;

    /**
     * Normalizes a raw log entry into the UnifiedEvent schema.
     * @param rawLog The raw log entry from the source.
     */
    abstract normalize(rawLog: any): Omit<UnifiedEvent, "id" | "ingestedAt">;

    /**
     * Helper to ensure basic fields are present.
     */
    protected createBaseEvent(
        timestamp: Date,
        eventType: string,
        metadata: any
    ): Omit<UnifiedEvent, "id" | "ingestedAt"> {
        return {
            timestamp,
            source: this.source,
            eventType,
            actor: {},
            network: {},
            severityHint: "low",
            confidenceHint: 0.5,
            metadata: {
                ...metadata,
                _raw: metadata, // Explicitly preserve raw log
            },
        };
    }
}
