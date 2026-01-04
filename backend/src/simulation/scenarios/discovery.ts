import { SimulationScenario } from '../types';

/**
 * Discovery Scenarios  
 * MITRE Tactic: TA0007
 */

export const discoveryScenarios: SimulationScenario[] = [
    {
        id: 'dis-001',
        name: 'Account Discovery',
        description: 'Attacker enumerates user accounts',
        mitreTactics: ['Discovery'],
        mitreTechniques: ['T1087 - Account Discovery'],
        severity: 'Low',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'compromised_user',
                    process: 'net user /domain',
                    parent_process: 'cmd.exe',
                    hostname: 'workstation-08'
                }
            }
        ]
    },
    {
        id: 'dis-002',
        name: 'Network Service Scanning',
        description: 'Port scanning to discover services',
        mitreTactics: ['Discovery', 'Reconnaissance'],
        mitreTechniques: ['T1046 - Network Service Discovery'],
        severity: 'Medium',
        logs: [
            {
                source: 'network',
                data: {
                    timestamp: new Date().toISOString(),
                    source_ip: '10.0.1.50',
                    dest_ip: '10.0.1.0/24',
                    type: 'SCAN',
                    ports: '22,80,443,445,3389',
                    tool: 'nmap'
                }
            }
        ]
    },
    {
        id: 'dis-003',
        name: 'System Information Discovery',
        description: 'Gathering system details for reconnaissance',
        mitreTactics: ['Discovery'],
        mitreTechniques: ['T1082 - System Information Discovery'],
        severity: 'Low',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'attacker',
                    process: 'systeminfo && ipconfig /all',
                    parent_process: 'cmd.exe',
                    hostname: 'server-02'
                }
            }
        ]
    },
    {
        id: 'dis-004',
        name: 'Remote System Discovery',
        description: 'Discovering other systems on the network',
        mitreTactics: ['Discovery'],
        mitreTechniques: ['T1018 - Remote System Discovery'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'admin',
                    process: 'net view /domain',
                    parent_process: 'powershell.exe',
                    hostname: 'dc-01'
                }
            }
        ]
    }
];
