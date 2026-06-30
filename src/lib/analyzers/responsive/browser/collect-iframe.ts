type CollectIframeParams = {
  viewportWidth: number;
};

export function collectRiskyIframes({
  viewportWidth,
}: CollectIframeParams): number {
  return Array.from(
    document.querySelectorAll<HTMLIFrameElement>("iframe"),
  ).filter((iframe) => {
    const rect = iframe.getBoundingClientRect();
    const parent = iframe.parentElement;
    const parentStyles = parent ? window.getComputedStyle(parent) : null;

    const hasResponsiveParent =
      parentStyles?.position === "relative" ||
      parentStyles?.aspectRatio !== "auto" ||
      parentStyles?.overflow === "hidden";

    return rect.width > viewportWidth + 2 || !hasResponsiveParent;
  }).length;
}