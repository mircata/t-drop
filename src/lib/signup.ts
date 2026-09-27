import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { SignupDraft } from "@/payload-types";
import { getPayloadClient } from "./payload";
import { signupAutoVerify } from "./signup-flags";
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
 *
 * An upsert, and it has to be a real one. Looking the address up and then creating it is
 * two round trips with a gap in the middle, and `signup_drafts.email` carries a unique
 * index — so anything that lands a second insert for the same address inside that gap
 * turns the landing page's only button into a 500. A double-submitted form is the obvious
 * way in, but it is not the only one, so the collision is handled rather than assumed away:
 * if the insert is rejected for uniqueness, the row it collided with is the row we wanted
 * in the first place, and we resume it.
 */
export async function startDraft(email: string): Promise<SignupDraft> {
  const payload = await getPayloadClient();
  const normalised = email.trim().toLowerCase();
  const resumeToken = newToken();

  const resume = async (id: number | string) =>
    payload.update({ collection: "signup-drafts", id, data: { resumeToken } });

  const existing = await payload.find({
    collection: "signup-drafts",
    where: { email: { equals: normalised } },
    limit: 1,
  });

  let draft: SignupDraft;
  if (existing.docs[0]) {
    draft = await resume(existing.docs[0].id);
  } else {
    try {
      draft = await payload.create({
        collection: "signup-drafts",
        data: { email: normalised, step: "plan", resumeToken },
      });
    } catch (err) {
      if (!isEmailFieldError(err)) throw err;
      /* Payload reports every field problem the same way, so the error alone does not say
         whether the address collided with an existing draft or was simply refused. Looking
         again is what tells them apart: a row that is there now is the one we wanted, and
         no row means the address itself was rejected. */
      const raced = await payload.find({
        collection: "signup-drafts",
        where: { email: { equals: normalised } },
        limit: 1,
      });
      if (!raced.docs[0]) throw new SignupEmailRejected(normalised, { cause: err });
      draft = await resume(raced.docs[0].id);
    }
  }

  await setDraftCookie(resumeToken);
  return draft;
}

/**
 * Payload refused the address itself — it is not a duplicate, it is not acceptable.
 *
 * Its own email validation is stricter than any check worth writing by hand (it wants an
 * alphabetic top-level domain of two characters or more, so `you@213.123` and
 * `you@localhost` are both out), and the two are guaranteed to drift. This turns that
 * disagreement into something a form can show instead of an unhandled throw, which is what
 * the landing page did on 2026-09-22 for exactly that address.
 */
export class SignupEmailRejected extends Error {
  constructor(email: string, options?: { cause?: unknown }) {
    super(`Payload rejected the signup address ${email}`, options);
    this.name = "SignupEmailRejected";
  }
}

/**
 * Whether a thrown error is Payload complaining about the `email` field of a
 * `signup-drafts` write, for any reason — duplicate, malformed or missing.
 *
 * Matched structurally rather than on the message: Payload reports these as a
 * `ValidationError` carrying a per-field list, and the messages themselves are user-facing
 * copy that can be localised or reworded between versions.
 */
function isEmailFieldError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = (err as { name?: string }).name;
  if (name !== "ValidationError") return false;
  const errors = (err as { data?: { errors?: { path?: string }[] } }).data?.errors ?? [];
  return errors.some((e) => e.path === "email");
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

/* How long a verification link stays good. Long enough to survive a night in a spam
   folder, short enough that a link sitting in an old mailbox is not a way in. */
const VERIFY_TOKEN_HOURS = 48;

/**
 * Issue a fresh verification link for a draft, invalidating any previous one, and send it.
 *
 * Called from the plan step's "НАПРЕД" (Figma annotation 519:408: *"when the user click it
 * leads to the next step and send the user a confirmation link"*), from "ИЗПРАТИ ОТНОВО",
 * and from the update-mail popup. In every case the old token stops working — which is
 * what stops a superseded address from still being able to finish the signup.
 *
 * **Nothing is actually sent yet.** There is no Resend account, so real sending is deferred
 * along with the rest of the email work (docs/new-user-flow.md). While `SIGNUP_AUTOVERIFY`
 * is on, the address is marked verified here and the draft stamped `verifiedWithoutEmail`
 * so these rows are distinguishable from genuinely verified ones later. With the flag off
 * the token is stored and the link is logged, so the funnel can still be walked by hand.
 */
export async function issueVerification(draft: SignupDraft): Promise<SignupDraft> {
  const payload = await getPayloadClient();
  const verifyToken = newToken();
  const autoVerify = signupAutoVerify();

  const updated = await payload.update({
    collection: "signup-drafts",
    id: draft.id,
    data: autoVerify
      ? { emailVerified: true, verifiedWithoutEmail: true, verifyToken: null, verifyTokenExpiresAt: null }
      : {
          verifyToken,
          verifyTokenExpiresAt: new Date(Date.now() + VERIFY_TOKEN_HOURS * 3600_000).toISOString(),
          emailVerified: false,
        },
  });

  if (!autoVerify) {
    const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "";
    /* Stands in for the email until Resend exists. Deliberately a log line and not a
       thrown error: the funnel stays walkable in development. */
    console.info(`[signup] verification link for ${draft.email}: ${base}/signup/confirm?token=${verifyToken}`);
  }

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
