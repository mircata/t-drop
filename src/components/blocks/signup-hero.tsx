import Image from "next/image";
import { SignupEmailForm } from "@/components/forms/signup-email-form";
import { mediaUrl } from "@/lib/payload";
import type { Page } from "@/payload-types";

type Props = Extract<NonNullable<Page["layout"]>[number], { blockType: "signupHero" }>;

/**
 * Step 0 of the funnel — the landing hero, Figma `519:3` (mobile, 402px) and `525:3048`
 * (desktop, 1440×876), annotated *"this is a the new redesigned hero section of the landing
 * page"*. It replaces the old `hero` block on `/`.
 *
 * The two frames are different compositions, not one layout at two widths, so they are
 * written separately rather than bent into each other with breakpoints:
 *
 * - **Mobile** is a centred stack — headings, body, form — with the three photos in a row
 *   *below* the button, and the neon star and circle baked into one decorative SVG behind
 *   the headings (`519:367`).
 * - **Desktop** is a left column at x=80 with the photos scattered across the right half,
 *   overlapping each other and a neon lozenge. Everything is absolutely placed at the
 *   frame's own coordinates, which is how the rest of this codebase carries pixel values
 *   (see "Rules for edits" in CLAUDE.md). Offsets are the frame's `top` minus 160px, the
 *   height of the announcement strip and header that the site layout renders above this.
 *
 * Both headings are red. "Всеки месец" is Handjet ExtraBold — `font-dot`, not `font-headline`
 * — at 116px on desktop and 85.6px on mobile, with the design's own uneven line heights
 * (1.27 then 0.79) that tuck the second line up under the first. "нови тениски" is Dela
 * Gothic One and is much smaller than the line above it: 25px on desktop, 38px on mobile.
 *
 * The photos are decorative, so they carry empty alt text.
 */

/* Frame `525:3048` draws DotGothic16 on the placeholder; the owner confirmed on 2026-09-22
   that this is a stale layer and the face is Handjet, i.e. `font-dot`. */

/* Figma reports the bounding box of the *rotated* image. Rotation is about the centre, so
   the unrotated origin these need is the box origin plus half the difference in size —
   placing the box values directly would shift every photo by tens of pixels. */
const DESKTOP_PHOTOS = [
  { key: "left", rotate: "-18.11deg", w: 283.491, h: 331.07, left: 498.27, top: 213.03, z: "z-10" },
  { key: "mid", rotate: "-9.66deg", w: 418.561, h: 488.809, left: 754.42, top: 92.37, z: "z-30" },
  { key: "right", rotate: "20.54deg", w: 283.491, h: 331.07, left: 1040.77, top: 29.83, z: "z-10" },
] as const;

const MOBILE_PHOTOS = [
  { key: "left", rotate: "-18.11deg", w: 143, h: 167, left: -3.25, top: 25.31, z: "z-10" },
  { key: "mid", rotate: "-1.98deg", w: 211.133, h: 246.567, left: 100.59, top: 14.24, z: "z-30" },
  { key: "right", rotate: "20.54deg", w: 143, h: 167, left: 281.09, top: 0, z: "z-10" },
] as const;

