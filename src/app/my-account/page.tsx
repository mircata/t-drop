import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBasket, Home, FileText, User, UserPlus, LogOut } from "lucide-react";
import { button } from "@/components/site/shared";

export const metadata: Metadata = { title: "My account – T-Drop Monthly T-Shirts" };

const accountItems = [
  { label: "Поръчки", href: "#", icon: ShoppingBasket, count: "6" },
  { label: "Адреси", href: "#", icon: Home },
  { label: "Методи за разплащане", href: "#", icon: FileText },
  { label: "Детайли на профила", href: "#", icon: User },
  { label: "Subscriptions", href: "#", icon: UserPlus },
  { label: "Излизане", href: "/your-profile", icon: LogOut },
];

const drops = [
  { label: "Култура", image: "/wp/2026/04/cult001.png" },
  { label: "Изкуство", image: "/wp/2026/04/art001.png" },
  { label: "Спорт", image: "/wp/2026/04/sport001.png" },
  { label: "Фитнес", image: "/wp/2026/04/fit001.png" },
];

const accountLink = "text-[#5bc0de] no-underline";

export default function MyAccountPage() {
  return (
    <section className="site-container pb-[59px] max-md:px-5 max-md:pb-[49px]">
      <nav className="pb-10">
        <ul className="flex items-stretch gap-px max-md:flex-col">
          {accountItems.map(({ label, href, icon: Icon, count }) => (
            <li
              key={label}
              className="flex min-h-[82px] min-w-0 flex-1 rounded-[20px] bg-[#f7f7f7] max-md:min-h-0 max-md:w-full max-md:flex-none"
            >
              <Link
                href={href}
                className="flex w-full items-center justify-between px-5 py-3 font-roboto text-[14px] font-bold leading-[29px] tracking-normal text-[#69727d] max-md:mt-2.5 max-md:px-2.5 max-md:pt-0 max-md:text-[18px] max-md:font-medium max-md:leading-[21px] max-md:text-black"
              >
                <span className="min-w-0">
                  {label}
                  {count && (
                    <span className="ml-2 inline-flex h-[17px] w-[36px] items-center justify-center rounded-[9px] bg-[#1d9843] align-middle text-[14px] font-normal leading-[17px] text-white">
                      {count}
                    </span>
                  )}
                </span>
                <Icon size={20} className="shrink-0 text-[#69727d]" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pt-[50px] max-md:pt-7">
        <div className="rounded-[3px] border border-[#d5d8dc] bg-white px-[30px] py-4 font-roboto text-[14px] leading-[29px] tracking-normal text-[#69727d]">
          <p className="mb-5">
            Здравейте, <strong className="font-bold">dropadmin</strong> (не сте{" "}
            <strong className="font-bold">dropadmin</strong>?{" "}
            <Link href="/your-profile" className={accountLink}>Изход</Link>)
          </p>
          <p className="mb-5">
            От вашия профил можете да преглеждате{" "}
            <Link href="#" className={accountLink}>последните си поръчки</Link>, да управлявате вашите{" "}
            <Link href="#" className={accountLink}>адреси за плащане и доставка</Link> и{" "}
            <Link href="#" className={accountLink}>да променяте паролата и данните на профила си</Link>.
          </p>
        </div>
      </div>

      <form action="#" method="post" className="flex flex-col gap-10 max-md:gap-5">
        <fieldset className="min-w-0">
          <legend className="mb-5 w-full font-body text-[16px] leading-[29px] tracking-[0.04em] text-[#333]">
            Следващ дроп
          </legend>
          <div className="grid grid-cols-4 gap-[17px] max-md:grid-cols-1 max-md:gap-5">
            {drops.map(({ label, image }) => (
              <label
                key={label}
                className="flex h-[320px] min-w-0 cursor-pointer flex-col items-center justify-between rounded-[10px] bg-white p-5 max-md:h-[340px]"
              >
                <span
                  className="h-[230px] w-full shrink-0 rounded-[20px] bg-cover bg-center max-md:h-[240px]"
                  style={{ backgroundImage: `url(${image})` }}
                  aria-hidden="true"
                />
                <input type="radio" name="drop" value={label} className="size-[13px] shrink-0" />
                <span className="w-full text-center font-headline text-[21px] leading-[21px] tracking-normal text-[#333]">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className={`${button} h-[84px] w-[201px] max-md:w-full`}>
          SUBMIT
        </button>
      </form>
    </section>
  );
}
