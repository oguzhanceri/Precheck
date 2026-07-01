import type {
  ElementCause,
  ResponsiveFinding,
  ResponsiveViewport,
} from "../types";
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

  const formattedElements = overflowContainers
    .map((element) => formatElementCause(element))
    .filter(Boolean)
    .slice(0, 8);

  return [
    createResponsiveFinding({
      title: "Overflow hidden gerçek taşmayı gizliyor olabilir",
      desc: `${viewport.name} görünümünde overflow hidden kullanılan containerlarda içerik taşması tespit edildi.`,
      level: "medium",
      icon: "eye-off",
      solution:
        "overflow-x: hidden ile problemi gizlemek yerine taşan child elemanın width, min-width veya transform değerini düzeltin.",
      causes: formattedElements.length
        ? formattedElements
        : ["body/html üzerinde overflow-x: hidden kullanımı tespit edildi."],
      evidence: formattedElements.length
        ? formattedElements
        : ["body/html üzerinde overflow-x: hidden kullanımı tespit edildi."],
    }),
  ];
}
