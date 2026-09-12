import type { Access, CollectionConfig, FieldAccess } from "payload";

/**
 * Site customers: people who subscribe. Separate from `users`, which is the
 * /admin login. Customers register on the site, confirm their email, and log in
 * at /your-profile or /register. Admins see and edit them in /admin.
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
    verify: {
      generateEmailSubject: () => "Потвърди имейла си за T-Drop",
      generateEmailHTML: ({ token }) =>
        emailShell(
          "Добре дошъл в T-Drop",
          "Остава една стъпка: потвърди имейла си, за да можеш да влезеш в профила си.",
          `${siteUrl()}/your-profile/verify?token=${token}`,
          "Потвърди имейла",
        ),
    },
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
  fields: [
    { name: "name", type: "text", label: "Име", required: true },
    { name: "phone", type: "text", label: "Телефон" },
    {
      name: "address",
      type: "group",
      label: "Адрес за доставка",
      fields: [
        { name: "line1", type: "text", label: "Улица и номер" },
        { name: "line2", type: "text", label: "Допълнение" },
        { name: "city", type: "text", label: "Град" },
        { name: "postcode", type: "text", label: "Пощенски код" },
        { name: "country", type: "text", label: "Държава", defaultValue: "BG" },
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
