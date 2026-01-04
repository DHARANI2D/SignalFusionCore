import { SimulationScenario } from '../types';

/**
 * Privilege Escalation Scenarios
 * MITRE Tactic: TA0004
 */

export const privilegeEscalationScenarios: SimulationScenario[] = [
    {
        id: 'pe-001',
        name: 'Access Token Manipulation',
        description: 'Attacker manipulates access tokens for privilege escalation',
        mitreTactics: ['Privilege Escalation', 'Defense Evasion'],
        mitreTechniques: ['T1134 - Access Token Manipulation'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'low_priv_user',
                    process: 'token_manipulation.exe',
                    parent_process: 'cmd.exe',
                    hostname: 'workstation-18',
                    privilege_level: 'SYSTEM'
                }
            }
        ]
    },
    {
        id: 'pe-002',
        name: 'Bypass UAC',
        description: 'Bypassing User Account Control to gain elevated privileges',
        mitreTactics: ['Privilege Escalation', 'Defense Evasion'],
        mitreTechniques: ['T1548.002 - Bypass User Account Control'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'standard_user',
                    process: 'eventvwr.exe',
                    parent_process: 'malware.exe',
                    hostname: 'laptop-08',
                    integrity_level: 'High'
                }
            }
        ]
    },
    {
        id: 'pe-003',
        name: 'Exploitation for Privilege Escalation',
        description: 'Exploiting vulnerability to gain SYSTEM privileges',
        mitreTactics: ['Privilege Escalation'],
        mitreTechniques: ['T1068 - Exploitation for Privilege Escalation'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'user',
                    process: 'exploit.exe',
                    parent_process: 'cmd.exe',
                    hostname: 'server-07',
                    exploit: 'CVE-2021-1675'
                }
            }
        ]
    },
    {
        id: 'pe-004',
        name: 'Sudo Abuse',
        description: 'Abusing sudo privileges on Linux system',
        mitreTactics: ['Privilege Escalation'],
        mitreTechniques: ['T1548.003 - Sudo and Sudo Caching'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'lowpriv',
                    process: 'sudo /bin/bash',
                    parent_process: 'bash',
                    hostname: 'linux-server-03'
                }
            }
        ]
    }
];
