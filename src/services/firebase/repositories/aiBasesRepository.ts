/**
 * AI Bases repository for Cyber Siege.
 * Uses dynamic imports for Firebase to gracefully degrade when Firebase is not configured.
 */

import type { AIPresetBase } from "@/types/game";
import { aiBases as localAiBases } from "@/data/aiBases";

let _cachedBases: AIPresetBase[] | null = null;

async function _isFirebaseReady(): Promise<boolean> {
    try {
        const firebase = await import("firebase/app");
        return (firebase.getApps?.()).length > 0;
    } catch {
        return false;
    }
}

export async function getAIBases(): Promise<AIPresetBase[]> {
    if (_cachedBases) return _cachedBases;

    if (await _isFirebaseReady()) {
        try {
            const { getFirestore, collection, getDocs } = await import("firebase/firestore");
            const db = getFirestore();
            const snap = await getDocs(collection(db, "aiBases"));
            if (!snap.empty) {
                const bases = snap.docs.map((d) => d.data() as AIPresetBase);
                _cachedBases = bases;
                return bases;
            }
        } catch {
            // fall through
        }
    }

    _cachedBases = localAiBases;
    return localAiBases;
}

export async function getAIBaseById(id: string): Promise<AIPresetBase | null> {
    if (await _isFirebaseReady()) {
        try {
            const { getFirestore, doc, getDoc } = await import("firebase/firestore");
            const snap = await getDoc(doc(getFirestore(), "aiBases", id));
            if (snap.exists()) return snap.data() as AIPresetBase;
        } catch {
            // fall through
        }
    }

    return localAiBases.find((b) => b.id === id) ?? null;
}

export function invalidateAIBasesCache(): void {
    _cachedBases = null;
}

export default { getAIBases, getAIBaseById, invalidateAIBasesCache };
