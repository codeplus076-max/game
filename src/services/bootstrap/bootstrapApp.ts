/**
 * bootstrapApp – runs once after Firebase auth is established.
 *
 * Improvements:
 * - Accepts optional userId to create/ensure user record on first boot
 * - No-ops cleanly when Firebase config is missing
 * - Runs seedStarterContent idempotently
 * - Returns structured result for caller to log or display
 */

import initFirebaseFromEnv from "@/services/firebase/config";
import { seedStarterContent } from "./seedStarterContent";
import { ensureUserRecord } from "@/services/firebase/repositories/usersRepository";

export interface BootstrapResult {
  ok: boolean;
  firebase: boolean;
  seedResult?: { seeded: boolean; reason?: string };
  error?: string;
  reason?: string;
}

/**
 * Run app bootstrap after auth is available.
 * @param userId - optional authenticated user ID; when provided, ensures user record exists
 */
export async function bootstrapApp(userId?: string): Promise<BootstrapResult> {
  const init = initFirebaseFromEnv();

  if (!init.ok) {
    // Firebase not configured — safe no-op (works in local-only mode)
    return { ok: true, firebase: false, reason: init.reason };
  }

  try {
    const seedResult = await seedStarterContent();

    if (userId) {
      try {
        await ensureUserRecord(userId);
      } catch (err) {
        console.warn("bootstrapApp: failed to ensure user record", err);
      }
    }

    return { ok: true, firebase: true, seedResult };
  } catch (err) {
    return { ok: false, firebase: true, error: String(err) };
  }
}

export default bootstrapApp;
