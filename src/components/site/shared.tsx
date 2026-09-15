import Image from "next/image";

export const SHIRT =
  "/wp/2025/12/u2385526421_backround_blurry_style_design_-sref_httpss.mj_.ru_9b6359ca-3836-4215-b6da-d0520d3b4da6_1.png";

/* Kit typography: Headline 72px Dela Gothic One, uppercase, line-height 112% */
export const headlineBase = "font-headline text-[72px] uppercase leading-[1.12] tracking-normal text-t-red";
/* 72px on desktop, 40px on phones (the kit's mobile size for page titles) */
export const headline = `${headlineBase} max-md:text-[40px]`;
/* 72px on desktop, 36px on phones (used by the landing page section titles) */
export const headline36 = `${headlineBase} max-md:text-[36px]`;
/* Kit typography: Subheadline 21px Dela Gothic One, uppercase, letter-spacing 0.84px */
export const subheadline = "font-headline text-[21px] uppercase leading-[1.12] tracking-[0.84px]";
/* Kit button: 25px 40px padding, radius 50, Dela 21 uppercase */
export const button =
  "inline-block rounded-[50px] bg-t-red px-10 py-[25px] font-headline text-[21px] uppercase leading-none tracking-[0.84px] text-t-cream hover:bg-t-neon hover:text-t-black";
/* Absolutely positioned sticker headings: Handjet 24 uppercase, padding 15/20, radius 25 */
const badgeBase = "absolute rounded-[25px] px-5 py-[15px] text-center uppercase leading-[1.12]";
export const badge = `${badgeBase} font-body text-[24px] tracking-[0.04em]`;
export const badgeNeon = `${badge} bg-t-neon text-t-black`;
export const badgeRed = `${badge} bg-t-red text-white`;
/* Handjet variant used for the "ЕКО Материя" sticker */
export const badgeDot = `${badgeBase} bg-t-neon font-dot text-[14px] tracking-normal text-t-black`;
/* Title of the classic WordPress pages (Cart, Checkout, payment pages): Handjet 40, weight 500 */
export const pageTitle = "mb-4 font-body text-[40px] font-medium leading-[1.2] tracking-normal text-[#333]";
/* White button used on the red FAQ band */
export const buttonWhite =
  "inline-block rounded-[50px] bg-white px-10 py-[25px] font-headline text-[21px] uppercase leading-none tracking-[0.84px] text-t-black hover:bg-t-neon";

export function Shirt({ src = SHIRT, className = "", w = 600, h = 800, aspect = "aspect-[3/4]" }: { src?: string; className?: string; w?: number; h?: number; aspect?: string }) {
  return <Image src={src} alt="" width={w} height={h} className={`${aspect} w-full rounded-[28px] object-cover ${className}`} />;
}

export function InstagramIcon({ className = "size-[92px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 448 512" className={`${className} fill-current`} aria-hidden="true">
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
    </svg>
  );
}

export function FacebookIcon({ className = "size-[92px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 512" className={`${className} fill-current`} aria-hidden="true">
      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
    </svg>
  );
}

export function SocialFollow({ text, smallOnPhones = false, instagram = "#", facebook = "#" }: { text: string; smallOnPhones?: boolean; instagram?: string; facebook?: string }) {
  const icon = smallOnPhones ? "size-[92px] max-md:size-16" : "size-[92px]";
  const link = smallOnPhones ? "flex h-[102px] items-center max-md:h-[74px]" : "flex h-[102px] items-center";
  return (
    <section className="site-container flex flex-col items-center">
      <div className="flex flex-row justify-center gap-5 text-t-red">
        <a href={instagram} aria-label="Instagram" className={link}><InstagramIcon className={icon} /></a>
        <a href={facebook} aria-label="Facebook" className={link}><FacebookIcon className={icon} /></a>
      </div>
      <p className="w-[20%] pb-3.5 pt-[15px] text-center max-md:w-[232px]">{text}</p>
    </section>
  );
}
