import type { ElementCause, ResponsiveFinding, ResponsiveViewport } from "../types";
import { createResponsiveFinding, formatElementCause } from "../utils";

export function checkFlexLayout(params: {
  viewport: ResponsiveViewport;
  flexNoWrapRisks: ElementCause[];
}): ResponsiveFinding[] {
  const { viewport, flexNoWrapRisks } = params;

  if (viewport.width > 768 || flexNoWrapRisks.length === 0) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Flex layout mobilde kırılmıyor",
      desc: `${viewport.name} görünümünde ${flexNoWrapRisks.length} flex container nowrap nedeniyle taşma riski oluşturuyor.`,
      level: "high",
      icon: "columns",
      solution:
        "Mobil breakpointlerde flex-wrap: wrap, flex-direction: column veya min-width: 0 kullanın.",
      causes: flexNoWrapRisks.map((element) => formatElementCause(element)),
    }),
  ];
}