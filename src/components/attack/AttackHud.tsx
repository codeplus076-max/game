export default function AttackHud({ lives, maxLives }: { lives: number; maxLives: number }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-cyber-panel/80 backdrop-blur border border-cyber-border rounded-lg shadow-lg">
      <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 mr-2">
        Attempts Remaining
      </div>
      {Array.from({ length: maxLives }).map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-sm rotate-45 transition-all ${i < lives ? "bg-cyber-accent shadow-[0_0_8px_rgba(14,165,233,0.6)]" : "bg-gray-800 border border-gray-700"
            }`}
        />
      ))}
    </div>
  );
}
