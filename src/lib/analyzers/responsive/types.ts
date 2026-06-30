export type ResponsiveFindingLevel = "critical" | "high" | "medium" | "low";

export type ResponsiveViewport = {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
};

export type ElementCause = {
  tag: string;
  className?: string;
  id?: string;
  width?: number;
  height?: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  cssWidth?: string;
  minWidth?: string;
  maxWidth?: string;
  position?: string;
  display?: string;
  overflowX?: string;
  overflowY?: string;
  whiteSpace?: string;
};

export type ResponsiveFinding = {
  title: string;
  desc: string;
  level: ResponsiveFindingLevel;
  icon: string;
  category: "responsive";
  solution: string;
  causes: string[];
  affectedPages: string[];
  affectedCount: number;
};

export type ResponsiveCheckContext = {
  viewport: ResponsiveViewport;
};

export type ResponsiveCheckResult = {
  findings: ResponsiveFinding[];
};

export type ViewportCheckResult = {
  viewportWidth: number;
  documentScrollWidth: number;

  hasHorizontalScroll: boolean;
  overflowingElements: ElementCause[];

  bodyOverflowRisk: boolean;
  overflowContainers: ElementCause[];

  fixedWidthElements: ElementCause[];

  riskyTables: number;
  riskyMedia: number;
  riskyIframes: number;

  smallTouchTargets: number;
  clippedTextElements: number;

  navOverflow: boolean;
  flexNoWrapRisks: ElementCause[];
  gridOverflowRisks: ElementCause[];

  fixedOverlapRisks: ElementCause[];
};
