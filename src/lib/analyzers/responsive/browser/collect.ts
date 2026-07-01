import { collectFixedOverlapRisks } from "./collect-fixed-elements";
import { collectGridOverflowRisks } from "./collect-grid";
import { collectFlexNoWrapRisks } from "./collect-flex";
import { collectNavigationOverflow } from "./collect-navigation";
import { collectClippedTextElements } from "./collect-clipped-text";
import { collectSmallTouchTargets } from "./collect-touch-target";
import { collectRiskyIframes } from "./collect-iframe";
import { collectRiskyMedia } from "./collect-media";
import { collectRiskyTables } from "./collect-tables";
import { collectFixedWidthElements } from "./collect-fixed-width";
import { collectOverflowContainers } from "./collect-overflow";
import { collectHorizontalRisks } from "./collect-horizontal";
import { getAllElements } from "./shared";
import type { BrowserResponsiveData } from "./types";

export function collectResponsiveData(): BrowserResponsiveData {
  const viewportWidth = window.innerWidth;
  const documentScrollWidth = document.documentElement.scrollWidth;

  const allElements = getAllElements();

  const hasHorizontalScroll = documentScrollWidth > viewportWidth + 2;

  const overflowingElements = collectHorizontalRisks({
    allElements,
    viewportWidth,
  });

  const overflowResult = collectOverflowContainers({
    allElements,
  });

  const fixedWidthElements = collectFixedWidthElements({
    allElements,
    viewportWidth,
  });

  const riskyTables = collectRiskyTables({
    viewportWidth,
  });

  const riskyMedia = collectRiskyMedia({
    viewportWidth,
  });

  const riskyIframes = collectRiskyIframes({
    viewportWidth,
  });

  const smallTouchTargets = collectSmallTouchTargets();

  const clippedTextElements = collectClippedTextElements({
    allElements,
  });

  const navOverflow = collectNavigationOverflow();

  const flexNoWrapRisks = collectFlexNoWrapRisks({
    allElements,
  });

  const gridOverflowRisks = collectGridOverflowRisks({
    allElements,
  });

  const fixedOverlapRisks = collectFixedOverlapRisks({
    allElements,
    viewportWidth,
  });

  return {
    viewportWidth,
    documentScrollWidth,
    hasHorizontalScroll,

    overflowingElements,
    bodyOverflowRisk: overflowResult.bodyOverflowRisk,
    overflowContainers: overflowResult.overflowContainers,
    fixedWidthElements,

    riskyTables,
    riskyMedia,
    riskyIframes,
    smallTouchTargets,
    clippedTextElements,

    navOverflow,

    flexNoWrapRisks,
    gridOverflowRisks,
    fixedOverlapRisks,
  };
}