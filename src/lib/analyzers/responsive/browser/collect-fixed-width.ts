import type { ElementCause } from "../types";
import { toElementCause } from "./shared";

type CollectFixedWidthParams = {
  allElements: HTMLElement[];
  viewportWidth: number;
};

export function collectFixedWidthElements({
  allElements,
  viewportWidth,
}: CollectFixedWidthParams): ElementCause[] {
  return allElements
    .filter((element) => {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) return false;

      const hasPxWidth = styles.width.endsWith("px");
      const hasPxMinWidth = styles.minWidth.endsWith("px");

      return (
        (hasPxWidth || hasPxMinWidth) &&
        rect.width > viewportWidth * 0.9 &&
        viewportWidth <= 768
      );
    })
    .map(toElementCause)
    .slice(0, 10);
}