import { SimulationScenario } from '../types';

/**
 * Persistence Scenarios
 * MITRE Tactic: TA0003
 */

export const persistenceScenarios: SimulationScenario[] = [
    {
        id: 'per-001',
        name: 'Registry Run Keys',
        description: 'Malware adds registry run key for persistence',
        mitreTactics: ['Persistence'],
        mitreTechniques: ['T1547 - Boot or Logon Autostart Execution'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'SYSTEM',
                    process: 'reg.exe add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v Updater /t REG_SZ /d C:\\Users\\Public\\update.exe',
                    parent_process: 'cmd.exe',
                    hostname: 'workstation-07'
                }
            }
        ]
    },
    {
        id: 'per-002',
        name: 'Scheduled Task Creation',
        description: 'Attacker creates scheduled task for persistence',
        mitreTactics: ['Persistence', 'Execution'],
        mitreTechniques: ['T1053 - Scheduled Task/Job'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'admin',
                    process: 'schtasks /create /tn "WindowsUpdate" /tr "C:\\Temp\\backdoor.exe" /sc daily /st 09:00',
                    parent_process: 'powershell.exe',
                    hostname: 'server-dc-01'
                }
            }
        ]
    },
    {
        id: 'per-003',
        name: 'Account Manipulation - Add to Admin Group',
        description: 'Attacker adds compromised account to administrators',
        mitreTactics: ['Persistence', 'Privilege Escalation'],
        mitreTechniques: ['T1098 - Account Manipulation'],
        severity: 'High',
        logs: [
            {
                source: 'auth',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'administrator',
                    action: 'ADD_USER_TO_GROUP',
                    target_user: 'guest',
                    target_group: 'Administrators',
                    result: 'SUCCESS'
                }
            }
        ]
    },
    {
        id: 'per-004',
        name: 'Create New Account',
        description: 'Attacker creates hidden backdoor account',
        mitreTactics: ['Persistence'],
        mitreTechniques: ['T1136 - Create Account'],
        severity: 'High',
        logs: [
            {
                source: 'auth',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'administrator',
                    action: 'CREATE_USER',
                    target_user: 'support$',
                    result: 'SUCCESS'
                }
            },
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date(Date.now() + 5000).toISOString(),
                    user: 'administrator',
                    process: 'net user support$ P@ssw0rd123! /add /active:yes',
                    parent_process: 'cmd.exe',
                    hostname: 'dc-01'
                },
                delayMs: 100
            }
        ]
    },
    {
        id: 'per-005',
        name: 'SSH Authorized Keys',
        description: 'Attacker adds SSH key for persistent access',
        mitreTactics: ['Persistence'],
        mitreTechniques: ['T1098 - Account Manipulation'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'root',
                    process: 'echo "ssh-rsa AAAAB3..." >> /root/.ssh/authorized_keys',
                    parent_process: 'bash',
                    hostname: 'linux-server-02'
                }
            }
        ]
    }
];
