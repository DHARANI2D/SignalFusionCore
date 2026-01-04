import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
    color?: string;
}

export const StatsCard = ({ title, value, icon: Icon, trend, color = "text-blue-500" }: StatsCardProps) => {
    return (
        <div className="glass-panel p-6 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white/50">{title}</span>
                    <span className="text-3xl font-bold">{value}</span>
                </div>
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            {trend && (
                <div className="text-xs font-medium text-white/30">
                    {trend}
                </div>
            )}
        </div>
    );
};
