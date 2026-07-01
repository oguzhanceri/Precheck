import type {
  ElementCause,
  ResponsiveFinding,
  ResponsiveViewport,
} from "../types";
import { createResponsiveFinding, formatElementCause } from "../utils";

export function checkFixedWidth(params: {
  viewport: ResponsiveViewport;
  fixedWidthElements: ElementCause[];
}): ResponsiveFinding[] {
  const { viewport, fixedWidthElements } = params;

  if (viewport.width > 768 || fixedWidthElements.length === 0) {
    return [];
  }

  const formattedElements = fixedWidthElements
    .map((element) => formatElementCause(element))
    .filter(Boolean)
    .slice(0, 8);

  return [
    createResponsiveFinding({
      title: "Mobil viewportta geniş eleman var",
      desc: `${viewport.name} görünümünde ${fixedWidthElements.length} eleman ekran genişliğini aşıyor.`,
      level: "high",
      icon: "layout",
      solution:
        "Mobil breakpointlerde width: 100%, max-width: 100%, min-width: 0 veya uygun grid/flex kırılımı uygulayın.",
      causes: [
        "Mobil breakpointlerde sabit width veya min-width kullanılmış olabilir.",
        "Header, popup, slider veya container yapısı viewport genişliğini aşacak şekilde ayarlanmış olabilir.",
        "Flex veya grid child elemanlarında min-width: 0 eksik olabilir.",
      ],
      evidence: formattedElements,
    }),
  ];
}