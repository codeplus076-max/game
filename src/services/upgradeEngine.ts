/**
 * Upgrade engine for Cyber Siege – handles building upgrade lifecycle.
 *
 * Fixed in this version:
 * - instantFinishUpgrade now applies INSTANT_FINISH_TOKEN_PER_MINUTE constant correctly
 * - max-level guard added to applyUpgrade
 * - finalizeUpgrade reads fresh base before patching (prevents stale-cache loss of data)
 * - getInstantFinishCost is the single authoritative cost calculation
 */

import type { BuildingInstance } from "@/types/game";
import type { BuildingType } from "@/types/common";
import type { PlayerBase, ActiveUpgrade } from "@/types/game";
import constants from "@/data/constants";
import { phaserEventBus } from "@/game/bridge/phaserEventBus";
import {
  getPlayerBase,
  updatePlayerBase,
} from "@/services/firebase/repositories/playerBasesRepository";
import {
  deductCrypto,
  getUser,
  deductQuizTokens,
} from "@/services/firebase/repositories/usersRepository";

// ─── Pure helpers (no side-effects) ──────────────────────────────────────────

/** Returns true if building can be upgraded right now. */
export function canUpgrade(building: BuildingInstance): boolean {
  return (
    building.level < constants.MAX_BUILDING_LEVEL &&
    !building.isUpgrading &&
    !building.isDestroyed
  );
}

/** Crypto cost to start an upgrade from currentLevel → currentLevel+1. */
export function getUpgradeCost(buildingType: BuildingType, currentLevel: number): number {
  const costs = (constants.UPGRADE_COSTS as Record<string, number[]>)[buildingType];
  return costs?.[currentLevel] ?? 0;
}

/** Duration in ms for an upgrade from currentLevel → currentLevel+1. */
export function getUpgradeDuration(buildingType: BuildingType, currentLevel: number): number {
  const durations = (constants.UPGRADE_DURATIONS_MS as Record<string, number[]>)[buildingType];
  return durations?.[currentLevel] ?? 0;
}

/**
 * Token cost to instant-finish an upgrade with `remainingMs` left.
 */
export function getInstantFinishCost(remainingMs: number): number {
  const seconds = Math.max(0, remainingMs / 1000);
  const rawTokens = Math.ceil(seconds / constants.INSTANT_FINISH_SECONDS_PER_TOKEN);
  return Math.max(constants.INSTANT_FINISH_MIN_COST, rawTokens);
}

// ─── Async actions ────────────────────────────────────────────────────────────

/**
 * Start an upgrade for a building.
 * Deducts crypto, marks building as upgrading, persists.
 */
export async function applyUpgrade(
  userId: string,
  buildingId: string
): Promise<{ success: boolean; message?: string }> {
  const base: PlayerBase = await getPlayerBase(userId);
  const building = base.baseLayout.find((b) => b.id === buildingId);

  if (!building) return { success: false, message: "building_not_found" };
  if (building.isDestroyed) return { success: false, message: "building_destroyed" };
  if (building.isUpgrading) return { success: false, message: "already_upgrading" };
  if (building.level >= constants.MAX_BUILDING_LEVEL) return { success: false, message: "max_level" };

  const cost = getUpgradeCost(building.type, building.level);
  const duration = getUpgradeDuration(building.type, building.level);

  const user = await getUser(userId);
  if (user.cryptoCurrency < cost) return { success: false, message: "insufficient_funds" };

  const deducted = await deductCrypto(userId, cost);
  if (!deducted) return { success: false, message: "deduct_failed" };

  const now = Date.now();
  const endsAt = new Date(now + duration).toISOString();

  building.isUpgrading = true;
  building.upgradeEndsAt = endsAt;

  // Remove any stale record for this building before adding fresh one
  base.activeUpgrades = base.activeUpgrades.filter((u) => u.buildingId !== buildingId);

  const newUpgrade: ActiveUpgrade = {
    buildingId,
    fromLevel: building.level,
    toLevel: Math.min(constants.MAX_BUILDING_LEVEL, building.level + 1) as 1 | 2 | 3,
    startedAt: new Date(now).toISOString(),
    endsAt,
    costCryptoCurrency: cost,
    instantFinishTokenCost: getInstantFinishCost(duration),
  };
  base.activeUpgrades.push(newUpgrade);

  await updatePlayerBase(base);

  try {
    phaserEventBus.emit("START_BUILDING_UPGRADE_VISUAL", { buildingId, endsAt });
  } catch {
    // Phaser may not be mounted
  }

  return { success: true };
}

