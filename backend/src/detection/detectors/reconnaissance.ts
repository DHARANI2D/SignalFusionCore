import { Detector, Detection, UnifiedEvent } from '../../types';

/**
 * Reconnaissance Detector
 * Detects reconnaissance activities like port scanning, network enumeration, OSINT gathering
 */
export class ReconnaissanceDetector implements Detector {
    name = 'ReconnaissanceDetector';
    description = 'Detects reconnaissance activities like port scanning, network enumeration, OSINT gathering';

    run(events: UnifiedEvent[]): Detection[] {
        const detections: Detection[] = [];

        // Group events by source IP
        const eventsBySource = new Map<string, UnifiedEvent[]>();
        events.forEach(event => {
            const sourceIp = event.network?.sourceIp;
            if (sourceIp) {
                if (!eventsBySource.has(sourceIp)) {
                    eventsBySource.set(sourceIp, []);
                }
                eventsBySource.get(sourceIp)!.push(event);
            }
        });

        // Detect port scanning (T1595 - Active Scanning)
        eventsBySource.forEach((sourceEvents, sourceIp) => {
            const networkEvents = sourceEvents.filter(e => e.source === 'network');
            const uniquePorts = new Set(networkEvents.map(e => e.metadata?.port).filter(Boolean));

            if (uniquePorts.size >= 10) {
                detections.push({
                    detector: this.name,
                    matchedEvents: networkEvents.slice(0, 10),
                    signals: ['port_scanning', 'network_reconnaissance'],
                    confidence: 0.9,
                    mitreTactics: ['Reconnaissance'],
                    mitreTechniques: ['T1595 - Active Scanning'],
                    reasoning: [
                        `Source IP ${sourceIp} scanned ${uniquePorts.size} different ports`,
                        `Ports: ${Array.from(uniquePorts).slice(0, 10).join(', ')}`,
                        'Indicates reconnaissance activity'
                    ]
                });
            }
        });

        // Detect DNS enumeration (T1590 - Gather Victim Network Information)
        eventsBySource.forEach((sourceEvents, sourceIp) => {
            const dnsQueries = sourceEvents.filter(e =>
                e.source === 'network' && e.metadata?.type === 'DNS'
            );

            if (dnsQueries.length >= 50) {
                detections.push({
                    detector: this.name,
                    matchedEvents: dnsQueries.slice(0, 20),
                    signals: ['dns_enumeration', 'network_mapping'],
                    confidence: 0.85,
                    mitreTactics: ['Reconnaissance'],
                    mitreTechniques: ['T1590 - Gather Victim Network Information'],
                    reasoning: [
                        `Source IP ${sourceIp} performed ${dnsQueries.length} DNS queries`,
                        'High volume DNS queries indicate network enumeration',
                        'Possible subdomain discovery or zone transfer attempt'
                    ]
                });
            }
        });

        // Detect OSINT gathering (T1593 - Search Open Websites/Domains)
        events.forEach(event => {
            if (event.source === 'network' && event.metadata?.url) {
                const url = event.metadata.url.toLowerCase();
                const osintSites = ['linkedin.com', 'github.com', 'pastebin.com', 'shodan.io', 'censys.io'];

                if (osintSites.some(site => url.includes(site))) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['osint_gathering', 'information_collection'],
                        confidence: 0.6,
                        mitreTactics: ['Reconnaissance'],
                        mitreTechniques: ['T1593 - Search Open Websites/Domains'],
                        reasoning: [
                            `Access to OSINT platform: ${event.metadata.url}`,
                            'Potential information gathering on organization or employees'
                        ]
                    });
                }
            }
        });

        // Detect system information discovery (T1082 - System Information Discovery)
        events.forEach(event => {
            if (event.source === 'endpoint' && event.actor?.process) {
                const process = event.actor.process.toLowerCase();
                const infoCommands = ['systeminfo', 'ipconfig', 'hostname', 'uname -a', 'cat /etc/os-release'];

                if (infoCommands.some(cmd => process.includes(cmd))) {
                    detections.push({
                        detector: this.name,
                        matchedEvents: [event],
                        signals: ['system_enumeration', 'host_discovery'],
                        confidence: 0.7,
                        mitreTactics: ['Discovery', 'Reconnaissance'],
                        mitreTechniques: ['T1082 - System Information Discovery'],
                        reasoning: [
                            `System information command executed: ${event.actor.process}`,
                            `User: ${event.actor.user}`,
                            'Gathering host configuration details'
                        ]
                    });
                }
            }
        });

        return detections;
    }
}
