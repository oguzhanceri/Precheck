import type { ElementCause } from "../types";
import { toElementCause } from "./shared";

type CollectOverflowParams = {
  allElements: HTMLElement[];
};

export function collectOverflowContainers({
  allElements,
}: CollectOverflowParams): ElementCause[] {
  return allElements
    .filter((element) => {
      const styles = window.getComputedStyle(element);

      const hidesOverflow =
        styles.overflow === "hidden" ||
        styles.overflowX === "hidden" ||
        styles.overflowY === "hidden";

      if (!hidesOverflow) return false;

      return (
        element.scrollWidth > element.clientWidth + 2 ||
        element.scrollHeight > element.clientHeight + 2
      );
    })
    .map(toElementCause)
    .slice(0, 10);
}