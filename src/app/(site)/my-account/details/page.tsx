import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/forms/profile-form";
import { wooTitle } from "@/components/forms/woo";
import { AccountNav } from "@/components/site/account-nav";
import { getCustomer } from "@/lib/auth";
import { getPayloadClient } from "@/lib/payload";

export const metadata: Metadata = { title: "Детайли на профила – T-Drop Monthly T-Shirts" };

export default async function AccountDetailsPage() {
  const customer = await getCustomer();
  if (!customer) redirect("/your-profile");
  const payload = await getPayloadClient();
  const paid = await payload.count({ collection: "payments", where: { and: [{ customer: { equals: customer.id } }, { status: { equals: "paid" } }] } });
  return (
    <section className="site-container pb-[59px] max-md:px-5 max-md:pb-[49px]">
      <AccountNav orders={paid.totalDocs} />
      <h2 className={`${wooTitle} pt-[50px] max-md:pt-7`}>Детайли на профила</h2>
      <div className="mt-[25px]">
        <ProfileForm customer={customer} />
      </div>
    </section>
  );
}
