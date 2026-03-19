import SectionCard from "@/components/common/SectionCard";
import type { BuildingInstance } from "@/types/game";
import { getBuildingIcon } from "@/features/base/baseUtils";

type TargetInfoPanelProps = {
  building: BuildingInstance | null;
  damageDealt: number;
  isDestroyed: boolean;
};

export default function TargetInfoPanel({ building, damageDealt, isDestroyed }: TargetInfoPanelProps) {
  if (!building) {
    return (
      <SectionCard title="Target Lock">
        <div className="flex items-center justify-center p-6 text-gray-500 text-center h-[200px]">
          No target selected. <br /> Click a structure to engage.
        </div>
      </SectionCard>
    );
  }

  const damagePercent = Math.max(0, Math.min(100, (damageDealt / building.maxHealth) * 100));

  return (
    <SectionCard title="Target Lock" className={isDestroyed ? "opacity-60 grayscale" : ""}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-lg bg-cyber-panel-light flex items-center justify-center text-2xl shadow-inner border border-red-900/30">
          {getBuildingIcon(building.type)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight leading-tight">{building.name}</h2>
          <div className="text-xs text-red-400 uppercase tracking-wider font-semibold">
            {isDestroyed ? "Target Destroyed" : "Active Target"}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1 text-gray-400">
            <span>Damage Dealt</span>
            <span className="font-mono">{damageDealt} / {building.maxHealth} HP</span>
          </div>
          <div className="h-2 w-full bg-cyber-panel-light rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${damagePercent}%` }}
            />
          </div>
        </div>

        <div className="bg-red-950/20 border border-red-900/40 p-3 rounded text-sm text-red-200">
          <div className="font-semibold mb-1">Exploitable Vulnerabilities:</div>
          <div className="capitalize">
            {building.vulnerabilityProfile.weaknessThemes.length > 0
              ? building.vulnerabilityProfile.weaknessThemes.join(" & ")
              : "Unknown signature"}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
