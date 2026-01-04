import { Detector, Detection, UnifiedEvent } from '../../types';

/**
 * Data Exfiltration Detector
 * Detects data exfiltration via various channels
 */
export class DataExfiltrationDetector implements Detector {
    name = 'DataExfiltrationDetector';
    description = 'Detects data exfiltration via various channels';

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];

        // Detect large data transfers (T1048 - Exfiltration Over Alternative Protocol)
        events.forEach(event => {
            if (event.source === 'network' && event.metadata?.bytes_transferred) {
                const bytes = event.metadata.bytes_transferred;
                const threshold = 100 * 1024 * 1024; // 100 MB

                if (bytes > threshold) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['large_data_transfer', 'potential_exfiltration'],
                        confidence: 0.7,
                        mitreTactics: ['Exfiltration'],
                        mitreTechniques: ['T1048 - Exfiltration Over Alternative Protocol'],
                        reasoning: [
                            `Large data transfer detected: ${(bytes / 1024 / 1024).toFixed(2)} MB`,
                            `From: ${event.network?.sourceIp} To: ${event.network?.destIp}`,
                            `Protocol: ${event.metadata.type}`,
                            'Potential data exfiltration'
                        ]
                    });
                }
            }
        });

        // Detect cloud exfiltration (T1567 - Exfiltration Over Web Service)
        events.forEach(event => {
            if (event.source === 'cloud' && event.metadata?.action) {
                const action = event.metadata.action;
                const exfilActions = ['S3_OBJECT_UPLOAD', 'BLOB_UPLOAD', 'DRIVE_UPLOAD'];

                if (exfilActions.includes(action) && event.metadata?.size) {
                    const size = parseInt(event.metadata.size);
                    if (size > 10 * 1024 * 1024) { // 10 MB
                        detections.push({
                            detector: this.name,
                            matchedEvents: [event],
                            signals: ['cloud_exfiltration', 'unauthorized_upload'],
                            confidence: 0.75,
                            mitreTactics: ['Exfiltration'],
                            mitreTechniques: ['T1567 - Exfiltration Over Web Service'],
                            reasoning: [
                                `Cloud upload detected: ${action}`,
                                `Resource: ${event.metadata.resource}`,
                                `Size: ${(size / 1024 / 1024).toFixed(2)} MB`,
                                `User: ${event.actor?.user}`
                            ]
                        });
                    }
                }
            }
        });

        // Detect DNS tunneling (T1048.003 - Exfiltration Over Unencrypted/Obfuscated Non-C2 Protocol)
        const dnsBySource = new Map<string, UnifiedEvent[]>();
        events.filter(e => e.source === 'network' && e.metadata?.type === 'DNS').forEach(event => {
            const sourceIp = event.network?.sourceIp;
            if (sourceIp) {
                if (!dnsBySource.has(sourceIp)) {
                    dnsBySource.set(sourceIp, []);
                }
                dnsBySource.get(sourceIp)!.push(event);
            }
        });

        dnsBySource.forEach((dnsEvents, sourceIp) => {
            // Check for unusually long DNS queries (potential tunneling)
            const longQueries = dnsEvents.filter(e =>
                e.metadata?.query && e.metadata.query.length > 50
            );

            if (longQueries.length >= 10) {
                detections.push({
                    detector: this.name,
                    matchedEvents: longQueries.slice(0, 10),
                    signals: ['dns_tunneling', 'covert_channel'],
                    confidence: 0.8,
                    mitreTactics: ['Exfiltration', 'Command and Control'],
                    mitreTechniques: ['T1048.003 - Exfiltration Over Unencrypted/Obfuscated Non-C2 Protocol'],
                    reasoning: [
                        `${longQueries.length} unusually long DNS queries from ${sourceIp}`,
                        'Pattern consistent with DNS tunneling',
                        'Possible covert data exfiltration channel'
                    ]
                });
            }
        });

        // Detect automated exfiltration (T1020 - Automated Exfiltration)
        events.forEach(event => {
            if (event.source === 'endpoint' && event.actor?.process && event.metadata?.parentProcess) {
                const process = event.actor.process.toLowerCase();
                const parent = (event.metadata.parentProcess as string).toLowerCase();

                // Scheduled task or cron running exfiltration script
                if ((parent.includes('taskeng') || parent.includes('cron')) &&
                    (process.includes('exfil') || process.includes('upload') || process.includes('ftp'))) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['automated_exfiltration', 'scheduled_upload'],
                        confidence: 0.85,
                        mitreTactics: ['Exfiltration'],
                        mitreTechniques: ['T1020 - Automated Exfiltration'],
                        reasoning: [
                            `Scheduled exfiltration script: ${event.actor.process}`,
                            `Parent: ${event.metadata.parentProcess}`,
                            'Automated data exfiltration detected'
                        ]
                    });
                }
            }
        });

        return detections;
    }
}
