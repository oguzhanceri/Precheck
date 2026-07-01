import type { ElementCause } from "../types";
import { isLayoutFlexContainer } from "./flex-utils";
import { shouldIgnoreResponsiveElement } from "./ignore";
import { toElementCause } from "./shared";

type CollectFlexParams = {
  allElements: HTMLElement[];
};

function hasMeaningfulFlexOverflow(element: HTMLElement) {
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

export function collectFlexNoWrapRisks({
  allElements,
}: CollectFlexParams): ElementCause[] {
  return allElements
    .filter((element) => {
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }

      const styles = window.getComputedStyle(element);

      if (styles.display !== "flex" && styles.display !== "inline-flex") {
        return false;
      }

      if (!isLayoutFlexContainer(element)) {
        return false;
      }

      if (styles.flexWrap !== "nowrap") return false;

      return hasMeaningfulFlexOverflow(element);
    })
    .map(toElementCause)
    .slice(0, 10);
}
