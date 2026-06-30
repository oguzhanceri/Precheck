import type { ResponsiveViewport } from "./types";

export const RESPONSIVE_VIEWPORTS: ResponsiveViewport[] = [
  { name: "Mobile XS - 320px", width: 320, height: 720, deviceScaleFactor: 2, isMobile: true },
  { name: "Mobile S - 375px", width: 375, height: 812, deviceScaleFactor: 2, isMobile: true },
  { name: "Mobile M - 390px", width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
  { name: "Mobile L - 414px", width: 414, height: 896, deviceScaleFactor: 2, isMobile: true },
  { name: "Tablet - 768px", width: 768, height: 1024, deviceScaleFactor: 1, isMobile: true },
  { name: "Small Laptop - 1024px", width: 1024, height: 768, deviceScaleFactor: 1, isMobile: false },
  { name: "Desktop - 1280px", width: 1280, height: 800, deviceScaleFactor: 1, isMobile: false },
];