import type { Access, CollectionConfig, FieldAccess } from "payload";
import { blockDeleteIfReferenced } from "../lib/delete-guards";

/**
 * Site customers: people who subscribe. Separate from `users`, which is the
 * /admin login. Customers register on the site, confirm their email, and log in
 * at /login (/your-profile redirects there too). Admins see and edit them in /admin.
 */

const siteUrl = () => process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

const isAdmin: Access = ({ req: { user } }) => user?.collection === "users";
const isAdminField: FieldAccess = ({ req: { user } }) => user?.collection === "users";

const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false;
  if (user.collection === "users") return true;
  return { id: { equals: user.id } };
};

function emailShell(title: string, body: string, ctaHref: string, ctaLabel: string) {
  return `<!doctype html><html lang="bg"><body style="font-family:Arial,sans-serif;color:#212121;background:#fffef9;padding:32px">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
<h1 style="font-size:22px;margin:0 0 16px">${title}</h1>
<p style="font-size:16px;line-height:1.6">${body}</p>
<p style="margin:24px 0"><a href="${ctaHref}" style="display:inline-block;background:#cc0e45;color:#fffef9;text-decoration:none;padding:14px 28px;border-radius:50px;font-weight:bold">${ctaLabel}</a></p>
<p style="font-size:13px;color:#666">Ако бутонът не работи, копирай този адрес в браузъра:<br>${ctaHref}</p>
<p style="font-size:13px;color:#666;margin-top:32px">T-Drop Monthly T-Shirts</p>
</div></body></html>`;
}

export const Customers: CollectionConfig = {
  slug: "customers",
  labels: { singular: "Клиент", plural: "Клиенти" },
  auth: {
    // 30 days. The site cookie is a session cookie unless "remember me" is ticked.
    tokenExpiration: 60 * 60 * 24 * 30,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    cookies: {
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    },
    // TODO before going to production: turn email verification back on (verify: {...}
    // below, unchanged) and revert the "no verification needed" copy in register()
    // (src/lib/actions/auth.ts) and RegisterForm. Turned off 2026-09-16 at the owner's
    // request so registration doesn't depend on outbound email while that's still being
    // set up (RESEND_API_KEY). /your-profile/verify still works if re-enabled — it was
    // left in place, only this switch changed. The account created inline in startCheckout
    // (src/lib/actions/checkout.ts, added 2026-09-16 for the same reason — RESEND_API_KEY
    // wasn't set on the test Vercel deploy, so the webhook's "choose your password" email
    // never arrived) goes through the same payload.create and needs no separate change:
    // flipping this back on covers both signup paths.
    verify: false,
    // verify: {
    //   generateEmailSubject: () => "Потвърди имейла си за T-Drop",
    //   generateEmailHTML: ({ token }) =>
    //     emailShell(
    //       "Добре дошъл в T-Drop",
    //       "Остава една стъпка: потвърди имейла си, за да можеш да влезеш в профила си.",
    //       `${siteUrl()}/your-profile/verify?token=${token}`,
    //       "Потвърди имейла",
    //     ),
    // },
    forgotPassword: {
      generateEmailSubject: () => "Нова парола за T-Drop",
      generateEmailHTML: (args) =>
        emailShell(
          "Смяна на парола",
          "Получихме заявка за нова парола. Линкът е валиден един час. Ако не си ти, просто игнорирай този имейл.",
          `${siteUrl()}/your-profile/reset-password?token=${args?.token ?? ""}`,
          "Избери нова парола",
        ),
    },
  },
  access: {
    // Registration and checkout create customers through the Local API (server actions,
    // webhook), which bypasses this. Nobody creates customers over REST.
    create: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
    delete: isAdmin,
    unlock: isAdmin,
    admin: ({ req: { user } }) => user?.collection === "users",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "name", "createdAt"],
    group: "Клиенти",
  },
  hooks: {
    beforeDelete: [
      blockDeleteIfReferenced([
        { collection: "subscriptions", field: "customer", label: "Абонаменти" },
        { collection: "payments", field: "customer", label: "Плащания" },
        { collection: "category-selections", field: "customer", label: "Избори за дроп" },
      ]),
    ],
  },
  fields: [
    { name: "name", type: "text", label: "Име", required: true },
    { name: "phone", type: "text", label: "Телефон" },
    {
      name: "address",
      type: "group",
      label: "Адрес от Stripe",
      admin: { description: "Попълва се автоматично от Stripe при плащане. Не се показва на клиента — виж \"Доставка\" по-долу за адреса, който клиентът въвежда сам." },
      fields: [
        { name: "line1", type: "text", label: "Улица и номер" },
        { name: "line2", type: "text", label: "Допълнение" },
        { name: "city", type: "text", label: "Град" },
        { name: "postcode", type: "text", label: "Пощенски код" },
        { name: "country", type: "text", label: "Държава", defaultValue: "BG" },
      ],
    },
    {
      name: "shipping",
      type: "group",
      label: "Доставка",
      admin: { description: "Показва се и се редактира на /account/address." },
      fields: [
        { name: "recipientName", type: "text", label: "Име на получателя" },
        /* city added 2026-09-16 with the /join/delivery redesign, which asks for "Град".
           postcode stayed on the owner's call — the courier labels and the factory CSV both
           use it, so the form collects both. */
        { name: "city", type: "text", label: "Град" },
        { name: "postcode", type: "text", label: "Пощенски код" },
        {
          name: "carrier",
          type: "select",
          label: "Спедитор",
          options: [
            { label: "Speedy", value: "speedy" },
            { label: "Sameday", value: "sameday" },
            { label: "BoxNow", value: "boxnow" },
          ],
        },
        { name: "addressOrOffice", type: "text", label: "Точен адрес за доставка / офис на куриер" },
      ],
    },
    {
      name: "emailPreferences",
      type: "group",
      label: "Имейли",
      fields: [
        { name: "newsletter", type: "checkbox", label: "Новини и оферти", defaultValue: true },
        { name: "dropReminder", type: "checkbox", label: "Напомняне за избор на дроп", defaultValue: true },
      ],
    },
    {
      name: "stripeCustomerId",
      type: "text",
      label: "Stripe customer",
      admin: { readOnly: true, position: "sidebar" },
      access: { create: isAdminField, read: isAdminField, update: isAdminField },
    },
  ],
};
