import type { ElementCause } from "../types";

export type BrowserResponsiveData = {
  viewportWidth: number;
  documentScrollWidth: number;
  hasHorizontalScroll: boolean;

  overflowingElements: ElementCause[];
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