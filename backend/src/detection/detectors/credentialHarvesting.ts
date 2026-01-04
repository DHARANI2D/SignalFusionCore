import { Detector, Detection, UnifiedEvent } from '../../types';

/**
 * Credential Harvesting Detector
 * Detects credential theft, dumping, brute force, and password attacks
 */
export class CredentialHarvestingDetector implements Detector {
    name = 'CredentialHarvestingDetector';
    description = 'Detects credential theft, dumping, brute force, and password attacks';

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];

        // Detect credential dumping tools (T1003 - OS Credential Dumping)
        events.forEach(event => {
            if (event.source === 'endpoint' && event.actor?.process) {
                const process = event.actor.process.toLowerCase();
                const dumpingTools = ['mimikatz', 'procdump', 'pwdump', 'gsecdump', 'wce.exe', 'lsass'];

                if (dumpingTools.some(tool => process.includes(tool))) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['credential_dumping', 'lsass_access', 'memory_scraping'],
                        confidence: 0.95,
                        mitreTactics: ['Credential Access'],
                        mitreTechniques: ['T1003 - OS Credential Dumping'],
                        reasoning: [
                            `Credential dumping tool detected: ${event.actor.process}`,
                            `User: ${event.actor.user}`,
                            `Host: ${event.metadata?.hostname}`,
                            'High confidence credential theft attempt'
                        ]
                    });
                }
            }
        });

        // Detect password spraying (T1110.003 - Password Spraying)
        const authEventsByUser = new Map<string, UnifiedEvent[]>();
        events.filter(e => e.source === 'auth').forEach(event => {
            const user = event.actor?.user;
            if (user) {
                if (!authEventsByUser.has(user)) {
                    authEventsByUser.set(user, []);
                }
                authEventsByUser.get(user)!.push(event);
            }
        });

        // Check for same source IP trying multiple accounts
        const authEventsByIp = new Map<string, UnifiedEvent[]>();
        events.filter(e => e.source === 'auth').forEach(event => {
            const ip = event.network?.sourceIp;
            if (ip) {
                if (!authEventsByIp.has(ip)) {
                    authEventsByIp.set(ip, []);
                }
                authEventsByIp.get(ip)!.push(event);
            }
        });

        authEventsByIp.forEach((ipEvents, sourceIp) => {
            const uniqueUsers = new Set(ipEvents.map(e => e.actor?.user).filter(Boolean));
            const failedAttempts = ipEvents.filter(e => e.metadata?.result === 'FAILED');

            if (uniqueUsers.size >= 5 && failedAttempts.length >= 5) {
                detections.push({
                    detector: this.name,
                    matchedEvents: ipEvents.slice(0, 10),
                    signals: ['password_spraying', 'credential_stuffing'],
                    confidence: 0.85,
                    mitreTactics: ['Credential Access'],
                    mitreTechniques: ['T1110.003 - Password Spraying'],
                    reasoning: [
                        `Source IP ${sourceIp} attempted login to ${uniqueUsers.size} different accounts`,
                        `${failedAttempts.length} failed attempts detected`,
                        'Pattern consistent with password spraying attack'
                    ]
                });
            }
        });

        // Detect keylogging (T1056 - Input Capture)
        events.forEach(event => {
            if (event.source === 'endpoint' && event.actor?.process) {
                const process = event.actor.process.toLowerCase();
                const keyloggers = ['keylogger', 'keylog', 'inputcapture', 'cliplogger'];

                if (keyloggers.some(kl => process.includes(kl))) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['keylogging', 'input_capture'],
                        confidence: 0.9,
                        mitreTactics: ['Credential Access', 'Collection'],
                        mitreTechniques: ['T1056 - Input Capture'],
                        reasoning: [
                            `Keylogger detected: ${event.actor.process}`,
                            'Capturing user keystrokes for credential theft'
                        ]
                    });
                }
            }
        });

        // Detect Kerberos attacks (T1558 - Steal or Forge Kerberos Tickets)
        events.forEach(event => {
            if (event.source === 'endpoint' && event.actor?.process) {
                const process = event.actor.process.toLowerCase();

                if (process.includes('rubeus') || process.includes('kerberoast') ||
                    process.includes('asreproast') || process.includes('golden ticket')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['kerberos_attack', 'ticket_theft'],
                        confidence: 0.95,
                        mitreTactics: ['Credential Access'],
                        mitreTechniques: ['T1558 - Steal or Forge Kerberos Tickets'],
                        reasoning: [
                            `Kerberos attack tool detected: ${event.actor.process}`,
                            'Attempting to steal or forge Kerberos tickets'
                        ]
                    });
                }
            }
        });

        return detections;
    }
}
