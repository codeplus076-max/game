import SectionCard from "@/components/common/SectionCard";

export default function SecurityAuditPanel({ onRunAudit }: { onRunAudit: () => void }) {
    return (
        <SectionCard title="Security Auditor">
            <div className="text-sm text-gray-400 mb-4 leading-relaxed">
                Run a full heuristic scan of your base layout to identify structural weaknesses and configuration flaws.
            </div>
            <button
                onClick={onRunAudit}
                className="w-full py-2.5 bg-cyber-panel-light hover:bg-cyber-border border border-cyber-border-hl text-cyber-text rounded-md font-medium transition-colors"
            >
                Run Diagnostics Scan
            </button>
        </SectionCard>
    );
}
