import { BuildingType, TopicTag, DifficultyLevel } from "./common";

export interface GridPosition { x: number; y: number; }

export interface VulnerabilityProfile {
  primaryTags: TopicTag[];
  weaknessThemes: string[];
}

export interface BuildingInstance {
  id: string;
  type: BuildingType;
  name: string;
  level: 1 | 2 | 3;
  position: GridPosition;
  health: number;
  maxHealth: number;
  isDestroyed: boolean;
  isUpgrading: boolean;
  upgradeEndsAt: string | null;
  vulnerabilityProfile: VulnerabilityProfile;
}

export interface ActiveUpgrade {
  buildingId: string;
  fromLevel: number;
  toLevel: number;
  startedAt: string;
  endsAt: string;
  costCryptoCurrency: number;
  instantFinishTokenCost: number;
}

export interface PlayerBase {
  userId: string;
  baseLayout: BuildingInstance[];
  activeUpgrades: ActiveUpgrade[];
  defenseScore: number;
  lastAuditReportId: string | null;
  updatedAt: string;
}

export interface AIPresetBase {
  id: string;
  name: string;
  difficultyTier: DifficultyLevel;
  layout: BuildingInstance[];
  rewardMultiplier: number;
  weaknessProfile: string[];
}

export interface AttackTargetState {
  buildingId: string;
  damageDealt: number;
  destroyed: boolean;
}

export interface AttackSession {
  sessionId: string;
  aiBaseId: string;
  livesRemaining: number;
  selectedTargetId: string | null;
  destructionPercent: number;
  destroyedBuildingIds: string[];
  targetStates: AttackTargetState[];
  destroyedMainServer: boolean;
  rewardClaimed: boolean;
}

export interface AuditFinding {
  buildingId: string;
  buildingType: BuildingType;
  riskScore: number;
  weaknessFound: string;
  attackMethod: string;
  estimatedDamage: string;
  recommendation: string;
  relatedTopics: TopicTag[];
}

export interface AuditReport {
  id: string;
  userId: string;
  createdAt: string;
  weakestTargetBuildingId: string;
  overallRiskScore: number;
  findings: AuditFinding[];
  summary: string;
  learningSummary: string;
}

export interface RewardBreakdown {
  baseReward: number;
  destructionBonus: number;
  mainServerBonus: number;
  multiplierApplied: number;
  totalCryptoEarned: number;
}

export interface QuizSession {
  sessionId: string;
  answeredQuestionIds: string[];
  correctCount: number;
  wrongCount: number;
  tokenDelta: number;
  currentQuestionId: string | null;
}
