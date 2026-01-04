import { SimulationScenario } from '../types';

/**
 * Initial Access Scenarios
 * MITRE Tactic: TA0001
 */

export const initialAccessScenarios: SimulationScenario[] = [
    {
        id: 'ia-001',
        name: 'Phishing - Credential Harvesting',
        description: 'User clicks phishing link, credentials stolen, attacker logs in',
        mitreTactics: ['Initial Access', 'Credential Access'],
        mitreTechniques: ['T1566 - Phishing', 'T1078 - Valid Accounts'],
        severity: 'High',
        logs: [
            {
                source: 'network',
                data: {
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    source_ip: '192.168.1.50',
                    dest_ip: '185.220.101.45', // Suspicious external IP
                    type: 'HTTP',
                    port: 443,
                    url: 'hxxps://secure-login-verify[.]com/microsoft'
                }
            },
            {
                source: 'auth',
                data: {
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    user: 'john.doe',
                    source_ip: '185.220.101.45',
                    result: 'SUCCESS',
                    geo_location: 'Russia'
                },
                delayMs: 100
            }
        ]
    },
    {
        id: 'ia-002',
        name: 'Exploit Public-Facing Application',
        description: 'SQL injection on web application leading to shell access',
        mitreTactics: ['Initial Access', 'Execution'],
        mitreTechniques: ['T1190 - Exploit Public-Facing Application', 'T1059 - Command and Scripting Interpreter'],
        severity: 'High',
        logs: [
            {
                source: 'network',
                data: {
                    timestamp: new Date().toISOString(),
                    source_ip: '45.33.22.11',
                    dest_ip: '10.0.1.100',
                    type: 'HTTP',
                    port: 80,
                    url: '/login.php?id=1\' OR \'1\'=\'1',
                    payload: 'SQL_INJECTION'
                }
            },
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date(Date.now() + 5000).toISOString(),
                    user: 'www-data',
                    process: '/bin/bash -i',
                    parent_process: 'apache2',
                    hostname: 'web-server-01'
                },
                delayMs: 200
            }
        ]
    },
    {
        id: 'ia-003',
        name: 'Valid Accounts - Stolen Credentials',
        description: 'Attacker uses previously stolen credentials',
        mitreTactics: ['Initial Access', 'Persistence'],
        mitreTechniques: ['T1078 - Valid Accounts'],
        severity: 'Medium',
        logs: [
            {
                source: 'auth',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'admin',
                    source_ip: '103.22.11.55',
                    result: 'SUCCESS',
                    geo_location: 'China',
                    user_agent: 'curl/7.68.0'
                }
            }
        ]
    },
    {
        id: 'ia-004',
        name: 'Supply Chain Compromise',
        description: 'Malicious npm package installed, backdoor deployed',
        mitreTactics: ['Initial Access', 'Execution'],
        mitreTechniques: ['T1195 - Supply Chain Compromise', 'T1059 - Command and Scripting Interpreter'],
        severity: 'High',
        logs: [
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date().toISOString(),
                    user: 'developer',
                    process: 'npm install malicious-package',
                    parent_process: 'node',
                    hostname: 'dev-workstation-03'
                }
            },
            {
                source: 'network',
                data: {
                    timestamp: new Date(Date.now() + 10000).toISOString(),
                    source_ip: '10.0.2.50',
                    dest_ip: '185.220.101.99',
                    type: 'HTTPS',
                    port: 443,
                    url: 'hxxps://c2-server[.]evil/beacon'
                },
                delayMs: 300
            }
        ]
    },
    {
        id: 'ia-005',
        name: 'Drive-by Compromise',
        description: 'User visits compromised website, malware downloaded',
        mitreTactics: ['Initial Access', 'Execution'],
        mitreTechniques: ['T1189 - Drive-by Compromise', 'T1204 - User Execution'],
        severity: 'Medium',
        logs: [
            {
                source: 'network',
                data: {
                    timestamp: new Date().toISOString(),
                    source_ip: '192.168.1.75',
                    dest_ip: '93.184.216.34',
                    type: 'HTTP',
                    port: 80,
                    url: 'hxxp://compromised-news-site[.]com/exploit.js'
                }
            },
            {
                source: 'endpoint',
                data: {
                    timestamp: new Date(Date.now() + 5000).toISOString(),
                    user: 'sarah.jones',
                    process: 'powershell.exe -enc SGVsbG8gV29ybGQ=',
                    parent_process: 'chrome.exe',
                    hostname: 'laptop-win10-05'
                },
                delayMs: 200
            }
        ]
    }
];