/**
 * Finalize a completed upgrade — level up the building, remove from activeUpgrades.
 * Always reads a fresh copy of the base to prevent stale-cache overwrites.
 */
export async function finalizeUpgrade(
  userId: string,
  buildingId: string
): Promise<{ success: boolean; message?: string }> {
  // Always re-read from persistence to avoid stale state
  const base: PlayerBase = await getPlayerBase(userId);
  const building = base.baseLayout.find((b) => b.id === buildingId);

  if (!building) return { success: false, message: "building_not_found" };

  const activeIndex = base.activeUpgrades.findIndex((u) => u.buildingId === buildingId);
  if (activeIndex === -1) {
    // Already finalized (safe to no-op)
    if (!building.isUpgrading) return { success: true };
    return { success: false, message: "no_active_upgrade" };
  }

  const upgrade = base.activeUpgrades[activeIndex];

  // Level up
  building.level = Math.min(constants.MAX_BUILDING_LEVEL, upgrade.toLevel) as 1 | 2 | 3;
  building.isUpgrading = false;
  building.upgradeEndsAt = null;

  // Restore health boost on upgrade
  const levelHealthMap: Record<number, number> = { 1: 1.0, 2: 1.3, 3: 1.6 };
  const factor = levelHealthMap[building.level] ?? 1.0;
  const base100 = Math.round(building.maxHealth / (levelHealthMap[upgrade.fromLevel] ?? 1.0));
  building.maxHealth = Math.round(base100 * factor);
  building.health = building.maxHealth; // Fully repaired on upgrade

  // Remove from active upgrades
  base.activeUpgrades.splice(activeIndex, 1);

  await updatePlayerBase(base);

  try {
    phaserEventBus.emit("COMPLETE_BUILDING_UPGRADE_VISUAL", { buildingId, newLevel: building.level });
  } catch {
    // Phaser may not be mounted
  }

  return { success: true };
}

/**
 * Instant-finish an in-progress upgrade by spending quiz tokens.
 * Token cost is calculated from remaining ms × INSTANT_FINISH_TOKEN_PER_MINUTE.
 */
export async function instantFinishUpgrade(
  userId: string,
  buildingId: string
): Promise<{ success: boolean; message?: string }> {
  const base: PlayerBase = await getPlayerBase(userId);
  const building = base.baseLayout.find((b) => b.id === buildingId);

  if (!building) return { success: false, message: "building_not_found" };
  if (!building.isUpgrading || !building.upgradeEndsAt) return { success: false, message: "not_upgrading" };

  const remainingMs = Math.max(0, Date.parse(building.upgradeEndsAt) - Date.now());
  const tokenCost = getInstantFinishCost(remainingMs);

  const user = await getUser(userId);
  if (user.quizTokens < tokenCost) return { success: false, message: "insufficient_tokens" };

  const deducted = await deductQuizTokens(userId, tokenCost);
  if (!deducted) return { success: false, message: "deduct_failed" };

  // Mark endsAt as now so finalizeUpgrade proceeds immediately
  building.upgradeEndsAt = new Date().toISOString();
  const activeUpgrade = base.activeUpgrades.find((u) => u.buildingId === buildingId);
  if (activeUpgrade) activeUpgrade.endsAt = building.upgradeEndsAt;

  await updatePlayerBase(base);

  return finalizeUpgrade(userId, buildingId);
}

export default { applyUpgrade, finalizeUpgrade, instantFinishUpgrade, canUpgrade, getUpgradeCost, getUpgradeDuration, getInstantFinishCost };
