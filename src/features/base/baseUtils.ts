/**
 * baseUtils – pure helpers for building display, defense scoring, and status strings.
 */

import type { BuildingInstance, PlayerBase, AuditReport } from "@/types/game";
import type { BuildingType } from "@/types/common";
import constants from "@/data/constants";

// ─── Display names ────────────────────────────────────────────────────────────

const BUILDING_DISPLAY_NAMES: Record<BuildingType, string> = {
    main_server: "Main Server",
    firewall_tower: "Firewall Tower",
    patch_center: "Patch Center",
    backup_center: "Backup Center",
};

const BUILDING_ICONS: Record<BuildingType, string> = {
    main_server: "🖥️",
    firewall_tower: "🔥",
    patch_center: "🩹",
    backup_center: "💾",
};

/**
 * Human-readable display name for a building type.
 */
export function getBuildingDisplayName(type: BuildingType | string): string {
    return BUILDING_DISPLAY_NAMES[type as BuildingType] ?? type.replace(/_/g, " ");
}

/**
 * Emoji icon for a building type.
 */
export function getBuildingIcon(type: BuildingType | string): string {
    return BUILDING_ICONS[type as BuildingType] ?? "🏢";
}

// ─── Upgrade status ───────────────────────────────────────────────────────────

export type BuildingUpgradeStatus = "idle" | "upgrading" | "max_level" | "destroyed";

/**
 * Current upgrade status of a building instance.
 */
export function getBuildingUpgradeStatus(building: BuildingInstance): BuildingUpgradeStatus {
    if (building.isDestroyed) return "destroyed";
    if (building.isUpgrading) return "upgrading";
    if (building.level >= constants.MAX_BUILDING_LEVEL) return "max_level";
    return "idle";
}

// ─── Defense score ────────────────────────────────────────────────────────────

/**
 * Derive a 0–100 defense score from the base layout.
 * Weighted by building type importance and current level.
 */
export function deriveDefenseScore(base: PlayerBase): number {
    if (!base.baseLayout.length) return 0;

    const weights: Record<BuildingType, number> = {
        main_server: 0.4,
        firewall_tower: 0.25,
        patch_center: 0.2,
        backup_center: 0.15,
    };

    let score = 0;
    let totalWeight = 0;

    for (const building of base.baseLayout) {
        const w = weights[building.type] ?? 0.1;
        const levelScore = (building.level / constants.MAX_BUILDING_LEVEL) * 100;
        const healthScore = building.maxHealth > 0 ? (building.health / building.maxHealth) * 100 : 0;
        const buildingScore = levelScore * 0.7 + healthScore * 0.3;
        score += buildingScore * w;
        totalWeight += w;
    }

    return Math.round(totalWeight > 0 ? score / totalWeight : 0);
}

// ─── Audit summary ────────────────────────────────────────────────────────────

/**
 * Short human-readable audit summary from the latest report.
 */
export function getLatestAuditSummary(report: AuditReport | null | undefined): string {
    if (!report) return "No audit run yet. Generate a report to see your vulnerabilities.";
    const risk = report.overallRiskScore;
    const label = risk > 60 ? "High" : risk > 35 ? "Moderate" : "Low";
    const weakest = report.weakestTargetBuildingId
        ? getBuildingDisplayName(report.findings.find((f) => f.buildingId === report.weakestTargetBuildingId)?.buildingType ?? "")
        : "unknown";
    return `Risk: ${label} (${risk}/100) — Weakest: ${weakest}`;
}

// ─── Attack summary ───────────────────────────────────────────────────────────

/**
 * Short readable summary of an attack session result.
 */
export function getAttackSessionSummary(
    destructionPercent: number,
    mainServerDestroyed: boolean
): string {
    const parts: string[] = [`${destructionPercent}% destruction`];
    if (mainServerDestroyed) parts.push("Main Server taken down");
    return parts.join(" · ");
}

export default {
    getBuildingDisplayName,
    getBuildingIcon,
    getBuildingUpgradeStatus,
    deriveDefenseScore,
    getLatestAuditSummary,
    getAttackSessionSummary,
};
