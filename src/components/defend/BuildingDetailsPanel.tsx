import SectionCard from "@/components/common/SectionCard";
import type { BuildingInstance } from "@/types/game";
import { getBuildingIcon } from "@/features/base/baseUtils";

export default function BuildingDetailsPanel({ building }: { building: BuildingInstance | null }) {
    if (!building) {
        return (
            <SectionCard title="System Details" className="h-full">
                <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-500">
                    Select a system on the left grid to view its details.
                </div>
            </SectionCard>
        );
    }

    const hpPercent = Math.max(0, Math.min(100, (building.health / building.maxHealth) * 100));
    const hpColor = hpPercent > 70 ? "bg-cyber-success" : hpPercent > 30 ? "bg-cyber-warning" : "bg-cyber-danger";

    return (
        <SectionCard title="System Details">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-cyber-border cursor-default">
                <div className="w-16 h-16 rounded-xl bg-cyber-panel-light flex items-center justify-center text-3xl shadow-inner border border-cyber-border-hl/20">
                    {getBuildingIcon(building.type)}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{building.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-cyber-accent/20 text-cyber-accent px-2 py-0.5 rounded uppercase tracking-wider font-semibold">
                            Level {building.level}
                        </span>
                        <span className="text-xs text-gray-400 capitalize">{building.type.replace("_", " ")}</span>
                        {building.isUpgrading && (
                            <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded uppercase tracking-wider font-semibold ml-2 border border-amber-500/30 animate-pulse">
                                Upgrading
                            </span>
                        )}
                        {building.level === 3 && !building.isUpgrading && (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded uppercase tracking-wider font-semibold ml-2 border border-blue-500/30">
                                Max Lvl
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-5">
                <div>
                    <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-400">System Integrity</span>
                        <span className="font-mono text-white">{building.health} / {building.maxHealth}</span>
                    </div>
                    <div className="h-2 w-full bg-cyber-panel-light rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full ${hpColor} transition-all duration-500`} style={{ width: `${hpPercent}%` }} />
                    </div>
                </div>

                <div>
                    <div className="text-sm text-gray-400 mb-2">Known Vulnerabilities</div>
                    <div className="flex flex-wrap gap-2">
                        {building.vulnerabilityProfile.weaknessThemes.map(theme => (
                            <span key={theme} className="text-xs px-2 py-1 rounded bg-red-950/40 text-red-300 border border-red-900/50">
                                {theme}
                            </span>
                        ))}
                        {building.vulnerabilityProfile.weaknessThemes.length === 0 && (
                            <span className="text-xs text-gray-500 italic">None logged</span>
                        )}
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}
