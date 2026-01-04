import { getApiUrl } from "@/lib/api";
import { AlertFeed } from "@/components/AlertFeed";
import { Activity, Filter, Search, ArrowUpDown } from "lucide-react";
import { AutoRefresh } from "@/components/AutoRefresh";

export default async function AlertsPage() {
    return (
        <div className="flex flex-col gap-8 flex-1 max-w-7xl mx-auto w-full">
            <AutoRefresh intervalMs={1000} />
            <header className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Alert Feed</h1>
                        <p className="text-white/40 text-sm mt-1">Comprehensive view of all detected threat signals</p>
                    </div>
                </div>
            </header>

            <div className="flex flex-col gap-6">
                {/* Control Bar */}
                <div className="glass-panel p-4 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-4 items-center flex-1 min-w-[300px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                type="text"
                                placeholder="Search alerts, users, or detectors..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 glass-panel text-sm hover:bg-white/5 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 glass-panel text-sm hover:bg-white/5 transition-colors">
                            <ArrowUpDown className="w-4 h-4" />
                            <span>Sort: Newest</span>
                        </button>
                    </div>
                </div>

                {/* Main Feed */}
                <div className="flex flex-col gap-4">
                    <AlertFeed />
                </div>
            </div>
        </div>
    );
}
