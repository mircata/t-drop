import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "1 месец – T-Drop Monthly T-Shirts" };

/* WooCommerce product page "1 месец", rendered through the Elementor product template.
   Reference: reference/screenshots/wp/product-1440.jpeg */

const SIZES = ["S", "M", "L", "XL"];
const THEMES = [
  { label: "Поп култура", value: "/wp/2026/01/cult001.png" },
  { label: "Спорт", value: "/wp/2026/01/sport001.png" },
  { label: "Арт", value: "/wp/2026/01/art001.png" },
  { label: "Фитнес", value: "/wp/2026/01/fit001.png" },
];
const SIZE_CHART = [102, 104, 106, 108, 103, 105, 107, "109-1"].map((n) => `/wp/2026/04/Group-${n}.png`);

const label = "block text-[22.4px] leading-[20px] text-[#424242]";
const required = <span className="text-t-red">*</span>;
const field =
  "h-[45px] w-full rounded-[6px] border border-[#c6d0e9] bg-white px-3 text-[19.2px] text-[#5d5d5d] outline-none focus:border-t-red";
const radio =
  "mb-[3px] flex h-[63px] cursor-pointer items-center rounded-[20px] bg-t-grey px-5 text-[19.2px] transition-transform hover:translate-x-[5px] hover:brightness-90";
const radioText = "font-headline text-[23.04px] font-medium tracking-[0.36px] text-[#474747]";

export default function JoinPage() {
  return (
    <>
      <section className="site-container flex min-h-[661px] flex-row max-md:mt-10 max-md:flex-col">
        <div className="flex w-1/3 flex-col justify-center max-md:w-full">
          <Image
            src="/wp/2026/01/Rectangle-16.png"
            alt="1 месец"
            width={800}
            height={1000}
            priority
            className="h-[455px] w-full rotate-[1deg] rounded-[25px] object-cover"
          />
        </div>

        <div className="flex w-2/3 flex-col max-md:w-full">
          <div className="p-5">
            <h1 className="font-headline text-[21px] uppercase leading-[1.12] tracking-[0.84px]">1 месец</h1>
            <p className="mt-0 font-body text-[24px] uppercase leading-[1.12] tracking-[0.04em]">
              <del>20,00 €</del> <ins>17,99 €</ins> / month
            </p>
          </div>

          <form className="p-5" action="#">
            <div className="mt-[18px] flex flex-col gap-4 pl-0.5">
              <div className="w-full">
                <label className={label} htmlFor="gender">Пол{required}</label>
                <select id="gender" name="gender" required className={`${field} mt-2`} defaultValue="male">
                  <option value="male">Мъж</option>
                  <option value="female">Жена</option>
                </select>
              </div>

              <fieldset className="w-full">
                <legend className={label}>Размер{required}</legend>
                <div className="mt-[11px] flex flex-row flex-wrap gap-x-5 gap-y-[13px]">
                  {SIZES.map((s) => (
                    <label key={s} className={radio}>
                      <input type="radio" name="size" value={s.toLowerCase()} required className="mr-2.5 size-4 accent-t-red" />
                      <span className={radioText}>{s}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="w-full">
                <legend className={label}>Този месец предлагаме{required}</legend>
                <div className="mt-[11px] flex flex-row flex-wrap gap-x-5 gap-y-[13px]">
                  {THEMES.map((t) => (
                    <label key={t.label} className={radio}>
                      <input type="radio" name="theme" value={t.value} required className="mr-2.5 size-4 accent-t-red" />
                      <span className={radioText}>{t.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="w-full">
                <label className={label} htmlFor="order-name">Име на поръчка</label>
                <input id="order-name" name="order-name" className={`${field} mt-2`} />
              </div>
            </div>

            <button
              type="submit"
              className="ml-[-2px] mt-[57px] rounded-[60px] bg-t-red px-10 py-5 font-headline text-[28px] uppercase leading-none tracking-[0.84px] text-white hover:bg-t-neon hover:text-black"
            >
              Поръчай
            </button>
          </form>
        </div>
      </section>

      <section className="site-container flex flex-col max-md:px-5">
        <p className="h-[29px]">&nbsp;</p>
        <p className="mt-[15px]">Таблица с размери:</p>
        {[SIZE_CHART.slice(0, 4), SIZE_CHART.slice(4)].map((group, i) => (
          <div key={i} className={`flex flex-row flex-wrap gap-x-[5px] gap-y-[7px] max-md:justify-center ${i === 0 ? "mt-[14px]" : "mt-[21px]"}`}>
            {group.map((src) => (
              <Image key={src} src={src} alt="" width={257} height={300} className="h-[300px] w-[257px]" />
            ))}
          </div>
        ))}
        <p className="mt-[22px]"><em>- Широчината се измерва 1см надолу от дупките за ръкавите</em></p>
        <p className="mt-[14px]"><em>- Дължината се измерва от най-високата част на раменете до най-долния ръб на дрехата</em></p>
      </section>
    </>
  );
}
