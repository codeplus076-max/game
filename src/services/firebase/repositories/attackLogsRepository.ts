/**
 * Firebase-backed attack logs repository for Cyber Siege.
 * Uses dynamic imports for Firebase to gracefully degrade when Firebase is not configured.
 */

import type { AttackSession } from "@/types/game";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AttackLogEntry {
  id: string;
  userId: string;
  session: AttackSession;
  createdAt: string;
}

// ─── In-memory fallback ───────────────────────────────────────────────────────

const _local: AttackLogEntry[] = [];
const LOCAL_LIMIT = 50;

async function _isFirebaseReady(): Promise<boolean> {
  try {
    const firebase = await import("firebase/app");
    return (firebase.getApps?.()).length > 0;
  } catch {
    return false;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function saveAttackLog(userId: string, session: AttackSession): Promise<string> {
  const createdAt = new Date().toISOString();
  const localId = `local-${userId}-${Date.now()}`;

  const entry: AttackLogEntry = { id: localId, userId, session, createdAt };
  _local.push(entry);
  if (_local.length > LOCAL_LIMIT) _local.shift();

  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, collection, addDoc } = await import("firebase/firestore");
      const db = getFirestore();
      const ref = await addDoc(collection(db, "attackLogs"), { userId, session, createdAt });
      entry.id = ref.id;
      return ref.id;
    } catch (err) {
      console.warn("attackLogsRepository: Firestore write failed.", err);
    }
  }

  return localId;
}

export async function getLatestAttackLog(userId: string): Promise<AttackLogEntry | null> {
  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore");
      const db = getFirestore();
      const q = query(
        collection(db, "attackLogs"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        return { id: d.id, ...(d.data() as Omit<AttackLogEntry, "id">) };
      }
    } catch {
      // fall through to local
    }
  }

  for (let i = _local.length - 1; i >= 0; i--) {
    if (_local[i].userId === userId) return _local[i];
  }
  return null;
}

export async function getAttackLogs(userId: string, maxCount = 10): Promise<AttackLogEntry[]> {
  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, collection, query, where, orderBy, limit, getDocs } = await import("firebase/firestore");
      const db = getFirestore();
      const q = query(
        collection(db, "attackLogs"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(maxCount)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AttackLogEntry, "id">) }));
      }
    } catch {
      // fall through to local
    }
  }

  return _local
    .filter((e) => e.userId === userId)
    .slice(-maxCount)
    .reverse();
}

export default { saveAttackLog, getLatestAttackLog, getAttackLogs };
