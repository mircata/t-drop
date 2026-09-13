import { expect, test } from "@playwright/test";
import { query } from "./db";

/* The customer journey without Stripe: sign up, confirm the email, log in,
   see the dashboard, pick a drop theme, and the footer newsletter opt-in. */

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

test("register, verify by token, log in, see the dashboard", async ({ page }) => {
  await page.goto("/your-profile/register");
  await page.getByLabel("Име и фамилия").fill("Smoke Тест");
  await page.getByLabel("Имейл адрес").fill(email);
  await page.getByLabel("Парола (поне 8 знака)").fill(password);
  await page.getByLabel("Повтори паролата").fill(password);
  await page.getByRole("button", { name: "Регистрация" }).click();
  await expect(page.getByText("Изпратихме ти имейл")).toBeVisible();

  const [row] = await query<{ _verificationtoken: string }>("select _verificationtoken from customers where email = $1", [email]);
  expect(row?._verificationtoken).toBeTruthy();
  await page.goto(`/your-profile/verify?token=${row._verificationtoken}`);
  await expect(page).toHaveURL(/verified=1/);
  await expect(page.getByText("Имейлът е потвърден")).toBeVisible();

  await page.getByLabel("Потребителско име или имейл адрес").fill(email);
  await page.getByLabel("Парола", { exact: false }).first().fill("wrong-password");
  await page.getByRole("button", { name: "Влизане" }).click();
  await expect(page.getByText("Грешен имейл или парола")).toBeVisible();

  await page.getByLabel("Потребителско име или имейл адрес").fill(email);
  await page.getByLabel("Парола", { exact: false }).first().fill(password);
  await page.getByRole("button", { name: "Влизане" }).click();
  await expect(page).toHaveURL(/\/my-account$/);
  await expect(page.getByText("Здравейте, Smoke Тест")).toBeVisible();
  await expect(page.getByText("Нямаш активен абонамент")).toBeVisible();
});

test("pick a drop theme and change it", async ({ page }) => {
  await page.goto("/your-profile");
  await page.getByLabel("Потребителско име или имейл адрес").fill(email);
  await page.getByLabel("Парола", { exact: false }).first().fill(password);
  await page.getByRole("button", { name: "Влизане" }).click();
  await expect(page).toHaveURL(/\/my-account$/);

  const radios = page.locator('input[name="drop"]');
  await expect(radios.first()).toBeVisible();
  await radios.nth(1).check();
  await page.getByRole("button", { name: "SUBMIT" }).click();
  await expect(page).toHaveURL(/picked=ok/);
  await expect(page.getByText("Изборът ти е записан")).toBeVisible();
  await expect(page.locator('input[name="drop"]').nth(1)).toBeChecked();

  const picks = await query<{ n: string }>("select count(*)::text as n from category_selections cs join customers c on c.id = cs.customer_id where c.email = $1", [email]);
  expect(picks[0].n).toBe("1");
});

test("logout protects the dashboard again", async ({ page }) => {
  await page.goto("/logout");
  await page.goto("/my-account");
  await expect(page).toHaveURL(/\/your-profile$/);
});

test("newsletter double opt-in", async ({ page }) => {
  const nl = `nl-${stamp}@example.com`;
  await page.goto("/about");
  await page.getByPlaceholder("Email").fill(nl);
  await page.getByRole("button", { name: "Запиши се", exact: true }).click();
  await expect(page.getByText("Провери имейла си")).toBeVisible();

  const [row] = await query<{ token: string; status: string }>("select token, status from subscribers where email = $1", [nl]);
  expect(row.status).toBe("pending");
  await page.goto(`/newsletter/confirm?token=${row.token}`);
  await expect(page.getByRole("heading", { name: "Абонаментът е потвърден" })).toBeVisible();
  const [after] = await query<{ status: string }>("select status from subscribers where email = $1", [nl]);
  expect(after.status).toBe("confirmed");
});
