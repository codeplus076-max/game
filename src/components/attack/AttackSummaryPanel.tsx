import SectionCard from "@/components/common/SectionCard";
import type { AttackSession } from "@/types/game";
import { rewardSummary } from "@/utils/formatters";

type Props = {
  session: AttackSession | null;
  onRetreat: () => void;
};

export default function AttackSummaryPanel({ session, onRetreat }: Props) {
  if (!session) return null;

  const totalDamage = session.targetStates.reduce((acc, t) => acc + t.damageDealt, 0);
  const percent = session.destructionPercent || 0;

  return (
    <SectionCard title="Mission Status">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-cyber-panel-light p-3 rounded border border-cyber-border">
            <div className="text-xs text-gray-400 uppercase">Destruction</div>
            <div className="font-mono text-xl font-bold text-red-400">{Math.round(percent)}%</div>
          </div>
          <div className="bg-cyber-panel-light p-3 rounded border border-cyber-border">
            <div className="text-xs text-gray-400 uppercase">Rewards Claimed</div>
            <div className={`font-mono text-xl font-bold ${session.rewardClaimed ? "text-emerald-400" : "text-gray-500"}`}>
              {session.rewardClaimed ? "YES" : "NO"}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-cyber-panel-light/50 p-3 rounded border border-cyber-border/50 text-sm">
          <span className="text-gray-400">Total Damage Output</span>
          <span className="font-mono font-medium text-white">{totalDamage} HP</span>
        </div>

        {session.destroyedMainServer && (
          <div className="text-center text-sm font-bold text-cyber-accent animate-pulse border border-cyber-accent/30 bg-cyber-accent/10 py-3 rounded">
            CRITICAL HIT: MAIN SERVER DESTROYED
          </div>
        )}

        <button
          onClick={onRetreat}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-md font-medium transition-colors border border-slate-600"
        >
          {session.livesRemaining === 0 ? "Return to Base" : "Tactical Retreat"}
        </button>
      </div>
    </SectionCard>
  );
}
