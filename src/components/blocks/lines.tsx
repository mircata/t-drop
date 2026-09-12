import { Fragment } from "react";

/** Renders a textarea value with <br /> at each line break, no wrapper element. */
export function Lines({ text }: { text: string }) {
  return text.split("\n").map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {part}
    </Fragment>
  ));
}
