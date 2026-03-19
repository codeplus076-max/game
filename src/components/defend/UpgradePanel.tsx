import SectionCard from "@/components/common/SectionCard";
import FeedbackToast from "@/components/common/FeedbackToast";
import type { BuildingInstance } from "@/types/game";
import { canUpgrade } from "@/services/upgradeEngine";
import { computeRemainingMs, tokenCostFromRemainingMs } from "@/services/timerEngine";
import { formatTimeRemaining } from "@/utils/dates";
import { useEffect, useState } from "react";

type Props = {
    building: BuildingInstance | null;
    onUpgradePrompt: () => void;
    onInstantFinish: () => Promise<{ success: boolean; message?: string }>;
};

export default function UpgradePanel({ building, onUpgradePrompt, onInstantFinish }: Props) {
    const [remainingMs, setRemainingMs] = useState(0);
    const [toastMsg, setToastMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);
    const [isFinishing, setIsFinishing] = useState(false);

    useEffect(() => {
        let id: any = null;
        if (building?.isUpgrading && building.upgradeEndsAt) {
            setRemainingMs(computeRemainingMs(building.upgradeEndsAt));
            id = setInterval(() => {
                const currentMs = computeRemainingMs(building.upgradeEndsAt!);
                setRemainingMs(currentMs);
                if (currentMs <= 0) {
                    clearInterval(id);
                    // Force refresh globally so base fetches new leveled up instances
                    window.dispatchEvent(new CustomEvent("gamedata:updated", { detail: { type: "base" } }));
                }
            }, 1000);
        } else {
            setRemainingMs(0);
        }
        return () => clearInterval(id);
    }, [building]);

    const handleFinish = async () => {
        setIsFinishing(true);
        setToastMsg(null);
        const res = await onInstantFinish();
        if (!res.success) {
            setToastMsg({ text: res.message === "insufficient_tokens" ? "Not enough Quiz Tokens." : "Instant finish failed.", type: "error" });
        } else {
            setToastMsg({ text: "Upgrade completed instantly!", type: "success" });
        }
        setIsFinishing(false);
    };

    if (!building) return null;

    const cost = tokenCostFromRemainingMs(remainingMs);
    const upgradable = canUpgrade(building);
    const maxLevel = building.level >= 3;

    return (
        <div className="flex flex-col gap-3">
            {toastMsg && <FeedbackToast message={toastMsg.text} type={toastMsg.type} />}

            <SectionCard title="Lifecycle Management">
                {building.isUpgrading ? (
                    <div className="space-y-4">
                        <div className="bg-cyber-panel-light p-4 rounded-lg border border-cyber-border-hl/40 text-center shadow-inner">
                            <div className="text-sm text-gray-400 mb-1 uppercase tracking-wider">Time Remaining</div>
                            <div className="text-2xl font-mono text-cyber-accent font-bold">
                                {formatTimeRemaining(remainingMs)}
                            </div>
                        </div>
                        <button
                            onClick={handleFinish}
                            disabled={isFinishing}
                            className="w-full py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/50 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50"
                        >
                            {isFinishing ? "Processing..." : `Instant Finish (${cost} Tokens)`}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <button
                            disabled={!upgradable || maxLevel}
                            onClick={onUpgradePrompt}
                            className={`w-full py-3 rounded-lg font-medium transition-all shadow-lg ${!maxLevel && upgradable
                                ? "bg-cyber-accent hover:bg-blue-400 text-slate-900 shadow-cyber-accent/20"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                                }`}
                        >
                            {maxLevel ? "Maximum Optimization Reached" : upgradable ? "Initiate Core Upgrade" : "Insufficient Resources"}
                        </button>
                        {!upgradable && !maxLevel && (
                            <div className="text-xs text-center text-red-500/80 font-medium tracking-wide">
                                Insufficient Crypto Capital to initiate upgrade.
                            </div>
                        )}
                        {maxLevel && (
                            <div className="text-xs text-center text-emerald-500/80 font-medium tracking-wide">
                                System is operating at maximum capacity.
                            </div>
                        )}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}
