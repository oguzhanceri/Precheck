import type { ElementCause } from "../types";
import { toElementCause } from "./shared";

type CollectHorizontalParams = {
  allElements: HTMLElement[];
  viewportWidth: number;
};

export function collectHorizontalRisks({
  allElements,
  viewportWidth,
}: CollectHorizontalParams): ElementCause[] {
  return allElements
    .filter((element) => {
      const rect = element.getBoundingClientRect();

      if (rect.width <= 0 || rect.height <= 0) return false;

      return rect.right > viewportWidth + 2 || rect.left < -2;
    })
    .map(toElementCause)
    .slice(0, 10);
}