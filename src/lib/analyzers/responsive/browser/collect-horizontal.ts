import type { ElementCause } from "../types";
import { shouldIgnoreResponsiveElement } from "./ignore";
import { toElementCause } from "./shared";

type CollectHorizontalParams = {
  allElements: HTMLElement[];
  viewportWidth: number;
};

function isRootElement(element: HTMLElement) {
  return element === document.documentElement || element === document.body;
}

function isInsideAlreadyReportedElement(
  element: HTMLElement,
  reportedElements: HTMLElement[],
) {
  return reportedElements.some((reported) => reported.contains(element));
}

export function collectHorizontalRisks({
  allElements,
  viewportWidth,
}: CollectHorizontalParams): ElementCause[] {
  const reportedElements: HTMLElement[] = [];

  return allElements
    .filter((element) => {
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }

      const rect = element.getBoundingClientRect();

      if (isRootElement(element)) return false;
      if (rect.width <= 0 || rect.height <= 0) return false;

      const isOverflowing = rect.right > viewportWidth + 2 || rect.left < -2;

      if (!isOverflowing) return false;

      if (isInsideAlreadyReportedElement(element, reportedElements)) {
        return false;
      }

      reportedElements.push(element);

      return true;
    })
    .map(toElementCause)
    .slice(0, 10);
}