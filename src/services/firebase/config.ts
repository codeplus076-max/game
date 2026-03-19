// Lightweight Firebase client initializer with safe guards
import { initializeApp, getApps } from "firebase/app";
import type { FirebaseOptions } from "firebase/app";

export type InitResult = { ok: boolean; reason?: string };

export function initFirebaseFromEnv(): InitResult {
  try {
    const raw = process.env.NEXT_PUBLIC_FIREBASE_CONFIG || (globalThis as any)?.FIREBASE_CONFIG;
    if (!raw) return { ok: false, reason: "no-config" };
    let config: FirebaseOptions;
    if (typeof raw === "string") {
      try { config = JSON.parse(raw); } catch (e) { return { ok: false, reason: "invalid-json" }; }
    } else {
      config = raw as any;
    }

    if (!config || !config.projectId) return { ok: false, reason: "invalid-config" };
    if (!getApps().length) initializeApp(config);
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: String(err) };
  }
}

export default initFirebaseFromEnv;
