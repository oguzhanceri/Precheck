import type { ElementCause } from "../types";

export function collectBaseResponsiveData() {
  const documentElement = document.documentElement;
  const body = document.body;
  const viewportWidth = window.innerWidth;

  const documentScrollWidth = Math.max(
    documentElement.scrollWidth,
    body?.scrollWidth ?? 0,
  );

  const allElements = Array.from(
    document.querySelectorAll<HTMLElement>("body *"),
  );

  const toElementCause = (element: HTMLElement): ElementCause => {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    return {
      tag: element.tagName.toLowerCase(),
      className:
        typeof element.className === "string" ? element.className : "",
      id: element.id,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      cssWidth: styles.width,
      minWidth: styles.minWidth,
      maxWidth: styles.maxWidth,
      position: styles.position,
      display: styles.display,
      overflowX: styles.overflowX,
      overflowY: styles.overflowY,
      whiteSpace: styles.whiteSpace,
    };
  };

  return {
    body,
    documentElement,
    viewportWidth,
    documentScrollWidth,
    allElements,
    toElementCause,
  };
}