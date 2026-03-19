import { TopicTag, DifficultyLevel, QuestionMode, BuildingType } from "./common";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: TopicTag;
  difficulty: DifficultyLevel;
  modeTags: QuestionMode[];
  buildingTags?: BuildingType[];
  attackTags?: string[];
  isActive: boolean;
}

export interface QuestionRequest {
  mode: QuestionMode;
  difficulty?: DifficultyLevel;
  topic?: TopicTag;
  buildingType?: BuildingType;
  attackTag?: string;
  excludeIds?: string[];
}

export interface QuestionResult {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}
