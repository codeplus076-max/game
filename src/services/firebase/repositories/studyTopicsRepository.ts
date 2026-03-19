/**
 * Study topics repository for Cyber Siege.
 * Uses dynamic imports for Firebase to gracefully degrade when Firebase is not configured.
 */

import type { StudyTopic } from "@/data/starterStudyContent";
import { starterStudyContent } from "@/data/starterStudyContent";

let _cachedTopics: StudyTopic[] | null = null;

async function _isFirebaseReady(): Promise<boolean> {
    try {
        const firebase = await import("firebase/app");
        return (firebase.getApps?.()).length > 0;
    } catch {
        return false;
    }
}

export async function getStudyTopics(): Promise<StudyTopic[]> {
    if (_cachedTopics) return _cachedTopics;

    if (await _isFirebaseReady()) {
        try {
            const { getFirestore, collection, getDocs } = await import("firebase/firestore");
            const db = getFirestore();
            const snap = await getDocs(collection(db, "studyTopics"));
            if (!snap.empty) {
                const topics = snap.docs.map((d) => d.data() as StudyTopic);
                _cachedTopics = topics;
                return topics;
            }
        } catch {
            // fall through
        }
    }

    _cachedTopics = starterStudyContent;
    return starterStudyContent;
}

export async function getStudyTopicById(id: string): Promise<StudyTopic | null> {
    if (await _isFirebaseReady()) {
        try {
            const { getFirestore, doc, getDoc } = await import("firebase/firestore");
            const snap = await getDoc(doc(getFirestore(), "studyTopics", id));
            if (snap.exists()) return snap.data() as StudyTopic;
        } catch {
            // fall through
        }
    }

    return starterStudyContent.find((t) => t.id === id) ?? null;
}

export function invalidateStudyTopicsCache(): void {
    _cachedTopics = null;
}

export default { getStudyTopics, getStudyTopicById, invalidateStudyTopicsCache };
