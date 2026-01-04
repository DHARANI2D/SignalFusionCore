import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// IOC EXTRACTION
// ============================================================================

export interface ExtractedIOC {
    type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
    value: string;
    field: string;
}

const IP_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
const DOMAIN_REGEX = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\b/gi;
const MD5_REGEX = /\b[a-f0-9]{32}\b/gi;
const SHA1_REGEX = /\b[a-f0-9]{40}\b/gi;
const SHA256_REGEX = /\b[a-f0-9]{64}\b/gi;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

export function extractIOCs(event: any): ExtractedIOC[] {
    const iocs: ExtractedIOC[] = [];
    const seen = new Set<string>();

    // Helper to add unique IOCs
    const addIOC = (type: ExtractedIOC['type'], value: string, field: string) => {
        const key = `${type}:${value}`;
        if (!seen.has(key)) {
            seen.add(key);
            iocs.push({ type, value, field });
        }
    };

    // Extract IPs
    if (event.sourceIp) addIOC('ip', event.sourceIp, 'sourceIp');
    if (event.destIp) addIOC('ip', event.destIp, 'destIp');

    // Extract domains from metadata
    const metadata = typeof event.metadata === 'string' ? JSON.parse(event.metadata) : event.metadata;

    if (metadata.domain) addIOC('domain', metadata.domain, 'metadata.domain');
    if (metadata.url) {
        try {
            const url = new URL(metadata.url);
            addIOC('domain', url.hostname, 'metadata.url');
        } catch (e) { }
    }

    // Extract hashes
    if (metadata.fileHash || metadata.file_hash) {
        const hash = metadata.fileHash || metadata.file_hash;
        if (hash.length === 32) addIOC('hash', hash.toLowerCase(), 'metadata.fileHash');
        else if (hash.length === 40) addIOC('hash', hash.toLowerCase(), 'metadata.fileHash');
        else if (hash.length === 64) addIOC('hash', hash.toLowerCase(), 'metadata.fileHash');
    }

    // Extract from process command line
    if (event.process || metadata.command_line) {
        const text = event.process || metadata.command_line;

        // IPs in command line
        const ips = text.match(IP_REGEX);
        if (ips) ips.forEach((ip: string) => addIOC('ip', ip, 'process'));

        // Domains in command line
        const domains = text.match(DOMAIN_REGEX);
        if (domains) domains.forEach((domain: string) => addIOC('domain', domain.toLowerCase(), 'process'));
    }

    return iocs;
}

// ============================================================================
// THREAT INTELLIGENCE LOOKUP
// ============================================================================

export interface ThreatIntelResult {
    found: boolean;
    iocType: string;
    iocValue: string;
    threatActor?: string;
    malwareFamily?: string;
    severity: string;
    confidence: string;
    source?: string;
    tags?: string[];
}

export async function lookupIOC(iocValue: string, iocType: string): Promise<ThreatIntelResult | null> {
    try {
        const intel = await prisma.threatIntelligence.findFirst({
            where: {
                iocValue: iocValue,
                iocType: iocType,
                active: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            }
        });

        if (!intel) {
            return null;
        }

        return {
            found: true,
            iocType: intel.iocType,
            iocValue: intel.iocValue,
            threatActor: intel.threatActor || undefined,
            malwareFamily: intel.malwareFamily || undefined,
            severity: intel.severity,
            confidence: intel.confidence,
            source: intel.source || undefined,
            tags: intel.tags ? JSON.parse(intel.tags) : undefined
        };
    } catch (error) {
        console.error('Error looking up IOC:', error);
        return null;
    }
}

// ============================================================================
// EVENT ENRICHMENT
// ============================================================================

export interface EnrichmentResult {
    eventId: string;
    iocsFound: number;
    matches: Array<{
        iocType: string;
        iocValue: string;
        field: string;
        threatIntel?: ThreatIntelResult;
    }>;
    highestSeverity: string;
}

