/**
 * Questions repository for Cyber Siege.
 * Uses dynamic imports for Firebase to gracefully degrade when Firebase is not configured.
 */

import type { Question } from "@/types/questions";
import { starterQuestions } from "@/data/starterQuestions";

let _cachedQuestions: Question[] | null = null;

async function _isFirebaseReady(): Promise<boolean> {
    try {
        const firebase = await import("firebase/app");
        return (firebase.getApps?.()).length > 0;
    } catch {
        return false;
    }
}

export async function getQuestions(): Promise<Question[]> {
    if (_cachedQuestions) return _cachedQuestions;

    if (await _isFirebaseReady()) {
        try {
            const { getFirestore, collection, getDocs } = await import("firebase/firestore");
            const db = getFirestore();
            const snap = await getDocs(collection(db, "questions"));
            if (!snap.empty) {
                const questions = snap.docs.map((d) => d.data() as Question);
                _cachedQuestions = questions;
                return questions;
            }
        } catch {
            // fall through
        }
    }

    _cachedQuestions = starterQuestions;
    return starterQuestions;
}

export async function getQuestionById(id: string): Promise<Question | null> {
    if (await _isFirebaseReady()) {
        try {
            const { getFirestore, doc, getDoc } = await import("firebase/firestore");
            const snap = await getDoc(doc(getFirestore(), "questions", id));
            if (snap.exists()) return snap.data() as Question;
        } catch {
            // fall through
        }
    }

    return starterQuestions.find((q) => q.id === id) ?? null;
}

export function invalidateQuestionsCache(): void {
    _cachedQuestions = null;
}

export default { getQuestions, getQuestionById, invalidateQuestionsCache };
