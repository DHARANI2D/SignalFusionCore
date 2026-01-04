"use client";

import { Shield, Activity, BarChart3, Settings, LayoutDashboard, Upload, Network, Zap, Eye } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Sidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Alert Feed", href: "/alerts", icon: Activity },
        { name: "Ingest", href: "/ingest", icon: Upload },
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
        { name: "Attack Graph", href: "/attack-graph", icon: Network },
        { name: "Threat Intel", href: "/threat-intel", icon: Eye },
        { name: "Playbooks", href: "/playbooks", icon: Zap },
    ];

    return (
        <aside className="w-64 border-r border-white/10 flex flex-col p-6 gap-8 bg-[#0a0a0c]/80 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-2 px-2">
                <Shield className="w-8 h-8 text-blue-500" />
                <span className="font-bold text-lg tracking-tight">SignalFusion<span className="text-blue-500">Core</span></span>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                isActive
                                    ? "bg-blue-500/10 text-blue-500"
                                    : "text-white/60 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="flex flex-col gap-2 border-t border-white/10 pt-6">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        pathname === "/settings"
                            ? "bg-blue-500/10 text-blue-500"
                            : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                </Link>
            </div>
        </aside>
    );
};
