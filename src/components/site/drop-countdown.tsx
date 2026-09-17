"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/countdown";

/**
 * The live countdown to the next delivery date, replacing the old hardcoded
 * "12:24:10:035" placeholder. `initial` is what the server already rendered, so the
 * first client render matches the HTML exactly and hydration stays quiet; the
 * interval takes over on mount and corrects any drift from a cached page.
 */
export function DropCountdown({ target, initial }: { target: number; initial: string }) {
  const [text, setText] = useState(initial);

  useEffect(() => {
    const tick = () => setText(formatCountdown(target, Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return <b>{text}</b>;
}
