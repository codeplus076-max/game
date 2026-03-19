export default function SectionCard({ title, children, className = "", action }: { title: string; children: React.ReactNode; className?: string; action?: React.ReactNode }) {
    return (
        <div className={`bg-cyber-panel border border-cyber-border rounded-xl shadow-lg flex flex-col overflow-hidden ${className}`}>
            <div className="bg-cyber-panel-light px-4 py-3 border-b border-cyber-border flex items-center justify-between">
                <h3 className="font-semibold text-white tracking-wide text-sm uppercase">{title}</h3>
                {action && <div>{action}</div>}
            </div>
            <div className="p-4 flex-1">
                {children}
            </div>
        </div>
    );
}
