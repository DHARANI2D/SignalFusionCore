import { SimulationScenario } from '../types';

/**
 * Defense Evasion Scenarios
 * MITRE Tactic: TA0005
 */

export const defenseEvasionScenarios: SimulationScenario[] = [
    {
        id: 'de-001',
        name: 'Obfuscated Files',
        description: 'Malware uses obfuscation to evade detection',
        mitreTactics: ['Defense Evasion'],
        mitreTechniques: ['T1027 - Obfuscated Files or Information'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'user',
                    process: 'powershell.exe -enc SGVsbG8gV29ybGQ=',
                    parent_process: 'cmd.exe',
                    hostname: 'workstation-11'
                }
            }
        ]
    },
    {
        id: 'de-002',
        name: 'Process Injection',
        description: 'Malware injects code into legitimate process',
        mitreTactics: ['Defense Evasion', 'Privilege Escalation'],
        mitreTechniques: ['T1055 - Process Injection'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'SYSTEM',
                    process: 'svchost.exe',
                    parent_process: 'malware.exe',
                    hostname: 'server-06',
                    anomaly: 'unusual_parent_process'
                }
            }
        ]
    },
    {
        id: 'de-003',
        name: 'Disable Security Tools',
        description: 'Attacker disables antivirus and firewall',
        mitreTactics: ['Defense Evasion'],
        mitreTechniques: ['T1562 - Impair Defenses'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'admin',
                    process: 'Set-MpPreference -DisableRealtimeMonitoring $true',
                    parent_process: 'powershell.exe',
                    hostname: 'workstation-13'
                }
            }
        ]
    },
    {
        id: 'de-004',
        name: 'Masquerading',
        description: 'Malware disguised as legitimate Windows process',
        mitreTactics: ['Defense Evasion'],
        mitreTechniques: ['T1036 - Masquerading'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'SYSTEM',
                    process: 'svch0st.exe',
                    parent_process: 'explorer.exe',
                    hostname: 'workstation-14',
                    path: 'C:\\Temp\\svch0st.exe'
                }
            }
        ]
    },
    {
        id: 'de-005',
        name: 'Clear Event Logs',
        description: 'Attacker clears Windows event logs to hide tracks',
        mitreTactics: ['Defense Evasion'],
        mitreTechniques: ['T1070.001 - Clear Windows Event Logs'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'administrator',
                    process: 'wevtutil.exe cl Security',
                    parent_process: 'cmd.exe',
                    hostname: 'dc-01'
                }
            }
        ]
    }
];
