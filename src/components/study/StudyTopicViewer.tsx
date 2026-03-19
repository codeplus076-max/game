import SectionCard from "@/components/common/SectionCard";
import type { StudyTopic } from "@/data/starterStudyContent";
import EmptyState from "@/components/common/EmptyState";

type Props = {
  topic: StudyTopic | null;
  onTakeQuiz?: () => void;
};

export default function StudyTopicViewer({ topic, onTakeQuiz }: Props) {
  if (!topic) {
    return (
      <SectionCard title="Topic Viewer" className="h-full">
        <EmptyState
          title="Select a Topic"
          description="Click a topic from the library to view detailed study materials."
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Study Terminal"
      className="h-full"
      action={
        onTakeQuiz && (
          <button
            onClick={onTakeQuiz}
            className="text-xs px-3 py-1.5 bg-cyber-accent text-slate-900 rounded font-semibold hover:bg-blue-400"
          >
            Practice Quiz
          </button>
        )
      }
    >
      <div className="flex gap-2 items-center mb-6">
        <span className="text-xs bg-black/40 text-gray-300 px-2 py-1 rounded uppercase tracking-wider font-medium">
          {topic.difficulty}
        </span>
        <div className="flex gap-1.5">
          {topic.tags.map(tag => (
            <span key={tag} className="text-xs text-cyber-accent bg-cyber-accent/10 px-2 py-1 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">{topic.title}</h1>
      <p className="text-lg text-gray-400 mb-8 leading-relaxed">
        {topic.summary}
      </p>

      <div className="prose prose-invert prose-blue max-w-none text-gray-300 leading-relaxed">
        {topic.body.split("\n\n").map((para, i) => (
          <p key={i} className="mb-4">{para}</p>
        ))}
      </div>
    </SectionCard>
  );
}
