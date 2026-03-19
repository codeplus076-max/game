/**
 * Firebase-backed user repository for Cyber Siege.
 * Uses dynamic imports for Firebase to gracefully degrade when Firebase is not configured.
 * Priority: Firestore → localStorage cache → in-memory fallback.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRecord {
  userId: string;
  cryptoCurrency: number;
  quizTokens: number;
}

// ─── In-memory cache ──────────────────────────────────────────────────────────

const _cache = new Map<string, UserRecord>();

function _makeDefault(userId: string): UserRecord {
  return { userId, cryptoCurrency: 1000, quizTokens: 0 };
}

function _persist(record: UserRecord): void {
  _cache.set(record.userId, record);
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`user:${record.userId}`, JSON.stringify(record));
    }
  } catch {
    // localStorage not available
  }
}

function _fromLocalStorage(userId: string): UserRecord | null {
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(`user:${userId}`);
      if (raw) return JSON.parse(raw) as UserRecord;
    }
  } catch {
    // ignore
  }
  return null;
}

async function _isFirebaseReady(): Promise<boolean> {
  try {
    const firebase = await import("firebase/app");
    return (firebase.getApps?.()).length > 0;
  } catch {
    return false;
  }
}

function _dispatchUpdate(): void {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("gamedata:updated", { detail: { type: "user" } }));
    }
  } catch {
    // ignore
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getUser(userId: string): Promise<UserRecord> {
  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, doc, getDoc } = await import("firebase/firestore");
      const db = getFirestore();
      const snap = await getDoc(doc(db, "users", userId));
      if (snap.exists()) {
        const data = snap.data();
        const record: UserRecord = {
          userId,
          cryptoCurrency: typeof data.cryptoCurrency === "number" ? data.cryptoCurrency : 1000,
          quizTokens: typeof data.quizTokens === "number" ? data.quizTokens : 0,
        };
        _persist(record);
        return record;
      }
    } catch {
      // fall through to cache/localStorage
    }
  }

  const fromLS = _fromLocalStorage(userId);
  if (fromLS) {
    _cache.set(userId, fromLS);
    return fromLS;
  }

  const cached = _cache.get(userId);
  if (cached) return cached;

  const fresh = _makeDefault(userId);
  _persist(fresh);
  return fresh;
}

export async function ensureUserRecord(userId: string): Promise<UserRecord> {
  const existing = await getUser(userId);

  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, doc, getDoc, setDoc } = await import("firebase/firestore");
      const db = getFirestore();
      const snap = await getDoc(doc(db, "users", userId));
      if (!snap.exists()) {
        await setDoc(doc(db, "users", userId), existing, { merge: true });
      }
    } catch {
      // ignore
    }
  }

  return existing;
}

export async function deductCrypto(userId: string, amount: number): Promise<boolean> {
  const user = await getUser(userId);
  if (user.cryptoCurrency < amount) return false;

  user.cryptoCurrency -= amount;
  _persist(user);

  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, doc, updateDoc } = await import("firebase/firestore");
      const db = getFirestore();
      await updateDoc(doc(db, "users", userId), { cryptoCurrency: user.cryptoCurrency });
    } catch {
      try {
        const { getFirestore, doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(getFirestore(), "users", userId), { cryptoCurrency: user.cryptoCurrency }, { merge: true });
      } catch { /* ignore */ }
    }
  }

  _dispatchUpdate();
  return true;
}

export async function addCrypto(userId: string, amount: number): Promise<boolean> {
  const user = await getUser(userId);
  user.cryptoCurrency += amount;
  _persist(user);

  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(getFirestore(), "users", userId), { cryptoCurrency: user.cryptoCurrency });
    } catch {
      try {
        const { getFirestore, doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(getFirestore(), "users", userId), { cryptoCurrency: user.cryptoCurrency }, { merge: true });
      } catch { /* ignore */ }
    }
  }

  _dispatchUpdate();
  return true;
}

export async function deductQuizTokens(userId: string, amount: number): Promise<boolean> {
  const user = await getUser(userId);
  if (user.quizTokens < amount) return false;

  user.quizTokens -= amount;
  _persist(user);

  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(getFirestore(), "users", userId), { quizTokens: user.quizTokens });
    } catch {
      try {
        const { getFirestore, doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(getFirestore(), "users", userId), { quizTokens: user.quizTokens }, { merge: true });
      } catch { /* ignore */ }
    }
  }

  _dispatchUpdate();
  return true;
}

export async function addQuizTokens(userId: string, amount: number): Promise<boolean> {
  const user = await getUser(userId);
  user.quizTokens += amount;
  _persist(user);

  if (await _isFirebaseReady()) {
    try {
      const { getFirestore, doc, updateDoc } = await import("firebase/firestore");
      await updateDoc(doc(getFirestore(), "users", userId), { quizTokens: user.quizTokens });
    } catch {
      try {
        const { getFirestore, doc, setDoc } = await import("firebase/firestore");
        await setDoc(doc(getFirestore(), "users", userId), { quizTokens: user.quizTokens }, { merge: true });
      } catch { /* ignore */ }
    }
  }

  _dispatchUpdate();
  return true;
}

export default { getUser, ensureUserRecord, deductCrypto, addCrypto, deductQuizTokens, addQuizTokens };
