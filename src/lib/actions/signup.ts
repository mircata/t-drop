"use server";

import { redirect } from "next/navigation";
import { setAuthCookie } from "@/lib/auth";
import { isEmailShaped } from "@/lib/email";
import { dropMonth } from "@/lib/stripe-sync";
import { getPayloadClient } from "@/lib/payload";
import { rateLimited } from "@/lib/rate-limit";
import { SignupEmailRejected, advanceDraft, getDraft, issueVerification, requireDraft, startDraft } from "@/lib/signup";
import { nextEmptySlot, stepPath } from "@/lib/signup-steps";

/**
 * The server actions behind the signup funnel (docs/new-user-flow.md).
 *
 * Every one of these works on the draft behind the `tdrop-signup` cookie and nothing else —
 * no action takes a draft id from the browser. The Local API skips access control, so that
 * restraint is the access control.
 */

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();

export type FormState = { error?: string; ok?: boolean };


/**
 * Step 0 — the landing hero's email field (Figma `519:348`).
 *
 * Creates the draft and starts the funnel. Nothing is sent here: the design sends the
 * verification link from the *plan* step's "НАПРЕД", one screen later.
 */
export async function startSignup(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  if (!isEmailShaped(email)) return { error: "Въведи валиден имейл адрес." };

  /* Public and unauthenticated, and it writes a row per address. Without a limit this is a
     way to fill the table from one machine. */
  if (await rateLimited("signup-start", 8, 60_000)) {
    return { error: "Твърде много опити. Опитай пак след минута." };
  }

  try {
    await startDraft(email);
  } catch (err) {
    /* Never let Payload's stricter opinion of an address reach the customer as a crash. */
    if (err instanceof SignupEmailRejected) return { error: "Въведи валиден имейл адрес." };
    throw err;
  }
  redirect(stepPath("plan"));
}

/**
 * Step 1-1 — "НАПРЕД" on the package selector (Figma `519:377`, annotated *"when the user
 * click it leads to the next step and send the user a confirmation link"*).
 *
 * Records the package and issues the verification link in one go, then moves the draft on
 * to the waiting screen.
 */
export async function choosePlan(_prev: FormState, fd: FormData): Promise<FormState> {
  const draft = await requireDraft("plan");
  const planId = Number(fd.get("plan") ?? 0);
  if (!planId) return { error: "Избери пакет, за да продължиш." };

  const payload = await getPayloadClient();
  const plan = await payload.findByID({ collection: "plans", id: planId, depth: 0 }).catch(() => null);
  if (!plan?.active) return { error: "Този пакет вече не се предлага." };

  /* Changing package after picks have been made can orphan picks whose slot no longer
     exists — a Family customer dropping to Базов leaves picks 2-4 pointing at nothing.
     Trim them here rather than letting the design step filter them out, so the draft never
     holds a pick the package cannot deliver. */
  const picks = (draft.picks ?? []).filter((p) => (p.slot ?? 0) <= plan.shirtCount);

  await payload.update({ collection: "signup-drafts", id: draft.id, data: { plan: plan.id, picks } });
  await issueVerification({ ...draft, plan: plan.id });
  await advanceDraft(draft, "verify");

  redirect(stepPath("verify"));
}

/*
 * `resendVerification` and `changeSignupEmail` lived here until 2026-09-22. They were
 * removed with the waiting screen and the "Друг мейл?" popup: nothing is verified for now
 * (see src/lib/signup-flags.ts), so both were unreachable — and an unused Server Action is
 * still a live network endpoint, not dead code. Rebuild them with the screens when real
 * sending lands; git history has the originals.
 */

/** "НАПРЕД" on the verified state (Figma `519:579`) — on to the design picker. */
export async function continueFromVerify() {
  const draft = await requireDraft("verify");
  if (!draft.emailVerified) redirect(stepPath("verify"));
  await advanceDraft(draft, "design");
  redirect(stepPath("design"));
}

/**
 * Step 2-1 — "ИЗБЕРИ" on the design picker (Figma `519:628` / `524:179`).
 *
 * Saves one shirt's design, size and gender against its slot and moves on: to the next
 * empty slot if the package has one, otherwise to the account screen. Each shirt carries
 * its own gender and size (owner decision 8), so nothing here is shared across slots.
 *
 * Re-picking a slot updates it in place rather than appending, which is what makes the
 * cart's "РЕДАКТИРАЙ" link work without a second code path.
 */
export async function savePick(_prev: FormState, fd: FormData): Promise<FormState> {
  const draft = await requireDraft("design");

  const slot = Number(fd.get("slot") ?? 0);
  const categoryId = Number(fd.get("category") ?? 0);
  const size = str(fd, "size");
  const gender = str(fd, "gender");

  /* The design puts an error line under the button, annotated *"this is the error
     notification bar if the user still hasnt selected everything"*. Name what is missing
     rather than just refusing — the button itself gives no clue which pill was skipped. */
  const missing = [!gender && "пол", !size && "размер", !categoryId && "дизайн"].filter(Boolean) as string[];
  if (missing.length) {
    const list = missing.length > 1 ? `${missing.slice(0, -1).join(", ")} и ${missing[missing.length - 1]}` : missing[0];
    return { error: `Избери ${list}, за да продължиш.` };
  }

  const payload = await getPayloadClient();
  const plan = await resolvePlan(draft);
  if (!plan) redirect(stepPath("plan"));
  if (slot < 1 || slot > plan.shirtCount) return { error: "Невалидна тениска." };

  const category = await payload.findByID({ collection: "categories", id: categoryId, depth: 0 }).catch(() => null);
  if (!category?.active) return { error: "Този дизайн вече не се предлага." };

  const picks = [...(draft.picks ?? [])];
  const at = picks.findIndex((p) => p.slot === slot);
  const pick = { slot, category: category.id, size: size as "s" | "m" | "l" | "xl", gender: gender as "male" | "female" };
  if (at >= 0) picks[at] = { ...picks[at], ...pick };
  else picks.push(pick);

  await payload.update({ collection: "signup-drafts", id: draft.id, data: { picks } });

  /* Straight on to whichever shirt is still unpicked, so a Family order walks slots 1..4
     without the customer having to find the next one. All four done means the package is
     complete and the account screen is next. */
  const nextEmpty = nextEmptySlot(picks, plan.shirtCount);
  if (nextEmpty) redirect(`${stepPath("design")}?slot=${nextEmpty}`);

  await advanceDraft(draft, "account");
  redirect(stepPath("account"));
}

