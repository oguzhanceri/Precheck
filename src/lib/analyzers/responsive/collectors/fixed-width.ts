import type { ElementCause } from "../types";

export function collectFixedWidthElements(params: {
  allElements: HTMLElement[];
  viewportWidth: number;
  toElementCause: (element: HTMLElement) => ElementCause;
}) {
  const { allElements, viewportWidth, toElementCause } = params;

  return allElements
    .map(toElementCause)
    .filter((element) => {
      if (!element.width) return false;

      return element.width > viewportWidth + 2;
    })
    .slice(0, 10);
}