import type { ElementCause } from "../types";

export function collectOverflowContainers(params: {
  toElementCause: (element: HTMLElement) => ElementCause;
}) {
  const { toElementCause } = params;

  return Array.from(
    document.querySelectorAll<HTMLElement>(
      "html, body, main, section, .container, .wrapper, [class*='container'], [class*='wrapper']",
    ),
  )
    .filter((element) => {
      const styles = window.getComputedStyle(element);

      const hidesOverflow =
        styles.overflowX === "hidden" || styles.overflow === "hidden";

      return hidesOverflow && element.scrollWidth > element.clientWidth + 2;
    })
    .map(toElementCause)
    .slice(0, 10);
}