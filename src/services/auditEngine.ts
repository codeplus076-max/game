/**
 * Audit engine for Cyber Siege – generates deterministic security audit reports.
 *
 * Fixed in this version:
 * - Removed duplicate generateAuditReport export (was causing TS compile error)
 * - Single clean implementation using crypto.randomUUID and sorted findings
 * - Persists lastAuditReportId via focused repository method
 */

import type { AuditFinding, AuditReport, PlayerBase } from "@/types/game";
import { setLastAuditReportId } from "@/services/firebase/repositories/playerBasesRepository";

// ─── Internal helpers ─────────────────────────────────────────────────────────

function getBuildingRiskScore(type: string, level: number): number {
  const baseRiskByType: Record<string, number> = {
    main_server: 70,
    firewall_tower: 85,
    patch_center: 80,
    backup_center: 75,
  };

  const base = baseRiskByType[type] ?? 50;
  const reduction = (level - 1) * 20;
  return Math.max(10, base - reduction);
}

interface WeaknessProfile {
  weaknessFound: string;
  attackMethod: string;
  estimatedDamage: string;
  recommendation: string;
  relatedTopics: string[];
}

function mapWeakness(type: string): WeaknessProfile {
  switch (type) {
    case "firewall_tower":
      return {
        weaknessFound: "Misconfigured filtering rules",
        attackMethod: "Network intrusion through exposed traffic paths",
        estimatedDamage: "Medium to high perimeter breach risk",
        recommendation: "Upgrade Firewall Tower and review filtering policy",
        relatedTopics: ["firewalls", "network_security"],
      };
    case "patch_center":
      return {
        weaknessFound: "Unpatched services and known exploits",
        attackMethod: "Exploit chain against outdated components",
        estimatedDamage: "High exploit likelihood",
        recommendation: "Upgrade Patch Center and prioritize patch hygiene",
        relatedTopics: ["patching", "malware"],
      };
    case "backup_center":
      return {
        weaknessFound: "Weak restore readiness",
        attackMethod: "Ransomware-style disruption with poor recovery",
        estimatedDamage: "High downtime and recovery risk",
        recommendation: "Upgrade Backup Center and improve restore strategy",
        relatedTopics: ["backups", "ransomware"],
      };
    default: // main_server
      return {
        weaknessFound: "Core infrastructure exposure",
        attackMethod: "Critical service compromise via weak auth or misconfiguration",
        estimatedDamage: "Critical operational damage",
        recommendation: "Strengthen authentication, enforce MFA, and harden supporting defenses",
        relatedTopics: ["authentication", "encryption"],
      };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate a security audit report for a player's base.
 * Findings are sorted by risk score descending (highest risk first).
 * Persists lastAuditReportId to the player base asynchronously.
 */
export function generateAuditReport(playerBase: PlayerBase): AuditReport {
  const findings: AuditFinding[] = playerBase.baseLayout.map((building) => {
    const riskScore = getBuildingRiskScore(building.type, building.level);
    const mapped = mapWeakness(building.type);

    return {
      buildingId: building.id,
      buildingType: building.type,
      riskScore,
      weaknessFound: mapped.weaknessFound,
      attackMethod: mapped.attackMethod,
      estimatedDamage: mapped.estimatedDamage,
      recommendation: mapped.recommendation,
      relatedTopics: [...mapped.relatedTopics] as AuditFinding["relatedTopics"],
    };
  });

  findings.sort((a, b) => b.riskScore - a.riskScore);

  const weakest = findings[0];
  const overallRiskScore = findings.length > 0
    ? Math.round(findings.reduce((sum, f) => sum + f.riskScore, 0) / findings.length)
    : 0;

  const report: AuditReport = {
    id: crypto.randomUUID(),
    userId: playerBase.userId,
    createdAt: new Date().toISOString(),
    weakestTargetBuildingId: weakest?.buildingId ?? "",
    overallRiskScore,
    findings,
    summary: weakest
      ? `Your weakest area is ${weakest.buildingType.replace(/_/g, " ")}, mainly due to ${weakest.weaknessFound.toLowerCase()}.`
      : "No findings to report.",
    learningSummary: weakest
      ? `Focus on ${weakest.relatedTopics.join(", ")} to reduce your most likely breach path.`
      : "Keep maintaining strong security practices.",
  };

  // Persist lastAuditReportId asynchronously — do not block the caller
  setLastAuditReportId(playerBase.userId, report.id).catch((err) => {
    console.warn("auditEngine: failed to persist lastAuditReportId", err);
  });

  return report;
}

export default { generateAuditReport };
