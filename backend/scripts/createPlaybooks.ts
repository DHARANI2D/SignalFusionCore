import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSamplePlaybooks() {
    console.log('Creating sample playbooks...');

    // Playbook 1: Isolate Compromised Host
    const playbook1 = await prisma.playbook.create({
        data: {
            name: 'Isolate Compromised Host',
            description: 'Automatically isolate a compromised host from the network when malware or suspicious activity is detected',
            enabled: true,
            priority: 1,
            trigger: JSON.stringify({
                type: 'alert',
                conditions: {
                    severity: ['High', 'Critical'],
                    techniques: ['T1486', 'T1490', 'T1561'], // Ransomware techniques
                    minConfidence: 0.8
                }
            }),
            actions: JSON.stringify([
                {
                    type: 'isolate_host',
                    params: {
                        hostField: 'hostName',
                        method: 'firewall_block'
                    },
                    order: 1
                },
                {
                    type: 'notify_slack',
                    params: {
                        channel: '#security-alerts',
                        message: 'Host {{hostName}} has been isolated due to {{summary}}'
                    },
                    order: 2
                },
                {
                    type: 'create_ticket',
                    params: {
                        system: 'jira',
                        project: 'SEC',
                        priority: 'High',
                        summary: 'Investigate isolated host: {{hostName}}'
                    },
                    order: 3
                }
            ]),
            requiresApproval: false,
            createdBy: 'system',
            tags: JSON.stringify(['malware', 'ransomware', 'auto-response'])
        }
    });

    // Playbook 2: Block Malicious IP
    const playbook2 = await prisma.playbook.create({
        data: {
            name: 'Block Malicious IP',
            description: 'Block IP addresses identified as malicious by threat intelligence',
            enabled: true,
            priority: 2,
            trigger: JSON.stringify({
                type: 'alert',
                conditions: {
                    detector: ['ThreatIntelDetector'],
                    iocType: ['ip'],
                    minConfidence: 0.7
                }
            }),
            actions: JSON.stringify([
                {
                    type: 'block_ip',
                    params: {
                        ipField: 'sourceIp',
                        duration: '24h',
                        scope: 'global'
                    },
                    order: 1
                },
                {
                    type: 'notify_slack',
                    params: {
                        channel: '#threat-intel',
                        message: 'Blocked malicious IP: {{sourceIp}} - Threat Actor: {{threatActor}}'
                    },
                    order: 2
                }
            ]),
            requiresApproval: false,
            createdBy: 'system',
            tags: JSON.stringify(['threat-intel', 'network-defense'])
        }
    });

    // Playbook 3: Credential Theft Response
    const playbook3 = await prisma.playbook.create({
        data: {
            name: 'Credential Theft Response',
            description: 'Respond to detected credential theft attempts with account lockout and investigation',
            enabled: true,
            priority: 1,
            trigger: JSON.stringify({
                type: 'alert',
                conditions: {
                    techniques: ['T1003', 'T1110', 'T1558'], // Credential dumping, brute force, Kerberos
                    severity: ['High', 'Critical']
                }
            }),
            actions: JSON.stringify([
                {
                    type: 'disable_account',
                    params: {
                        userField: 'user',
                        reason: 'Suspected credential theft'
                    },
                    order: 1
                },
                {
                    type: 'force_password_reset',
                    params: {
                        userField: 'user'
                    },
                    order: 2
                },
                {
                    type: 'notify_slack',
                    params: {
                        channel: '#security-incidents',
                        message: '🚨 Credential theft detected for user {{user}}. Account disabled pending investigation.'
                    },
                    order: 3
                },
                {
                    type: 'create_ticket',
                    params: {
                        system: 'jira',
                        project: 'SEC',
                        priority: 'Critical',
                        summary: 'Credential theft investigation: {{user}}'
                    },
                    order: 4
                }
            ]),
            requiresApproval: true,
            createdBy: 'system',
            tags: JSON.stringify(['credentials', 'identity', 'requires-approval'])
        }
    });

    console.log('✅ Created 3 sample playbooks');
    console.log(`  - ${playbook1.name}`);
    console.log(`  - ${playbook2.name}`);
    console.log(`  - ${playbook3.name}`);

    return [playbook1, playbook2, playbook3];
}

createSamplePlaybooks()
    .then(() => {
        console.log('Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error:', error);
        process.exit(1);
    });
