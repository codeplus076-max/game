import type { Question } from "@/types/questions";

type Props = {
  question: Question;
  onAnswer: (index: number) => void;
  disabled: boolean;
};

export default function QuizCard({ question, onAnswer, disabled }: Props) {
  return (
    <div className="bg-cyber-panel border border-cyber-border rounded-xl p-6 shadow-xl max-w-2xl mx-auto w-full">
      <div className="flex justify-between items-start mb-6 border-b border-cyber-border pb-4">
        <h2 className="text-xl font-semibold text-white leading-relaxed">
          {question.question}
        </h2>
        <span className="px-2 py-1 bg-cyber-panel-light text-cyber-accent text-xs rounded uppercase font-medium tracking-wider whitespace-nowrap ml-4">
          {question.difficulty}
        </span>
      </div>

      <div className="space-y-3">
        {question.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onAnswer(idx)}
            disabled={disabled}
            className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${disabled
                ? "bg-cyber-panel-light/50 border-cyber-border/50 text-gray-500 cursor-not-allowed"
                : "bg-cyber-panel-light border-cyber-border hover:border-cyber-accent hover:bg-cyber-accent/10 text-gray-200"
              }`}
          >
            <div className="flex items-center">
              <span className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center mr-4 text-sm font-medium text-gray-400 shrink-0">
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
