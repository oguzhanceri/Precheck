import type { ResponsiveFinding, ResponsiveViewport } from "../types";
import { createResponsiveFinding } from "../utils";

export function checkNavigation(params: {
  viewport: ResponsiveViewport;
  navOverflow: boolean;
}): ResponsiveFinding[] {
  const { viewport, navOverflow } = params;

  if (!navOverflow || viewport.width > 1024) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Responsive navigation taşması",
      desc: `${viewport.name} görünümünde navigasyon kendi container genişliğini aşıyor.`,
      level: "high",
      icon: "menu",
      solution:
        "Tablet/mobil breakpointlerde desktop nav gizlenmeli, hamburger/mobile menu aktif olmalı veya nav spacing düşürülmeli.",
      causes: [
        "Desktop navigation mobil/tablet görünümde açık kalıyor olabilir.",
        "Menü itemleri container genişliğine sığmıyor olabilir.",
      ],
      evidence: [`${viewport.name} görünümünde navigation container taşması tespit edildi.`],
    }),
  ];
}
