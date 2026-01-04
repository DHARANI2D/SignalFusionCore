import { SimulationScenario } from '../types';

/**
 * Credential Access Scenarios
 * MITRE Tactic: TA0006
 */

export const credentialAccessScenarios: SimulationScenario[] = [
    {
        id: 'ca-001',
        name: 'Credential Dumping - Mimikatz',
        description: 'Attacker dumps credentials from memory using Mimikatz',
        mitreTactics: ['Credential Access'],
        mitreTechniques: ['T1003 - OS Credential Dumping'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'admin',
                    process: 'mimikatz.exe privilege::debug sekurlsa::logonpasswords',
                    parent_process: 'powershell.exe',
                    hostname: 'workstation-12'
                }
            }
        ]
    },
    {
        id: 'ca-002',
        name: 'Brute Force Attack',
        description: 'Multiple failed login attempts followed by success',
        mitreTactics: ['Credential Access', 'Initial Access'],
        mitreTechniques: ['T1110 - Brute Force'],
        severity: 'High',
        logs: [
            ...Array.from({ length: 10 }, (_, i) => ({
                source: 'auth' as const,
                data: {
                    timestamp: new Date(Date.now() - (10 - i) * 5000).toISOString(),
                    user: 'admin',
                    source_ip: '45.33.22.11',
                    result: 'FAILED',
                    geo_location: 'Unknown'
                },
                delayMs: i * 50
            })),
            {
                source: 'auth' as const,
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'admin',
                    source_ip: '45.33.22.11',
                    result: 'SUCCESS',
                    geo_location: 'Unknown'
                },
                delayMs: 500
            }
        ]
    },
    {
        id: 'ca-003',
        name: 'Password Spraying',
        description: 'Common password tried against multiple accounts',
        mitreTactics: ['Credential Access'],
        mitreTechniques: ['T1110.003 - Password Spraying'],
        severity: 'Medium',
        logs: [
            ...['alice', 'bob', 'charlie', 'david', 'eve'].map((user, i) => ({
                source: 'auth' as const,
                data: {
                    timestamp: new Date(Date.now() + i * 10000).toISOString(),
                    user,
                    source_ip: '103.22.11.55',
                    result: i === 3 ? 'SUCCESS' : 'FAILED',
                    geo_location: 'China'
                },
                delayMs: i * 100
            }))
        ]
    },
    {
        id: 'ca-004',
        name: 'Keylogging',
        description: 'Keylogger captures credentials',
        mitreTactics: ['Credential Access', 'Collection'],
        mitreTechniques: ['T1056 - Input Capture'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'john.doe',
                    process: 'keylogger.exe',
                    parent_process: 'explorer.exe',
                    hostname: 'laptop-05'
                }
            },
            {
                source: 'network',
                data: {
                    timestamp: new Date(Date.now() + 60000).toISOString(),
                    source_ip: '192.168.1.105',
                    dest_ip: '185.220.101.45',
                    type: 'HTTPS',
                    port: 443,
                    payload: 'ENCRYPTED_KEYLOG_DATA'
                },
                delayMs: 200
            }
        ]
    },
    {
        id: 'ca-005',
        name: 'Credentials in Files',
        description: 'Attacker searches for credentials in config files',
        mitreTactics: ['Credential Access', 'Discovery'],
        mitreTechniques: ['T1552 - Unsecured Credentials'],
        severity: 'Medium',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'attacker',
                    process: 'findstr /si password *.txt *.xml *.config',
                    parent_process: 'cmd.exe',
                    hostname: 'file-server-01'
                }
            }
        ]
    }
];
