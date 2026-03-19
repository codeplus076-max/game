/**
 * useGameData – lightweight shared hook for base and user state.
 *
 * Provides:
 * - base: PlayerBase | null
 * - user: UserRecord | null
 * - isLoading: boolean
 * - refreshBase(): re-fetch base from repository
 * - refreshUser(): re-fetch user from repository
 * - refreshAll(): refresh both
 *
 * Listens to "gamedata:updated" CustomEvent dispatched by repositories
 * to automatically re-fetch when any mutation occurs.
 *
 * On mount: runs checkAndFinalizeOnLoad to handle any upgrades that
 * completed while the user was away.
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PlayerBase } from "@/types/game";
import type { UserRecord } from "@/services/firebase/repositories/usersRepository";
import { getPlayerBase } from "@/services/firebase/repositories/playerBasesRepository";
import { getUser } from "@/services/firebase/repositories/usersRepository";
import { checkAndFinalizeOnLoad } from "@/services/timerEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GameDataState {
    base: PlayerBase | null;
    user: UserRecord | null;
    isLoading: boolean;
    refreshBase: () => Promise<void>;
    refreshUser: () => Promise<void>;
    refreshAll: () => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Hook to get and subscribe to player base and user data.
 * @param userId - authenticated user ID, or null/undefined when not logged in
 */
export function useGameData(userId: string | null | undefined): GameDataState {
    const [base, setBase] = useState<PlayerBase | null>(null);
    const [user, setUser] = useState<UserRecord | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Track whether mount-time finalization has run
    const initRef = useRef(false);

    const refreshBase = useCallback(async () => {
        if (!userId) return;
        try {
            const b = await getPlayerBase(userId);
            setBase(b);
        } catch (err) {
            console.warn("useGameData: failed to refresh base", err);
        }
    }, [userId]);

    const refreshUser = useCallback(async () => {
        if (!userId) return;
        try {
            const u = await getUser(userId);
            setUser(u);
        } catch (err) {
            console.warn("useGameData: failed to refresh user", err);
        }
    }, [userId]);

    const refreshAll = useCallback(async () => {
        if (!userId) return;
        await Promise.all([refreshBase(), refreshUser()]);
    }, [userId, refreshBase, refreshUser]);

    // Initial load + check for expired upgrades on mount
    useEffect(() => {
        if (!userId || initRef.current) return;
        initRef.current = true;

        let cancelled = false;

        const init = async () => {
            setIsLoading(true);
            try {
                // Finalize any upgrades that expired while the user was away
                await checkAndFinalizeOnLoad(userId);
                if (cancelled) return;
                await Promise.all([refreshBase(), refreshUser()]);
            } catch (err) {
                console.warn("useGameData: init error", err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        init();

        return () => {
            cancelled = true;
        };
    }, [userId, refreshBase, refreshUser]);

    // React to repository mutations via the "gamedata:updated" CustomEvent
    useEffect(() => {
        if (!userId || typeof window === "undefined") return;

        const handler = (event: Event) => {
            const detail = (event as CustomEvent<{ type?: string }>).detail;
            if (detail?.type === "base") {
                refreshBase().catch(() => { });
            } else if (detail?.type === "user") {
                refreshUser().catch(() => { });
            } else {
                // Generic: refresh both
                refreshAll().catch(() => { });
            }
        };

        window.addEventListener("gamedata:updated", handler);
        return () => window.removeEventListener("gamedata:updated", handler);
    }, [userId, refreshBase, refreshUser, refreshAll]);

    // Reset when userId changes (logout / switch)
    useEffect(() => {
        if (!userId) {
            setBase(null);
            setUser(null);
            initRef.current = false;
        }
    }, [userId]);

    return { base, user, isLoading, refreshBase, refreshUser, refreshAll };
}

export default useGameData;
