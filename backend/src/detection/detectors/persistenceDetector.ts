import { Detector, Detection, UnifiedEvent } from '../../types';

/**
 * Persistence Detector
 * Detects persistence mechanisms like registry keys, scheduled tasks, services
 */
export class PersistenceDetector implements Detector {
    name = 'PersistenceDetector';
    description = 'Detects persistence mechanisms like registry keys, scheduled tasks, services';

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];

        events.forEach(event => {
            if (event.source === 'endpoint' && event.actor?.process) {
                const process = event.actor.process.toLowerCase();

                // T1547 - Boot or Logon Autostart Execution (Registry Run Keys)
                if (process.includes('reg add') && process.includes('\\currentversion\\run')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['registry_persistence', 'autostart_execution'],
                        confidence: 0.9,
                        mitreTactics: ['Persistence'],
                        mitreTechniques: ['T1547 - Boot or Logon Autostart Execution'],
                        reasoning: [`Registry run key modification: ${event.actor.process}`]
                    });
                }

                // T1053 - Scheduled Task/Job
                if (process.includes('schtasks /create') || process.includes('at ') || process.includes('crontab')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['scheduled_task_persistence'],
                        confidence: 0.85,
                        mitreTactics: ['Persistence', 'Execution'],
                        mitreTechniques: ['T1053 - Scheduled Task/Job'],
                        reasoning: [`Scheduled task creation: ${event.actor.process}`]
                    });
                }

                // T1543 - Create or Modify System Process (Service)
                if (process.includes('sc create') || process.includes('new-service')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['service_persistence'],
                        confidence: 0.9,
                        mitreTactics: ['Persistence'],
                        mitreTechniques: ['T1543 - Create or Modify System Process'],
                        reasoning: [`Service creation detected: ${event.actor.process}`]
                    });
                }
            }
        });

        return detections;
    }
}
