/**
 * Type guards and safe utility functions for Cyber Siege.
 * All functions are pure — no side effects.
 */

// ─── Null / undefined guards ──────────────────────────────────────────────────

/**
 * Type guard: filters out null and undefined values.
 * Useful with Array.filter for producing typed arrays.
 *
 * @example
 * const items = [1, null, 2, undefined].filter(isNonNull); // number[]
 */
export function isNonNull<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

/**
 * Type guard: checks if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

/**
 * Type guard: checks if a value is a finite number (not NaN or Infinity).
 */
export function isFiniteNumber(value: unknown): value is number {
    return typeof value === "number" && Number.isFinite(value);
}

// ─── Safe parsers ─────────────────────────────────────────────────────────────

/**
 * Safely parse a JSON string, returning `fallback` on any error.
 *
 * @example
 * const data = safeParseJSON<MyType>(raw, defaultValue);
 */
export function safeParseJSON<T>(raw: string | null | undefined, fallback: T): T {
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

/**
 * Safely parse an integer from a string or number. Returns `fallback` if parsing fails.
 */
export function safeParseInt(value: unknown, fallback = 0): number {
    const n = parseInt(String(value), 10);
    return Number.isNaN(n) ? fallback : n;
}

/**
 * Safely parse a float from a string or number. Returns `fallback` if parsing fails.
 */
export function safeParseFloat(value: unknown, fallback = 0): number {
    const n = parseFloat(String(value));
    return Number.isFinite(n) ? n : fallback;
}

// ─── Number helpers ───────────────────────────────────────────────────────────

/**
 * Clamp a number between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Ensure a value is within [0, 100].
 */
export function clampPercent(value: number): number {
    return clamp(value, 0, 100);
}

// ─── Exhaustive check ─────────────────────────────────────────────────────────

/**
 * Use in switch/if-else exhaustive checks to get a TypeScript error for unhandled cases.
 *
 * @example
 * switch (status) {
 *   case "idle": ...
 *   case "upgrading": ...
 *   default: assertNever(status); // TS error if a case is missing
 * }
 */
export function assertNever(x: never): never {
    throw new Error(`Unexpected value: ${JSON.stringify(x)}`);
}

export default {
    isNonNull,
    isNonEmptyString,
    isFiniteNumber,
    safeParseJSON,
    safeParseInt,
    safeParseFloat,
    clamp,
    clampPercent,
    assertNever,
};
