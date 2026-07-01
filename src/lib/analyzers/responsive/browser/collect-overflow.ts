import type { ElementCause } from "../types";
import { toElementCause } from "./shared";

type CollectOverflowParams = {
  allElements: HTMLElement[];
};

type CollectOverflowResult = {
  bodyOverflowRisk: boolean;
  overflowContainers: ElementCause[];
};

export function collectOverflowContainers({
  allElements,
}: CollectOverflowParams): CollectOverflowResult {
  const bodyStyles = window.getComputedStyle(document.body);
  const htmlStyles = window.getComputedStyle(document.documentElement);

  const bodyOverflowRisk =
    bodyStyles.overflow === "hidden" ||
    bodyStyles.overflowX === "hidden" ||
    htmlStyles.overflow === "hidden" ||
    htmlStyles.overflowX === "hidden";

  const overflowContainers = allElements
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

  return {
    bodyOverflowRisk,
    overflowContainers,
  };
}