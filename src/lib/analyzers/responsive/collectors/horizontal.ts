import type { ElementCause } from "../types";

export function collectHorizontalOverflow(params: {
  allElements: HTMLElement[];
  viewportWidth: number;
  toElementCause: (element: HTMLElement) => ElementCause;
}) {
  const { allElements, viewportWidth, toElementCause } = params;

  return allElements
    .map(toElementCause)
    .filter((element) => {
      if (!element.width || element.width <= 0) return false;

      return (
        (element.right ?? 0) > viewportWidth + 2 ||
        (element.left ?? 0) < -2
      );
    })
    .slice(0, 10);
}