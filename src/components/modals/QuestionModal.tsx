"use client";

import { useEffect, useState } from "react";
import type { BuildingInstance } from "@/types/game";
import type { Question } from "@/types/questions";
import { starterQuestions } from "@/data/starterQuestions";
import { getRandomQuestion, validateQuestionAnswer } from "@/services/questionEngine";

type Props = {
  building: BuildingInstance;
  onClose: () => void;
  onCorrect: (questionId: string) => void;
};

function levelToDifficulty(level: number) {
  if (level <= 1) return "easy" as const;
  if (level === 2) return "medium" as const;
  return "hard" as const;
}

export default function QuestionModal({ building, onClose, onCorrect }: Props) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const q = getRandomQuestion(starterQuestions, { mode: "upgrade", difficulty: levelToDifficulty(building.level), buildingType: building.type });
    setQuestion(q);
  }, [building]);

  if (!question) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-cyber-panel p-6 rounded-xl border border-cyber-border text-white shadow-2xl">
          No upgrade question available
        </div>
      </div>
    );
  }

  function submit() {
    if (selectedIndex === null || !question) return;
    const q = question;
    const correct = validateQuestionAnswer(q, selectedIndex);
    setSubmitted(true);
    setIsCorrect(correct);
    if (correct) {
      onCorrect(q.id);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-cyber-panel border border-cyber-border p-6 rounded-xl text-white shadow-2xl transform transition-all">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-cyber-accent">⚡</span> Upgrade Challenge
        </h3>
        <div className="mb-6 text-gray-200 text-lg leading-relaxed">{question.question}</div>

        <div className="flex flex-col gap-3">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`text-left px-4 py-3 rounded-lg border transition-all duration-200 ${selectedIndex === idx
                  ? "bg-cyber-accent/20 border-cyber-accent text-white"
                  : "bg-cyber-panel-light border-cyber-border text-gray-300 hover:border-cyber-border-hl hover:bg-cyber-panel-light/70"
                }`}
            >
              <div className="flex items-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${selectedIndex === idx ? "bg-cyber-accent text-black" : "bg-black/40 text-gray-400"
                  }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={submit}
            disabled={selectedIndex === null || submitted}
            className="flex-1 py-2.5 bg-cyber-success hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
          <button
            onClick={onClose}
            disabled={submitted}
            className="flex-1 py-2.5 bg-cyber-panel-light hover:bg-slate-700 text-white rounded-lg transition-colors border border-cyber-border disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

        {submitted && isCorrect === false && (
          <div className="mt-4 p-3 bg-red-950/40 border border-red-900/50 rounded-lg text-red-400 text-sm text-center animate-pulse">
            Incorrect — upgrade failed. Try again later.
          </div>
        )}
      </div>
    </div>
  );
}
