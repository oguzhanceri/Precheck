import type { ResponsiveFinding, ResponsiveViewport } from "../types";
import { createResponsiveFinding } from "../utils";

export function checkMedia(params: {
  viewport: ResponsiveViewport;
  riskyMedia: number;
}): ResponsiveFinding[] {
  const { viewport, riskyMedia } = params;

  if (riskyMedia === 0) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Medya elemanı viewport dışına taşıyor",
      desc: `${viewport.name} görünümünde ${riskyMedia} medya elemanı ekran dışına taşıyor.`,
      level: "medium",
      icon: "image",
      solution:
        "Görsel, video, iframe, canvas ve svg elemanlarına max-width: 100%; height: auto; ekleyin.",
      causes: [
        `${viewport.name} viewportunda medya genişliği viewportu aşıyor.`,
      ],
      evidence: [`${viewport.name} görünümünde ${riskyMedia} riskli medya elemanı tespit edildi.`],
    }),
  ];
}
