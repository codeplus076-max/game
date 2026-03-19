/**
 * Timer engine for Cyber Siege – checks and finalizes expired upgrades.
 *
 * Fixed in this version:
 * - tokenCostFromRemainingMs now applies INSTANT_FINISH_TOKEN_PER_MINUTE multiplier
 * - Polling tracks a single interval per userId (no duplicates)
 * - onComplete callback support for UI reactivity
 * - checkAndFinalizeOnLoad for one-shot page-load check
 */

import constants from "@/data/constants";
import { getPlayerBase } from "@/services/firebase/repositories/playerBasesRepository";
import { finalizeUpgrade, getInstantFinishCost } from "@/services/upgradeEngine";

// ─── Pure helpers ─────────────────────────────────────────────────────────────

/**
 * Returns ms remaining until `endsAt`. Returns 0 if already expired or missing.
 */
export function computeRemainingMs(endsAt: string | null | undefined): number {
  if (!endsAt) return 0;
  return Math.max(0, Date.parse(endsAt) - Date.now());
}

/**
 * Quiz token cost to instant-finish with `remainingMs` left.
 * Applies INSTANT_FINISH_TOKEN_PER_MINUTE constant. Minimum 1 token.
 */
export function tokenCostFromRemainingMs(remainingMs: number): number {
  return getInstantFinishCost(remainingMs);
}

// ─── One-shot finalization ────────────────────────────────────────────────────

/**
 * Check all active upgrades for a user and finalize any that have expired.
 * Safe to call multiple times — no-ops on already-finalized upgrades.
 */
export async function checkAndFinalizeUpgrades(userId: string): Promise<string[]> {
  const base = await getPlayerBase(userId);
  const now = Date.now();
  const expired = base.activeUpgrades.filter((u) => Date.parse(u.endsAt) <= now);
  const finalizedIds: string[] = [];

  for (const up of expired) {
    try {
      const result = await finalizeUpgrade(userId, up.buildingId);
      if (result.success) finalizedIds.push(up.buildingId);
    } catch (err) {
      console.warn("timerEngine: failed to finalize upgrade", up.buildingId, err);
    }
  }

  return finalizedIds;
}

/**
 * One-shot check to run at page load. Returns list of building IDs finalized.
 */
export async function checkAndFinalizeOnLoad(userId: string): Promise<string[]> {
  try {
    return await checkAndFinalizeUpgrades(userId);
  } catch {
    return [];
  }
}

// ─── Polling ──────────────────────────────────────────────────────────────────

/** Active interval map — one per userId so we don't stack intervals. */
const _activeIntervals = new Map<string, ReturnType<typeof setInterval>>();

/**
 * Start polling for a user's expired upgrades.
 * Only one interval per userId is active at a time.
 * @param onComplete - optional callback called with each finalized buildingId
 * @returns cleanup function to stop polling
 */
export function startPollingUpgrades(
  userId: string,
  intervalMs = 5_000,
  onComplete?: (finalizedBuildingIds: string[]) => void
): () => void {
  // Stop any existing poll for this user
  stopPollingUpgrades(userId);

  const id = setInterval(async () => {
    try {
      const finalized = await checkAndFinalizeUpgrades(userId);
      if (finalized.length > 0 && onComplete) {
        onComplete(finalized);
      }
    } catch (e) {
      console.warn("timerEngine: poll error", e);
    }
  }, intervalMs);

  _activeIntervals.set(userId, id);
  return () => stopPollingUpgrades(userId);
}

/**
 * Stop polling for a specific user.
 */
export function stopPollingUpgrades(userId: string): void {
  const existing = _activeIntervals.get(userId);
  if (existing !== undefined) {
    clearInterval(existing);
    _activeIntervals.delete(userId);
  }
}

export default {
  computeRemainingMs,
  tokenCostFromRemainingMs,
  checkAndFinalizeUpgrades,
  checkAndFinalizeOnLoad,
  startPollingUpgrades,
  stopPollingUpgrades,
};
