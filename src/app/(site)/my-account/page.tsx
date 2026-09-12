import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountNav } from "@/components/site/account-nav";
import { button } from "@/components/site/shared";
import { ErrorNotice, InfoNotice } from "@/components/forms/notice";
import { pickCategory } from "@/lib/actions/drop";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient, mediaUrl } from "@/lib/payload";
import { stripeEnabled } from "@/lib/stripe";
import { dropMonth, isDropLocked } from "@/lib/stripe-sync";

const STATUS_LABEL: Record<string, string> = {
  active: "Активен",
  trialing: "Пробен период",
  past_due: "Просрочено плащане",
  unpaid: "Неплатен",
  incomplete: "Незавършен",
  paused: "Паузиран",
  canceled: "Отказан",
};

const bgDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("bg-BG", { day: "numeric", month: "long", year: "numeric" }) : "");

export const metadata: Metadata = { title: "My account – T-Drop Monthly T-Shirts" };

const PICK_NOTICE: Record<string, { ok?: string; error?: string }> = {
  ok: { ok: "Изборът ти е записан." },
  locked: { error: "Датата на дропа мина. Изборът за този месец е затворен." },
  missing: { error: "Избери една от темите." },
};

const accountLink = "text-[#5bc0de] no-underline";

/* The logged-in WooCommerce dashboard. Visitors without a session go to the login page. */
export default async function MyAccountPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [customer, { picked }] = await Promise.all([getCustomer(), searchParams]);
  if (!customer) redirect("/your-profile");
  const displayName = customer.name || customer.email;
  const payload = await getPayloadClient();
  const site = await payload.findGlobal({ slug: "site", depth: 0 });
  const month = dropMonth(site.nextDropDate);
  const [subs, paid, categories, picks] = await Promise.all([
    payload.find({ collection: "subscriptions", where: { customer: { equals: customer.id } }, sort: "-createdAt", depth: 1, limit: 10 }),
    payload.count({ collection: "payments", where: { and: [{ customer: { equals: customer.id } }, { status: { equals: "paid" } }] } }),
    payload.find({ collection: "categories", where: { active: { equals: true } }, sort: "sortOrder", depth: 1, limit: 20 }),
    payload.find({ collection: "category-selections", where: { and: [{ customer: { equals: customer.id } }, { month: { equals: month } }] }, depth: 0, limit: 1 }),
  ]);
  const active = subs.docs.filter((s) => s.status !== "canceled");
  const currentPick = picks.docs[0] ? (typeof picks.docs[0].category === "number" ? picks.docs[0].category : picks.docs[0].category.id) : null;
  const locked = isDropLocked(site.nextDropDate);
  const notice = typeof picked === "string" ? PICK_NOTICE[picked] : undefined;
  return (
    <section className="site-container pb-[59px] max-md:px-5 max-md:pb-[49px]">
      <AccountNav orders={paid.totalDocs} />

      <div className="pt-[50px] max-md:pt-7">
        <div className="rounded-[3px] border border-[#d5d8dc] bg-white px-[30px] py-4 font-roboto text-[14px] leading-[29px] tracking-normal text-[#69727d]">
          <p className="mb-5">
            Здравейте, <strong className="font-bold">{displayName}</strong> (не сте{" "}
            <strong className="font-bold">{displayName}</strong>?{" "}
            <Link href="/logout" className={accountLink}>Изход</Link>)
          </p>
          <p className="mb-5">
            От вашия профил можете да преглеждате{" "}
            <Link href="#" className={accountLink}>последните си поръчки</Link>, да управлявате вашите{" "}
            <Link href="#" className={accountLink}>адреси за плащане и доставка</Link> и{" "}
            <Link href="/my-account/details" className={accountLink}>да променяте паролата и данните на профила си</Link>.
          </p>
        </div>
      </div>

      <div id="subscriptions" className="pt-5">
        <div className="rounded-[3px] border border-[#d5d8dc] bg-white px-[30px] py-4 font-roboto text-[14px] leading-[29px] tracking-normal text-[#69727d]">
          <p className="mb-2 font-bold text-black">Абонамент</p>
          {active.length === 0 ? (
            <p className="mb-2">
              Нямаш активен абонамент. <Link href="/join" className={accountLink}>Запиши се</Link>.
            </p>
          ) : (
            active.map((s) => (
              <p key={s.id} className="mb-2">
                {typeof s.plan === "object" ? s.plan.name : "Абонамент"}: <strong className="font-bold">{STATUS_LABEL[s.status] ?? s.status}</strong>
                {s.currentPeriodEnd && <> · платено до {bgDate(s.currentPeriodEnd)}</>}
                {s.cancelAtPeriodEnd && <> · спира в края на периода</>}
                {s.size && <> · размер {s.size.toUpperCase()}</>}
              </p>
            ))
          )}
          {stripeEnabled() && customer.stripeCustomerId && (
            <p className="mb-2">
              <Link href="/my-account/portal" className={accountLink}>Карта, фактури и отказ на абонамента</Link>
            </p>
          )}
        </div>
      </div>

      <form id="drop" action={pickCategory} className="flex flex-col gap-10 max-md:gap-5">
        <fieldset className="min-w-0">
          <legend className="mb-5 w-full font-body text-[16px] leading-[29px] tracking-[0.04em] text-[#333]">
            Следващ дроп
          </legend>
          <InfoNotice message={notice?.ok} />
          <ErrorNotice message={notice?.error} />
          <div className="grid grid-cols-4 gap-[17px] max-md:grid-cols-1 max-md:gap-5">
            {categories.docs.map((c) => (
              <label
                key={c.id}
                className="flex h-[320px] min-w-0 cursor-pointer flex-col items-center justify-between rounded-[10px] bg-white p-5 max-md:h-[340px]"
              >
                <span
                  className="h-[230px] w-full shrink-0 rounded-[20px] bg-cover bg-center max-md:h-[240px]"
                  style={{ backgroundImage: `url(${mediaUrl(c.image, "")})` }}
                  aria-hidden="true"
                />
                <input type="radio" name="drop" value={c.id} defaultChecked={c.id === currentPick} disabled={locked} className="size-[13px] shrink-0" />
                <span className="w-full text-center font-headline text-[21px] leading-[21px] tracking-normal text-[#333]">
                  {c.name}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" disabled={locked} className={`${button} h-[84px] w-[201px] max-md:w-full disabled:opacity-50`}>
          SUBMIT
        </button>
      </form>
    </section>
  );
}
