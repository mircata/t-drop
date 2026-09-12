import { redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";

/* Target of the link in the verification email. Confirms the address, then sends the visitor to log in. */
export default async function VerifyPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) redirect("/your-profile?verify-failed=1");
  const payload = await getPayloadClient();
  let ok = false;
  try {
    ok = await payload.verifyEmail({ collection: "customers", token });
  } catch {
    ok = false;
  }
  redirect(ok ? "/your-profile?verified=1" : "/your-profile?verify-failed=1");
}
