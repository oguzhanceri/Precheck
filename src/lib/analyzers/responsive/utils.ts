import type { ElementCause, ResponsiveFinding } from "./types";

export function createResponsiveFinding(
  finding: Omit<
    ResponsiveFinding,
    "category" | "affectedPages" | "affectedCount"
  >,
): ResponsiveFinding {
  return {
    ...finding,
    category: "responsive",
    affectedPages: [],
    affectedCount: 0,
  };
}

export function formatElementCause(element: ElementCause) {
  const selector = [
    element.tag,
    element.id ? `#${element.id}` : "",
    element.className
      ? `.${element.className
          .split(" ")
          .filter(Boolean)
          .slice(0, 3)
          .join(".")}`
      : "",
  ].join("");

  const details = [
    element.width ? `genişlik: ${element.width}px` : "",
    element.height ? `yükseklik: ${element.height}px` : "",
    element.right ? `sağ sınır: ${element.right}px` : "",
    element.cssWidth ? `css width: ${element.cssWidth}` : "",
    element.minWidth ? `min-width: ${element.minWidth}` : "",
    element.maxWidth ? `max-width: ${element.maxWidth}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return `${selector || element.tag} (${details})`;
}