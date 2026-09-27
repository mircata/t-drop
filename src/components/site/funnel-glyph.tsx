import Image from "next/image";

/* The funnel frames' 18px glyphs are 20px SVGs drawn 1px outside an 18px box
   (`inset-[-5.56%]`), so the box is kept at 18 and the image allowed to overhang it. */
export function Glyph({ src }: { src: string }) {
  return (
    <span className="relative block size-[18px] shrink-0">
      <Image src={src} alt="" width={20} height={20} className="absolute -top-px -left-px size-[20px] max-w-none" />
    </span>
  );
}

/**
 * The funnel's error line — the picker frame's error bar, annotated *"this is the error
 * notification bar if the user still hasnt selected everything"*: the error glyph and the
 * message in red Handjet. The account step's frames draw no error state of their own, so it
 * uses this one rather than a third style.
 *
 * The live region is always rendered, so the message is announced when it appears.
 */
export function FunnelError({ message, className = "" }: { message?: string; className?: string }) {
  return (
    <div role="alert" aria-live="polite" className={className}>
      {message ? (
        <p className="flex items-center gap-[15px] font-dot text-[18px] leading-[normal] tracking-normal text-t-red">
          <Glyph src="/figma/signup/design/error.svg" />
          <span>{message}</span>
        </p>
      ) : null}
    </div>
  );
}
