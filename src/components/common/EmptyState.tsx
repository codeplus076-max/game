export default function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[120px] rounded-lg border border-dashed border-cyber-border/60 bg-cyber-panel/30">
      {icon && <div className="text-4xl mb-3 text-cyber-border-hl/50">{icon}</div>}
      <h4 className="text-gray-300 font-medium mb-1">{title}</h4>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}
