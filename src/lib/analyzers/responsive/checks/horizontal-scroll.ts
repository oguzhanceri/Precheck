import type {
  ElementCause,
  ResponsiveFinding,
  ResponsiveViewport,
} from "../types";
import { createResponsiveFinding, formatElementCause } from "../utils";

export function checkHorizontalScroll(params: {
  viewport: ResponsiveViewport;
  viewportWidth: number;
  documentScrollWidth: number;
  overflowingElements: ElementCause[];
}): ResponsiveFinding[] {
  const { viewport, viewportWidth, documentScrollWidth, overflowingElements } =
    params;

  const hasHorizontalScroll = documentScrollWidth > viewportWidth + 2;

  if (!hasHorizontalScroll) {
    return [];
  }

  const formattedElements = overflowingElements
    .map((element) => formatElementCause(element))
    .filter(Boolean)
    .slice(0, 8);

  return [
    createResponsiveFinding({
      title: "Yatay scroll tespit edildi",
      desc: `${viewport.name} görünümünde sayfa viewport dışına taşıyor. Viewport: ${viewportWidth}px, içerik: ${documentScrollWidth}px.`,
      level: viewport.width <= 414 ? "critical" : "high",
      icon: "move-horizontal",
      solution:
        "Taşan elemanları bulup width, min-width, grid, slider, table veya absolute/fixed yapılarını responsive hale getirin.",
      causes: formattedElements.length
        ? formattedElements
        : [`${viewport.name} görünümünde document genişliği viewportu aşıyor.`],
      evidence: formattedElements.length
        ? formattedElements
        : [
            `Viewport genişliği: ${viewportWidth}px`,
            `Document genişliği: ${documentScrollWidth}px`,
          ],
    }),
  ];
}