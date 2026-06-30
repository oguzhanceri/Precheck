import type { ResponsiveFinding, ResponsiveViewport } from "../types";
import { createResponsiveFinding } from "../utils";

export function checkClippedText(params: {
  viewport: ResponsiveViewport;
  clippedTextElements: number;
}): ResponsiveFinding[] {
  const { viewport, clippedTextElements } = params;

  if (clippedTextElements === 0) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Metin kırpılması tespit edildi",
      desc: `${viewport.name} görünümünde ${clippedTextElements} elemanda içerik kırpılıyor olabilir.`,
      level: "medium",
      icon: "text",
      solution:
        "Sabit height, overflow-hidden, nowrap ve ellipsis kullanımlarını mobil breakpointlerde kontrol edin.",
      causes: [
        "Container yüksekliği sabit kalmış olabilir.",
        "Mobilde font boyutu veya satır yüksekliği alana sığmıyor olabilir.",
      ],
    }),
  ];
}