import type { ResponsiveFinding, ResponsiveViewport } from "../types";
import { createResponsiveFinding } from "../utils";

export function checkIframe(params: {
  viewport: ResponsiveViewport;
  riskyIframes: number;
}): ResponsiveFinding[] {
  const { viewport, riskyIframes } = params;

  if (riskyIframes === 0) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Iframe responsive wrapper kullanmıyor",
      desc: `${viewport.name} görünümünde ${riskyIframes} iframe responsive aspect-ratio yapısı olmadan kullanılıyor olabilir.`,
      level: "medium",
      icon: "video",
      solution:
        "Iframe embedlerini aspect-ratio wrapper içine alın ve iframe için width: 100%; height: 100%; kullanın.",
      causes: [
        "Youtube, Vimeo, Google Maps veya benzeri iframe embedleri mobilde oranını korumuyor olabilir.",
      ],
      evidence: [`${viewport.name} görünümünde ${riskyIframes} riskli iframe tespit edildi.`],
    }),
  ];
}
