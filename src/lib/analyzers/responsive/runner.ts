import type { BrowserResponsiveData } from "./browser/types";
import { createCollectorScript } from "./browser/create-collector-script";
import { checkNavigation } from "./checks/navigation";
import { checkClippedText } from "./checks/clipped-text";
import { checkTouchTargets } from "./checks/touch-target";
import { checkIframe } from "./checks/iframe";
import { checkMedia } from "./checks/media";
import { checkTables } from "./checks/tables";
import { checkFixedElements } from "./checks/fixed-elements";
import { checkGridLayout } from "./checks/grid";
import { checkFlexLayout } from "./checks/flex";
import { checkOverflowHidden } from "./checks/overflow-hidden";
import { checkFixedWidth } from "./checks/fixed-width";
import { chromium, type Page } from "playwright";
import type { ResponsiveFinding } from "./types";
import { RESPONSIVE_VIEWPORTS } from "./viewports";
import { createResponsiveFinding, mergeResponsiveFindings } from "./utils";
import { checkHorizontalScroll } from "./checks/horizontal-scroll";

export async function analyzeViewportResponsive(url: string) {
  const findings: ResponsiveFinding[] = [];

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    for (const viewport of RESPONSIVE_VIEWPORTS) {
      const page = await browser.newPage({
        viewport: {
          width: viewport.width,
          height: viewport.height,
        },
        deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
        isMobile: viewport.isMobile ?? false,
      });

      try {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 15000,
        });

        await page.waitForLoadState("load", { timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(1200);

        const result = await runResponsiveViewportChecks(page);

        findings.push(
          ...createViewportFindings(viewport.name, viewport.width, result),
        );
      } catch (error) {
        findings.push(
          createResponsiveFinding({
            title: "Viewport testi tamamlanamadı",
            desc: `${viewport.name} görünümünde responsive test tamamlanamadı.`,
            level: "low",
            icon: "clock",
            solution:
              "Sayfa yüklenme süresini, üçüncü parti scriptleri veya bot engelleme davranışlarını kontrol edin.",
            causes: [
              error instanceof Error
                ? error.message.slice(0, 180)
                : "Bilinmeyen viewport test hatası.",
            ],
          }),
        );
      } finally {
        await page.close().catch(() => {});
      }
    }
  } finally {
    await browser.close();
  }

  return mergeResponsiveFindings(findings);
}

async function runResponsiveViewportChecks(
  page: Page,
): Promise<BrowserResponsiveData> {
  const collectorScript = await createCollectorScript();

  await page.addScriptTag({
    content: collectorScript,
  });

  return page.evaluate(() => {
    const collector = window.__PRECHECK_COLLECT_RESPONSIVE_DATA__;

    if (!collector) {
      throw new Error("Responsive browser collector yüklenemedi.");
    }

    return collector();
  });
}

function createViewportFindings(
  viewportName: string,
  viewportWidth: number,
  result: BrowserResponsiveData,
) {
  const findings: ResponsiveFinding[] = [];

  findings.push(
    ...checkHorizontalScroll({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      viewportWidth: result.viewportWidth,
      documentScrollWidth: result.documentScrollWidth,
      overflowingElements: result.overflowingElements,
    }),
  );

  findings.push(
    ...checkFixedWidth({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      fixedWidthElements: result.fixedWidthElements,
    }),
  );

  findings.push(
    ...checkOverflowHidden({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      bodyOverflowRisk: result.bodyOverflowRisk,
      overflowContainers: result.overflowContainers,
    }),
  );

  findings.push(
    ...checkFlexLayout({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      flexNoWrapRisks: result.flexNoWrapRisks,
    }),
  );

  findings.push(
    ...checkGridLayout({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      gridOverflowRisks: result.gridOverflowRisks,
    }),
  );

  findings.push(
    ...checkFixedElements({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      fixedOverlapRisks: result.fixedOverlapRisks,
    }),
  );

  findings.push(
    ...checkTables({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      riskyTables: result.riskyTables,
    }),
  );

  findings.push(
    ...checkMedia({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      riskyMedia: result.riskyMedia,
    }),
  );

  findings.push(
    ...checkIframe({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      riskyIframes: result.riskyIframes,
    }),
  );

  findings.push(
    ...checkTouchTargets({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      smallTouchTargets: result.smallTouchTargets,
    }),
  );

  findings.push(
    ...checkClippedText({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      clippedTextElements: result.clippedTextElements,
    }),
  );

  findings.push(
    ...checkNavigation({
      viewport: {
        name: viewportName,
        width: viewportWidth,
        height: 0,
      },
      navOverflow: result.navOverflow,
    }),
  );

  return findings.map((finding) => ({
    ...finding,
    affectedViewports: [`${viewportName} - ${viewportWidth}px`],
  }));
}
