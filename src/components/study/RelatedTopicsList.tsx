import type { StudyTopic } from "@/data/starterStudyContent";
import StudyTopicCard from "./StudyTopicCard";

type Props = {
  topics: StudyTopic[];
  onSelect: (topic: StudyTopic) => void;
};

export default function RelatedTopicsList({ topics, onSelect }: Props) {
  if (topics.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t border-cyber-border">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
        Related Intel
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map(topic => (
          <StudyTopicCard
            key={topic.id}
            topic={topic}
            onClick={() => onSelect(topic)}
          />
        ))}
      </div>
    </div>
  );
}
