import type { ElementCause } from "../types";
import { shouldIgnoreResponsiveElement } from "./ignore";
import { toElementCause } from "./shared";

type CollectFixedElementsParams = {
  allElements: HTMLElement[];
  viewportWidth: number;
};

export function collectFixedOverlapRisks({
  allElements,
  viewportWidth,
}: CollectFixedElementsParams): ElementCause[] {
  return allElements
    .filter((element) => {
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }

      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      if (styles.position !== "fixed") return false;
      if (rect.width <= 0 || rect.height <= 0) return false;

      return rect.top <= 0 && rect.height > 80 && viewportWidth <= 768;
    })
    .map(toElementCause)
    .slice(0, 10);
}