import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { SignupDraft } from "@/payload-types";
import { getPayloadClient } from "./payload";
import { type FunnelStep, isFunnelStep, redirectFor, stepIndex, stepPath } from "./signup-steps";

/**
 * The signup funnel's server-side session (docs/new-user-flow.md).
 *
 * The cookie holds a `resumeToken`, not a draft id. The token is what makes the funnel
 * resumable from the verification email: that link carries the same token, so opening it in
 * a different browser — which is the normal case, because mail clients open their own —
 * re-establishes the session there instead of dropping someone two screens from paying.
 *
 * An id in the cookie would not do. It would let anyone walk other people's drafts by
 * editing the number, and those rows hold an email address and a shipping address.
 *
 * Nothing here trusts the browser beyond the token. Every lookup is by token, and the
 * Local API skips access control, so these helpers are the only sanctioned way in.
 */

/* Separate from `tdrop-account-token` (src/lib/auth.ts) and from Payload's own admin
   cookie. A signup in progress and a signed-in session are different things and can
   legitimately coexist — someone can be signed in and still be mid-funnel. */
export const SIGNUP_COOKIE = "tdrop-signup";

/* Long enough to survive waiting for an email that went to spam and getting back to it the
   next day, short enough that an abandoned draft's cookie does not outlive the retention
   rule that deletes the draft itself. */
const FOURTEEN_DAYS = 60 * 60 * 24 * 14;

function newToken(): string {
  return randomBytes(32).toString("hex");
}

async function findByResumeToken(token: string): Promise<SignupDraft | null> {
  const payload = await getPayloadClient();
  const found = await payload.find({
    collection: "signup-drafts",
    where: { resumeToken: { equals: token } },
    depth: 1,
    limit: 1,
  });
  return found.docs[0] ?? null;
}

/** The signup draft this browser is carrying, or null. */
export const getDraft = cache(async (): Promise<SignupDraft | null> => {
  const token = (await cookies()).get(SIGNUP_COOKIE)?.value;
  if (!token) return null;
  return findByResumeToken(token);
});

export async function setDraftCookie(resumeToken: string) {
  const store = await cookies();
  store.set({
    name: SIGNUP_COOKIE,
    value: resumeToken,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: FOURTEEN_DAYS,
  });
}

export async function clearDraftCookie() {
  const store = await cookies();
  store.set({ name: SIGNUP_COOKIE, value: "", path: "/", maxAge: 0 });
}

/**
 * Start the funnel for an address, or pick up the one already under way for it.
 *
 * Drafts are unique per email, so a second attempt from the same address resumes rather
 * than colliding — someone who half-signed-up last week and starts again today keeps their
 * package and their picks. Resuming issues a fresh resume token, which is what attaches the
 * draft to whichever browser they are using now.
 */
export async function startDraft(email: string): Promise<SignupDraft> {
  const payload = await getPayloadClient();
  const normalised = email.trim().toLowerCase();
  const resumeToken = newToken();

  const existing = await payload.find({
    collection: "signup-drafts",
    where: { email: { equals: normalised } },
    limit: 1,
  });

  const draft = existing.docs[0]
    ? await payload.update({ collection: "signup-drafts", id: existing.docs[0].id, data: { resumeToken } })
    : await payload.create({ collection: "signup-drafts", data: { email: normalised, step: "plan", resumeToken } });

  await setDraftCookie(resumeToken);
  return draft;
}

/**
 * Resume from a verification link: mark the address verified and hand this browser the
 * session. Returns the draft, or null if the token is unknown or expired.
 */
export async function confirmByVerifyToken(verifyToken: string): Promise<SignupDraft | null> {
  const payload = await getPayloadClient();
  const found = await payload.find({
    collection: "signup-drafts",
    where: { verifyToken: { equals: verifyToken } },
    limit: 1,
  });
  const draft = found.docs[0];
  if (!draft) return null;

  const expiry = draft.verifyTokenExpiresAt ? new Date(draft.verifyTokenExpiresAt) : null;
  if (expiry && expiry.getTime() < Date.now()) return null;

  const resumeToken = newToken();
  const updated = await payload.update({
    collection: "signup-drafts",
    id: draft.id,
    data: {
      emailVerified: true,
      /* Single use. The link stops working once it has been followed, so a forwarded mail
         or a mailbox someone else later reads cannot re-enter the funnel. */
      verifyToken: null,
      verifyTokenExpiresAt: null,
      resumeToken,
      step: furthest(draft.step, "verify"),
    },
  });

  await setDraftCookie(resumeToken);
  return updated;
}

/** Advance a draft's high-water mark, never lower it. */
export function furthest(current: SignupDraft["step"], reached: FunnelStep): FunnelStep {
  const from = isFunnelStep(current) ? current : "plan";
  return stepIndex(reached) > stepIndex(from) ? reached : from;
}

/** Record that a draft has got as far as `step`, if it had not already. */
export async function advanceDraft(draft: SignupDraft, step: FunnelStep): Promise<SignupDraft> {
  const target = furthest(draft.step, step);
  if (target === draft.step) return draft;
  const payload = await getPayloadClient();
  return payload.update({ collection: "signup-drafts", id: draft.id, data: { step: target } });
}

/**
 * The guard every funnel page calls. Returns the draft, or redirects: to the landing page
 * when there is no signup under way, or to the furthest step actually reached when someone
 * tries to skip ahead. See `redirectFor` for the rules.
 */
export async function requireDraft(target: FunnelStep): Promise<SignupDraft> {
  const draft = await getDraft();
  /* Step 0 is the landing hero, where the address is entered and the draft created. */
  if (!draft) redirect("/");

  const position = {
    step: isFunnelStep(draft.step) ? draft.step : ("plan" as FunnelStep),
    emailVerified: Boolean(draft.emailVerified),
  };
  const elsewhere = redirectFor(position, target);
  if (elsewhere && elsewhere !== stepPath(target)) redirect(elsewhere);

  return draft;
}
