"use client";

import { useEffect, useState } from "react";
import type { BuildingInstance } from "@/types/game";
import type { Question } from "@/types/questions";
import { starterQuestions } from "@/data/starterQuestions";
import { getContextualAttackQuestion, validateQuestionAnswer } from "@/services/questionEngine";

type Props = {
  building: BuildingInstance;
  onClose: () => void;
  onCorrect: (questionId: string) => void;
  onIncorrect: () => void;
};

function levelToDifficulty(level: number) {
  if (level <= 1) return "easy" as const;
  if (level === 2) return "medium" as const;
  return "hard" as const;
}

export default function AttackQuestionModal({ building, onClose, onCorrect, onIncorrect }: Props) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const q = getContextualAttackQuestion(starterQuestions, {
      buildingType: building.type,
      attackTag: building.vulnerabilityProfile.weaknessThemes[0] || undefined,
      difficulty: levelToDifficulty(building.level),
    });
    setQuestion(q);
  }, [building]);

  if (!question) return (
    <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#071224", padding: 20, borderRadius: 8, color: "#fff" }}>No attack question available</div>
    </div>
  );

  function submit() {
    if (selectedIndex === null || !question) return;
    const q = question;
    setSubmitted(true);
    const correct = validateQuestionAnswer(q, selectedIndex);
    if (correct) {
      onCorrect(q.id);
    } else {
      onIncorrect();
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 640, background: "#0b1220", padding: 20, borderRadius: 8, color: "#fff" }}>
        <h3 style={{ marginTop: 0 }}>Attack Challenge — {building.name}</h3>
        <div style={{ marginBottom: 12 }}>{question.question}</div>

        <div style={{ display: "grid", gap: 8 }}>
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              style={{
                textAlign: "left",
                padding: "8px 12px",
                borderRadius: 6,
                background: selectedIndex === idx ? "#0ea5e9" : "#071824",
                color: "#fff",
                border: "none",
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={submit} style={{ padding: "8px 12px", borderRadius: 6, background: "#10b981", color: "#042018" }}>Submit</button>
          <button onClick={onClose} style={{ padding: "8px 12px", borderRadius: 6, background: "#111827", color: "#fff" }}>Cancel</button>
        </div>

        {submitted && (
          <div style={{ marginTop: 12, color: "#f87171" }}>Answer submitted.</div>
        )}
      </div>
    </div>
  );
}
