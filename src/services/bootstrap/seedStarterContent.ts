/**
 * seedStarterContent – idempotent seeder for questions, study topics, and AI bases.
 *
 * Improvements:
 * - Per-item idempotency: checks doc.exists() before writing each item
 * - Never deletes or overwrites existing data
 * - No-op when Firebase is not configured
 * - Returns detailed seeding statistics
 */

import initFirebaseFromEnv from "@/services/firebase/config";
import { starterQuestions } from "@/data/starterQuestions";
import { starterStudyContent } from "@/data/starterStudyContent";
import { aiBases } from "@/data/aiBases";
import {
  invalidateQuestionsCache,
} from "@/services/firebase/repositories/questionsRepository";
import {
  invalidateStudyTopicsCache,
} from "@/services/firebase/repositories/studyTopicsRepository";
import {
  invalidateAIBasesCache,
} from "@/services/firebase/repositories/aiBasesRepository";

export interface SeedResult {
  seeded: boolean;
  questionsAdded: number;
  studyTopicsAdded: number;
  aiBasesAdded: number;
  reason?: string;
}

/**
 * Seed starter content into Firestore.
 * Per-item idempotent: only writes documents that do not already exist.
 * Safe to call on every boot — will never overwrite existing player or content data.
 */
export async function seedStarterContent(): Promise<SeedResult> {
  const init = initFirebaseFromEnv();
  if (!init?.ok) {
    return { seeded: false, questionsAdded: 0, studyTopicsAdded: 0, aiBasesAdded: 0, reason: init.reason ?? "no-firebase" };
  }

  try {
    const { getFirestore, doc, getDoc, setDoc } = await import("firebase/firestore");
    const db = getFirestore();

    let questionsAdded = 0;
    let studyTopicsAdded = 0;
    let aiBasesAdded = 0;

    // ── Questions ───────────────────────────────────────────────────────────
    for (const q of starterQuestions) {
      try {
        const snap = await getDoc(doc(db, "questions", q.id));
        if (!snap.exists()) {
          await setDoc(doc(db, "questions", q.id), q);
          questionsAdded++;
        }
      } catch {
        // skip this question on error
      }
    }

    // ── Study Topics ────────────────────────────────────────────────────────
    for (const s of starterStudyContent) {
      try {
        const snap = await getDoc(doc(db, "studyTopics", s.id));
        if (!snap.exists()) {
          await setDoc(doc(db, "studyTopics", s.id), s);
          studyTopicsAdded++;
        }
      } catch {
        // skip this topic on error
      }
    }

    // ── AI Bases ────────────────────────────────────────────────────────────
    for (const a of aiBases) {
      try {
        const snap = await getDoc(doc(db, "aiBases", a.id));
        if (!snap.exists()) {
          await setDoc(doc(db, "aiBases", a.id), a);
          aiBasesAdded++;
        }
      } catch {
        // skip this base on error
      }
    }

    // Invalidate caches so next read fetches from Firestore
    if (questionsAdded > 0) invalidateQuestionsCache();
    if (studyTopicsAdded > 0) invalidateStudyTopicsCache();
    if (aiBasesAdded > 0) invalidateAIBasesCache();

    return { seeded: true, questionsAdded, studyTopicsAdded, aiBasesAdded };
  } catch (err) {
    return { seeded: false, questionsAdded: 0, studyTopicsAdded: 0, aiBasesAdded: 0, reason: String(err) };
  }
}

export default seedStarterContent;
