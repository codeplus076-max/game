export interface UserRecord {
  userId: string;
  cryptoCurrency: number;
  quizTokens: number;
}

// Simple in-memory user store for MVP
const users = new Map<string, UserRecord>();

function ensureUser(userId: string) {
  if (!users.has(userId)) {
    users.set(userId, { userId, cryptoCurrency: 1000, quizTokens: 0 });
  }
  return users.get(userId)!;
}

export async function getUser(userId: string): Promise<UserRecord> {
  const lsKey = `user:${userId}`;
  try {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(lsKey) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as UserRecord;
      // hydrate in-memory
      users.set(userId, parsed);
      return parsed;
    }
  } catch (e) {
    // ignore
  }
  return ensureUser(userId);
}

export async function deductCrypto(userId: string, amount: number): Promise<boolean> {
  const u = ensureUser(userId);
  if (u.cryptoCurrency < amount) return false;
  u.cryptoCurrency -= amount;
  persistUserLocally(userId, u);
  try {
    const firebase = await import("firebase/app");
    // @ts-ignore
    if (!firebase.apps?.length) return true;
    const { getFirestore, doc, setDoc } = await import("firebase/firestore");
    const db = getFirestore();
    await setDoc(doc(db, "users", userId), { cryptoCurrency: u.cryptoCurrency }, { merge: true });
  } catch (err) {
    // ignore
  }

  return true;
}

export async function deductQuizTokens(userId: string, amount: number): Promise<boolean> {
  const u = ensureUser(userId);
  if (u.quizTokens < amount) return false;
  u.quizTokens -= amount;
  persistUserLocally(userId, u);
  try {
    const firebase = await import("firebase/app");
    // @ts-ignore
    if (!firebase.apps?.length) return true;
    const { getFirestore, doc, setDoc } = await import("firebase/firestore");
    const db = getFirestore();
    await setDoc(doc(db, "users", userId), { quizTokens: u.quizTokens }, { merge: true });
  } catch (err) {
    // ignore
  }

  return true;
}

export async function addQuizTokens(userId: string, amount: number): Promise<boolean> {
  const u = ensureUser(userId);
  u.quizTokens += amount;
  persistUserLocally(userId, u);
  try {
    const firebase = await import("firebase/app");
    // @ts-ignore
    if (!firebase.apps?.length) return true;
    const { getFirestore, doc, setDoc } = await import("firebase/firestore");
    const db = getFirestore();
    await setDoc(doc(db, "users", userId), { quizTokens: u.quizTokens }, { merge: true });
  } catch (err) {
    // ignore
  }

  return true;
}

export async function addCrypto(userId: string, amount: number): Promise<boolean> {
  const u = ensureUser(userId);
  u.cryptoCurrency += amount;
  persistUserLocally(userId, u);
  try {
    const firebase = await import("firebase/app");
    // @ts-ignore
    if (!firebase.apps?.length) return true;
    const { getFirestore, doc, setDoc } = await import("firebase/firestore");
    const db = getFirestore();
    await setDoc(doc(db, "users", userId), { cryptoCurrency: u.cryptoCurrency }, { merge: true });
  } catch (err) {
    // ignore
  }

  return true;
}

function persistUserLocally(userId: string, record: UserRecord) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`user:${userId}`, JSON.stringify(record));
    }
  } catch (e) {
    // ignore
  }
}

export default { getUser, deductCrypto, deductQuizTokens, addQuizTokens, addCrypto };
