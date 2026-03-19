import type { BuildingInstance, AuditReport } from "@/types/game";

type Props = {
  report: AuditReport;
  baseLayout: BuildingInstance[];
  onClose: () => void;
};

export default function AuditReportModal({ report, baseLayout, onClose }: Props) {
  const findName = (id: string) => baseLayout.find((b) => b.id === id)?.name ?? id;

  let scoreColor = "border-cyber-border bg-cyber-panel-light text-white shadow-inner";
  if (report.overallRiskScore >= 80) {
    scoreColor = "border-red-600 bg-red-900/20 text-red-400";
  } else if (report.overallRiskScore >= 50) {
    scoreColor = "border-yellow-600 bg-yellow-900/20 text-yellow-400";
  } else {
    scoreColor = "border-emerald-600 bg-emerald-900/20 text-emerald-400";
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-cyber-panel border border-cyber-border rounded-xl text-white shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-cyber-border bg-cyber-panel-light/50">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span className="text-cyber-accent">🛡️</span> Security Diagnostic Report
            </h2>
            <div className="text-sm text-gray-400 mt-1">ID: {report.id}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-cyber-panel border border-cyber-border hover:bg-red-500/20 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border flex flex-col justify-center ${scoreColor}`}>
              <span className="block text-sm uppercase tracking-wider mb-1 opacity-80">Overall Risk Score</span>
              <span className="text-3xl font-bold">{Math.round(report.overallRiskScore)}</span>
            </div>
            <div className="p-4 rounded-lg flex flex-col justify-center border border-cyber-border bg-cyber-panel-light shadow-inner">
              <span className="block text-sm uppercase tracking-wider text-gray-400 mb-1">Generated</span>
              <span className="text-lg font-medium">{new Date(report.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-cyber-panel-light/40 border border-cyber-border/40 p-4 rounded-lg text-sm text-gray-300">
            <div className="mb-2"><strong>Weakest Target:</strong> <span className="text-white">{findName(report.weakestTargetBuildingId)}</span></div>
            <div className="mb-2"><strong>Summary:</strong> {report.summary}</div>
            <div><strong>Learning:</strong> {report.learningSummary}</div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3 border-b border-cyber-border pb-2">
              Identified Vulnerabilities
            </h3>
            {report.findings.length === 0 ? (
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-lg text-emerald-400 text-center">
                ✓ Base is secure. No critical findings.
              </div>
            ) : (
              <div className="space-y-3">
                {report.findings.map((finding, idx) => {
                  return (
                    <div key={idx} className="p-4 rounded-lg bg-red-950/20 border border-red-900/40">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-red-400">🚨 RISK SCORE: {finding.riskScore}</span>
                        <span className="text-xs bg-red-900/40 px-2 py-1 rounded text-red-200">Building: {findName(finding.buildingId)}</span>
                      </div>
                      <div className="text-gray-300 text-sm space-y-1 mt-2">
                        <div><strong className="text-gray-400">Weakness:</strong> {finding.weaknessFound}</div>
                        <div><strong className="text-gray-400">Attack method:</strong> {finding.attackMethod}</div>
                        <div><strong className="text-gray-400">Estimated damage:</strong> {finding.estimatedDamage}</div>
                        <div><strong className="text-gray-400">Recommendation:</strong> {finding.recommendation}</div>
                        <div className="mt-2 text-xs text-cyber-accent"><strong>Topics:</strong> {finding.relatedTopics.join(", ")}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyber-border bg-cyber-panel-light text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyber-border hover:bg-slate-700 text-white rounded-lg transition-colors font-medium border border-cyber-border-hl/50"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
