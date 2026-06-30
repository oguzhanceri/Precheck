import type { ResponsiveFinding, ResponsiveViewport } from "../types";
import { createResponsiveFinding } from "../utils";

export function checkTouchTargets(params: {
  viewport: ResponsiveViewport;
  smallTouchTargets: number;
}): ResponsiveFinding[] {
  const { viewport, smallTouchTargets } = params;

  if (viewport.width > 768 || smallTouchTargets <= 8) {
    return [];
  }

  return [
    createResponsiveFinding({
      title: "Küçük touch target alanları var",
      desc: `${viewport.name} görünümünde ${smallTouchTargets} tıklanabilir alan 44x44px önerisinin altında.`,
      level: "medium",
      icon: "hand",
      solution:
        "Mobilde buton, link ve form alanlarının minimum 44px dokunma alanına sahip olmasını sağlayın.",
      causes: [
        "Mobil link veya buton padding değerleri düşük olabilir.",
        "Menü, footer veya form elemanları dokunmak için küçük kalıyor olabilir.",
      ],
    }),
  ];
}