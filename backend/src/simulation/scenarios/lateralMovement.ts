import { SimulationScenario } from '../types';

/**
 * Lateral Movement Scenarios
 * MITRE Tactic: TA0008
 */

export const lateralMovementScenarios: SimulationScenario[] = [
    {
        id: 'lm-001',
        name: 'RDP Lateral Movement',
        description: 'Attacker moves laterally using RDP',
        mitreTactics: ['Lateral Movement'],
        mitreTechniques: ['T1021.001 - Remote Desktop Protocol'],
        severity: 'High',
        logs: [
            {
                source: 'auth',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'admin',
                    source_ip: '10.0.1.50',
                    dest_ip: '10.0.2.100',
                    service: 'RDP',
                    result: 'SUCCESS'
                }
            }
        ]
    },
    {
        id: 'lm-002',
        name: 'SMB/Windows Admin Shares',
        description: 'Accessing remote systems via admin shares',
        mitreTactics: ['Lateral Movement'],
        mitreTechniques: ['T1021.002 - SMB/Windows Admin Shares'],
        severity: 'High',
        logs: [
            {
                source: 'network',
                data: {
                    timestamp: new Date().toISOString(),
                    source_ip: '10.0.1.50',
                    dest_ip: '10.0.2.100',
                    type: 'SMB',
                    port: 445,
                    share: '\\\\10.0.2.100\\C$'
                }
            }
        ]
    },
    {
        id: 'lm-003',
        name: 'Pass the Hash',
        description: 'Using stolen hash to authenticate',
        mitreTactics: ['Lateral Movement', 'Credential Access'],
        mitreTechniques: ['T1550.002 - Pass the Hash'],
        severity: 'High',
        logs: [
            {
                source: 'auth',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'administrator',
                    source_ip: '10.0.1.50',
                    auth_method: 'NTLM',
                    result: 'SUCCESS',
                    anomaly: 'hash_authentication'
                }
            }
        ]
    },
    {
        id: 'lm-004',
        name: 'PsExec Remote Execution',
        description: 'Using PsExec for lateral movement',
        mitreTactics: ['Lateral Movement', 'Execution'],
        mitreTechniques: ['T1021.002 - SMB/Windows Admin Shares', 'T1569.002 - Service Execution'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'admin',
                    process: 'psexec.exe \\\\10.0.2.100 -u admin -p password cmd.exe',
                    parent_process: 'cmd.exe',
                    hostname: 'workstation-01'
                }
            }
        ]
    }
];
