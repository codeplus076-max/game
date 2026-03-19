import type { PlayerBase } from "@/types/game";
import { starterBase } from "@/data/starterBase";

// MVP repository: in-memory starter base with optional Firestore persistence (if configured)

export async function getPlayerBase(userId: string): Promise<PlayerBase> {
  // For now return a copy of starterBase with userId set
  return { ...starterBase, userId, baseLayout: starterBase.baseLayout.map((b) => ({ ...b })) };
}

export async function updatePlayerBase(base: PlayerBase): Promise<void> {
  // Attempt Firestore persistence if firebase is configured, otherwise no-op (MVP)
  try {
    // dynamic import to avoid requiring firebase in the project
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const firebase = await import("firebase/app");
    // @ts-ignore
    if (!firebase.apps?.length) {
      // no firebase app init detected
      console.warn("Firebase not initialized; skipping remote save for player base.");
      return;
    }
    const { getFirestore, doc, setDoc } = await import("firebase/firestore");
    const db = getFirestore();
    await setDoc(doc(db, "playerBases", base.userId), base, { merge: true });
  } catch (err) {
    // Firestore not available in dev environment — keep in-memory only
    console.warn("playerBasesRepository: Firestore not available, skipping persistence.", err);
    return;
  }
}

export default { getPlayerBase, updatePlayerBase };
