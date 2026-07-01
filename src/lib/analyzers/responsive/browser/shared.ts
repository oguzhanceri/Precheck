import type { ElementCause } from "../types";

export function getAllElements() {
  return Array.from(document.querySelectorAll<HTMLElement>("*")).filter(
    (element) => {
      const tag = element.tagName.toLowerCase();
      return tag !== "html" && tag !== "body";
    },
  );
}

export function toElementCause(element: HTMLElement): ElementCause {
  const tag = element.tagName.toLowerCase();
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);

  const className = typeof element.className === "string"
    ? element.className.trim().replace(/\s+/g, " ")
    : undefined;

  return {
    tag,
    id: element.id || undefined,
    className: className || undefined,
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
}
