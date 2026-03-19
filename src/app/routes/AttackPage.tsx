import { useState, useEffect } from "react";
import { aiBases } from "@/data/aiBases";
import { startNewAttackSession, resolveAttackHit } from "@/services/attackEngine";
import { computeReward, grantReward } from "@/services/rewardEngine";
import type { AttackSession, BuildingInstance } from "@/types/game";
import { usePhaserGame } from "@/game/bridge/usePhaserGame";
import { phaserEventBus } from "@/game/bridge/phaserEventBus";

import AttackHud from "@/components/attack/AttackHud";
import TargetInfoPanel from "@/components/attack/TargetInfoPanel";
import AttackSummaryPanel from "@/components/attack/AttackSummaryPanel";
import QuestionModal from "@/components/modals/QuestionModal";
import LoadingState from "@/components/common/LoadingState";
import FeedbackToast from "@/components/common/FeedbackToast";

export default function AttackPage() {
    const { isReady } = usePhaserGame("phaser-attack");
    const [session, setSession] = useState<AttackSession | null>(null);
    const [targetBuilding, setTargetBuilding] = useState<BuildingInstance | null>(null);
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [selectedAiBaseId, setSelectedAiBaseId] = useState<string>(aiBases[0].id);
    const [toastMsg, setToastMsg] = useState<{ text: string; type: "error" | "success" } | null>(null);

    // Bootstrap attack loop
    const startAttack = () => {
        const newSession = startNewAttackSession(selectedAiBaseId);
        setSession(newSession);

        // Let Phaser know to load the layout
        if (isReady) {
            const base = aiBases.find(b => b.id === selectedAiBaseId);
            if (base) phaserEventBus.emit("LOAD_AI_BASE", { aiBase: base });
        }
    };

    // Keep Phaser synchronized if it initializes after session creation
    useEffect(() => {
        if (isReady && session) {
            const base = aiBases.find(b => b.id === session.aiBaseId);
            if (base) phaserEventBus.emit("LOAD_AI_BASE", { aiBase: base });
        }
    }, [isReady, session]);

    // Handle clicks from Phaser
    useEffect(() => {
        const handleTargetSelected = (p: { buildingId: string }) => {
            if (!session) return;
            const base = aiBases.find(b => b.id === session.aiBaseId);
            const b = base?.layout.find(l => l.id === p.buildingId);
            if (!b) return;
            setTargetBuilding(b);

            // Check if already destroyed
            if (session.destroyedBuildingIds.includes(b.id)) {
                return; // cannot attack already destroyed
            }

            setSession({ ...session, selectedTargetId: b.id });
            setShowQuestionModal(true);
        };

        phaserEventBus.on("ATTACK_TARGET_SELECTED", handleTargetSelected as any);
        return () => phaserEventBus.off("ATTACK_TARGET_SELECTED", handleTargetSelected as any);
    }, [session]);

    const handleAttackResult = (isCorrect: boolean) => {
        if (!session || !targetBuilding) return;

        const hitState = resolveAttackHit(targetBuilding, isCorrect);

        // Merge into states
        let mergedStates = [...session.targetStates];
        const existIdx = mergedStates.findIndex(t => t.buildingId === targetBuilding.id);

        let finalDamage = hitState.damageDealt;
        let finalDestroyed = hitState.destroyed;

        if (existIdx >= 0) {
            finalDamage += mergedStates[existIdx].damageDealt;
            finalDestroyed = finalDamage >= targetBuilding.health;
            mergedStates[existIdx] = { buildingId: targetBuilding.id, damageDealt: finalDamage, destroyed: finalDestroyed };
        } else {
            mergedStates.push({ buildingId: targetBuilding.id, damageDealt: finalDamage, destroyed: finalDestroyed });
        }

        const destroyedBuildingIds = mergedStates.filter(t => t.destroyed).map(t => t.buildingId);

        const baseLayout = aiBases.find(b => b.id === session.aiBaseId)?.layout || [];
        const mainServerId = baseLayout.find(l => l.type === "main_server")?.id;
        const destroyedMainServer = mainServerId ? destroyedBuildingIds.includes(mainServerId) : false;

        const nextSession: AttackSession = {
            ...session,
            targetStates: mergedStates,
            destroyedBuildingIds,
            livesRemaining: isCorrect ? session.livesRemaining : Math.max(0, session.livesRemaining - 1),
            destructionPercent: (destroyedBuildingIds.length / Math.max(1, baseLayout.length)) * 100,
            destroyedMainServer
        };

        setSession(nextSession);
        setShowQuestionModal(false);

        if (isCorrect) {
            setToastMsg({ text: `Exploit Successful! Heavy damage dealt to ${targetBuilding.name}.`, type: "success" });
        } else {
            setToastMsg({ text: `Exploit Failed! Target counter-measures deployed. 1 Life lost.`, type: "error" });
        }

        // Tell phaser to update visuals
        phaserEventBus.emit("APPLY_ATTACK_DAMAGE", {
            buildingId: targetBuilding.id,
            damage: finalDamage,
            destroyed: finalDestroyed
        });
    };

    const handleRetreat = async () => {
        if (!session) return;

        if (!session.rewardClaimed && session.destructionPercent > 0) {
            try {
                const base = aiBases.find(b => b.id === session.aiBaseId);
                const breakdown = computeReward(
                    session.destructionPercent,
                    session.destroyedMainServer,
                    base?.rewardMultiplier || 1
                );

                await grantReward("user-demo", breakdown);
                setToastMsg({ text: `Retreat successful! Transferring ${breakdown.total} Crypto.`, type: "success" });

                setSession({ ...session, rewardClaimed: true });
                setTimeout(() => setSession(null), 2000);
            } catch (e) {
                setSession(null);
            }
        } else {
            setSession(null);
        }
    };

    if (!session) {
        return (
            <div className="animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col items-center justify-center">
                <div className="text-center max-w-2xl w-full">
                    <div className="text-6xl mb-6">⚔️</div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tight mb-4">Offensive Penetration</h1>
                    <p className="text-gray-400 mb-8 leading-relaxed max-w-lg mx-auto">
                        Engage hostile external networks. Successfully exploiting vulnerabilities yields Crypto rewards required for advanced base construction.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
                        {aiBases.map((base) => (
                            <button
                                key={base.id}
                                onClick={() => setSelectedAiBaseId(base.id)}
                                className={`p-4 rounded-xl border transition-all ${selectedAiBaseId === base.id ? "bg-red-900/40 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" : "bg-cyber-panel-light border-cyber-border hover:border-red-500/50"}`}
                            >
                                <div className="font-bold text-white mb-1">{base.name}</div>
                                <div className={`text-xs uppercase font-medium ${base.difficultyTier === 'hard' ? 'text-red-400' : base.difficultyTier === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {base.difficultyTier} Tier
                                </div>
                                <div className="text-xs text-gray-500 mt-3">{base.layout.length} Detectable Nodes</div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={startAttack}
                        className="px-8 py-4 bg-cyber-danger hover:bg-red-500 text-red-950 font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all uppercase tracking-wider block mx-auto"
                    >
                        Initialize Attack Vector
                    </button>
                </div>
            </div>
        );
    }

    const currentBase = aiBases.find(b => b.id === session.aiBaseId);

    const targetState = session.targetStates.find(t => t.buildingId === session.selectedTargetId);

    return (
        <div className="animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col relative">
            {toastMsg && <FeedbackToast message={toastMsg.text} type={toastMsg.type} />}
            <header className="mb-6 shrink-0 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight text-red-400">Active Incursion</h1>
                    <p className="text-gray-400 mt-1">Target: {currentBase?.name}</p>
                </div>
                <AttackHud lives={session.livesRemaining} maxLives={3} />
            </header>

            <div className="flex gap-6 flex-1 min-h-0">
                <div className="flex-1 bg-cyber-panel border border-red-900/50 rounded-xl shadow-[inset_0_0_100px_rgba(15,23,42,0.8)] relative overflow-hidden flex items-center justify-center">
                    <div id="phaser-attack" className="w-full h-full relative z-10" />
                    {!isReady && (
                        <div className="absolute inset-0 bg-cyber-bg/80 flex items-center justify-center z-20 backdrop-blur-sm">
                            <LoadingState message="Initializing Target Acquisition Link..." />
                        </div>
                    )}
                </div>

                <div className="w-80 flex flex-col gap-6 overflow-y-auto pr-2 pb-2">
                    <TargetInfoPanel
                        building={targetBuilding}
                        damageDealt={targetState?.damageDealt || 0}
                        isDestroyed={targetState?.destroyed || false}
                    />
                    <AttackSummaryPanel
                        session={session}
                        onRetreat={handleRetreat}
                    />
                </div>
            </div>

            {showQuestionModal && targetBuilding && (
                <QuestionModal
                    building={targetBuilding}
                    onClose={() => setShowQuestionModal(false)}
                    onCorrect={() => handleAttackResult(true)}
                />
            )}
        </div>
    );
}
