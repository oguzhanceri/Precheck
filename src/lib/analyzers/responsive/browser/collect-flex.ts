import type { ElementCause } from "../types";
import { toElementCause } from "./shared";

type CollectFlexParams = {
  allElements: HTMLElement[];
};

export function collectFlexNoWrapRisks({
  allElements,
}: CollectFlexParams): ElementCause[] {
  return allElements
    .filter((element) => {
      const styles = window.getComputedStyle(element);

      if (styles.display !== "flex" && styles.display !== "inline-flex") {
        return false;
      }

      if (styles.flexWrap !== "nowrap") return false;

      return element.scrollWidth > element.clientWidth + 2;
    })
    .map(toElementCause)
    .slice(0, 10);
}