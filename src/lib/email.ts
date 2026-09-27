/**
 * Whether an address is shaped like one Payload will accept.
 *
 * Every address this app collects is ultimately written to a Payload `email` field, and
 * Payload validates those itself. Anything a form lets past that Payload then refuses comes
 * back as a thrown `ValidationError` rather than a message under the field — which is how
 * `/` came to answer 500 to `testmail123@213.123` on 2026-09-22.
 *
 * So this is not a general-purpose email validator and should not be "improved" into one.
 * Its job is to agree with Payload. The part that matters is the end: an alphabetic
 * top-level domain of two characters or more, which is what rules out a numeric TLD
 * (`213.123`), a bare host (`localhost`), a one-letter TLD and a raw IPv4 address. The local
 * part is ASCII for the same reason — Payload turns away `кирилица@example.com`.
 *
 * It is a first pass, so the common typo is caught without a round trip to the database.
 * The caller still has to handle a rejection from Payload itself; see `SignupEmailRejected`
 * in `signup.ts`.
 */
const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function isEmailShaped(value: string): boolean {
  return EMAIL.test(value);
}
