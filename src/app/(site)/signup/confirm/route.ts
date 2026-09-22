import { NextResponse } from "next/server";
import { rateLimited } from "@/lib/rate-limit";
import { confirmByVerifyToken } from "@/lib/signup";
import { stepPath } from "@/lib/signup-steps";

/**
 * The target of the link in the verification email: `/signup/confirm?token=…`.
 *
 * This is the one place the funnel can be entered from outside, and it is normally opened
 * in a *different browser* from the one that started the signup, because mail clients open
 * their own. So it does two jobs at once — mark the address verified, and hand this browser
 * the resume cookie — after which the funnel simply continues here.
 *
 * Public and unauthenticated, so it is rate limited: the token is the only secret, and
 * without a limit this route would happily answer an unlimited number of guesses.
 *
 * A bad or expired token is not an error page. It redirects to the waiting screen, which
 * already offers "ИЗПРАТИ ОТНОВО" and is what someone with a stale link actually needs. If
 * they have no draft cookie either, `requireDraft` sends them to the landing page.
 */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const origin = new URL(request.url).origin;

  /* Ten a minute per IP. A legitimate visitor follows this link once; anything repeatedly
     hitting it is working through guesses. The limiter keys on the caller's IP itself. */
  if (!token || (await rateLimited("signup-confirm", 10, 60_000))) {
    return NextResponse.redirect(new URL(stepPath("verify"), origin));
  }

  const draft = await confirmByVerifyToken(token);
  if (!draft) return NextResponse.redirect(new URL(stepPath("verify"), origin));

  /* Back to the same screen, which now renders its verified state — the "ВЕРИФИЦИРАН"
     panel and a "НАПРЕД" button (Figma 519:579). Not straight on to the picker: that is a
     screen the customer is meant to see, it is the confirmation that the round trip
     worked, and advancing on their click is what moves the draft's step past `verify`.
     Redirecting to the picker here would also bounce, since the guard will not open a step
     the draft has not reached yet. */
  return NextResponse.redirect(new URL(stepPath("verify"), origin));
}
