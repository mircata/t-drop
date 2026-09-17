/**
 * Formatting for the "до следващия дроп" counter on /about. Lives here rather than
 * in the client component so the server can render the first value and the client
 * can keep ticking it with the exact same code — the two must agree on the initial
 * string or hydration complains.
 */

/** dd:hh:mm:ss left until `target`, zero-padded, clamped at zero once the date has passed. */
export function formatCountdown(target: number, now: number = Date.now()): string {
  const total = Math.max(0, Math.floor((target - now) / 1000));
  const parts = [Math.floor(total / 86400), Math.floor(total / 3600) % 24, Math.floor(total / 60) % 60, total % 60];
  return parts.map((n) => String(n).padStart(2, "0")).join(":");
}
