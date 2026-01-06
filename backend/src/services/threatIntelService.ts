import axios from 'axios';
import { prisma } from '../lib/db';

interface VirusTotalIPReport {
    data: {
        attributes: {
            last_analysis_stats: {
                malicious: number;
                suspicious: number;
                harmless: number;
                undetected: number;
            };
            country: string;
            as_owner: string;
            reputation: number;
        };
    };
}

interface AbuseIPDBReport {
    data: {
        abuseConfidenceScore: number;
        usageType: string;
        isp: string;
        domain: string;
        countryCode: string;
        isWhitelisted: boolean;
        totalReports: number;
    };
}

interface ThreatIntelResult {
    indicator: string;
    indicatorType: 'ip' | 'hash' | 'domain' | 'url';
    sources: {
        virustotal?: any;
        abuseipdb?: any;
        alienvault?: any;
    };
    summary: {
        isMalicious: boolean;
        threatLevel: 'high' | 'medium' | 'low' | 'clean';
        confidence: number;
        detectionRatio?: string;
    };
    checkedAt: Date;
    cached: boolean;
}

class ThreatIntelService {
    private virusTotalApiKey: string | undefined;
    private abuseIPDBApiKey: string | undefined;
    private alienVaultApiKey: string | undefined;
    private cacheExpiryHours = 24;

    constructor() {
        this.virusTotalApiKey = process.env.VIRUSTOTAL_API_KEY;
        this.abuseIPDBApiKey = process.env.ABUSEIPDB_API_KEY;
        this.alienVaultApiKey = process.env.ALIENVAULT_OTX_API_KEY;
    }

    /**
     * Check if we have cached results for this indicator
     */
    private async getCachedResult(indicator: string, indicatorType: string): Promise<ThreatIntelResult | null> {
        try {
            const cached = await prisma.threatIntelCache.findFirst({
                where: {
                    indicator,
                    indicatorType,
                    expiresAt: {
                        gte: new Date()
                    }
                }
            });

            if (cached) {
                console.log(`✓ Cache hit for ${indicatorType}: ${indicator}`);
                return {
                    ...JSON.parse(cached.results),
                    cached: true
                };
            }
        } catch (error) {
            console.error('Cache lookup error:', error);
        }
        return null;
    }

