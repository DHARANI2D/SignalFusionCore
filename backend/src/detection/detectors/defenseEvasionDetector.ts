import { Detector, Detection, UnifiedEvent } from '../../types';

/**
 * Defense Evasion Detector
 * Detects defense evasion techniques like log clearing, security tool disabling
 */
export class DefenseEvasionDetector implements Detector {
    name = 'DefenseEvasionDetector';
    description = 'Detects defense evasion techniques like log clearing, security tool disabling';

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];

        events.forEach(event => {
            if (event.source === 'endpoint' && event.actor?.process) {
                const process = event.actor.process.toLowerCase();

                // T1070.001 - Clear Windows Event Logs
                if (process.includes('wevtutil') && process.includes('cl')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['log_clearing', 'anti_forensics'],
                        confidence: 0.95,
                        mitreTactics: ['Defense Evasion'],
                        mitreTechniques: ['T1070.001 - Clear Windows Event Logs'],
                        reasoning: [`Event log clearing detected: ${event.actor.process}`]
                    });
                }

                // T1562 - Impair Defenses (Disable Security Tools)
                if (process.includes('set-mppreference') && process.includes('disablerealtimemonitoring')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['disable_av', 'impair_defenses'],
                        confidence: 0.95,
                        mitreTactics: ['Defense Evasion'],
                        mitreTechniques: ['T1562 - Impair Defenses'],
                        reasoning: [`Antivirus disabled: ${event.actor.process}`]
                    });
                }

                // T1027 - Obfuscated Files or Information
                if (process.includes('-enc ') || process.includes('base64')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['obfuscation', 'encoded_command'],
                        confidence: 0.7,
                        mitreTactics: ['Defense Evasion'],
                        mitreTechniques: ['T1027 - Obfuscated Files or Information'],
                        reasoning: [`Obfuscated command: ${event.actor.process}`]
                    });
                }
            }
        });

        return detections;
    }
}
