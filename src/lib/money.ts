/**
 * Prices as the site writes them: `€17,99` — sign leading, comma decimal.
 *
 * The format was settled on 2026-09-16 against the `/join` Figma frame and is used
 * everywhere a price is shown. One helper rather than a `toFixed` at each call site, so a
 * later switch to лев (or to Intl, once a second currency exists) is one edit.
 */
export const euro = (cents: number) => `€${(cents / 100).toFixed(2).replace(".", ",")}`;
