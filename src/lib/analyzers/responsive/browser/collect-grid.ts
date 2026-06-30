import type { ElementCause } from "../types";
import { toElementCause } from "./shared";

type CollectGridParams = {
  allElements: HTMLElement[];
};

export function collectGridOverflowRisks({
  allElements,
}: CollectGridParams): ElementCause[] {
  return allElements
    .filter((element) => {
      const styles = window.getComputedStyle(element);

      if (!styles.display.includes("grid")) return false;

      return element.scrollWidth > element.clientWidth + 2;
    })
    .map(toElementCause)
    .slice(0, 10);
}