import type { ElementCause, ResponsiveFinding, ResponsiveViewport } from "../types";
import { createResponsiveFinding, formatElementCause } from "../utils";

export function checkFixedWidth(params: {
  viewport: ResponsiveViewport;
  fixedWidthElements: ElementCause[];
}): ResponsiveFinding[] {
  const { viewport, fixedWidthElements } = params;

  if (viewport.width > 768 || fixedWidthElements.length === 0) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Mobil viewportta geniş eleman var",
      desc: `${viewport.name} görünümünde ${fixedWidthElements.length} eleman ekran genişliğini aşıyor.`,
      level: "high",
      icon: "layout",
      solution:
        "Mobil breakpointlerde width: 100%, max-width: 100%, min-width: 0 veya uygun grid/flex kırılımı uygulayın.",
      causes: fixedWidthElements.map((element) => formatElementCause(element)),
    }),
  ];
}