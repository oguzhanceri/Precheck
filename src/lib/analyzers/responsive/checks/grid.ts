import type { ElementCause, ResponsiveFinding, ResponsiveViewport } from "../types";
import { createResponsiveFinding, formatElementCause } from "../utils";

export function checkGridLayout(params: {
  viewport: ResponsiveViewport;
  gridOverflowRisks: ElementCause[];
}): ResponsiveFinding[] {
  const { viewport, gridOverflowRisks } = params;

  if (viewport.width > 768 || gridOverflowRisks.length === 0) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Grid layout mobilde taşıyor",
      desc: `${viewport.name} görünümünde ${gridOverflowRisks.length} grid container viewport genişliğini zorluyor.`,
      level: "high",
      icon: "grid",
      solution:
        "Mobilde grid-template-columns değerini 1 kolona düşürün veya minmax(0, 1fr) kullanın.",
      causes: gridOverflowRisks.map((element) => formatElementCause(element)),
    }),
  ];
}