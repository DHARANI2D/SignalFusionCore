"use client";

import { useState } from "react";
import { Shield, Hash, Globe, Link as LinkIcon, Loader2, Search } from "lucide-react";
import { ThreatIntelPanel } from "./ThreatIntelPanel";

interface ThreatIntelActionsProps {
    alertId: string;
    indicators?: {
        ips: string[];
        hashes: string[];
        domains: string[];
        urls: string[];
    };
}

export function ThreatIntelActions({ alertId, indicators }: ThreatIntelActionsProps) {
    const [loading, setLoading] = useState(false);
    const [activeCheck, setActiveCheck] = useState<string | null>(null);
    const [results, setResults] = useState<any[]>([]);
    const [extractedIndicators, setExtractedIndicators] = useState(indicators);

    const checkIndicator = async (type: 'ip' | 'hash' | 'domain' | 'url', value: string) => {
        setLoading(true);
        setActiveCheck(`${type}-${value}`);
        try {
            const response = await fetch(`http://localhost:8001/api/threat-intel/check-${type}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [type]: value })
            });

            if (!response.ok) {
                throw new Error(`Failed to check ${type}`);
            }

            const result = await response.json();
            setResults(prev => [...prev, result]);
        } catch (error) {
            console.error(`Error checking ${type}:`, error);
            alert(`Failed to check ${type}. Please try again.`);
        } finally {
            setLoading(false);
            setActiveCheck(null);
        }
    };

    const extractIndicators = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8001/api/threat-intel/extract-indicators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId })
            });

            if (!response.ok) {
                throw new Error('Failed to extract indicators');
            }

            const extracted = await response.json();
            setExtractedIndicators(extracted);
        } catch (error) {
            console.error('Error extracting indicators:', error);
            alert('Failed to extract indicators. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const hasIndicators = extractedIndicators && (
        extractedIndicators.ips.length > 0 ||
        extractedIndicators.hashes.length > 0 ||
        extractedIndicators.domains.length > 0 ||
        extractedIndicators.urls.length > 0
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="glass-panel p-6">
                <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-4">Threat Intelligence</h3>

                {!extractedIndicators && (
                    <button
                        onClick={extractIndicators}
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Extracting...
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4" />
                                Extract Indicators
                            </>
                        )}
                    </button>
                )}

                {extractedIndicators && !hasIndicators && (
                    <p className="text-sm text-white/40 italic text-center py-4">
                        No indicators found in this alert
                    </p>
                )}

                {extractedIndicators && hasIndicators && (
                    <div className="flex flex-col gap-3">
                        {/* IP Addresses */}
                        {extractedIndicators.ips.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-white/40 uppercase font-bold">IP Addresses ({extractedIndicators.ips.length})</span>
                                {extractedIndicators.ips.slice(0, 5).map(ip => (
                                    <button
                                        key={ip}
                                        onClick={() => checkIndicator('ip', ip)}
                                        disabled={loading}
                                        className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-mono rounded-lg transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-3 h-3 text-blue-400" />
                                            <span>{ip}</span>
                                        </div>
                                        {activeCheck === `ip-${ip}` ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <span className="text-[10px] text-white/40">Check</span>
                                        )}
                                    </button>
                                ))}
                                {extractedIndicators.ips.length > 5 && (
                                    <span className="text-[10px] text-white/30 italic">
                                        +{extractedIndicators.ips.length - 5} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* File Hashes */}
                        {extractedIndicators.hashes.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-white/40 uppercase font-bold">File Hashes ({extractedIndicators.hashes.length})</span>
                                {extractedIndicators.hashes.slice(0, 3).map(hash => (
                                    <button
                                        key={hash}
                                        onClick={() => checkIndicator('hash', hash)}
                                        disabled={loading}
                                        className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-mono rounded-lg transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Hash className="w-3 h-3 text-purple-400 shrink-0" />
                                            <span className="truncate">{hash.slice(0, 16)}...</span>
                                        </div>
                                        {activeCheck === `hash-${hash}` ? (
                                            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                                        ) : (
                                            <span className="text-[10px] text-white/40 shrink-0">Check</span>
                                        )}
                                    </button>
                                ))}
                                {extractedIndicators.hashes.length > 3 && (
                                    <span className="text-[10px] text-white/30 italic">
                                        +{extractedIndicators.hashes.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Domains */}
                        {extractedIndicators.domains.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-white/40 uppercase font-bold">Domains ({extractedIndicators.domains.length})</span>
                                {extractedIndicators.domains.slice(0, 5).map(domain => (
                                    <button
                                        key={domain}
                                        onClick={() => checkIndicator('domain', domain)}
                                        disabled={loading}
                                        className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-mono rounded-lg transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-3 h-3 text-emerald-400" />
                                            <span>{domain}</span>
                                        </div>
                                        {activeCheck === `domain-${domain}` ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <span className="text-[10px] text-white/40">Check</span>
                                        )}
                                    </button>
                                ))}
                                {extractedIndicators.domains.length > 5 && (
                                    <span className="text-[10px] text-white/30 italic">
                                        +{extractedIndicators.domains.length - 5} more
                                    </span>
                                )}
                            </div>
                        )}

                        {/* URLs */}
                        {extractedIndicators.urls.length > 0 && (
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] text-white/40 uppercase font-bold">URLs ({extractedIndicators.urls.length})</span>
                                {extractedIndicators.urls.slice(0, 3).map(url => (
                                    <button
                                        key={url}
                                        onClick={() => checkIndicator('url', url)}
                                        disabled={loading}
                                        className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-xs font-mono rounded-lg transition-colors flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <LinkIcon className="w-3 h-3 text-amber-400 shrink-0" />
                                            <span className="truncate">{url.slice(0, 30)}...</span>
                                        </div>
                                        {activeCheck === `url-${url}` ? (
                                            <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                                        ) : (
                                            <span className="text-[10px] text-white/40 shrink-0">Check</span>
                                        )}
                                    </button>
                                ))}
                                {extractedIndicators.urls.length > 3 && (
                                    <span className="text-[10px] text-white/30 italic">
                                        +{extractedIndicators.urls.length - 3} more
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Results */}
            {results.length > 0 && (
                <div className="flex flex-col gap-4">
                    {results.map((result, index) => (
                        <ThreatIntelPanel key={index} result={result} />
                    ))}
                </div>
            )}
        </div>
    );
}
