/**
 * Question engine for Cyber Siege – filtering, selection, and answer validation.
 *
 * Improvements:
 * - getQuestionsForUpgrade: building-type specific question selection
 * - All fallback chains ensure a question is returned if any compatible questions exist
 * - Strongly typed throughout
 */

import type { Question, QuestionRequest } from "@/types/questions";
import type { BuildingType, DifficultyLevel } from "@/types/common";

// ─── Core filter ──────────────────────────────────────────────────────────────

/**
 * Filter a question bank by the given request parameters.
 */
export function filterQuestions(questions: Question[], request: QuestionRequest): Question[] {
  return questions.filter((q) => {
    if (!q.isActive) return false;
    if (!q.modeTags.includes(request.mode)) return false;
    if (request.difficulty && q.difficulty !== request.difficulty) return false;
    if (request.topic && q.topic !== request.topic) return false;

    if (request.buildingType && q.buildingTags && q.buildingTags.length > 0) {
      if (!q.buildingTags.includes(request.buildingType)) return false;
    }

    if (request.attackTag && q.attackTags && q.attackTags.length > 0) {
      if (!q.attackTags.includes(request.attackTag)) return false;
    }

    if (request.excludeIds?.includes(q.id)) return false;

    return true;
  });
}

// ─── Random selection ─────────────────────────────────────────────────────────

/**
 * Pick a random question matching the request. Returns null only if bank is empty.
 */
export function getRandomQuestion(questions: Question[], request: QuestionRequest): Question | null {
  const candidates = filterQuestions(questions, request);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// ─── Answer validation ────────────────────────────────────────────────────────

/**
 * Returns true if selectedIndex matches the correct answer.
 */
export function validateQuestionAnswer(question: Question, selectedIndex: number): boolean {
  return question.correctAnswerIndex === selectedIndex;
}

// ─── Contextual attack question ───────────────────────────────────────────────

/**
 * Pick the best contextual question for an attack on a specific building.
 * Four-level fallback chain: specific → buildingType → difficulty → any attack.
 */
export function getContextualAttackQuestion(
  questions: Question[],
  opts: {
    buildingType?: BuildingType | string;
    attackTag?: string;
    difficulty?: DifficultyLevel | string;
    excludeIds?: string[];
  }
): Question | null {
  const exclude = opts.excludeIds ?? [];

  // 1. Exact: buildingType + attackTag + difficulty
  const q1 = getRandomQuestion(questions, {
    mode: "attack",
    buildingType: opts.buildingType as BuildingType,
    attackTag: opts.attackTag,
    difficulty: opts.difficulty as DifficultyLevel,
    excludeIds: exclude,
  });
  if (q1) return q1;

  // 2. buildingType + difficulty
  const q2 = getRandomQuestion(questions, {
    mode: "attack",
    buildingType: opts.buildingType as BuildingType,
    difficulty: opts.difficulty as DifficultyLevel,
    excludeIds: exclude,
  });
  if (q2) return q2;

  // 3. difficulty only
  const q3 = getRandomQuestion(questions, {
    mode: "attack",
    difficulty: opts.difficulty as DifficultyLevel,
    excludeIds: exclude,
  });
  if (q3) return q3;

  // 4. Any attack question
  return getRandomQuestion(questions, { mode: "attack", excludeIds: exclude });
}

// ─── Upgrade question selection ───────────────────────────────────────────────

/**
 * Pick a question tagged for the upgrade mode and specific building type.
 * Falls back to any upgrade question if no building-specific ones exist.
 */
export function getQuestionsForUpgrade(
  questions: Question[],
  buildingType: BuildingType,
  difficulty?: DifficultyLevel,
  excludeIds: string[] = []
): Question | null {
  // Try building-specific + difficulty
  const q1 = getRandomQuestion(questions, {
    mode: "upgrade",
    buildingType,
    difficulty,
    excludeIds,
  });
  if (q1) return q1;

  // Try building-specific only
  const q2 = getRandomQuestion(questions, {
    mode: "upgrade",
    buildingType,
    excludeIds,
  });
  if (q2) return q2;

  // Any upgrade question
  return getRandomQuestion(questions, { mode: "upgrade", excludeIds });
}

// ─── Quiz question selection ──────────────────────────────────────────────────

/**
 * Pick a random question for quiz mode, avoiding recently answered questions.
 * Falls back to any quiz question if recently-excluded ones exhaust the pool.
 */
export function getRandomQuizQuestion(
  questions: Question[],
  excludeRecent: string[] = []
): Question | null {
  const candidates = questions.filter(
    (q) => q.isActive && q.modeTags.includes("quiz") && !excludeRecent.includes(q.id)
  );
  if (candidates.length === 0) {
    // Fallback: ignore exclusions and pick any quiz question
    const all = questions.filter((q) => q.isActive && q.modeTags.includes("quiz"));
    if (all.length === 0) return null;
    return all[Math.floor(Math.random() * all.length)];
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default {
  filterQuestions,
  getRandomQuestion,
  validateQuestionAnswer,
  getContextualAttackQuestion,
  getQuestionsForUpgrade,
  getRandomQuizQuestion,
};
