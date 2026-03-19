import SectionCard from "@/components/common/SectionCard";
import EmptyState from "@/components/common/EmptyState";

export default function NotificationsPanel({ items }: { items: any[] }) {
  return (
    <SectionCard title="Activity Feed">
      {items.length === 0 ? (
        <EmptyState title="No new alerts" description="All systems operating normally." />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={i} className="text-sm p-2 rounded bg-cyber-panel-light/40 border border-cyber-border/40 text-gray-300">
              {String(item)}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
