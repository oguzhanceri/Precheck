"use strict";
(() => {
  // src/lib/analyzers/responsive/browser/ignore.ts
  var IGNORED_STRUCTURE_SELECTORS = [
    ".swiper",
    ".swiper-wrapper",
    ".swiper-slide",
    ".slick-slider",
    ".slick-track",
    ".slick-slide",
    ".splide",
    ".splide__track",
    ".splide__slide",
    ".embla",
    ".embla__container",
    ".embla__slide",
    ".keen-slider",
    ".keen-slider__slide"
  ];
  var IGNORED_OVERLAY_KEYWORDS = [
    "popup",
    "modal",
    "overlay",
    "drawer",
    "mega-menu",
    "search"
  ];
  function includesKeyword(value, keywords) {
    const normalized = value.toLowerCase();
    return keywords.some((keyword) => normalized.includes(keyword));
  }
  function shouldIgnoreResponsiveElement(element) {
    if (element === document.documentElement || element === document.body) {
      return true;
    }
    if (IGNORED_STRUCTURE_SELECTORS.some((selector) => element.matches(selector))) {
      return true;
    }
    if (element.closest(IGNORED_STRUCTURE_SELECTORS.join(","))) {
      return true;
    }
    const className = element.className.toString();
    const id = element.id;
    return includesKeyword(className, IGNORED_OVERLAY_KEYWORDS) || includesKeyword(id, IGNORED_OVERLAY_KEYWORDS);
  }

  // src/lib/analyzers/responsive/browser/shared.ts
  function getAllElements() {
    return Array.from(document.querySelectorAll("*")).filter(
      (element) => {
        const tag = element.tagName.toLowerCase();
        return tag !== "html" && tag !== "body";
      }
    );
  }
  function toElementCause(element) {
    const tag = element.tagName.toLowerCase();
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    const className = typeof element.className === "string" ? element.className.trim().replace(/\s+/g, " ") : void 0;
    return {
      tag,
      id: element.id || void 0,
      className: className || void 0,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      top: Math.round(rect.top),
      bottom: Math.round(rect.bottom),
      cssWidth: styles.width,
      minWidth: styles.minWidth,
      maxWidth: styles.maxWidth,
      position: styles.position,
      display: styles.display,
      overflowX: styles.overflowX,
      overflowY: styles.overflowY,
      whiteSpace: styles.whiteSpace
    };
  }

  // src/lib/analyzers/responsive/browser/collect-fixed-elements.ts
  function collectFixedOverlapRisks({
    allElements,
    viewportWidth
  }) {
    return allElements.filter((element) => {
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (styles.position !== "fixed") return false;
      if (rect.width <= 0 || rect.height <= 0) return false;
      return rect.top <= 0 && rect.height > 80 && viewportWidth <= 768;
    }).map(toElementCause).slice(0, 10);
  }

  // src/lib/analyzers/responsive/browser/grid-utils.ts
  function isLayoutGridContainer(element) {
    const rect = element.getBoundingClientRect();
    if (rect.width < 120) return false;
    if (rect.height < 20) return false;
    if (element.children.length < 2) return false;
    const visibleChildren = Array.from(element.children).filter((child) => {
      if (!(child instanceof HTMLElement)) return false;
      const childRect = child.getBoundingClientRect();
      return childRect.width > 0 && childRect.height > 0;
    });
    return visibleChildren.length >= 2;
  }

  // src/lib/analyzers/responsive/browser/collect-grid.ts
  function hasMeaningfulGridOverflow(element) {
    const overflowAmount = element.scrollWidth - element.clientWidth;
    if (overflowAmount <= 16) return false;
    const parentRect = element.getBoundingClientRect();
    return Array.from(element.children).some((child) => {
      if (!(child instanceof HTMLElement)) return false;
      const childRect = child.getBoundingClientRect();
      return childRect.right > parentRect.right + 8 || childRect.left < parentRect.left - 8;
    });
  }
  function collectGridOverflowRisks({
    allElements
  }) {
    return allElements.filter((element) => {
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }
      const styles = window.getComputedStyle(element);
      if (!styles.display.includes("grid")) return false;
      const hasGridColumns = styles.gridTemplateColumns && styles.gridTemplateColumns !== "none";
      if (!hasGridColumns) {
        return false;
      }
      const columnCount = styles.gridTemplateColumns.split(" ").filter(Boolean).length;
      if (columnCount < 2) {
        return false;
      }
      if (!isLayoutGridContainer(element)) {
        return false;
      }
      return hasMeaningfulGridOverflow(element);
    }).map(toElementCause).slice(0, 10);
  }

  // src/lib/analyzers/responsive/browser/flex-utils.ts
  function isLayoutFlexContainer(element) {
    const rect = element.getBoundingClientRect();
    if (rect.width < 120) return false;
    if (rect.height < 20) return false;
    if (element.children.length < 2) return false;
    const visibleChildren = Array.from(element.children).filter((child) => {
      if (!(child instanceof HTMLElement)) return false;
      const childRect = child.getBoundingClientRect();
      return childRect.width > 0 && childRect.height > 0;
    });
    if (visibleChildren.length < 2) return false;
    const hasMeaningfulText = element.textContent?.trim().length ?? 0;
    if (hasMeaningfulText <= 2 && visibleChildren.length <= 2) {
      return false;
    }
    return true;
  }

  // src/lib/analyzers/responsive/browser/collect-flex.ts
  function hasMeaningfulFlexOverflow(element) {
    const overflowAmount = element.scrollWidth - element.clientWidth;
    if (overflowAmount <= 16) return false;
    const parentRect = element.getBoundingClientRect();
    return Array.from(element.children).some((child) => {
      if (!(child instanceof HTMLElement)) return false;
      const childRect = child.getBoundingClientRect();
      return childRect.right > parentRect.right + 8 || childRect.left < parentRect.left - 8;
    });
  }
  function collectFlexNoWrapRisks({
    allElements
  }) {
    return allElements.filter((element) => {
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }
      const styles = window.getComputedStyle(element);
      if (styles.display !== "flex" && styles.display !== "inline-flex") {
        return false;
      }
      if (!isLayoutFlexContainer(element)) {
        return false;
      }
      if (styles.flexWrap !== "nowrap") return false;
      return hasMeaningfulFlexOverflow(element);
    }).map(toElementCause).slice(0, 10);
  }

  // src/lib/analyzers/responsive/browser/collect-navigation.ts
  function collectNavigationOverflow() {
    const nav = document.querySelector(
      "nav, header nav, [data-nav], [data-menu], .menu, .navbar"
    );
    if (!nav) return false;
    if (shouldIgnoreResponsiveElement(nav)) {
      return false;
    }
    return nav.scrollWidth > nav.clientWidth + 2;
  }

  // src/lib/analyzers/responsive/browser/collect-clipped-text.ts
  function collectClippedTextElements({
    allElements
  }) {
    return allElements.filter((element) => {
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }
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
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }
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
      if (shouldIgnoreResponsiveElement(iframe)) {
        return false;
      }
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
      if (shouldIgnoreResponsiveElement(media)) {
        return false;
      }
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
        if (shouldIgnoreResponsiveElement(table)) {
          return false;
        }
        return table.scrollWidth > viewportWidth + 2;
      }
    ).length;
  }

  // src/lib/analyzers/responsive/browser/collect-fixed-width.ts
  function isInsideReportedElement(element, reportedElements) {
    return reportedElements.some((reported) => reported.contains(element));
  }
  function getBestRepresentative(element) {
    const card = element.closest("article, li, [class*='card'], [class*='item']");
    if (card instanceof HTMLElement) {
      return card;
    }
    return element;
  }
  function collectFixedWidthElements({
    allElements,
    viewportWidth
  }) {
    const reportedElements = [];
    const riskyElements = allElements.map((element) => getBestRepresentative(element)).filter((element, index, array) => array.indexOf(element) === index).filter((element) => {
      const styles = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      if (viewportWidth > 768) return false;
      if (shouldIgnoreResponsiveElement(element)) return false;
      if (rect.width <= 0 || rect.height <= 0) return false;
      if (isInsideReportedElement(element, reportedElements)) {
        return false;
      }
      const hasPxWidth = styles.width.endsWith("px");
      const hasPxMinWidth = styles.minWidth.endsWith("px");
      const exceedsViewport = rect.right > viewportWidth + 2;
      const nearlyFullViewport = rect.width > viewportWidth * 0.98;
      const isRisk = (hasPxWidth || hasPxMinWidth) && exceedsViewport && !nearlyFullViewport;
      if (isRisk) {
        reportedElements.push(element);
      }
      return isRisk;
    });
    return riskyElements.map(toElementCause).slice(0, 8);
  }

  // src/lib/analyzers/responsive/browser/collect-overflow.ts
  function collectOverflowContainers({
    allElements
  }) {
    const bodyStyles = window.getComputedStyle(document.body);
    const htmlStyles = window.getComputedStyle(document.documentElement);
    const bodyOverflowRisk = bodyStyles.overflow === "hidden" || bodyStyles.overflowX === "hidden" || htmlStyles.overflow === "hidden" || htmlStyles.overflowX === "hidden";
    const overflowContainers = allElements.filter((element) => {
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }
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
  function isRootElement(element) {
    return element === document.documentElement || element === document.body;
  }
  function isInsideAlreadyReportedElement(element, reportedElements) {
    return reportedElements.some((reported) => reported.contains(element));
  }
  function collectHorizontalRisks({
    allElements,
    viewportWidth
  }) {
    const reportedElements = [];
    return allElements.filter((element) => {
      if (shouldIgnoreResponsiveElement(element)) {
        return false;
      }
      const rect = element.getBoundingClientRect();
      if (isRootElement(element)) return false;
      if (rect.width <= 0 || rect.height <= 0) return false;
      const isOverflowing = rect.right > viewportWidth + 2 || rect.left < -2;
      if (!isOverflowing) return false;
      if (isInsideAlreadyReportedElement(element, reportedElements)) {
        return false;
      }
      reportedElements.push(element);
      return true;
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
