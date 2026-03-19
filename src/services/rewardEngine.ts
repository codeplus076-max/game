/**
 * Reward engine for Cyber Siege – computes and grants attack rewards.
 *
 * Fixed in this version:
 * - Import path corrected to Firebase repository (was importing from wrong usersRepository)
 * - RewardBreakdown re-exported from this module for consistency
 * - Storage event replaced with proper gamedata:updated CustomEvent
 */

import constants from "@/data/constants";
import { addCrypto } from "@/services/firebase/repositories/usersRepository";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RewardBreakdown {
  base: number;
  bonusMainServer: number;
  multiplier: number;
  total: number;
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Compute the reward for an attack session.
 * Pure function — no side effects.
 */
export function computeReward(
  destructionPercent: number,
  mainServerDestroyed: boolean,
  multiplier = 1
): RewardBreakdown {
  const base = Math.max(
    constants.REWARD_MIN,
    Math.round((destructionPercent / 100) * 60 * constants.REWARD_BASE_SCALE)
  );
  const bonusMainServer = mainServerDestroyed ? constants.REWARD_MAIN_SERVER_BONUS : 0;
  const total = Math.max(
    constants.REWARD_MIN,
    Math.round((base + bonusMainServer) * multiplier)
  );
  return { base, bonusMainServer, multiplier, total };
}

// ─── Async action ─────────────────────────────────────────────────────────────

/**
 * Grant the reward to a user: adds crypto, persists, and dispatches gamedata:updated.
 * Returns the total crypto amount granted.
 */
export async function grantReward(userId: string, breakdown: RewardBreakdown): Promise<number> {
  await addCrypto(userId, breakdown.total);
  // addCrypto already dispatches "gamedata:updated" via the repository
  return breakdown.total;
}

export default { computeReward, grantReward };
