import Image from "next/image";

/**
 * The decoration on step 1-2's desktop frame (Figma `525:4180`): a neon star behind the
 * heading and three faint outline artworks filling the right half.
 *
 * Desktop only — the mobile frame (`519:579`) has neither, and at 402px there is nowhere
 * for them to go.
 *
 * Every position is the frame's own, converted from its bounding box to the unrotated
 * origin (Figma reports the box of the *rotated* node, and rotation is about the centre, so
 * the origin is the box origin plus half the size difference). Offsets are the frame's `top`
 * minus 198px, the height of the announcement strip and header above this section.
 */
const ART = [
  /* `525:4233` — the flexing figure, top of the stack. */
  { src: "/figma/signup/verify/art-muscles.svg", w: 234.953, h: 301.432, left: 798.19, top: 27.59, rotate: "17.22deg", opacity: 1 },
  /* `525:4254` — the portrait, to its right and lower. */
  { src: "/figma/signup/verify/art-face.svg", w: 196.189, h: 294.837, left: 1095.55, top: 166.88, rotate: "-5.43deg", opacity: 1 },
  /* `525:4184` — the seated figure, faintest and furthest down. */
  { src: "/figma/signup/verify/art-mona.svg", w: 288.018, h: 233.814, left: 764.79, top: 436.31, rotate: "-6.26deg", opacity: 0.23 },
] as const;

/**
 * Sits inside `FunnelPage`'s left column, behind the heading. The account step draws the
 * same star at the same angle further right, behind the end of "СЪЗДАВАНЕ" — hence `left`.
 */
export function VerifyStar({ left = 242 }: { left?: number }) {
  return (
    <Image
      src="/figma/signup/verify/star.svg"
      alt=""
      width={215}
      height={210}
      /* `525:4181`: unrotated origin x=321.75 in the frame, i.e. 242px into the x=80 column. */
      style={{ left }}
      className="absolute top-[0px] w-[215px] max-w-none rotate-[14.63deg] max-lg:hidden"
    />
  );
}

/**
 * The three artworks. Rendered as `FunnelPage`'s aside, so it is a positioned box the width
 * of the right column; the lefts below are frame-absolute and shifted by the column's own
 * offset (x=769) to sit inside it.
 */
export function VerifyArt() {
  return (
    <div className="relative hidden h-[760px] w-full lg:block" aria-hidden="true">
      {ART.map((a) => (
        <Image
          key={a.src}
          src={a.src}
          alt=""
          width={Math.round(a.w)}
          height={Math.round(a.h)}
          style={{ left: a.left - 769, top: a.top, width: a.w, height: a.h, transform: `rotate(${a.rotate})`, opacity: a.opacity }}
          className="absolute max-w-none"
        />
      ))}
    </div>
  );
}
