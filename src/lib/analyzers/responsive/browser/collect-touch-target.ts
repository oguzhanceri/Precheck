export function collectSmallTouchTargets(): number {
  return Array.from(
    document.querySelectorAll<HTMLElement>(
      "a, button, input, select, textarea, [role='button']",
    ),
  ).filter((element) => {
    const rect = element.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;

    return rect.width < 44 || rect.height < 44;
  }).length;
}