"use strict";
(() => {
  // src/lib/analyzers/responsive/browser/shared.ts
  function getAllElements() {
    return Array.from(document.querySelectorAll("*"));
  }
  function toElementCause(element) {
    const tag = element.tagName.toLowerCase();
    return {
      tag
    };
  }

  // src/lib/analyzers/responsive/browser/collect-fixed-elements.ts
  function collectFixedOverlapRisks({
    allElements,
    viewportWidth
  }) {
    return allElements.filter((element) => {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (styles.position !== "fixed") return false;
      if (rect.width <= 0 || rect.height <= 0) return false;
      return rect.top <= 0 && rect.height > 80 && viewportWidth <= 768;
    }).map(toElementCause).slice(0, 10);
  }

  // src/lib/analyzers/responsive/browser/collect-grid.ts
  function collectGridOverflowRisks({
    allElements
  }) {
    return allElements.filter((element) => {
      const styles = window.getComputedStyle(element);
      if (!styles.display.includes("grid")) return false;
      return element.scrollWidth > element.clientWidth + 2;
    }).map(toElementCause).slice(0, 10);
  }

  // src/lib/analyzers/responsive/browser/collect-flex.ts
  function collectFlexNoWrapRisks({
    allElements
  }) {
    return allElements.filter((element) => {
      const styles = window.getComputedStyle(element);
      if (styles.display !== "flex" && styles.display !== "inline-flex") {
        return false;
      }
      if (styles.flexWrap !== "nowrap") return false;
      return element.scrollWidth > element.clientWidth + 2;
    }).map(toElementCause).slice(0, 10);
  }

  // src/lib/analyzers/responsive/browser/collect-navigation.ts
  function collectNavigationOverflow() {
    const nav = document.querySelector(
      "nav, header nav, [data-nav], [data-menu], .menu, .navbar"
    );
    return nav ? nav.scrollWidth > nav.clientWidth + 2 : false;
  }

  // src/lib/analyzers/responsive/browser/collect-clipped-text.ts
  function collectClippedTextElements({
    allElements
  }) {
    return allElements.filter((element) => {
      const styles = window.getComputedStyle(element);
      const clipsText = styles.overflow === "hidden" || styles.overflowX === "hidden" || styles.textOverflow === "ellipsis" || styles.whiteSpace === "nowrap";
      if (!clipsText) return false;
      return element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2;
    }).length;
  }

  // src/lib/analyzers/responsive/browser/collect-touch-target.ts
  function collectSmallTouchTargets() {
    return Array.from(
      document.querySelectorAll(
        "a, button, input, select, textarea, [role='button']"
      )
    ).filter((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (element.getAttribute("aria-hidden") === "true") return false;
      return rect.width < 44 || rect.height < 44;
    }).length;
  }

  // src/lib/analyzers/responsive/browser/collect-iframe.ts
  function collectRiskyIframes({
    viewportWidth
  }) {
    return Array.from(
      document.querySelectorAll("iframe")
    ).filter((iframe) => {
      const rect = iframe.getBoundingClientRect();
      const parent = iframe.parentElement;
      const parentStyles = parent ? window.getComputedStyle(parent) : null;
      const hasResponsiveParent = parentStyles?.position === "relative" || parentStyles?.aspectRatio !== "auto" || parentStyles?.overflow === "hidden";
      return rect.width > viewportWidth + 2 || !hasResponsiveParent;
    }).length;
  }

  // src/lib/analyzers/responsive/browser/collect-media.ts
  function collectRiskyMedia({ viewportWidth }) {
    return Array.from(
      document.querySelectorAll("img, video, canvas, svg")
    ).filter((media) => {
      const rect = media.getBoundingClientRect();
      return rect.width > viewportWidth + 2;
    }).length;
  }

  // src/lib/analyzers/responsive/browser/collect-tables.ts
  function collectRiskyTables({
    viewportWidth
  }) {
    return Array.from(document.querySelectorAll("table")).filter(
      (table) => {
        return table.scrollWidth > viewportWidth + 2;
      }
    ).length;
  }

  // src/lib/analyzers/responsive/browser/collect-fixed-width.ts
  function collectFixedWidthElements({
    allElements,
    viewportWidth
  }) {
    return allElements.filter((element) => {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      const hasPxWidth = styles.width.endsWith("px");
      const hasPxMinWidth = styles.minWidth.endsWith("px");
      return (hasPxWidth || hasPxMinWidth) && rect.width > viewportWidth * 0.9 && viewportWidth <= 768;
    }).map(toElementCause).slice(0, 10);
  }

  // src/lib/analyzers/responsive/browser/collect-overflow.ts
  function collectOverflowContainers({
    allElements
  }) {
    const bodyStyles = window.getComputedStyle(document.body);
    const htmlStyles = window.getComputedStyle(document.documentElement);
    const bodyOverflowRisk = bodyStyles.overflow === "hidden" || bodyStyles.overflowX === "hidden" || htmlStyles.overflow === "hidden" || htmlStyles.overflowX === "hidden";
    const overflowContainers = allElements.filter((element) => {
      const styles = window.getComputedStyle(element);
      const hidesOverflow = styles.overflow === "hidden" || styles.overflowX === "hidden" || styles.overflowY === "hidden";
      if (!hidesOverflow) return false;
      return element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2;
    }).map(toElementCause).slice(0, 10);
    return {
      bodyOverflowRisk,
      overflowContainers
    };
  }

  // src/lib/analyzers/responsive/browser/collect-horizontal.ts
  function collectHorizontalRisks({
    allElements,
    viewportWidth
  }) {
    return allElements.filter((element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      return rect.right > viewportWidth + 2 || rect.left < -2;
    }).map(toElementCause).slice(0, 10);
  }

  // src/lib/analyzers/responsive/browser/collect.ts
  function collectResponsiveData() {
    const viewportWidth = window.innerWidth;
    const documentScrollWidth = document.documentElement.scrollWidth;
    const allElements = getAllElements();
    const hasHorizontalScroll = documentScrollWidth > viewportWidth + 2;
    const overflowingElements = collectHorizontalRisks({
      allElements,
      viewportWidth
    });
    const overflowResult = collectOverflowContainers({
      allElements
    });
    const fixedWidthElements = collectFixedWidthElements({
      allElements,
      viewportWidth
    });
    const riskyTables = collectRiskyTables({
      viewportWidth
    });
    const riskyMedia = collectRiskyMedia({
      viewportWidth
    });
    const riskyIframes = collectRiskyIframes({
      viewportWidth
    });
    const smallTouchTargets = collectSmallTouchTargets();
    const clippedTextElements = collectClippedTextElements({
      allElements
    });
    const navOverflow = collectNavigationOverflow();
    const flexNoWrapRisks = collectFlexNoWrapRisks({
      allElements
    });
    const gridOverflowRisks = collectGridOverflowRisks({
      allElements
    });
    const fixedOverlapRisks = collectFixedOverlapRisks({
      allElements,
      viewportWidth
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
      fixedOverlapRisks
    };
  }

  // src/lib/analyzers/responsive/browser/index.ts
  window.__PRECHECK_COLLECT_RESPONSIVE_DATA__ = collectResponsiveData;
})();
