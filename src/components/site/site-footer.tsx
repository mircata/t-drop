import Link from "next/link";

const footerLink =
  "font-headline text-[21px] uppercase leading-[1.12] tracking-[0.84px] text-t-black hover:text-t-red";

export function SiteFooter() {
  return (
    <footer className="site-container">
      <div className="flex min-h-[432px] flex-row max-lg:flex-col max-lg:items-center max-lg:justify-center">
        <div className="flex flex-1 flex-col justify-center gap-2.5 max-lg:w-[40%] max-lg:items-center max-md:w-full max-md:pt-10">
          <Link href="/about" className={footerLink}>За нас</Link>
          <Link href="/" className={footerLink}>Актуален дроп</Link>
        </div>

        <div className="flex flex-1 flex-col justify-end bg-[url('/wp/2026/04/footer-img2.png')] bg-contain bg-top bg-no-repeat max-lg:order-first max-lg:min-h-[402px] max-lg:items-center">
          <div className="mb-5 text-center font-dot text-[14px] uppercase leading-[1.12]">Newsletter</div>
          <form className="flex w-full flex-col max-lg:w-[53%] max-md:w-[88%]" action="#">
            <input
              type="email"
              name="email"
              required
              placeholder="Email"
              className="h-[52px] w-full rounded-[50px] border border-t-red bg-t-grey px-5 font-body text-[24px] tracking-[0.04em] text-t-black outline-none placeholder:text-[#666]"
            />
            <button
              type="submit"
              className="mt-2.5 h-[71px] w-full rounded-[50px] font-headline text-[21px] uppercase leading-none tracking-[0.84px] text-t-red hover:bg-t-neon"
            >
              Запиши се
            </button>
          </form>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-2.5 max-lg:w-[40%] max-lg:items-center max-lg:pt-2.5 max-md:w-full max-md:pb-5">
          <Link href="#" className={`${footerLink} max-lg:text-center`}>Правила за ползване</Link>
          <Link href="#" className={`${footerLink} max-lg:text-center`}>Политика за поверителност</Link>
          <Link href="#" className={`${footerLink} max-lg:text-center`}>Условия за връщане</Link>
        </div>
      </div>

      <div className="flex flex-row justify-between font-body text-[24px] uppercase leading-[1.12] tracking-[0.04em] max-lg:flex-col max-lg:items-center max-md:pt-10">
        <span>Tdrop © 2026</span>
        <span>Designed by Mirko Minkov</span>
      </div>
    </footer>
  );
}
