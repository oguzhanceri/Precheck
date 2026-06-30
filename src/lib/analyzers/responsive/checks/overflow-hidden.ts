import type { ElementCause, ResponsiveFinding, ResponsiveViewport } from "../types";
import { createResponsiveFinding, formatElementCause } from "../utils";

export function checkOverflowHidden(params: {
  viewport: ResponsiveViewport;
  bodyOverflowRisk: boolean;
  overflowContainers: ElementCause[];
}): ResponsiveFinding[] {
  const { viewport, bodyOverflowRisk, overflowContainers } = params;

  if (!bodyOverflowRisk) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Overflow hidden gerçek taşmayı gizliyor olabilir",
      desc: `${viewport.name} görünümünde overflow hidden kullanılan containerlarda içerik taşması tespit edildi.`,
      level: "medium",
      icon: "eye-off",
      solution:
        "overflow-x: hidden ile problemi gizlemek yerine taşan child elemanın width, min-width veya transform değerini düzeltin.",
      causes: overflowContainers.map((element) => formatElementCause(element)),
    }),
  ];
}