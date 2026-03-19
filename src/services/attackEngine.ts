/**
 * Attack engine for Cyber Siege – pure helpers for attack session lifecycle.
 *
 * Fixed in this version:
 * - Removed duplicate createAttackSession / startNewAttackSession (merged into one)
 * - Removed duplicate applyDamageToTarget — replaced by resolveAttackHit + calculateDestructionPercent
 * - Destruction percent now uses totalHealth correctly
 */

import type { AttackTargetState, AttackSession, BuildingInstance } from "@/types/game";

// ─── Session creation ─────────────────────────────────────────────────────────

/**
 * Create a fresh attack session for a given AI base.
 * Uses crypto.randomUUID for a unique session ID.
 */
export function startNewAttackSession(aiBaseId: string): AttackSession {
  return {
    sessionId: crypto.randomUUID(),
    aiBaseId,
    livesRemaining: 3,
    selectedTargetId: null,
    destructionPercent: 0,
    destroyedBuildingIds: [],
    targetStates: [],
    destroyedMainServer: false,
    rewardClaimed: false,
  };
}

// ─── Hit resolution ───────────────────────────────────────────────────────────

/**
 * Resolve a single attack hit on a target building.
 * Returns the damage state including whether the building was destroyed.
 */
export function resolveAttackHit(target: BuildingInstance, isCorrect: boolean): AttackTargetState {
  // Correct answer deals full damage; wrong answer deals reduced damage
  const baseDamage = isCorrect ? 40 : 10;
  // Higher level buildings have more armor
  const armorFactor = (target.level / 3) * 0.5 + 0.75;
  const damage = Math.min(target.health, Math.floor(baseDamage / armorFactor));
  const destroyed = target.health - damage <= 0;

  return {
    buildingId: target.id,
    damageDealt: damage,
    destroyed,
  };
}

// ─── Destruction percent ──────────────────────────────────────────────────────

/**
 * Calculate destruction percent based on total damage dealt vs total health of the AI base.
 */
export function calculateDestructionPercent(
  layout: BuildingInstance[],
  targetStates: AttackTargetState[]
): number {
  const totalHealth = layout.reduce((sum, b) => sum + b.maxHealth, 0);
  if (totalHealth === 0) return 0;
  const damageDealt = targetStates.reduce((sum, t) => sum + t.damageDealt, 0);
  return Math.min(100, Math.round((damageDealt / totalHealth) * 100));
}

// ─── Session state mutation ───────────────────────────────────────────────────

/**
 * Apply an attack hit result to the session state.
 * Mutates session in-place and returns it.
 */
export function applyHitToSession(
  session: AttackSession,
  layout: BuildingInstance[],
  hitResult: AttackTargetState
): AttackSession {
  const existing = session.targetStates.find((t) => t.buildingId === hitResult.buildingId);
  if (existing) {
    existing.damageDealt += hitResult.damageDealt;
    existing.destroyed = existing.destroyed || hitResult.destroyed;
  } else {
    session.targetStates.push({ ...hitResult });
  }

  if (hitResult.destroyed && !session.destroyedBuildingIds.includes(hitResult.buildingId)) {
    session.destroyedBuildingIds.push(hitResult.buildingId);
  }

  session.destructionPercent = calculateDestructionPercent(layout, session.targetStates);

  // Detect main server destruction
  const building = layout.find((b) => b.id === hitResult.buildingId);
  if (hitResult.destroyed && building?.type === "main_server") {
    session.destroyedMainServer = true;
  }

  return session;
}

// ─── Backward-compatible aliases ─────────────────────────────────────────────
// Some pages still import these names; keep them as aliases to avoid breaking changes.

/** @deprecated Use startNewAttackSession instead */
export const createAttackSession = startNewAttackSession;

/**
 * @deprecated Use resolveAttackHit + applyHitToSession instead.
 * Kept for backward compatibility with attack page.
 */
export function applyDamageToTarget(
  session: AttackSession,
  buildingId: string,
  damage: number,
  destroyed: boolean
): void {
  const existing = session.targetStates.find((t) => t.buildingId === buildingId);
  if (existing) {
    existing.damageDealt += damage;
    existing.destroyed = existing.destroyed || destroyed;
  } else {
    session.targetStates.push({ buildingId, damageDealt: damage, destroyed });
  }
  if (destroyed && !session.destroyedBuildingIds.includes(buildingId)) {
    session.destroyedBuildingIds.push(buildingId);
  }
  if (destroyed && buildingId.includes("main")) {
    session.destroyedMainServer = true;
  }
}

export default {
  startNewAttackSession,
  createAttackSession,
  resolveAttackHit,
  calculateDestructionPercent,
  applyHitToSession,
  applyDamageToTarget,
};
