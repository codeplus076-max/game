import type { StudyTopic } from "@/data/starterStudyContent";

type Props = {
  topic: StudyTopic;
  isSelected?: boolean;
  onClick: () => void;
};

export default function StudyTopicCard({ topic, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 shadow-sm ${isSelected
          ? "bg-cyber-panel-light border-cyber-accent shadow-cyber-accent/10"
          : "bg-cyber-panel border-cyber-border hover:border-cyber-border-hl hover:bg-cyber-panel-light/50"
        }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-white leading-tight">{topic.title}</h3>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-black/30 px-2 py-0.5 rounded">
          {topic.difficulty}
        </span>
      </div>
      <p className="text-sm text-gray-400 line-clamp-2">
        {topic.summary}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {topic.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-cyber-panel border border-cyber-border text-gray-400">
            {tag}
          </span>
        ))}
        {topic.tags.length > 3 && (
          <span className="text-[10px] px-1.5 py-0.5 text-gray-500">+{topic.tags.length - 3}</span>
        )}
      </div>
    </button>
  );
}
