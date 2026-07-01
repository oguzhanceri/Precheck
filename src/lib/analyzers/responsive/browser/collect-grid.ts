import type { ElementCause } from "../types";
import { isLayoutGridContainer } from "./grid-utils";
import { shouldIgnoreResponsiveElement } from "./ignore";
import { toElementCause } from "./shared";

type CollectGridParams = {
  allElements: HTMLElement[];
};

function hasMeaningfulGridOverflow(element: HTMLElement) {
  const overflowAmount = element.scrollWidth - element.clientWidth;

  if (overflowAmount <= 16) return false;

  const parentRect = element.getBoundingClientRect();

  return Array.from(element.children).some((child) => {
    if (!(child instanceof HTMLElement)) return false;

    const childRect = child.getBoundingClientRect();

    return (
      childRect.right > parentRect.right + 8 ||
      childRect.left < parentRect.left - 8
    );
  });
}

export function collectGridOverflowRisks({
  allElements,
}: CollectGridParams): ElementCause[] {
  return allElements
    .filter((element) => {
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }

      const styles = window.getComputedStyle(element);

      if (!styles.display.includes("grid")) return false;

      const hasGridColumns =
        styles.gridTemplateColumns && styles.gridTemplateColumns !== "none";

      if (!hasGridColumns) {
        return false;
      }
      const columnCount = styles.gridTemplateColumns
        .split(" ")
        .filter(Boolean).length;

      if (columnCount < 2) {
        return false;
      }

      if (!isLayoutGridContainer(element)) {
        return false;
      }

      return hasMeaningfulGridOverflow(element);
    })
    .map(toElementCause)
    .slice(0, 10);
}
