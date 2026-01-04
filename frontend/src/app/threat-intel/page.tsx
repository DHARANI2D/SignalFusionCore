"use client";

import { useState, useEffect } from "react";
import { Shield, Search, Plus, Trash2, TrendingUp } from "lucide-react";

export default function ThreatIntelPage() {
    const [stats, setStats] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [searchType, setSearchType] = useState("ip");
    const [searchResult, setSearchResult] = useState<any>(null);

    useEffect(() => {
        fetchStats();
        fetchMatches();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/threat-intel/stats");
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const fetchMatches = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/threat-intel/matches?limit=20");
            const data = await res.json();
            setMatches(data.matches || []);
        } catch (error) {
            console.error("Failed to fetch matches:", error);
        }
    };

    const handleSearch = async () => {
        if (!searchValue) return;

        try {
            const res = await fetch(`http://localhost:8001/api/threat-intel/ioc/${searchValue}?type=${searchType}`);
            const data = await res.json();
            setSearchResult(data);
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    const updateFeeds = async () => {
        try {
            const res = await fetch("http://localhost:8001/api/threat-intel/feeds/update", { method: "POST" });
            const data = await res.json();
            alert(data.message);
            fetchStats();
        } catch (error) {
            console.error("Feed update failed:", error);
        }
    };

    return (
        <div className="flex flex-col gap-8 flex-1 max-w-7xl mx-auto w-full">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Threat Intelligence</h1>
                    <p className="text-white/50 mt-1">IOC management and threat feed integration</p>
                </div>
                <button
                    onClick={updateFeeds}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
                >
                    <TrendingUp className="w-4 h-4" />
                    Update Feeds
                </button>
            </header>

            {/* Stats */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                    <div className="text-sm text-white/40 mb-2">Total IOCs</div>
                    <div className="text-3xl font-bold">{stats?.total || 0}</div>
                </div>
                <div className="glass-panel p-6 shadow-lg shadow-green-500/5">
                    <div className="text-sm text-white/40 mb-2">Active IOCs</div>
                    <div className="text-3xl font-bold text-green-400">{stats?.active || 0}</div>
                </div>
                <div className="glass-panel p-6 shadow-lg shadow-orange-500/5">
                    <div className="text-sm text-white/40 mb-2">Recent Matches</div>
                    <div className="text-3xl font-bold text-orange-400">{stats?.recentMatches || 0}</div>
                </div>
                <div className="glass-panel p-6 shadow-lg shadow-purple-500/5">
                    <div className="text-sm text-white/40 mb-2">IOC Types</div>
                    <div className="text-3xl font-bold">{stats?.byType?.length || 0}</div>
                </div>
            </section>

            {/* IOC Lookup */}
            <section className="glass-panel p-6 shadow-lg shadow-blue-500/5">
                <div className="flex items-center gap-2 mb-6">
                    <Search className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">IOC Lookup</h3>
                </div>

                <div className="flex gap-3 mb-4">
                    <select
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="bg-white/5 text-white rounded-lg px-3 py-2 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                    >
                        <option value="ip">IP Address</option>
                        <option value="domain">Domain</option>
                        <option value="hash">Hash</option>
                        <option value="url">URL</option>
                        <option value="email">Email</option>
                    </select>
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter IOC value..."
                        className="flex-1 bg-white/5 text-white rounded-lg px-3 py-2 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                    />
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all"
                    >
                        Search
                    </button>
                </div>

                {searchResult && (
                    <div className={`p-4 rounded-lg border ${searchResult.found
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-green-500/10 border-green-500/30'
                        }`}>
                        {searchResult.found ? (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield className="w-5 h-5 text-red-400" />
                                    <span className="font-bold text-red-400">Threat Detected</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="text-white/40 text-xs">IOC Value</div>
                                        <div className="font-mono">{searchResult.iocValue}</div>
                                    </div>
                                    <div>
                                        <div className="text-white/40 text-xs">Type</div>
                                        <div>{searchResult.iocType}</div>
                                    </div>
                                    {searchResult.threatActor && (
                                        <div>
                                            <div className="text-white/40 text-xs">Threat Actor</div>
                                            <div>{searchResult.threatActor}</div>
                                        </div>
                                    )}
                                    {searchResult.malwareFamily && (
                                        <div>
                                            <div className="text-white/40 text-xs">Malware Family</div>
                                            <div>{searchResult.malwareFamily}</div>
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-white/40 text-xs">Severity</div>
                                        <div className="capitalize">{searchResult.severity}</div>
                                    </div>
                                    <div>
                                        <div className="text-white/40 text-xs">Confidence</div>
                                        <div className="capitalize">{searchResult.confidence}</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-green-400" />
                                <span className="text-green-400">No threat intelligence found for this IOC</span>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/* Recent Matches */}
            <section className="glass-panel p-6 shadow-lg shadow-purple-500/5">
                <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">Recent IOC Matches</h3>
                </div>

                <div className="space-y-2">
                    {matches.length === 0 ? (
                        <div className="text-center text-white/30 text-sm py-8">
                            No IOC matches yet
                        </div>
                    ) : (
                        matches.map((match) => (
                            <div key={match.id} className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-mono text-sm">{match.iocValue}</span>
                                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                                {match.iocType}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${match.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                                                    match.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                                        'bg-yellow-500/20 text-yellow-300'
                                                }`}>
                                                {match.severity}
                                            </span>
                                        </div>
                                        <div className="text-xs text-white/40">
                                            Matched in {match.matchedField} • {new Date(match.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}
