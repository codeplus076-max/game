"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { FeedbackProvider } from "@/components/common/FeedbackToast";
import bootstrapApp from "@/services/bootstrap/bootstrapApp";
import { BootstrapState, initialBootstrapState } from "@/services/bootstrap/status";

type BootstrapContextType = {
  bootstrap: BootstrapState;
  runBootstrap: () => Promise<void>;
};

const BootstrapContext = createContext<BootstrapContextType | null>(null);

export function useBootstrap() {
  const ctx = useContext(BootstrapContext);
  if (!ctx) throw new Error("useBootstrap must be used inside AppProviders");
  return ctx;
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [bootstrap, setBootstrap] = useState<BootstrapState>(initialBootstrapState);

  async function runBootstrap() {
    if (bootstrap.status === "running") return;
    setBootstrap({ status: "running", error: null });
    try {
      const res = await bootstrapApp();
      if (!res.ok) {
        const err = res.error ?? (res.seedResult?.reason) ?? "unknown";
        console.error("bootstrapApp failed:", res);
        setBootstrap({ status: "error", error: String(err) });
      } else {
        // treat no-firebase as success (no-op) but keep reason available
        const maybeReason = (res.seedResult && res.seedResult.reason) ?? res.reason ?? null;
        setBootstrap({ status: "success", error: maybeReason });
      }
    } catch (err) {
      console.error("bootstrapApp threw:", err);
      setBootstrap({ status: "error", error: String(err) });
    }
  }

  useEffect(() => {
    // run once after mount; this is safe for MVP and will no-op when Firebase not configured
    // do not block rendering; run async and ignore result beyond state
    const t = setTimeout(() => {
      runBootstrap().catch((e) => console.error(e));
    }, 120);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FeedbackProvider>
      <BootstrapContext.Provider value={{ bootstrap, runBootstrap }}>
        {children}
      </BootstrapContext.Provider>
    </FeedbackProvider>
  );
}
