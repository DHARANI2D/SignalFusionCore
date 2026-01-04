import { Detector, Detection, UnifiedEvent } from '../../types';

/**
 * Impact Detector
 * Detects impact techniques like ransomware, data destruction, service disruption
 */
export class ImpactDetector implements Detector {
    name = 'ImpactDetector';
    description = 'Detects impact techniques like ransomware, data destruction, service disruption';

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];

        events.forEach(event => {
            if (event.source === 'endpoint') {
                const process = event.actor?.process?.toLowerCase() || '';
                const files_modified = event.metadata?.files_modified;

                // T1486 - Data Encrypted for Impact (Ransomware)
                if (process.includes('ransomware') || process.includes('encrypt') ||
                    (files_modified && files_modified > 1000)) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['ransomware', 'mass_encryption'],
                        confidence: 0.95,
                        mitreTactics: ['Impact'],
                        mitreTechniques: ['T1486 - Data Encrypted for Impact'],
                        reasoning: [
                            `Potential ransomware activity`,
                            files_modified ? `${files_modified} files modified` : `Process: ${event.actor?.process}`
                        ]
                    });
                }

                // T1485 - Data Destruction
                if (process.includes('del /f /s /q') || process.includes('rm -rf')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['data_destruction', 'mass_deletion'],
                        confidence: 0.85,
                        mitreTactics: ['Impact'],
                        mitreTechniques: ['T1485 - Data Destruction'],
                        reasoning: [`Mass file deletion: ${event.actor?.process}`]
                    });
                }

                // T1489 - Service Stop
                if (process.includes('net stop') || process.includes('sc stop')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['service_disruption'],
                        confidence: 0.75,
                        mitreTactics: ['Impact'],
                        mitreTechniques: ['T1489 - Service Stop'],
                        reasoning: [`Service stopped: ${event.actor?.process}`]
                    });
                }
            }
        });

        return detections;
    }
}
