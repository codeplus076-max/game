// Centralized balancing constants for Cyber Siege MVP
export const MAX_BUILDING_LEVEL = 3;

export const UPGRADE_COSTS: Record<string, number[]> = {
  main_server: [0, 300, 900],
  firewall_tower: [0, 150, 450],
  patch_center: [0, 120, 360],
  backup_center: [0, 130, 390],
};

export const UPGRADE_DURATIONS_MS: Record<string, number[]> = {
  main_server: [0, 1000 * 30, 1000 * 90],
  firewall_tower: [0, 1000 * 20, 1000 * 60],
  patch_center: [0, 1000 * 15, 1000 * 45],
  backup_center: [0, 1000 * 25, 1000 * 75],
};

export const INSTANT_FINISH_SECONDS_PER_TOKEN = 15;
export const INSTANT_FINISH_MIN_COST = 2;

export const REWARD_BASE_SCALE = 1.5; // base multiplier for attack rewards
export const REWARD_MAIN_SERVER_BONUS = 60; // bonus crypto for destroying main server
export const REWARD_MIN = 25; // minimum crypto reward for any attack

export const QUIZ_TOKEN_REWARD = 10;
export const QUIZ_TOKEN_PENALTY = 2;

export default {
  MAX_BUILDING_LEVEL,
  UPGRADE_COSTS,
  UPGRADE_DURATIONS_MS,
  INSTANT_FINISH_SECONDS_PER_TOKEN,
  INSTANT_FINISH_MIN_COST,
  REWARD_BASE_SCALE,
  REWARD_MAIN_SERVER_BONUS,
  REWARD_MIN,
  QUIZ_TOKEN_REWARD,
  QUIZ_TOKEN_PENALTY,
};
