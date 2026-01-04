import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ============================================================================
    // MITRE ATT&CK Framework
    // ============================================================================
    console.log('📊 Seeding MITRE ATT&CK Framework...');

    const tactics = [
        { tacticId: 'TA0043', name: 'Reconnaissance', order: 1, description: 'Gather information for planning future operations' },
        { tacticId: 'TA0042', name: 'Resource Development', order: 2, description: 'Establish resources to support operations' },
        { tacticId: 'TA0001', name: 'Initial Access', order: 3, description: 'Get into your network' },
        { tacticId: 'TA0002', name: 'Execution', order: 4, description: 'Run malicious code' },
        { tacticId: 'TA0003', name: 'Persistence', order: 5, description: 'Maintain foothold' },
        { tacticId: 'TA0004', name: 'Privilege Escalation', order: 6, description: 'Gain higher-level permissions' },
        { tacticId: 'TA0005', name: 'Defense Evasion', order: 7, description: 'Avoid being detected' },
        { tacticId: 'TA0006', name: 'Credential Access', order: 8, description: 'Steal account names and passwords' },
        { tacticId: 'TA0007', name: 'Discovery', order: 9, description: 'Figure out your environment' },
        { tacticId: 'TA0008', name: 'Lateral Movement', order: 10, description: 'Move through your environment' },
        { tacticId: 'TA0009', name: 'Collection', order: 11, description: 'Gather data of interest' },
        { tacticId: 'TA0011', name: 'Command and Control', order: 12, description: 'Communicate with compromised systems' },
        { tacticId: 'TA0010', name: 'Exfiltration', order: 13, description: 'Steal data' },
        { tacticId: 'TA0040', name: 'Impact', order: 14, description: 'Manipulate, interrupt, or destroy systems and data' },
    ];

    for (const tactic of tactics) {
        await prisma.mitreTactic.upsert({
            where: { tacticId: tactic.tacticId },
            update: tactic,
            create: tactic,
        });
    }

    // Sample techniques for each tactic
    const techniques = [
        // Initial Access
        { techniqueId: 'T1190', name: 'Exploit Public-Facing Application', tacticId: 'TA0001' },
        { techniqueId: 'T1566', name: 'Phishing', tacticId: 'TA0001' },
        { techniqueId: 'T1078', name: 'Valid Accounts', tacticId: 'TA0001' },
        { techniqueId: 'T1189', name: 'Drive-by Compromise', tacticId: 'TA0001' },
        { techniqueId: 'T1195', name: 'Supply Chain Compromise', tacticId: 'TA0001' },

        // Execution
        { techniqueId: 'T1059', name: 'Command and Scripting Interpreter', tacticId: 'TA0002' },
        { techniqueId: 'T1106', name: 'Native API', tacticId: 'TA0002' },
        { techniqueId: 'T1053', name: 'Scheduled Task/Job', tacticId: 'TA0002' },
        { techniqueId: 'T1204', name: 'User Execution', tacticId: 'TA0002' },

        // Persistence
        { techniqueId: 'T1547', name: 'Boot or Logon Autostart Execution', tacticId: 'TA0003' },
        { techniqueId: 'T1136', name: 'Create Account', tacticId: 'TA0003' },
        { techniqueId: 'T1543', name: 'Create or Modify System Process', tacticId: 'TA0003' },

        // Privilege Escalation
        { techniqueId: 'T1068', name: 'Exploitation for Privilege Escalation', tacticId: 'TA0004' },
        { techniqueId: 'T1055', name: 'Process Injection', tacticId: 'TA0004' },
        { techniqueId: 'T1134', name: 'Access Token Manipulation', tacticId: 'TA0004' },

        // Defense Evasion
        { techniqueId: 'T1562', name: 'Impair Defenses', tacticId: 'TA0005' },
        { techniqueId: 'T1070', name: 'Indicator Removal', tacticId: 'TA0005' },
        { techniqueId: 'T1027', name: 'Obfuscated Files or Information', tacticId: 'TA0005' },

        // Credential Access
        { techniqueId: 'T1003', name: 'OS Credential Dumping', tacticId: 'TA0006' },
        { techniqueId: 'T1110', name: 'Brute Force', tacticId: 'TA0006' },
        { techniqueId: 'T1056', name: 'Input Capture', tacticId: 'TA0006' },

        // Discovery
        { techniqueId: 'T1087', name: 'Account Discovery', tacticId: 'TA0007' },
        { techniqueId: 'T1082', name: 'System Information Discovery', tacticId: 'TA0007' },
        { techniqueId: 'T1046', name: 'Network Service Discovery', tacticId: 'TA0007' },

        // Lateral Movement
        { techniqueId: 'T1021', name: 'Remote Services', tacticId: 'TA0008' },
        { techniqueId: 'T1550', name: 'Use Alternate Authentication Material', tacticId: 'TA0008' },

        // Collection
        { techniqueId: 'T1005', name: 'Data from Local System', tacticId: 'TA0009' },
        { techniqueId: 'T1113', name: 'Screen Capture', tacticId: 'TA0009' },

        // Command and Control
        { techniqueId: 'T1071', name: 'Application Layer Protocol', tacticId: 'TA0011' },
        { techniqueId: 'T1573', name: 'Encrypted Channel', tacticId: 'TA0011' },

        // Exfiltration
        { techniqueId: 'T1048', name: 'Exfiltration Over Alternative Protocol', tacticId: 'TA0010' },
        { techniqueId: 'T1567', name: 'Exfiltration Over Web Service', tacticId: 'TA0010' },

        // Impact
        { techniqueId: 'T1486', name: 'Data Encrypted for Impact', tacticId: 'TA0040' },
        { techniqueId: 'T1485', name: 'Data Destruction', tacticId: 'TA0040' },
    ];

    for (const technique of techniques) {
        const tactic = await prisma.mitreTactic.findUnique({ where: { tacticId: technique.tacticId } });
        if (tactic) {
            await prisma.mitreTechnique.upsert({
                where: { techniqueId: technique.techniqueId },
                update: { name: technique.name, tacticId: tactic.id },
                create: { ...technique, tacticId: tactic.id },
            });
        }
    }

    console.log('✅ MITRE ATT&CK Framework seeded');

    // ============================================================================
    // Sample Attack Scenarios
    // ============================================================================
    console.log('🎯 Seeding Attack Scenarios...');

    const scenarios = [
        {
            scenarioId: 'phishing-001',
            name: 'Phishing - Credential Harvesting',
            description: 'Spearphishing email with malicious link to steal credentials',
            severity: 'high',
            category: 'phishing',
            tacticNames: JSON.stringify(['Initial Access', 'Credential Access']),
            techniqueNames: JSON.stringify(['T1566 - Phishing', 'T1056 - Input Capture']),
            tags: JSON.stringify(['email', 'credentials', 'social_engineering']),
            author: 'SignalFusion',
        },
        {
            scenarioId: 'malware-001',
            name: 'Ransomware Deployment',
            description: 'Ransomware encrypts files and demands payment',
            severity: 'critical',
            category: 'malware',
            tacticNames: JSON.stringify(['Impact']),
            techniqueNames: JSON.stringify(['T1486 - Data Encrypted for Impact']),
            tags: JSON.stringify(['ransomware', 'encryption', 'extortion']),
            author: 'SignalFusion',
        },
        {
            scenarioId: 'lateral-001',
            name: 'PsExec Lateral Movement',
            description: 'Attacker uses PsExec to move laterally across network',
            severity: 'high',
            category: 'lateral_movement',
            tacticNames: JSON.stringify(['Lateral Movement', 'Execution']),
            techniqueNames: JSON.stringify(['T1021 - Remote Services']),
            tags: JSON.stringify(['psexec', 'lateral_movement', 'smb']),
            author: 'SignalFusion',
        },
    ];

    for (const scenario of scenarios) {
        const created = await prisma.attackScenario.upsert({
            where: { scenarioId: scenario.scenarioId },
            update: scenario,
            create: scenario,
        });

        // Add log templates
        if (scenario.scenarioId === 'phishing-001') {
            await prisma.logTemplate.create({
                data: {
                    scenarioId: created.id,
                    source: 'network',
                    eventType: 'HTTP_REQUEST',
                    delay: 0,
                    order: 1,
                    template: JSON.stringify({
                        url: 'http://malicious-phishing-site.com/login',
                        method: 'GET',
                        user_agent: 'Mozilla/5.0'
                    }),
                },
            });
        }
    }

    console.log('✅ Attack Scenarios seeded');

    // ============================================================================
    // Threat Intelligence
    // ============================================================================
    console.log('🔍 Seeding Threat Intelligence...');

    const iocs = [
        {
            iocType: 'ip',
            iocValue: '185.220.101.45',
            threatActor: 'APT29',
            malwareFamily: 'Cobalt Strike',
            severity: 'high',
            confidence: 'high',
            source: 'crowdstrike',
            firstSeen: new Date('2024-01-01'),
            lastSeen: new Date(),
            active: true,
        },
        {
            iocType: 'domain',
            iocValue: 'malicious-c2-server.com',
            threatActor: 'Lazarus Group',
            campaignName: 'Operation Ghost',
            severity: 'critical',
            confidence: 'confirmed',
            source: 'virustotal',
            firstSeen: new Date('2024-01-15'),
            lastSeen: new Date(),
            active: true,
        },
        {
            iocType: 'hash',
            iocValue: 'a1b2c3d4e5f6789012345678901234567890',
            malwareFamily: 'Emotet',
            severity: 'high',
            confidence: 'high',
            source: 'custom',
            firstSeen: new Date('2024-02-01'),
            lastSeen: new Date(),
            active: true,
        },
    ];

    for (const ioc of iocs) {
        await prisma.threatIntelligence.upsert({
            where: { iocType_iocValue: { iocType: ioc.iocType, iocValue: ioc.iocValue } },
            update: ioc,
            create: ioc,
        });
    }

    console.log('✅ Threat Intelligence seeded');

    // ============================================================================
    // System Configuration
    // ============================================================================
    console.log('⚙️  Seeding System Configuration...');

    const configs = [
        {
            key: 'detection.enabled',
            value: 'true',
            category: 'detection',
            dataType: 'boolean',
            description: 'Enable/disable detection engine',
            isPublic: false,
        },
        {
            key: 'simulation.default_count',
            value: '10',
            category: 'simulation',
            dataType: 'number',
            description: 'Default number of scenarios to run',
            isPublic: true,
        },
        {
            key: 'ui.refresh_interval',
            value: '5000',
            category: 'ui',
            dataType: 'number',
            description: 'Dashboard refresh interval in milliseconds',
            isPublic: true,
        },
    ];

    for (const config of configs) {
        await prisma.systemConfig.upsert({
            where: { key: config.key },
            update: config,
            create: config,
        });
    }

    console.log('✅ System Configuration seeded');

    console.log('🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
