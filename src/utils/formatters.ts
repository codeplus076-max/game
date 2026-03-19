/**
 * Formatting utilities for Cyber Siege.
 * All functions are pure — no side effects.
 */

import type { RewardBreakdown } from "@/services/rewardEngine";

// ─── Currency ─────────────────────────────────────────────────────────────────

/**
 * Format a crypto currency amount.
 * Example: 1250 → "₿ 1,250"
 */
export function formatCrypto(amount: number): string {
    return `₿ ${Math.floor(amount).toLocaleString()}`;
}

/**
 * Format a quiz token count.
 * Example: 45 → "🪙 45"
 */
export function formatTokens(amount: number): string {
    return `🪙 ${Math.floor(amount)}`;
}

// ─── Risk scores ──────────────────────────────────────────────────────────────

/**
 * Format a 0–100 risk score with a label.
 * Example: 75 → "High (75)"
 */
export function formatRiskScore(score: number): string {
    const clamped = Math.max(0, Math.min(100, Math.round(score)));
    let label: string;
    if (clamped >= 65) label = "High";
    else if (clamped >= 35) label = "Moderate";
    else label = "Low";
    return `${label} (${clamped})`;
}

// ─── Attack & reward summaries ────────────────────────────────────────────────

/**
 * Short readable summary of a reward breakdown.
 * Example: "Base: ₿ 30 + Main Server Bonus: ₿ 40 × 1.8 = ₿ 126"
 */
export function rewardSummary(breakdown: RewardBreakdown): string {
    const parts: string[] = [`Base: ${formatCrypto(breakdown.base)}`];
    if (breakdown.bonusMainServer > 0) {
        parts.push(`+ Main Server Bonus: ${formatCrypto(breakdown.bonusMainServer)}`);
    }
    if (breakdown.multiplier !== 1) {
        parts.push(`× ${breakdown.multiplier}`);
    }
    parts.push(`= ${formatCrypto(breakdown.total)}`);
    return parts.join(" ");
}

/**
 * Short readable string of an attack session's outcome.
 * Example: "42% destroyed · Main Server eliminated"
 */
export function buildingAttackSummary(
    destructionPercent: number,
    mainServerDestroyed: boolean,
    destroyedCount: number,
    totalCount: number
): string {
    const parts: string[] = [`${destructionPercent}% destroyed (${destroyedCount}/${totalCount} buildings)`];
    if (mainServerDestroyed) parts.push("Main Server eliminated 💀");
    return parts.join(" · ");
}

/**
 * Format a building level as a string.
 * Example: 2 → "Level 2"
 */
export function formatLevel(level: number): string {
    return `Level ${level}`;
}

/**
 * Format upgrade cost display.
 */
export function formatUpgradeCost(cost: number): string {
    return cost === 0 ? "Free" : formatCrypto(cost);
}

export default {
    formatCrypto,
    formatTokens,
    formatRiskScore,
    rewardSummary,
    buildingAttackSummary,
    formatLevel,
    formatUpgradeCost,
};
