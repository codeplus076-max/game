import { useRouter } from "next/navigation";
import { useGameData } from "@/hooks/useGameData";
import { getLatestAuditSummary } from "@/features/base/baseUtils";
import { getLatestAttackLog } from "@/services/firebase/repositories/attackLogsRepository";
import { useEffect, useState, useMemo } from "react";
import type { AttackLogEntry } from "@/services/firebase/repositories/attackLogsRepository";
import { generateAuditReport } from "@/services/auditEngine";

import BaseSummaryCard from "@/components/dashboard/BaseSummaryCard";
import ActiveUpgradesPanel from "@/components/dashboard/ActiveUpgradesPanel";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import QuickActionsPanel from "@/components/dashboard/QuickActionsPanel";
import SectionCard from "@/components/common/SectionCard";

export default function HomePage() {
    const router = useRouter();
    const { user, base: playerBase, isLoading } = useGameData("user-demo");
    const [latestAttack, setLatestAttack] = useState<AttackLogEntry | null>(null);

    useEffect(() => {
        getLatestAttackLog("user-demo").then(setLatestAttack);
    }, []);

    if (isLoading || !user || !playerBase) return null; // AppLayout handles loading

    // Use memoized dynamic report to ensure dashboard is never blank
    const fakeAudit = useMemo(() => generateAuditReport(playerBase), [playerBase]);

    // Build some quick system notifications
    const notifications = useMemo(() => {
        const notes = [];
        if (playerBase.activeUpgrades.length > 0) {
            notes.push(`${playerBase.activeUpgrades.length} system upgrade(s) concurrently running.`);
        }
        if (fakeAudit.findings.length > 3) {
            notes.push("CRITICAL: Multiple security vulnerabilities detected in base layout.");
        }
        if (playerBase.defenseScore < 50) {
            notes.push("Defense posture is severely compromised. Upgrade critical infrastructure.");
        }
        if (notes.length === 0) {
            notes.push("Network traffic stable. No anomalies detected.");
        }
        return notes;
    }, [playerBase, fakeAudit]);

    const directive = useMemo(() => {
        if (playerBase.defenseScore < 50 || fakeAudit.findings.length > 3) {
            return { title: "CRITICAL: Fortify Defenses", text: "Your cluster is highly vulnerable. Run a security audit and deploy patches immediately.", color: "text-red-400 border-red-500/30 bg-red-900/20" };
        } else if (user.quizTokens < 10) {
            return { title: "RESOURCE LOW: Training Required", text: "Quiz Token reserves are depleted. Complete training modules to sustain instant upgrade capabilities.", color: "text-amber-400 border-amber-500/30 bg-amber-900/20" };
        }
        return { title: "Ready for Offensive Operations", text: "All systems nominal. Target external network vulnerabilities to extract Crypto Capital.", color: "text-emerald-400 border-emerald-500/30 bg-emerald-900/20" };
    }, [playerBase, fakeAudit, user]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">Main Dashboard</h1>
                <p className="text-gray-400 mt-1">Overview of your system integrity and ongoing operations.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <BaseSummaryCard
                        crypto={user.cryptoCurrency}
                        tokens={user.quizTokens}
                        defenseScore={playerBase.defenseScore}
                        latestAudit={fakeAudit}
                    />

                    <SectionCard title="Recommended Directive" className="border-cyber-accent/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                        <div className={`p-4 rounded border ${directive.color} flex items-start gap-3`}>
                            <div className="mt-0.5 text-xl">ℹ️</div>
                            <div>
                                <h3 className="font-bold mb-1 uppercase tracking-wide">{directive.title}</h3>
                                <p className="text-sm opacity-90 text-white">{directive.text}</p>
                            </div>
                        </div>
                    </SectionCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ActiveUpgradesPanel upgrades={playerBase.activeUpgrades} layout={playerBase.baseLayout} />
                        <NotificationsPanel items={notifications} />
                    </div>
                </div>

                <aside className="space-y-6">
                    <QuickActionsPanel
                        onDefend={() => router.push("/defend")}
                        onAttack={() => router.push("/attack")}
                        onQuiz={() => router.push("/quiz")}
                        onStudy={() => router.push("/study")}
                        onSecurityAudit={() => router.push("/defend?audit=run")}
                    />

                    <SectionCard title="Latest Incursion">
                        {latestAttack ? (
                            <div className="space-y-3 mt-2">
                                <div className="flex justify-between items-center text-sm border-b border-cyber-border/40 pb-2">
                                    <span className="text-gray-400">Destruction</span>
                                    <span className="font-mono text-red-400 font-bold">{Math.round(latestAttack.session.destructionPercent)}%</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-cyber-border/40 pb-2">
                                    <span className="text-gray-400">Systems Offline</span>
                                    <span className="font-mono text-white">{latestAttack.session.destroyedBuildingIds.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Crypto Lost</span>
                                    <span className="font-mono text-red-400">0</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-4 text-gray-500 text-sm">
                                No recent incursions detected.
                            </div>
                        )}
                    </SectionCard>
                </aside>
            </div>
        </div>
    );
}