/** The plan on a draft, whatever depth it came back at. */
async function resolvePlan(draft: { plan?: number | { id: number; shirtCount: number } | null }) {
  if (!draft.plan) return null;
  if (typeof draft.plan === "object") return draft.plan;
  const payload = await getPayloadClient();
  return payload.findByID({ collection: "plans", id: draft.plan, depth: 0 }).catch(() => null);
}

const CARRIERS = new Set(["speedy", "sameday", "boxnow"]);

/**
 * Step 2-2 — "СЪЗДАЙ АКАУНТ" (Figma `524:479`), annotated *"after this click you can create
 * the profile"*.
 *
 * This is where the draft becomes real: a `customers` row with the address verified two
 * screens ago, the shipping details this screen collects, and the picks written out as
 * `category-selections` rows. The customer is signed in immediately, so the payment step
 * and everything after it run as them rather than as a draft.
 *
 * There is no email field, because the address was captured at step 0 and verified since —
 * asking again would let someone pay for a subscription on an address they never confirmed.
 */
export async function createSignupAccount(_prev: FormState, fd: FormData): Promise<FormState> {
  const draft = await requireDraft("account");

  const password = String(fd.get("password") ?? "");
  const password2 = String(fd.get("password2") ?? "");
  const recipientName = str(fd, "recipientName");
  const phone = str(fd, "phone");
  const carrier = str(fd, "carrier");
  const city = str(fd, "city");
  const postcode = str(fd, "postcode");
  const addressOrOffice = str(fd, "addressOrOffice");
  const privacyAccepted = fd.get("privacyAccepted") === "on";
  const marketingOptIn = fd.get("marketingOptIn") === "on";

  if (password.length < 8) return { error: "Паролата трябва да е поне 8 знака." };
  if (password !== password2) return { error: "Паролите не съвпадат." };
  if (!recipientName || !phone || !city || !postcode || !addressOrOffice) return { error: "Попълни всички полета." };
  if (!CARRIERS.has(carrier)) return { error: "Избери спедитор." };
  /* Not a nicety: without it there is no lawful basis for the account. The marketing box
     beside it stays separate and unticked — bundling the two is what makes consent invalid
     (docs/new-user-flow.md, "The GDPR question"). */
  if (!privacyAccepted) return { error: "Трябва да приемеш политиката за поверителност." };

  const payload = await getPayloadClient();
  const plan = await resolvePlan(draft);
  if (!plan) redirect(stepPath("plan"));

  const picks = draft.picks ?? [];
  if (nextEmptySlot(picks, plan.shirtCount)) redirect(stepPath("design"));

  const existing = await payload.find({ collection: "customers", where: { email: { equals: draft.email } }, limit: 1 });
  if (existing.docs[0]) return { error: "Вече има профил с този имейл. Влез в него вместо това." };

  const customer = await payload.create({
    collection: "customers",
    data: {
      name: recipientName,
      email: draft.email,
      password,
      phone,
      shipping: { recipientName, city, postcode, carrier: carrier as "speedy" | "sameday" | "boxnow", addressOrOffice },
    },
  });

  /* The picks become real rows now rather than after payment, so the order exists in
     /admin and in the deliveries export the moment it is placed. They carry
     "Чака плащане" until the webhook says otherwise — which is exactly what that status
     is for (src/lib/delivery-status.ts). */
  const site = await payload.findGlobal({ slug: "site", depth: 0 });
  const month = dropMonth(site.deliveryDay);
  for (const pick of picks) {
    if (!pick.slot || !pick.category) continue;
    await payload.create({
      collection: "category-selections",
      data: {
        customer: customer.id,
        month,
        slot: pick.slot,
        category: typeof pick.category === "object" ? pick.category.id : pick.category,
        size: pick.size,
        gender: pick.gender,
        fulfillmentStatus: "pending_payment",
      },
    });
  }

  await payload.update({
    collection: "signup-drafts",
    id: draft.id,
    data: { customer: customer.id, privacyAccepted, marketingOptIn },
  });

  /* Signed in before Stripe is reached, the same way /join/delivery does it — the payment
     step needs a customer to attach a SetupIntent to. */
  const { token } = await payload.login({ collection: "customers", data: { email: draft.email, password } });
  if (token) await setAuthCookie(token, true);

  await advanceDraft(draft, "payment");
  redirect(stepPath("payment"));
}

/** Abandon the signup in this browser. The draft row survives; only the cookie goes. */
export async function leaveSignup() {
  if (await getDraft()) {
    const { clearDraftCookie } = await import("@/lib/signup");
    await clearDraftCookie();
  }
  redirect("/");
}
