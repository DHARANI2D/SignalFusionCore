import { SimulationScenario } from '../types';

/**
 * Collection Scenarios
 * MITRE Tactic: TA0009
 */

export const collectionScenarios: SimulationScenario[] = [
    {
        id: 'col-001',
        name: 'Data from Local System',
        description: 'Attacker collects sensitive files from local system',
        mitreTactics: ['Collection'],
        mitreTechniques: ['T1005 - Data from Local System'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'attacker',
                    process: 'xcopy C:\\Users\\*\\Documents\\*.docx C:\\Temp\\exfil\\ /s',
                    parent_process: 'cmd.exe',
                    hostname: 'workstation-16'
                }
            }
        ]
    },
    {
        id: 'col-002',
        name: 'Screen Capture',
        description: 'Malware captures screenshots',
        mitreTactics: ['Collection'],
        mitreTechniques: ['T1113 - Screen Capture'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'victim',
                    process: 'screenshot.exe',
                    parent_process: 'explorer.exe',
                    hostname: 'laptop-07'
                }
            }
        ]
    },
    {
        id: 'col-003',
        name: 'Clipboard Data',
        description: 'Malware monitors and steals clipboard data',
        mitreTactics: ['Collection'],
        mitreTechniques: ['T1115 - Clipboard Data'],
        severity: 'Low',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'user',
                    process: 'cliplogger.exe',
                    parent_process: 'explorer.exe',
                    hostname: 'workstation-17'
                }
            }
        ]
    }
];
