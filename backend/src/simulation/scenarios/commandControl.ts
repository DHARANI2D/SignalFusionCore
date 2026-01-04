import { SimulationScenario } from '../types';

/**
 * Command and Control Scenarios
 * MITRE Tactic: TA0011
 */

export const commandControlScenarios: SimulationScenario[] = [
    {
        id: 'cc-001',
        name: 'Web Service C2',
        description: 'Malware communicates with C2 server via HTTPS',
        mitreTactics: ['Command and Control'],
        mitreTechniques: ['T1071 - Application Layer Protocol'],
        severity: 'High',
        logs: [
            {
                source: 'network',
                data: {
                    timestamp: new Date().toISOString(),
                    source_ip: '10.0.1.100',
                    dest_ip: '185.220.101.45',
                    type: 'HTTPS',
                    port: 443,
                    domain: 'c2-server.evil.com',
                    user_agent: 'Mozilla/5.0 (Malware/1.0)'
                }
            }
        ]
    },
    {
        id: 'cc-002',
        name: 'Encrypted Channel',
        description: 'C2 communication over encrypted channel',
        mitreTactics: ['Command and Control'],
        mitreTechniques: ['T1573 - Encrypted Channel'],
        severity: 'High',
        logs: [
            {
                source: 'network',
                data: {
                    timestamp: new Date().toISOString(),
                    source_ip: '10.0.2.50',
                    dest_ip: '93.184.216.34',
                    type: 'TLS',
                    port: 8443,
                    encryption: 'AES-256'
                }
            }
        ]
    },
    {
        id: 'cc-003',
        name: 'Non-Standard Port',
        description: 'C2 traffic on unusual port to evade detection',
        mitreTactics: ['Command and Control'],
        mitreTechniques: ['T1571 - Non-Standard Port'],
        severity: 'Medium',
        logs: [
            {
                source: 'network',
                data: {
                    timestamp: new Date().toISOString(),
                    source_ip: '10.0.1.75',
                    dest_ip: '45.33.22.11',
                    type: 'TCP',
                    port: 8888,
                    protocol: 'CUSTOM'
                }
            }
        ]
    }
];
