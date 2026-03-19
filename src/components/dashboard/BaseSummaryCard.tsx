import SectionCard from "@/components/common/SectionCard";
import StatCard from "@/components/common/StatCard";
import type { AuditReport } from "@/types/game";

type Props = {
  crypto: number;
  tokens: number;
  defenseScore: number;
  latestAudit: AuditReport | null;
};

export default function BaseSummaryCard({ crypto, tokens, defenseScore, latestAudit }: Props) {
  const issues = latestAudit ? latestAudit.findings.length : 0;
  const auditStatusColor = issues === 0 ? "success" : issues < 3 ? "warning" : "danger";
  const auditText = latestAudit ? `${issues} Issue${issues === 1 ? "" : "s"} Found` : "No Audit Run";

  return (
    <SectionCard title="Base Overview">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Crypto" value={crypto.toLocaleString()} highlightColor="success" />
        <StatCard label="Quiz Tokens" value={tokens.toLocaleString()} highlightColor="accent" />
        <StatCard label="Defense Score" value={defenseScore} subtext="Weighted rating" />
        <StatCard label="Security Posture" value={auditText} highlightColor={auditStatusColor} />
      </div>
    </SectionCard>
  );
}
