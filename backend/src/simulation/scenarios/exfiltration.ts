import { SimulationScenario } from '../types';

/**
 * Exfiltration Scenarios
 * MITRE Tactic: TA0010
 */

export const exfiltrationScenarios: SimulationScenario[] = [
    {
        id: 'exf-001',
        name: 'Exfiltration Over C2 Channel',
        description: 'Data exfiltrated through command and control channel',
        mitreTactics: ['Exfiltration', 'Command and Control'],
        mitreTechniques: ['T1041 - Exfiltration Over C2 Channel'],
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
                    bytes_transferred: 524288000, // 500 MB
                    duration_seconds: 300
                }
            }
        ]
    },
    {
        id: 'exf-002',
        name: 'Exfiltration to Cloud Storage',
        description: 'Sensitive data uploaded to external cloud service',
        mitreTactics: ['Exfiltration'],
        mitreTechniques: ['T1567 - Exfiltration Over Web Service'],
        severity: 'High',
        logs: [
            {
                source: 'cloud',
                data: {
                    timestamp: new Date().toISOString(),
                    action: 'S3_OBJECT_UPLOAD',
                    user: 'compromised_user',
                    resource: 'external-bucket-xyz',
                    status: 'SUCCESS',
                    metadata: { size: '2.5GB', files: 1500 }
                }
            }
        ]
    },
    {
        id: 'exf-003',
        name: 'Automated Exfiltration',
        description: 'Scheduled script exfiltrating data regularly',
        mitreTactics: ['Exfiltration', 'Collection'],
        mitreTechniques: ['T1020 - Automated Exfiltration'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'SYSTEM',
                    process: 'powershell.exe -File C:\\Scripts\\exfil.ps1',
                    parent_process: 'taskeng.exe',
                    hostname: 'file-server-01'
                }
            },
            {
                source: 'network',
                data: {
                    timestamp: new Date(Date.now() + 10000).toISOString(),
                    source_ip: '10.0.3.50',
                    dest_ip: '93.184.216.34',
                    type: 'FTP',
                    port: 21,
                    bytes_transferred: 104857600 // 100 MB
                },
                delayMs: 200
            }
        ]
    }
];