    /**
     * Store results in cache
     */
    private async cacheResult(indicator: string, indicatorType: string, results: ThreatIntelResult): Promise<void> {
        try {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + this.cacheExpiryHours);

            await prisma.threatIntelCache.upsert({
                where: {
                    indicator_indicatorType: {
                        indicator,
                        indicatorType
                    }
                },
                update: {
                    results: JSON.stringify(results),
                    checkedAt: new Date(),
                    expiresAt
                },
                create: {
                    indicator,
                    indicatorType,
                    results: JSON.stringify(results),
                    checkedAt: new Date(),
                    expiresAt
                }
            });
            console.log(`✓ Cached results for ${indicatorType}: ${indicator}`);
        } catch (error) {
            console.error('Cache storage error:', error);
        }
    }

    /**
     * Check IP reputation across multiple sources
     */
    async checkIP(ip: string): Promise<ThreatIntelResult> {
        // Check cache first
        const cached = await this.getCachedResult(ip, 'ip');
        if (cached) return cached;

        const sources: any = {};
        let isMalicious = false;
        let threatLevel: 'high' | 'medium' | 'low' | 'clean' = 'clean';
        let confidence = 0;

        // VirusTotal IP check
        if (this.virusTotalApiKey) {
            try {
                const response = await axios.get<VirusTotalIPReport>(
                    `https://www.virustotal.com/api/v3/ip_addresses/${ip}`,
                    {
                        headers: { 'x-apikey': this.virusTotalApiKey },
                        timeout: 10000
                    }
                );

                const stats = response.data.data.attributes.last_analysis_stats;
                const maliciousCount = stats.malicious + stats.suspicious;
                const totalCount = maliciousCount + stats.harmless + stats.undetected;

                sources.virustotal = {
                    malicious: stats.malicious,
                    suspicious: stats.suspicious,
                    harmless: stats.harmless,
                    undetected: stats.undetected,
                    detectionRatio: `${maliciousCount}/${totalCount}`,
                    country: response.data.data.attributes.country,
                    asOwner: response.data.data.attributes.as_owner,
                    reputation: response.data.data.attributes.reputation
                };

                if (maliciousCount > 0) {
                    isMalicious = true;
                    confidence = Math.max(confidence, (maliciousCount / totalCount) * 100);
                }
            } catch (error: any) {
                console.error('VirusTotal API error:', error.message);
                sources.virustotal = { error: error.message };
            }
        }

        // AbuseIPDB check
        if (this.abuseIPDBApiKey) {
            try {
                const response = await axios.get<AbuseIPDBReport>(
                    'https://api.abuseipdb.com/api/v2/check',
                    {
                        params: { ipAddress: ip, maxAgeInDays: 90 },
                        headers: { 'Key': this.abuseIPDBApiKey, 'Accept': 'application/json' },
                        timeout: 10000
                    }
                );

                const data = response.data.data;
                sources.abuseipdb = {
                    abuseConfidenceScore: data.abuseConfidenceScore,
                    usageType: data.usageType,
                    isp: data.isp,
                    domain: data.domain,
                    countryCode: data.countryCode,
                    isWhitelisted: data.isWhitelisted,
                    totalReports: data.totalReports
                };

                if (data.abuseConfidenceScore > 50) {
                    isMalicious = true;
                    confidence = Math.max(confidence, data.abuseConfidenceScore);
                }
            } catch (error: any) {
                console.error('AbuseIPDB API error:', error.message);
                sources.abuseipdb = { error: error.message };
            }
        }

        // Determine threat level
        if (confidence >= 75) {
            threatLevel = 'high';
        } else if (confidence >= 50) {
            threatLevel = 'medium';
        } else if (confidence >= 25) {
            threatLevel = 'low';
        }

        const result: ThreatIntelResult = {
            indicator: ip,
            indicatorType: 'ip',
            sources,
            summary: {
                isMalicious,
                threatLevel,
                confidence: Math.round(confidence),
                detectionRatio: sources.virustotal?.detectionRatio
            },
            checkedAt: new Date(),
            cached: false
        };

        // Cache the result
        await this.cacheResult(ip, 'ip', result);

        return result;
    }

    /**
     * Check file hash with VirusTotal
     */
    async checkHash(hash: string): Promise<ThreatIntelResult> {
        // Check cache first
        const cached = await this.getCachedResult(hash, 'hash');
        if (cached) return cached;

        const sources: any = {};
        let isMalicious = false;
        let threatLevel: 'high' | 'medium' | 'low' | 'clean' = 'clean';
        let confidence = 0;

        if (this.virusTotalApiKey) {
            try {
                const response = await axios.get(
                    `https://www.virustotal.com/api/v3/files/${hash}`,
                    {
                        headers: { 'x-apikey': this.virusTotalApiKey },
                        timeout: 10000
                    }
                );

                const stats = response.data.data.attributes.last_analysis_stats;
                const maliciousCount = stats.malicious;
                const totalCount = maliciousCount + stats.harmless + stats.undetected;

                sources.virustotal = {
                    malicious: stats.malicious,
                    suspicious: stats.suspicious,
                    harmless: stats.harmless,
                    undetected: stats.undetected,
                    detectionRatio: `${maliciousCount}/${totalCount}`,
                    fileType: response.data.data.attributes.type_description,
                    size: response.data.data.attributes.size,
                    names: response.data.data.attributes.names?.slice(0, 5)
                };

                if (maliciousCount > 0) {
                    isMalicious = true;
                    confidence = (maliciousCount / totalCount) * 100;
                }

                if (confidence >= 75) threatLevel = 'high';
                else if (confidence >= 50) threatLevel = 'medium';
                else if (confidence >= 25) threatLevel = 'low';

            } catch (error: any) {
                console.error('VirusTotal hash check error:', error.message);
                sources.virustotal = { error: error.message };
            }
        }

        const result: ThreatIntelResult = {
            indicator: hash,
            indicatorType: 'hash',
            sources,
            summary: {
                isMalicious,
                threatLevel,
                confidence: Math.round(confidence),
                detectionRatio: sources.virustotal?.detectionRatio
            },
            checkedAt: new Date(),
            cached: false
        };

        await this.cacheResult(hash, 'hash', result);
        return result;
    }

    /**
     * Check domain reputation
     */
    async checkDomain(domain: string): Promise<ThreatIntelResult> {
        const cached = await this.getCachedResult(domain, 'domain');
        if (cached) return cached;

        const sources: any = {};
        let isMalicious = false;
        let threatLevel: 'high' | 'medium' | 'low' | 'clean' = 'clean';
        let confidence = 0;

        if (this.virusTotalApiKey) {
            try {
                const response = await axios.get(
                    `https://www.virustotal.com/api/v3/domains/${domain}`,
                    {
                        headers: { 'x-apikey': this.virusTotalApiKey },
                        timeout: 10000
                    }
                );

                const stats = response.data.data.attributes.last_analysis_stats;
                const maliciousCount = stats.malicious + stats.suspicious;
                const totalCount = maliciousCount + stats.harmless + stats.undetected;

                sources.virustotal = {
                    malicious: stats.malicious,
                    suspicious: stats.suspicious,
                    harmless: stats.harmless,
                    undetected: stats.undetected,
                    detectionRatio: `${maliciousCount}/${totalCount}`,
                    categories: response.data.data.attributes.categories,
                    reputation: response.data.data.attributes.reputation
                };

                if (maliciousCount > 0) {
                    isMalicious = true;
                    confidence = (maliciousCount / totalCount) * 100;
                }

                if (confidence >= 75) threatLevel = 'high';
                else if (confidence >= 50) threatLevel = 'medium';
                else if (confidence >= 25) threatLevel = 'low';

            } catch (error: any) {
                console.error('VirusTotal domain check error:', error.message);
                sources.virustotal = { error: error.message };
            }
        }

        const result: ThreatIntelResult = {
            indicator: domain,
            indicatorType: 'domain',
            sources,
            summary: {
                isMalicious,
                threatLevel,
                confidence: Math.round(confidence),
                detectionRatio: sources.virustotal?.detectionRatio
            },
            checkedAt: new Date(),
            cached: false
        };

        await this.cacheResult(domain, 'domain', result);
        return result;
    }

    /**
     * Check URL safety
     */
    async checkURL(url: string): Promise<ThreatIntelResult> {
        const cached = await this.getCachedResult(url, 'url');
        if (cached) return cached;

        const sources: any = {};
        let isMalicious = false;
        let threatLevel: 'high' | 'medium' | 'low' | 'clean' = 'clean';
        let confidence = 0;

        if (this.virusTotalApiKey) {
            try {
                // First, get URL ID
                const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');

                const response = await axios.get(
                    `https://www.virustotal.com/api/v3/urls/${urlId}`,
                    {
                        headers: { 'x-apikey': this.virusTotalApiKey },
                        timeout: 10000
                    }
                );

                const stats = response.data.data.attributes.last_analysis_stats;
                const maliciousCount = stats.malicious + stats.suspicious;
                const totalCount = maliciousCount + stats.harmless + stats.undetected;

                sources.virustotal = {
                    malicious: stats.malicious,
                    suspicious: stats.suspicious,
                    harmless: stats.harmless,
                    undetected: stats.undetected,
                    detectionRatio: `${maliciousCount}/${totalCount}`,
                    categories: response.data.data.attributes.categories
                };

                if (maliciousCount > 0) {
                    isMalicious = true;
                    confidence = (maliciousCount / totalCount) * 100;
                }

                if (confidence >= 75) threatLevel = 'high';
                else if (confidence >= 50) threatLevel = 'medium';
                else if (confidence >= 25) threatLevel = 'low';

            } catch (error: any) {
                console.error('VirusTotal URL check error:', error.message);
                sources.virustotal = { error: error.message };
            }
        }

        const result: ThreatIntelResult = {
            indicator: url,
            indicatorType: 'url',
            sources,
            summary: {
                isMalicious,
                threatLevel,
                confidence: Math.round(confidence),
                detectionRatio: sources.virustotal?.detectionRatio
            },
            checkedAt: new Date(),
            cached: false
        };

        await this.cacheResult(url, 'url', result);
        return result;
    }

    /**
     * Extract indicators from alert events
     */
    extractIndicators(events: any[]): {
        ips: string[];
        hashes: string[];
        domains: string[];
        urls: string[];
    } {
        const ips = new Set<string>();
        const hashes = new Set<string>();
        const domains = new Set<string>();
        const urls = new Set<string>();

        const ipRegex = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
        const hashRegex = /\b[a-f0-9]{32,64}\b/gi;
        const domainRegex = /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}\b/gi;
        const urlRegex = /https?:\/\/[^\s]+/gi;

        events.forEach(event => {
            // Extract from sourceIp and destIp
            if (event.sourceIp) ips.add(event.sourceIp);
            if (event.destIp) ips.add(event.destIp);

            // Extract from metadata
            const metadataStr = typeof event.metadata === 'string'
                ? event.metadata
                : JSON.stringify(event.metadata);

            const foundIps = metadataStr.match(ipRegex);
            if (foundIps) foundIps.forEach(ip => ips.add(ip));

            const foundHashes = metadataStr.match(hashRegex);
            if (foundHashes) foundHashes.forEach(hash => hashes.add(hash.toLowerCase()));

            const foundDomains = metadataStr.match(domainRegex);
            if (foundDomains) foundDomains.forEach(domain => domains.add(domain.toLowerCase()));

            const foundUrls = metadataStr.match(urlRegex);
            if (foundUrls) foundUrls.forEach(url => urls.add(url));
        });

        // Filter out private IPs
        const publicIps = Array.from(ips).filter(ip => {
            const parts = ip.split('.').map(Number);
            return !(
                parts[0] === 10 ||
                (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
                (parts[0] === 192 && parts[1] === 168) ||
                parts[0] === 127
            );
        });

        return {
            ips: publicIps,
            hashes: Array.from(hashes),
            domains: Array.from(domains),
            urls: Array.from(urls)
        };
    }
}

export const threatIntelService = new ThreatIntelService();
export type { ThreatIntelResult };
