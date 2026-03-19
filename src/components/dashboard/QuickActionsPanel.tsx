import SectionCard from "@/components/common/SectionCard";

type Props = {
  onDefend: () => void;
  onAttack: () => void;
  onQuiz: () => void;
  onStudy: () => void;
  onSecurityAudit: () => void;
};

export default function QuickActionsPanel({ onDefend, onAttack, onQuiz, onStudy, onSecurityAudit }: Props) {
  const actions = [
    { label: "Manage Defenses", onClick: onDefend, color: "bg-blue-900/40 text-blue-300 hover:bg-blue-900/60 border-blue-500/30" },
    { label: "Run Security Audit", onClick: onSecurityAudit, color: "bg-fuchsia-900/40 text-fuchsia-300 hover:bg-fuchsia-900/60 border-fuchsia-500/30" },
    { label: "Launch Target Attack", onClick: onAttack, color: "bg-red-900/40 text-red-300 hover:bg-red-900/60 border-red-500/30" },
    { label: "Earn Quiz Tokens", onClick: onQuiz, color: "bg-amber-900/40 text-amber-300 hover:bg-amber-900/60 border-amber-500/30" },
    { label: "Study Intel Archive", onClick: onStudy, color: "bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60 border-emerald-500/30" },
  ];

  return (
    <SectionCard title="Quick Actions">
      <div className="grid grid-cols-1 gap-3">
        {actions.map((act, i) => (
          <button
            key={i}
            onClick={act.onClick}
            className={`w-full py-3 px-4 rounded-lg border text-sm font-medium transition-all ${act.color} flex justify-between items-center`}
          >
            {act.label}
            <span>→</span>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
