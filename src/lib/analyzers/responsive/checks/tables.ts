import type { ResponsiveFinding, ResponsiveViewport } from "../types";
import { createResponsiveFinding } from "../utils";

export function checkTables(params: {
  viewport: ResponsiveViewport;
  riskyTables: number;
}): ResponsiveFinding[] {
  const { viewport, riskyTables } = params;

  if (riskyTables === 0) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Responsive olmayan tablo tespit edildi",
      desc: `${viewport.name} görünümünde ${riskyTables} tablo scroll wrapper olmadan taşıyor.`,
      level: "medium",
      icon: "table",
      solution:
        "Tabloları overflow-x: auto wrapper içine alın veya mobilde kart/list görünümüne dönüştürün.",
      causes: [`${viewport.name} viewportunda tablo ekran genişliğini aşıyor.`],
      evidence: [`${viewport.name} görünümünde ${riskyTables} responsive olmayan tablo tespit edildi.`],
    }),
  ];
}
