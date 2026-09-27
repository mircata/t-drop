import { pbkdf2Sync, randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { query } from "./db";

/* The customer journey without Stripe: log in, see the dashboard, pick a drop theme, and
   the footer newsletter opt-in. Accounts are made by the signup funnel, which needs Stripe
   to finish, so the smoke customer is written straight into the test database. */

/** A password hash Payload's local strategy accepts (its generatePasswordSaltHash). */
function payloadHash(password: string) {
  const salt = randomBytes(32).toString("hex");
  return { salt, hash: pbkdf2Sync(password, salt, 25000, 512, "sha256").toString("hex") };
}

const stamp = Date.now();
const email = `smoke-${stamp}@example.com`;
const password = "smoke-pass-1234";

test.describe.configure({ mode: "serial" });

test("home and about render from Payload", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Всеки месец");
  await page.goto("/about");
  await expect(page.locator("h1")).toContainText("Какво е");
});

test("log in and see the dashboard", async ({ page }) => {
  /* /your-profile/register is retired (2026-09-27): signing up is the funnel's job. */
  await page.goto("/your-profile/register");
  await expect(page).toHaveURL(/\/(#signup)?$/);

  const { salt, hash } = payloadHash(password);
  await query(
    `insert into customers (name, email, salt, hash, _verified, created_at, updated_at) values ('Smoke Тест', $1, $2, $3, true, now(), now())`,
    [email, salt, hash],
  );

  await page.goto("/login");
  await page.getByLabel("Имейл", { exact: true }).fill(email);
  await page.getByLabel("Парола", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Вход" }).click();
  await expect(page.getByText("Грешен имейл или парола")).toBeVisible();

  await page.getByLabel("Имейл", { exact: true }).fill(email);
  await page.getByLabel("Парола", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Вход" }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText("Абонамента ви е неактивен")).toBeVisible();

  /* Signed in, the landing page sends the customer to their account. */
  await page.goto("/");
  await expect(page).toHaveURL(/\/account$/);
});

test("pick a drop theme and change it", async ({ page }) => {
  // The picker only shows for an active subscriber; the smoke customer never went through
  // Stripe checkout, so give them a synthetic active subscription directly in the test DB.
  await query(
    `insert into subscriptions (customer_id, plan_id, status, provider, provider_subscription_id, created_at, updated_at)
     select c.id, p.id, 'active', 'stripe', $2, now(), now()
     from customers c, plans p where c.email = $1 limit 1`,
    [email, `sub_smoke_${stamp}`],
  );

  // /your-profile is retired and redirects to /login, the surviving login page.
  await page.goto("/your-profile");
  await page.getByLabel("Имейл", { exact: true }).fill(email);
  await page.getByLabel("Парола", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Вход" }).click();
  await expect(page).toHaveURL(/\/account$/);

  /* No pick yet this month, so the dashboard opens on the design picker. */
  const form = page.locator("form#drop");
  await form.locator('input[name="drop"]').nth(1).locator("..").click();
  await form.locator("fieldset").getByText("Мъж", { exact: true }).click();
  await form.locator("fieldset").getByText("M", { exact: true }).click();
  await form.getByRole("button", { name: "Избери" }).click();
  await expect(page).toHaveURL(/picked=ok/);
  await expect(page.getByText("Изборът ти е записан")).toBeVisible();
  await expect(page.getByText("Избрана категория")).toBeVisible();

  const picks = await query<{ n: string }>("select count(*)::text as n from category_selections cs join customers c on c.id = cs.customer_id where c.email = $1", [email]);
  expect(picks[0].n).toBe("1");
});

test("logout protects the dashboard again", async ({ page }) => {
  await page.goto("/logout");
  await page.goto("/account");
  // /account redirects unauthenticated visitors straight to /login, the surviving
  // login page (renamed from /register 2026-09-16 — see next.config.ts).
  await expect(page).toHaveURL(/\/login$/);
});

test("newsletter double opt-in", async ({ page }) => {
  const nl = `nl-${stamp}@example.com`;
  await page.goto("/about");
  await page.getByRole("contentinfo").locator("input[type=email]").fill(nl);
  await page.getByRole("contentinfo").getByRole("button", { name: "Абонирай се", exact: true }).click();
  await expect(page.getByText("Провери имейла си")).toBeVisible();

  const [row] = await query<{ token: string; status: string }>("select token, status from subscribers where email = $1", [nl]);
  expect(row.status).toBe("pending");
  await page.goto(`/newsletter/confirm?token=${row.token}`);
  await expect(page.getByRole("heading", { name: "Абонаментът е потвърден" })).toBeVisible();
  const [after] = await query<{ status: string }>("select status from subscribers where email = $1", [nl]);
  expect(after.status).toBe("confirmed");
});
