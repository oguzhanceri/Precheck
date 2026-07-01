import { shouldIgnoreResponsiveElement } from "./ignore";

type CollectClippedTextParams = {
  allElements: HTMLElement[];
};

export function collectClippedTextElements({
  allElements,
}: CollectClippedTextParams): number {
  return allElements.filter((element) => {
    if (shouldIgnoreResponsiveElement(element)) {
      return false;
    }

    const styles = window.getComputedStyle(element);

    const clipsText =
      styles.overflow === "hidden" ||
      styles.overflowX === "hidden" ||
      styles.textOverflow === "ellipsis" ||
      styles.whiteSpace === "nowrap";

    if (!clipsText) return false;

    return (
      element.scrollWidth > element.clientWidth + 2 ||
      element.scrollHeight > element.clientHeight + 2
    );
  }).length;
}