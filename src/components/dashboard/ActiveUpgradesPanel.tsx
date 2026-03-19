import SectionCard from "@/components/common/SectionCard";
import EmptyState from "@/components/common/EmptyState";
import type { ActiveUpgrade, BuildingInstance } from "@/types/game";
import { formatTimeRemaining, msUntil } from "@/utils/dates";
import { useEffect, useState } from "react";

export default function ActiveUpgradesPanel({ upgrades, layout }: { upgrades: ActiveUpgrade[], layout: BuildingInstance[] }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (upgrades.length === 0) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [upgrades]);

  return (
    <SectionCard title="Active Upgrades">
      {upgrades.length === 0 ? (
        <EmptyState title="No active upgrades" description="Your systems are idle." />
      ) : (
        <div className="flex flex-col gap-3">
          {upgrades.map((u) => {
            const remaining = msUntil(u.endsAt);
            const isDone = remaining <= 0;
            return (
              <div key={u.buildingId} className="bg-cyber-panel-light p-3 rounded-md border border-cyber-border-hl/30 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-white">Upgrading System</div>
                  <div className="text-xs text-gray-400">{layout.find(b => b.id === u.buildingId)?.name || u.buildingId}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${isDone ? "text-cyber-success" : "text-cyber-accent"}`}>
                    {isDone ? "Completing..." : formatTimeRemaining(remaining)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
