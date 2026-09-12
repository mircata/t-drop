"use server";

import { randomBytes } from "crypto";
import { getPayloadClient } from "@/lib/payload";
import { rateLimited } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/stripe";
import type { FormState } from "./auth";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

/** Footer newsletter form. Sends a confirmation link; nothing is subscribed until it is opened. */
export async function subscribeNewsletter(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!isEmail(email)) return { error: "Въведи валиден имейл." };
  if (await rateLimited("newsletter", 5, 60 * 60 * 1000)) return { error: "Твърде много опити. Опитай по-късно." };

  const payload = await getPayloadClient();
  const found = await payload.find({ collection: "subscribers", where: { email: { equals: email } }, limit: 1 });
  let sub = found.docs[0];

  if (sub?.status === "confirmed") return { ok: true };

  const token = randomBytes(24).toString("hex");
  if (sub) {
    sub = await payload.update({ collection: "subscribers", id: sub.id, data: { status: "pending", token } });
  } else {
    sub = await payload.create({ collection: "subscribers", data: { email, status: "pending", token, source: "footer" } });
  }

  const link = `${siteUrl()}/newsletter/confirm?token=${token}`;
  await payload.sendEmail({
    to: email,
    subject: "Потвърди абонамента си за новини от T-Drop",
    html: `<!doctype html><html lang="bg"><body style="font-family:Arial,sans-serif;color:#212121;background:#fffef9;padding:32px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
<h1 style="font-size:22px;margin:0 0 16px">Още една стъпка</h1>
<p style="font-size:16px;line-height:1.6">Потвърди, че искаш новини и оферти от T-Drop. Ако не си ти, просто игнорирай този имейл.</p>
<p style="margin:24px 0"><a href="${link}" style="display:inline-block;background:#cc0e45;color:#fffef9;text-decoration:none;padding:14px 28px;border-radius:50px;font-weight:bold">Потвърждавам</a></p>
<p style="font-size:13px;color:#666">${link}</p>
</div></body></html>`,
  });
  return { ok: true };
}
