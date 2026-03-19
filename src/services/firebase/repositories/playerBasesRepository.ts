/**
 * Firebase-backed player base repository for Cyber Siege.
 * Uses dynamic imports for Firebase to gracefully degrade when Firebase is not configured.
 * Priority for reads: Firestore → localStorage → freshly-cloned starter base.
 */

import type { PlayerBase, ActiveUpgrade, BuildingInstance } from "@/types/game";
import { starterBase } from "@/data/starterBase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const _cache = new Map<string, PlayerBase>();

function _cloneStarter(userId: string): PlayerBase {
  return {
    ...starterBase,
    userId,
    baseLayout: starterBase.baseLayout.map((b) => ({ ...b })),
    activeUpgrades: [],
    updatedAt: new Date().toISOString(),
  };
}

async function _isFirebaseReady(): Promise<boolean> {
  try {
    const firebase = await import("firebase/app");
    return (firebase.getApps?.()).length > 0;
  } catch {
    return false;
  }
}

function _lsKey(userId: string) {
  return `playerBase:${userId}`;
}

function _fromLocalStorage(userId: string): PlayerBase | null {
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(_lsKey(userId));
      if (raw) return JSON.parse(raw) as PlayerBase;
    }
  } catch {
    // ignore
  }
  return null;
}

function _writeLocalStorage(base: PlayerBase): void {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(_lsKey(base.userId), JSON.stringify(base));
    }
  } catch {
    // ignore
  }
}

function _dispatchUpdate(): void {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gamedata:updated", { detail: { type: "base" } }));
    }
  } catch {
    // ignore
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getPlayerBase(userId: string): Promise<PlayerBase> {
  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, doc, getDoc } = await import("firebase/firestore");
      const db = getFirestore();
      const snap = await getDoc(doc(db, "playerBases", userId));
      if (snap.exists()) {
        const base = snap.data() as PlayerBase;
        _cache.set(userId, base);
        _writeLocalStorage(base);
        return base;
      }
    } catch {
      // fall through
    }
  }

  const fromLS = _fromLocalStorage(userId);
  if (fromLS) {
    _cache.set(userId, fromLS);
    return fromLS;
  }

  const cached = _cache.get(userId);
  if (cached) return cached;

  const fresh = _cloneStarter(userId);
  _cache.set(userId, fresh);
  _writeLocalStorage(fresh);
  return fresh;
}

export async function updatePlayerBase(base: PlayerBase): Promise<void> {
  const stamped = { ...base, updatedAt: new Date().toISOString() };
  _cache.set(stamped.userId, stamped);
  _writeLocalStorage(stamped);

  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, doc, setDoc } = await import("firebase/firestore");
      const db = getFirestore();
      await setDoc(doc(db, "playerBases", stamped.userId), stamped, { merge: true });
    } catch (err) {
      console.warn("playerBasesRepository: Firestore write failed, using local only.", err);
    }
  }

  _dispatchUpdate();
}

export async function updateActiveUpgrades(userId: string, upgrades: ActiveUpgrade[]): Promise<void> {
  const base = await getPlayerBase(userId);
  base.activeUpgrades = upgrades;
  await updatePlayerBase(base);
}

export async function patchBuilding(
  userId: string,
  buildingId: string,
  patch: Partial<BuildingInstance>
): Promise<PlayerBase> {
  const base = await getPlayerBase(userId);
  const idx = base.baseLayout.findIndex((b) => b.id === buildingId);
  if (idx !== -1) {
    base.baseLayout[idx] = { ...base.baseLayout[idx], ...patch };
  }
  await updatePlayerBase(base);
  return base;
}

export async function setLastAuditReportId(userId: string, reportId: string): Promise<void> {
  const base = await getPlayerBase(userId);
  base.lastAuditReportId = reportId;
  _cache.set(userId, base);
  _writeLocalStorage(base);

  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(getFirestore(), "playerBases", userId), { lastAuditReportId: reportId });
    } catch {
      try {
        const { getFirestore, doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(getFirestore(), "playerBases", userId), { lastAuditReportId: reportId }, { merge: true });
      } catch { /* ignore */ }
    }
  }
}

export default { getPlayerBase, updatePlayerBase, updateActiveUpgrades, patchBuilding, setLastAuditReportId };
