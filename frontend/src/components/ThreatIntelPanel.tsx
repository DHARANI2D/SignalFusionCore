"use client";

import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, ExternalLink, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface ThreatIntelResult {
    indicator: string;
    indicatorType: 'ip' | 'hash' | 'domain' | 'url';
    sources: {
        virustotal?: any;
        abuseipdb?: any;
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

interface ThreatIntelPanelProps {
    result: ThreatIntelResult;
    onClose?: () => void;
}

export function ThreatIntelPanel({ result, onClose }: ThreatIntelPanelProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']));

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(section)) {
            newExpanded.delete(section);
        } else {
            newExpanded.add(section);
        }
        setExpandedSections(newExpanded);
    };

    const getThreatLevelColor = (level: string) => {
        switch (level) {
            case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'low': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        }
    };

    const getThreatIcon = () => {
        if (result.summary.isMalicious) {
            return <AlertTriangle className="w-5 h-5 text-red-500" />;
        }
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    };

    return (
        <div className="glass-panel p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {getThreatIcon()}
                    <div>
                        <h3 className="text-lg font-semibold">Threat Intelligence Report</h3>
                        <p className="text-xs text-white/40 font-mono">{result.indicator}</p>
                    </div>
                </div>
                {result.cached && (
                    <span className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        CACHED
                    </span>
                )}
            </div>

            {/* Summary Section */}
            <div className="border border-white/10 rounded-lg overflow-hidden">
                <button
                    onClick={() => toggleSection('summary')}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                    <span className="text-sm font-bold uppercase tracking-wider">Summary</span>
                    {expandedSections.has('summary') ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>
                {expandedSections.has('summary') && (
                    <div className="p-4 border-t border-white/10 flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-white/60">Threat Level</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getThreatLevelColor(result.summary.threatLevel)}`}>
                                {result.summary.threatLevel}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-white/60">Confidence</span>
                            <span className="text-sm font-bold">{result.summary.confidence}%</span>
                        </div>
                        {result.summary.detectionRatio && (
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-white/60">Detection Ratio</span>
                                <span className="text-sm font-bold font-mono">{result.summary.detectionRatio}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-white/60">Status</span>
                            <span className={`text-sm font-bold ${result.summary.isMalicious ? 'text-red-500' : 'text-emerald-500'}`}>
                                {result.summary.isMalicious ? 'MALICIOUS' : 'CLEAN'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* VirusTotal Section */}
            {result.sources.virustotal && (
                <div className="border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('virustotal')}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-bold uppercase tracking-wider">VirusTotal</span>
                        </div>
                        {expandedSections.has('virustotal') ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                    {expandedSections.has('virustotal') && (
                        <div className="p-4 border-t border-white/10">
                            {result.sources.virustotal.error ? (
                                <p className="text-sm text-red-400">{result.sources.virustotal.error}</p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-white/40 uppercase">Malicious</span>
                                            <span className="text-lg font-bold text-red-500">{result.sources.virustotal.malicious || 0}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-white/40 uppercase">Suspicious</span>
                                            <span className="text-lg font-bold text-amber-500">{result.sources.virustotal.suspicious || 0}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-white/40 uppercase">Harmless</span>
                                            <span className="text-lg font-bold text-emerald-500">{result.sources.virustotal.harmless || 0}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-white/40 uppercase">Undetected</span>
                                            <span className="text-lg font-bold text-white/40">{result.sources.virustotal.undetected || 0}</span>
                                        </div>
                                    </div>
                                    {result.sources.virustotal.country && (
                                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                            <span className="text-xs text-white/60">Country</span>
                                            <span className="text-xs font-bold">{result.sources.virustotal.country}</span>
                                        </div>
                                    )}
                                    {result.sources.virustotal.asOwner && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-white/60">AS Owner</span>
                                            <span className="text-xs font-bold">{result.sources.virustotal.asOwner}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* AbuseIPDB Section */}
            {result.sources.abuseipdb && (
                <div className="border border-white/10 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('abuseipdb')}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span className="text-sm font-bold uppercase tracking-wider">AbuseIPDB</span>
                        </div>
                        {expandedSections.has('abuseipdb') ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                    {expandedSections.has('abuseipdb') && (
                        <div className="p-4 border-t border-white/10">
                            {result.sources.abuseipdb.error ? (
                                <p className="text-sm text-red-400">{result.sources.abuseipdb.error}</p>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-white/60">Abuse Confidence</span>
                                        <span className="text-lg font-bold text-red-500">{result.sources.abuseipdb.abuseConfidenceScore}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-white/60">Total Reports</span>
                                        <span className="text-sm font-bold">{result.sources.abuseipdb.totalReports}</span>
                                    </div>
                                    {result.sources.abuseipdb.isp && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-white/60">ISP</span>
                                            <span className="text-sm font-bold">{result.sources.abuseipdb.isp}</span>
                                        </div>
                                    )}
                                    {result.sources.abuseipdb.usageType && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-white/60">Usage Type</span>
                                            <span className="text-sm font-bold">{result.sources.abuseipdb.usageType}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* External Links */}
            <div className="flex gap-2 pt-2">
                <a
                    href={`https://www.virustotal.com/gui/${result.indicatorType}/${result.indicator}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg transition-colors border border-blue-500/20"
                >
                    <ExternalLink className="w-3 h-3" />
                    View on VirusTotal
                </a>
                {result.indicatorType === 'ip' && (
                    <a
                        href={`https://www.abuseipdb.com/check/${result.indicator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-bold rounded-lg transition-colors border border-purple-500/20"
                    >
                        <ExternalLink className="w-3 h-3" />
                        View on AbuseIPDB
                    </a>
                )}
            </div>
        </div>
    );
}
