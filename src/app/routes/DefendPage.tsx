import { useEffect, useState } from "react";
import { usePhaserGame } from "@/game/bridge/usePhaserGame";
import { phaserEventBus } from "@/game/bridge/phaserEventBus";
import { generateAuditReport } from "@/services/auditEngine";
import { applyUpgrade, instantFinishUpgrade } from "@/services/upgradeEngine";
import { getPlayerBase } from "@/services/firebase/repositories/playerBasesRepository";

import type { BuildingInstance, AuditReport } from "@/types/game";
import QuestionModal from "@/components/modals/QuestionModal";
import AuditReportModal from "@/components/modals/AuditReportModal";
import BuildingDetailsPanel from "@/components/defend/BuildingDetailsPanel";
import UpgradePanel from "@/components/defend/UpgradePanel";
import SecurityAuditPanel from "@/components/defend/SecurityAuditPanel";
import LoadingState from "@/components/common/LoadingState";

export default function DefendPage() {
    const { isReady } = usePhaserGame("phaser-defend");
    const [baseLayout, setBaseLayout] = useState<BuildingInstance[]>([]);
    const [selectedBuilding, setSelectedBuilding] = useState<BuildingInstance | null>(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [latestReport, setLatestReport] = useState<AuditReport | null>(null);

    // Load layout for modal naming resolution
    useEffect(() => {
        getPlayerBase("user-demo").then(pb => setBaseLayout(pb.baseLayout));

        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("audit") === "run") {
                setTimeout(() => handleRunAudit(), 600);
                // Clean URL
                window.history.replaceState({}, '', '/defend');
            }
        }
    }, []);

    useEffect(() => {
        const handler = async (p: { buildingId: string }) => {
            // Re-fetch fresh base to ensure we have the absolute latest state (upgrades etc)
            const pb = await getPlayerBase("user-demo");
            const b = pb.baseLayout.find((bb) => bb.id === p.buildingId) ?? null;
            setBaseLayout(pb.baseLayout);
            setSelectedBuilding(b);
        };

        phaserEventBus.on("BUILDING_SELECTED", handler as any);
        return () => phaserEventBus.off("BUILDING_SELECTED", handler as any);
    }, []);

    const handleRunAudit = async () => {
        const pb = await getPlayerBase("user-demo");
        const report = generateAuditReport(pb);
        setLatestReport(report);
    };

    const handleInstantFinish = async () => {
        if (!selectedBuilding) return { success: false };
        const res = await instantFinishUpgrade("user-demo", selectedBuilding.id);
        if (res.success) {
            const pb = await getPlayerBase("user-demo");
            const b = pb.baseLayout.find(bb => bb.id === selectedBuilding.id) || null;
            setSelectedBuilding(b);
            setBaseLayout(pb.baseLayout);
        }
        return res;
    };

    const handleUpgradeCorrect = async () => {
        if (!selectedBuilding) return;
        const res = await applyUpgrade("user-demo", selectedBuilding.id);
        if (res.success) {
            const pb = await getPlayerBase("user-demo");
            const b = pb.baseLayout.find(bb => bb.id === selectedBuilding.id) || null;
            setSelectedBuilding(b);
            setBaseLayout(pb.baseLayout);
        }
        setShowUpgradeModal(false);
    };

    return (
        <div className="animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
            <header className="mb-6 shrink-0">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Defensive Perimeter</h1>
                <p className="text-gray-400 mt-1">Select grid components to manage structural integrity and upgrades.</p>
            </header>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Phaser Viewport */}
                <div className="flex-1 bg-cyber-panel border border-cyber-border rounded-xl shadow-inner relative overflow-hidden flex items-center justify-center">
                    <div id="phaser-defend" className="w-full h-full" />
                    {!isReady && (
                        <div className="absolute inset-0 bg-cyber-bg/80 flex items-center justify-center z-10 backdrop-blur-sm">
                            <LoadingState message="Initializing Simulation Environment..." />
                        </div>
                    )}
                </div>

                {/* Info Panels */}
                <div className="w-96 flex flex-col gap-6 overflow-y-auto pr-2 pb-2">
                    <SecurityAuditPanel onRunAudit={handleRunAudit} />
                    <BuildingDetailsPanel building={selectedBuilding} />
                    <UpgradePanel
                        building={selectedBuilding}
                        onUpgradePrompt={() => setShowUpgradeModal(true)}
                        onInstantFinish={handleInstantFinish}
                    />
                </div>
            </div>

            {showUpgradeModal && selectedBuilding && (
                <QuestionModal
                    building={selectedBuilding}
                    onClose={() => setShowUpgradeModal(false)}
                    onCorrect={handleUpgradeCorrect}
                />
            )}

            {latestReport && (
                <AuditReportModal
                    report={latestReport}
                    baseLayout={baseLayout}
                    onClose={() => setLatestReport(null)}
                />
            )}
        </div>
    );
}
