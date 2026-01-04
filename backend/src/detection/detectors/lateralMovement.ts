import { Detector, Detection, UnifiedEvent } from '../../types';

/**
 * Lateral Movement Detector
 * Detects lateral movement via RDP, SMB, PsExec, WMI, etc.
 */
export class LateralMovementDetector implements Detector {
    name = 'LateralMovementDetector';
    description = 'Detects lateral movement via RDP, SMB, PsExec, WMI, etc.';

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];

        // Detect RDP lateral movement (T1021.001 - Remote Desktop Protocol)
        events.forEach(event => {
            if (event.source === 'network' && event.metadata?.service === 'RDP') {
                const sourceIp = event.network?.sourceIp;
                const destIp = event.network?.destIp;

                // Internal-to-internal RDP is suspicious
                if (sourceIp?.startsWith('10.') && destIp?.startsWith('10.')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['rdp_lateral_movement', 'remote_access'],
                        confidence: 0.75,
                        mitreTactics: ['Lateral Movement'],
                        mitreTechniques: ['T1021.001 - Remote Desktop Protocol'],
                        reasoning: [
                            `RDP connection from ${sourceIp} to ${destIp}`,
                            'Internal RDP usage may indicate lateral movement',
                            `User: ${event.actor?.user}`
                        ]
                    });
                }
            }
        });

        // Detect SMB/Admin Share access (T1021.002 - SMB/Windows Admin Shares)
        events.forEach(event => {
            if (event.source === 'network' && event.metadata?.share) {
                const share = event.metadata.share;
                const adminShares = ['C$', 'ADMIN$', 'IPC$'];

                if (adminShares.some(s => share.includes(s))) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['admin_share_access', 'smb_lateral_movement'],
                        confidence: 0.8,
                        mitreTactics: ['Lateral Movement'],
                        mitreTechniques: ['T1021.002 - SMB/Windows Admin Shares'],
                        reasoning: [
                            `Admin share access detected: ${share}`,
                            `From: ${event.network?.sourceIp} To: ${event.network?.destIp}`,
                            'Potential lateral movement via SMB'
                        ]
                    });
                }
            }
        });

        // Detect PsExec usage (T1021.002 + T1569.002)
        events.forEach(event => {
            if (event.source === 'endpoint' && event.actor?.process) {
                const process = event.actor.process.toLowerCase();

                if (process.includes('psexec') || process.includes('paexec')) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['psexec_execution', 'remote_execution'],
                        confidence: 0.9,
                        mitreTactics: ['Lateral Movement', 'Execution'],
                        mitreTechniques: ['T1021.002 - SMB/Windows Admin Shares', 'T1569.002 - Service Execution'],
                        reasoning: [
                            `PsExec detected: ${event.actor.process}`,
                            'Remote command execution tool',
                            'Commonly used for lateral movement'
                        ]
                    });
                }
            }
        });

        // Detect WMI lateral movement (T1047 - Windows Management Instrumentation)
        events.forEach(event => {
            if (event.source === 'endpoint' && event.actor?.process) {
                const process = event.actor.process.toLowerCase();

                if (process.includes('wmic') && (process.includes('/node:') || process.includes('process call create'))) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['wmi_lateral_movement', 'remote_wmi_execution'],
                        confidence: 0.85,
                        mitreTactics: ['Lateral Movement', 'Execution'],
                        mitreTechniques: ['T1047 - Windows Management Instrumentation'],
                        reasoning: [
                            `WMI remote execution: ${event.actor.process}`,
                            'WMI used for lateral movement',
                            `User: ${event.actor.user}`
                        ]
                    });
                }
            }
        });

        // Detect Pass-the-Hash (T1550.002)
        events.forEach(event => {
            if (event.source === 'auth' && event.metadata?.auth_method === 'NTLM' &&
                event.metadata?.anomaly === 'hash_authentication') {
                detections.push({
                    detector: this.name,
                    matchedEvents: [event],
                    signals: ['pass_the_hash', 'ntlm_relay'],
                    confidence: 0.9,
                    mitreTactics: ['Lateral Movement', 'Credential Access'],
                    mitreTechniques: ['T1550.002 - Pass the Hash'],
                    reasoning: [
                        'NTLM hash authentication detected',
                        `User: ${event.actor?.user}`,
                        `Source: ${event.network?.sourceIp}`,
                        'Possible Pass-the-Hash attack'
                    ]
                });
            }
        });

        return detections;
    }
}
