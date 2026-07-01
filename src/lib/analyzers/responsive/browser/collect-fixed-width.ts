import type { ElementCause } from "../types";
import { shouldIgnoreResponsiveElement } from "./ignore";
import { toElementCause } from "./shared";

type CollectFixedWidthParams = {
  allElements: HTMLElement[];
  viewportWidth: number;
};

function isInsideReportedElement(
  element: HTMLElement,
  reportedElements: HTMLElement[],
) {
  return reportedElements.some((reported) => reported.contains(element));
}

function getBestRepresentative(element: HTMLElement): HTMLElement {
  const card = element.closest("article, li, [class*='card'], [class*='item']");

  if (card instanceof HTMLElement) {
    return card;
  }

  return element;
}

export function collectFixedWidthElements({
  allElements,
  viewportWidth,
}: CollectFixedWidthParams): ElementCause[] {
  const reportedElements: HTMLElement[] = [];

  const riskyElements = allElements
    .map((element) => getBestRepresentative(element))
    .filter((element, index, array) => array.indexOf(element) === index)
    .filter((element) => {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();

      if (viewportWidth > 768) return false;
      if (shouldIgnoreResponsiveElement(element)) return false;
      if (rect.width <= 0 || rect.height <= 0) return false;

      if (isInsideReportedElement(element, reportedElements)) {
        return false;
      }

      const hasPxWidth = styles.width.endsWith("px");
      const hasPxMinWidth = styles.minWidth.endsWith("px");

      const exceedsViewport = rect.right > viewportWidth + 2;
      const nearlyFullViewport = rect.width > viewportWidth * 0.98;

      const isRisk =
        (hasPxWidth || hasPxMinWidth) && exceedsViewport && !nearlyFullViewport;

      if (isRisk) {
        reportedElements.push(element);
      }

      return isRisk;
    });

  return riskyElements.map(toElementCause).slice(0, 8);
}