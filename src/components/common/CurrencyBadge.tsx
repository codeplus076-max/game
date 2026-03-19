export default function CurrencyBadge({ type, amount }: { type: "crypto" | "tokens"; amount: number }) {
    const isCrypto = type === "crypto";
    const label = isCrypto ? "Crypto" : "Quiz Tokens";
    const color = isCrypto ? "text-emerald-400" : "text-amber-400";
    const bg = isCrypto ? "bg-emerald-400/10" : "bg-amber-400/10";
    const border = isCrypto ? "border-emerald-500/20" : "border-amber-500/20";

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${bg} ${border}`}>
            <span className="text-xs font-medium uppercase tracking-wider text-gray-300">{label}</span>
            <span className={`font-mono font-bold ${color}`}>{amount.toLocaleString()}</span>
        </div>
    );
}
