/**
 * Date and time utilities for Cyber Siege.
 * All functions are pure — no side effects.
 */

// ─── Remaining time ───────────────────────────────────────────────────────────

/**
 * Returns ms remaining until an ISO timestamp. Returns 0 if expired or missing.
 */
export function msUntil(isoString: string | null | undefined): number {
    if (!isoString) return 0;
    return Math.max(0, Date.parse(isoString) - Date.now());
}

/**
 * Returns true if an ISO timestamp has passed.
 */
export function isExpired(isoString: string | null | undefined): boolean {
    if (!isoString) return true;
    return Date.parse(isoString) <= Date.now();
}

// ─── Formatting ───────────────────────────────────────────────────────────────

/**
 * Format milliseconds as a short "Xm Ys" or "Xs" string.
 * Examples: 150000 → "2m 30s", 45000 → "45s", 0 → "0s"
 */
export function formatTimeRemaining(ms: number): string {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
        return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
    }
    return `${seconds}s`;
}

/**
 * Format milliseconds as a human-readable duration.
 * Examples: 180000 → "3 minutes", 3600000 → "1 hour", 90000 → "1 minute 30 seconds"
 */
export function formatDuration(ms: number): string {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
    if (seconds > 0 && hours === 0) parts.push(`${seconds} ${seconds === 1 ? "second" : "seconds"}`);

    return parts.join(" ") || "0 seconds";
}

/**
 * Format an ISO timestamp as a short date string.
 * Example: "Mar 19, 2026"
 */
export function formatDate(isoString: string | null | undefined): string {
    if (!isoString) return "—";
    try {
        return new Date(isoString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

/**
 * Returns a time-ago string (e.g. "2 minutes ago", "just now").
 */
export function timeAgo(isoString: string | null | undefined): string {
    if (!isoString) return "never";
    const diffMs = Date.now() - Date.parse(isoString);
    if (diffMs < 0) return "just now";
    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export default { msUntil, isExpired, formatTimeRemaining, formatDuration, formatDate, timeAgo };
