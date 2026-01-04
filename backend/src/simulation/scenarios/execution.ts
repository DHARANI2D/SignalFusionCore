import { SimulationScenario } from '../types';

/**
 * Execution Scenarios
 * MITRE Tactic: TA0002
 */

export const executionScenarios: SimulationScenario[] = [
    {
        id: 'exe-001',
        name: 'PowerShell Execution',
        description: 'Malicious PowerShell script execution',
        mitreTactics: ['Execution'],
        mitreTechniques: ['T1059.001 - PowerShell'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'user',
                    process: 'powershell.exe -ExecutionPolicy Bypass -File C:\\Temp\\malicious.ps1',
                    parent_process: 'explorer.exe',
                    hostname: 'workstation-09'
                }
            }
        ]
    },
    {
        id: 'exe-002',
        name: 'Scheduled Task Execution',
        description: 'Malware executes via scheduled task',
        mitreTactics: ['Execution', 'Persistence'],
        mitreTechniques: ['T1053 - Scheduled Task/Job'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'SYSTEM',
                    process: 'C:\\Windows\\Temp\\backdoor.exe',
                    parent_process: 'taskeng.exe',
                    hostname: 'server-05'
                }
            }
        ]
    },
    {
        id: 'exe-003',
        name: 'WMI Execution',
        description: 'Remote execution via Windows Management Instrumentation',
        mitreTactics: ['Execution'],
        mitreTechniques: ['T1047 - Windows Management Instrumentation'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'admin',
                    process: 'wmic.exe /node:10.0.2.100 process call create "cmd.exe /c malware.exe"',
                    parent_process: 'powershell.exe',
                    hostname: 'admin-workstation'
                }
            }
        ]
    },
    {
        id: 'exe-004',
        name: 'User Execution - Malicious File',
        description: 'User opens malicious attachment',
        mitreTactics: ['Execution'],
        mitreTechniques: ['T1204 - User Execution'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'employee',
                    process: 'Invoice_2024.exe',
                    parent_process: 'outlook.exe',
                    hostname: 'laptop-03'
                }
            }
        ]
    }
];
