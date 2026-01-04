import { SimulationScenario } from '../types';

/**
 * Impact Scenarios
 * MITRE Tactic: TA0040
 */

export const impactScenarios: SimulationScenario[] = [
    {
        id: 'imp-001',
        name: 'Ransomware - Data Encrypted',
        description: 'Ransomware encrypts files and demands payment',
        mitreTactics: ['Impact'],
        mitreTechniques: ['T1486 - Data Encrypted for Impact'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'victim_user',
                    process: 'ransomware.exe',
                    parent_process: 'explorer.exe',
                    hostname: 'workstation-15',
                    files_modified: 5000
                }
            },
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date(Date.now() + 5000).toISOString(),
                    user: 'victim_user',
                    process: 'notepad.exe RANSOM_NOTE.txt',
                    parent_process: 'ransomware.exe',
                    hostname: 'workstation-15'
                },
                delayMs: 100
            }
        ]
    },
    {
        id: 'imp-002',
        name: 'Service Stop - Critical Services',
        description: 'Attacker stops critical security services',
        mitreTactics: ['Impact', 'Defense Evasion'],
        mitreTechniques: ['T1489 - Service Stop'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'admin',
                    process: 'net stop "Windows Defender" && net stop "MpsSvc"',
                    parent_process: 'cmd.exe',
                    hostname: 'server-03'
                }
            }
        ]
    },
    {
        id: 'imp-003',
        name: 'Website Defacement',
        description: 'Attacker modifies website content',
        mitreTactics: ['Impact'],
        mitreTechniques: ['T1491 - Defacement'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'www-data',
                    process: 'echo "HACKED" > /var/www/html/index.html',
                    parent_process: 'bash',
                    hostname: 'web-server-01'
                }
            }
        ]
    }
];
