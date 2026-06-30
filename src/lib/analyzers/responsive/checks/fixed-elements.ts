import type {
  ElementCause,
  ResponsiveFinding,
  ResponsiveViewport,
} from "../types";
import { createResponsiveFinding, formatElementCause } from "../utils";

export function checkFixedElements(params: {
  viewport: ResponsiveViewport;
  fixedOverlapRisks: ElementCause[];
}): ResponsiveFinding[] {
  const { viewport, fixedOverlapRisks } = params;

  if (fixedOverlapRisks.length === 0) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Fixed eleman mobil içerikle çakışabilir",
      desc: `${viewport.name} görünümünde ${fixedOverlapRisks.length} fixed eleman üst alanı kaplıyor.`,
      level: "medium",
      icon: "pin",
      solution:
        "Mobilde fixed header/floating bar yüksekliğini azaltın veya ana içeriğe uygun padding-top ekleyin.",
      causes: fixedOverlapRisks.map((element) => formatElementCause(element)),
    }),
  ];
}