export async function enrichEvent(event: any): Promise<EnrichmentResult> {
    const iocs = extractIOCs(event);
    const matches: EnrichmentResult['matches'] = [];
    let highestSeverity = 'low';
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };

    for (const ioc of iocs) {
        const threatIntel = await lookupIOC(ioc.value, ioc.type);

        if (threatIntel) {
            matches.push({
                iocType: ioc.type,
                iocValue: ioc.value,
                field: ioc.field,
                threatIntel
            });

            // Track highest severity
            if (severityOrder[threatIntel.severity as keyof typeof severityOrder] > severityOrder[highestSeverity as keyof typeof severityOrder]) {
                highestSeverity = threatIntel.severity;
            }

            // Store IOC match
            await prisma.iOCMatch.create({
                data: {
                    eventId: event.id,
                    iocType: ioc.type,
                    iocValue: ioc.value,
                    matchedField: ioc.field,
                    threatIntelId: null, // Would link to ThreatIntelligence if we had the ID
                    threatActor: threatIntel.threatActor,
                    malwareFamily: threatIntel.malwareFamily,
                    severity: threatIntel.severity,
                    confidence: threatIntel.confidence
                }
            });
        }
    }

    return {
        eventId: event.id,
        iocsFound: matches.length,
        matches,
        highestSeverity
    };
}

// ============================================================================
// BATCH ENRICHMENT
// ============================================================================

export async function enrichEvents(events: any[]): Promise<EnrichmentResult[]> {
    const results: EnrichmentResult[] = [];

    for (const event of events) {
        const result = await enrichEvent(event);
        results.push(result);
    }

    return results;
}

// ============================================================================
// THREAT FEED INTEGRATION (Mock for now)
// ============================================================================

export async function updateThreatFeeds(): Promise<{ updated: number; added: number }> {
    // This would integrate with real threat feeds like:
    // - VirusTotal API
    // - AbuseIPDB
    // - AlienVault OTX
    // - MISP

    // For now, add some sample threat intelligence
    const sampleIOCs = [
        {
            iocType: 'ip',
            iocValue: '185.220.101.45',
            threatActor: 'APT29',
            malwareFamily: 'Cobalt Strike',
            severity: 'critical',
            confidence: 'high',
            source: 'CrowdStrike',
            firstSeen: new Date('2024-01-01'),
            lastSeen: new Date(),
            tags: JSON.stringify(['apt', 'c2', 'russia'])
        },
        {
            iocType: 'domain',
            iocValue: 'malicious-c2-server.com',
            threatActor: 'APT28',
            malwareFamily: 'X-Agent',
            severity: 'critical',
            confidence: 'confirmed',
            source: 'FireEye',
            firstSeen: new Date('2024-01-15'),
            lastSeen: new Date(),
            tags: JSON.stringify(['c2', 'apt', 'russia'])
        },
        {
            iocType: 'hash',
            iocValue: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            malwareFamily: 'Mimikatz',
            severity: 'high',
            confidence: 'confirmed',
            source: 'VirusTotal',
            firstSeen: new Date('2023-12-01'),
            lastSeen: new Date(),
            tags: JSON.stringify(['credential-theft', 'post-exploitation'])
        }
    ];

    let added = 0;
    let updated = 0;

    for (const ioc of sampleIOCs) {
        const existing = await prisma.threatIntelligence.findUnique({
            where: {
                iocType_iocValue: {
                    iocType: ioc.iocType,
                    iocValue: ioc.iocValue
                }
            }
        });

        if (existing) {
            await prisma.threatIntelligence.update({
                where: { id: existing.id },
                data: {
                    lastSeen: ioc.lastSeen,
                    updatedAt: new Date()
                }
            });
            updated++;
        } else {
            await prisma.threatIntelligence.create({
                data: ioc
            });
            added++;
        }
    }

    return { updated, added };
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getThreatIntelStats() {
    const [total, active, byType, bySeverity] = await Promise.all([
        prisma.threatIntelligence.count(),
        prisma.threatIntelligence.count({ where: { active: true } }),
        prisma.threatIntelligence.groupBy({
            by: ['iocType'],
            _count: true
        }),
        prisma.threatIntelligence.groupBy({
            by: ['severity'],
            _count: true,
            where: { active: true }
        })
    ]);

    const recentMatches = await prisma.iOCMatch.count({
        where: {
            createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
        }
    });

    return {
        total,
        active,
        byType: byType.map(t => ({ type: t.iocType, count: t._count })),
        bySeverity: bySeverity.map(s => ({ severity: s.severity, count: s._count })),
        recentMatches
    };
}
