"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LockedAuth, UnverifiedEmail } from "payload";
import { clearAuthCookie, getCustomer, setAuthCookie } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";
import { rateLimited } from "@/lib/rate-limit";

export type FormState = { error?: string; ok?: boolean };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function loginError(err: unknown): string {
  if (err instanceof UnverifiedEmail) return "Първо потвърди имейла си от линка, който ти изпратихме.";
  if (err instanceof LockedAuth) return "Твърде много опити. Опитай пак след 10 минути.";
  return "Грешен имейл или парола.";
}

/** Login form. Field names: user or username (email), password, remember or rememberme. */
export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = (str(fd, "email") || str(fd, "user") || str(fd, "username")).toLowerCase();
  const password = String(fd.get("password") ?? "");
  const remember = fd.get("remember") === "on" || fd.get("rememberme") === "on";
  if (!email || !password) return { error: "Попълни имейл и парола." };
  if (await rateLimited("login", 10, 10 * 60 * 1000)) return { error: "Твърде много опити. Опитай пак след 10 минути." };

  const payload = await getPayloadClient();
  let token: string | undefined;
  try {
    ({ token } = await payload.login({ collection: "customers", data: { email, password } }));
  } catch (err) {
    return { error: loginError(err) };
  }
  if (!token) return { error: "Грешен имейл или парола." };
  await setAuthCookie(token, remember);
  redirect("/account");
}

/**
 * Signs the customer out. A Server Action bound to a form's submit (POST), not a bare
 * GET link — an earlier `<Link href="/logout">` to a GET route handler (real bug, hit
 * and fixed 2026-09-16) got silently triggered by Next.js's automatic link prefetching
 * just from being rendered in AccountTabs, logging visitors out before they clicked
 * anything. GET requests must stay side-effect-free for exactly this reason.
 */
export async function logout(): Promise<void> {
  await clearAuthCookie();
  redirect("/register");
}

/** Registration form. Field names: name, email, password, password2. */
export async function register(_prev: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const password2 = String(fd.get("password2") ?? "");
  if (!name) return { error: "Въведи име." };
  if (!isEmail(email)) return { error: "Въведи валиден имейл." };
  if (password.length < 8) return { error: "Паролата трябва да е поне 8 знака." };
  if (password !== password2) return { error: "Двете пароли не съвпадат." };
  if (await rateLimited("register", 5, 60 * 60 * 1000)) return { error: "Твърде много регистрации от този адрес. Опитай по-късно." };

  const payload = await getPayloadClient();
  const existing = await payload.find({ collection: "customers", where: { email: { equals: email } }, limit: 1 });
  if (existing.totalDocs > 0) return { error: "Вече има профил с този имейл. Влез или поискай нова парола." };

  // Email verification is off for now (Customers.ts auth.verify) — see the TODO there.
  await payload.create({ collection: "customers", data: { name, email, password } });
  return { ok: true };
}

/** Lost password form. Field name: email. Always reports success so emails cannot be enumerated. */
export async function forgotPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  if (!email) return { error: "Въведи имейл." };
  if (await rateLimited("forgot", 5, 60 * 60 * 1000)) return { error: "Твърде много заявки. Опитай по-късно." };
  const payload = await getPayloadClient();
  try {
    await payload.forgotPassword({ collection: "customers", data: { email } });
  } catch {
    // Unknown email: say nothing different.
  }
  return { ok: true };
}

/** Reset password form. Field names: token, password, password2. */
export async function resetPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const token = str(fd, "token");
  const password = String(fd.get("password") ?? "");
  const password2 = String(fd.get("password2") ?? "");
  if (!token) return { error: "Линкът е невалиден. Поискай нов." };
  if (password.length < 8) return { error: "Паролата трябва да е поне 8 знака." };
  if (password !== password2) return { error: "Двете пароли не съвпадат." };

  const payload = await getPayloadClient();
  try {
    await payload.resetPassword({ collection: "customers", data: { token, password }, overrideAccess: true });
  } catch {
    return { error: "Линкът е изтекъл или вече е използван. Поискай нов." };
  }
  redirect("/register?reset=1");
}

/** Profile form on /account/details. */
export async function updateProfile(_prev: FormState, fd: FormData): Promise<FormState> {
  const customer = await getCustomer();
  if (!customer) redirect("/register");

  const name = str(fd, "name");
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const password2 = String(fd.get("password2") ?? "");
  if (!name) return { error: "Въведи име." };
  if (!isEmail(email)) return { error: "Въведи валиден имейл." };
  if (password && password.length < 8) return { error: "Новата парола трябва да е поне 8 знака." };
  if (password !== password2) return { error: "Двете пароли не съвпадат." };

  const payload = await getPayloadClient();
  try {
    await payload.update({
      collection: "customers",
      id: customer.id,
      data: {
        name,
        email,
        emailPreferences: {
          newsletter: fd.get("newsletter") === "on",
          dropReminder: fd.get("dropReminder") === "on",
        },
        ...(password ? { password } : {}),
      },
    });
  } catch {
    return { error: "Промените не бяха записани. Провери дали имейлът не се използва от друг профил." };
  }
  revalidatePath("/account/details");
  return { ok: true };
}

