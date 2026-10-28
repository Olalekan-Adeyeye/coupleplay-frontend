/**
 * URL params carrying JSON (scores, roundsWon) can arrive malformed —
 * e.g. truncated by a share sheet. Parse defensively instead of crashing.
 */
export function parseJsonParam<T>(raw: string | undefined | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