export function SignupHeroBlock(b: Props) {
  const photos = b.photos ?? [];
  /* Fall back to the frame's own artwork when an editor has not uploaded three of their
     own, so the section never renders with holes in it. */
  const src = (i: number, fallback: string) => mediaUrl(photos[i]?.photo, fallback);
  const sources = [
    src(0, "/figma/signup/photo-left.png"),
    src(1, "/figma/signup/photo-mid.png"),
    src(2, "/figma/signup/photo-right.png"),
  ];

  /* The frame sets "Всеки месец" as one text node that wraps, with the second line tucked
     up under the first (leading 1.27 then 0.79). Split on the editor's own line breaks, the
     same convention the `Lines` helper uses elsewhere, so the break stays editable. */
  const topLines = b.headingTop.split(/\r?\n/).filter(Boolean);

  const form = (align: "center" | "start") => (
    <SignupEmailForm placeholder={b.emailPlaceholder} ctaLabel={b.ctaLabel} note={b.fieldNote} align={align} />
  );

  return (
    <>
      {/* ---------------------------------------------------------------- mobile */}
      <section className="relative flex flex-col items-center overflow-hidden pt-[60px] lg:hidden">
        <div className="relative flex w-full flex-col items-center px-5">
          <Image
            src="/figma/signup/headline-decor-mobile.svg"
            alt=""
            width={335}
            height={239}
            className="pointer-events-none absolute left-1/2 top-[34px] w-[335px] max-w-none translate-x-[calc(-50%+18px)]"
          />

          <h1 className="relative flex flex-col items-center text-center uppercase text-t-red">
            {topLines.map((line, i) => (
              <span
                key={line}
                className={`font-dot text-[85.582px] font-extrabold tracking-[4.2791px] ${i === 0 ? "leading-[1.21]" : "leading-[0.79]"}`}
              >
                {line}
              </span>
            ))}
            <span className="mt-[9px] font-headline text-[38.037px] leading-[0.95]">{b.headingBottom}</span>
          </h1>
          <p className="relative mt-[55px] w-[206px] text-center font-dot text-[18px] leading-[normal] text-t-black">
            {b.body}
          </p>

          <div className="relative mt-[45px]">{form("center")}</div>
        </div>

        {/* `525:1115`–`525:1117`: a row under the button, the middle one larger and on top. */}
        <div className="relative mt-[60px] h-[265px] w-[402px] shrink-0">
          {MOBILE_PHOTOS.map((p, i) => (
            <span
              key={p.key}
              className={`absolute block overflow-hidden rounded-[28px] ${p.z}`}
              style={{ left: p.left, top: p.top, width: p.w, height: p.h, transform: `rotate(${p.rotate})` }}
            >
              <Image src={sources[i]} alt="" fill sizes="220px" className="object-cover" />
            </span>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------- desktop */}
      <section className="relative mx-auto hidden h-[716px] w-full max-w-[1440px] overflow-hidden lg:block">
        {/* Neon star, right of "ВСЕКИ" (`525:3428`, rotated -29.12deg). */}
        <Image
          src="/figma/signup/star.svg"
          alt=""
          width={150}
          height={145}
          className="pointer-events-none absolute left-[267px] top-[21px] w-[150px] -rotate-[29.12deg]"
        />
        {/* Neon circle, behind "НОВИ" (`525:3427`). */}
        <Image
          src="/figma/signup/circle.svg"
          alt=""
          width={114}
          height={114}
          className="pointer-events-none absolute left-[24px] top-[233px] size-[114px]"
        />

{/* 25px, not the frame's 49px. Figma trims the half-leading above the first line, so
            its 212px text box holds an ink block that starts ~11px in; the browser keeps that
            leading and pushes the same ink 24px lower, which closed the gap to "нови тениски"
            to nothing. Measured from canvas ink metrics (cap ink is 75px at this size), not
            from line boxes — a line box reports overlaps that are not there. */}
        <h1 className="absolute left-[81px] top-[25px] w-[463px] uppercase text-t-red">
          {topLines.map((line, i) => (
            <span
              key={line}
              className={`block font-dot text-[116.104px] font-extrabold tracking-[5.8052px] ${i === 0 ? "leading-[1.21]" : "leading-[0.79]"}`}
            >
              {line}
            </span>
          ))}
        </h1>

        <p className="absolute left-[81px] top-[278px] font-headline text-[25.175px] uppercase leading-[0.95] text-t-red">
          {b.headingBottom}
        </p>

        {/* 362px, not the frame's 341px: Handjet renders this sentence 361.2px wide in the
            browser against Figma's ~341px, so at the frame width it wraps to two lines where
            the design has one. Widened to keep the line count, the same deliberate departure
            already made for the /join USP box (CLAUDE.md). */}
        <p className="absolute left-[81px] top-[350px] w-[362px] font-dot text-[18px] leading-[normal] text-t-black">
          {b.body}
        </p>

        <div className="absolute left-[81px] top-[409px]">{form("start")}</div>

        {DESKTOP_PHOTOS.map((p, i) => (
          <span
            key={p.key}
            className={`absolute block overflow-hidden rounded-[36.156px] ${p.z}`}
            style={{ left: p.left, top: p.top, width: p.w, height: p.h, transform: `rotate(${p.rotate})` }}
          >
            <Image src={sources[i]} alt="" fill sizes="420px" className="object-cover" />
          </span>
        ))}

        {/* Neon lozenge, over the left photo and under the big one (`525:3053`). */}
        <Image
          src="/figma/signup/lozenge.svg"
          alt=""
          width={293}
          height={204}
          className="pointer-events-none absolute left-[540px] top-[277px] z-20 w-[293px]"
        />
      </section>
    </>
  );
}
