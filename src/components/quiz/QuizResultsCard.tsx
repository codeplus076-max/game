import type { Question } from "@/types/questions";

type Props = {
  question: Question;
  selectedAnswerIndex: number;
  onNext: () => void;
};

export default function QuizResultsCard({ question, selectedAnswerIndex, onNext }: Props) {
  const isCorrect = selectedAnswerIndex === question.correctAnswerIndex;

  return (
    <div className={`border rounded-xl p-6 max-w-2xl mx-auto w-full shadow-xl ${isCorrect ? "bg-emerald-950/20 border-emerald-900/50" : "bg-red-950/20 border-red-900/50"
      }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`text-2xl ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
          {isCorrect ? "✓ Correct" : "✗ Incorrect"}
        </div>
      </div>

      <div className="mb-6 bg-black/20 p-4 rounded-lg border border-white/5">
        <div className="text-sm text-gray-400 mb-1">Question</div>
        <div className="text-white font-medium mb-4">{question.question}</div>

        <div className="text-sm text-gray-400 mb-1">Your Answer</div>
        <div className={`font-medium ${isCorrect ? "text-emerald-300" : "text-red-300 line-through opacity-80"} mb-4`}>
          {question.options[selectedAnswerIndex]}
        </div>

        {!isCorrect && (
          <>
            <div className="text-sm text-gray-400 mb-1">Correct Answer</div>
            <div className="text-emerald-300 font-medium">{question.options[question.correctAnswerIndex]}</div>
          </>
        )}
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">Explanation</h4>
        <p className="text-gray-300 leading-relaxed text-sm bg-cyber-panel/50 p-4 rounded-lg border border-cyber-border/50">
          {question.explanation}
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-cyber-accent text-slate-900 rounded-lg font-bold hover:bg-blue-400 transition-colors shadow-lg shadow-cyber-accent/20"
      >
        Continue to Next Question
      </button>
    </div>
  );
}
