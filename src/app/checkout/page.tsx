import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Checkout – T-Drop Monthly T-Shirts" };

const field = "w-full rounded-[4px] border border-t-black/30 bg-white px-4 py-3 text-[18px] outline-none focus:border-t-red";
const h = "mb-4 text-[21px] font-medium";

export default function CheckoutPage() {
  return (
    <section className="site-container flex flex-row gap-12 py-10 max-lg:flex-col-reverse max-md:px-5">
      <form className="flex flex-[2] flex-col gap-10" action="#">
        <div>
          <h2 className={h}>Contact information</h2>
          <input type="email" placeholder="Email address" className={field} required />
        </div>
        <div>
          <h2 className={h}>Shipping address</h2>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <input placeholder="First name" className={field} required />
            <input placeholder="Last name" className={field} required />
            <input placeholder="Address" className={`${field} col-span-2 max-md:col-span-1`} required />
            <input placeholder="City" className={field} required />
            <input placeholder="Postal code" className={field} required />
            <select className={`${field} col-span-2 max-md:col-span-1`} defaultValue="BG">
              <option value="BG">Bulgaria</option>
            </select>
            <input placeholder="Phone (optional)" className={`${field} col-span-2 max-md:col-span-1`} />
          </div>
        </div>
        <div>
          <h2 className={h}>Payment options</h2>
          <label className="flex items-center gap-3 rounded-[10px] border border-t-black/20 bg-white p-4 text-[18px]">
            <input type="radio" name="payment" defaultChecked className="size-5 accent-t-red" /> Credit / Debit Card
          </label>
          <div className="mt-3 grid grid-cols-3 gap-3 max-md:grid-cols-1">
            <input placeholder="Card number" className={`${field} col-span-3 max-md:col-span-1`} />
            <input placeholder="MM / YY" className={field} />
            <input placeholder="CVC" className={field} />
          </div>
        </div>
        <button
          type="submit"
          className="self-start rounded-[60px] bg-t-red px-10 py-5 font-headline text-[28px] uppercase tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-black max-md:w-full"
        >
          Place Order
        </button>
      </form>

      <aside className="flex-1 self-start rounded-[20px] bg-white p-6 shadow-[0_0_10px_5px_rgba(0,0,0,0.06)]">
        <h2 className={h}>Order summary</h2>
        <div className="flex justify-between border-b border-t-black/10 py-3 text-[18px]"><span>1 месец × 1</span><span>17,99 €</span></div>
        <div className="flex justify-between border-b border-t-black/10 py-3 text-[18px]"><span>Subtotal</span><span>17,99 €</span></div>
        <div className="flex justify-between border-b border-t-black/10 py-3 text-[18px]"><span>Shipping</span><span>Free shipping</span></div>
        <div className="flex justify-between py-3 text-[21px] font-medium"><span>Total</span><span>17,99 €</span></div>
        <p className="text-[14px] opacity-70">Recurring totals: 17,99 € every month</p>
        <Link href="/cart" className="mt-4 block text-[14px] underline opacity-70">Return to cart</Link>
      </aside>
    </section>
  );
}
