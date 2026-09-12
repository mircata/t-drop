import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = { title: "Cart – T-Drop Monthly T-Shirts" };

/* WooCommerce block cart in its empty state, with the "New in store" product grid.
   Reference: reference/screenshots/wp/cart-1440.jpeg */

const PRODUCTS = [
  { name: "1 month +1 wife wanted one as well", price: <>15,00 € / Month</>, sale: false },
  { name: "1 month +1 family member", price: <>15,00 € / Month</>, sale: false },
  { name: "1 месец", price: <><del>20,00 €</del> <ins className="no-underline">17,99 €</ins> / Month</>, sale: true },
];

function SadFace() {
  return (
    <svg viewBox="0 0 24 24" className="size-[100px] fill-[#333]" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM8.5 9.5a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm5 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0zM12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5zm-4.5-1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5c0-.5-1.5-2.5-1.5-2.5s-1.5 2-1.5 2.5z" />
    </svg>
  );
}

export default function CartPage() {
  return (
    <section className="site-container flex flex-col pt-2 max-md:px-5">
      <h1 className="font-body text-[40px] font-medium leading-[1.2] text-[#333]">Cart</h1>

      <div className="mt-6 flex flex-col items-center py-4">
        <SadFace />
        <p className="mt-6 text-[16px] font-medium text-[#333]">Your cart is currently empty!</p>
      </div>

      <div className="my-2 flex justify-center gap-[70px] text-[10px] text-[#333]">
        <span>•</span><span>•</span><span>•</span>
      </div>

      <h2 className="mt-2 text-center text-[32px] font-medium leading-[1.2] text-[#333]">New in store</h2>

      <ul className="mt-4 flex flex-row max-md:flex-col">
        {PRODUCTS.map((p) => (
          <li key={p.name} className="relative flex w-1/4 flex-col items-center px-3 py-0 max-md:w-full">
            <Link href="/join" className="block w-[300px] max-w-full">
              <Image src="/wp/2026/01/Rectangle-16.png" alt="" width={300} height={300} className="size-[300px] object-cover" />
            </Link>
            {p.sale && (
              <span className="absolute right-[10px] top-[4px] rounded-[4px] border border-[#43454b] bg-white px-2.5 py-2 text-[10px] font-semibold uppercase text-[#43454b]">
                Промоция
              </span>
            )}
            <Link href="/join" className="mt-[22px] w-[300px] text-center text-[12px] font-medium text-[#cc3366] underline">
              {p.name}
            </Link>
            <div className="mt-[13px] text-center text-[12px]">{p.price}</div>
            <Link
              href="/join"
              className="mt-3 rounded-full bg-[#32373c] px-[18px] py-2.5 text-[12px] text-white underline"
            >
              Select options
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
