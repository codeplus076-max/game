export default function StatCard({ label, value, subtext, highlightColor }: { label: string; value: React.ReactNode; subtext?: string; highlightColor?: "accent" | "success" | "danger" | "warning" }) {
    const highlightClasses = {
        accent: "text-cyber-accent",
        success: "text-cyber-success",
        danger: "text-cyber-danger",
        warning: "text-cyber-warning",
    };

    const valColorClass = highlightColor ? highlightClasses[highlightColor] : "text-white";

    return (
        <div className="bg-cyber-panel-light/50 border border-cyber-border/50 rounded-lg p-3 flex flex-col justify-center">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</div>
            <div className={`text-xl font-bold ${valColorClass}`}>{value}</div>
            {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
        </div>
    );
}
