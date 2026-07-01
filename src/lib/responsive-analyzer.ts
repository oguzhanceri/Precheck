import { analyzeViewportResponsive } from "./analyzers/responsive/runner";
import { RESPONSIVE_VIEWPORTS } from "./analyzers/responsive/viewports";
import { createResponsiveFinding } from "./analyzers/responsive/utils";
import type { ResponsiveFinding } from "./analyzers/responsive/types";

type ResponsivePageResult = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  check: string;
  testedViewports: string[];
};

type ResponsiveAnalyzeOptions = {
  selectedPages?: string[];
};

type SinglePageResponsiveResult = {
  url: string;
  path: string;
  score: number;
  findings: ResponsiveFinding[];
  page: ResponsivePageResult;
};

export async function analyzeResponsive(
  url: string,
  options: ResponsiveAnalyzeOptions = {},
) {
  const baseUrl = normalizeUrl(url);
  const targetUrls = buildTargetUrls(baseUrl, options.selectedPages);

  const pageResults = await Promise.all(
    targetUrls.map((targetUrl, index) =>
      analyzeResponsivePage(targetUrl, index),
    ),
  );

  const findings = mergeFindings(pageResults);
  const pages = pageResults.map((result) => result.page);

  const score = pages.length
    ? Math.round(
        pages.reduce((total, page) => total + page.score, 0) / pages.length,
      )
    : 0;

  return {
    score,
    findings,
    pages,
  };
}

async function analyzeResponsivePage(
  url: string,
  index: number,
): Promise<SinglePageResponsiveResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PrecheckAI/1.0; +https://precheck.ai)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Responsive analizi başarısız oldu. HTTP ${response.status}`,
    );
  }

  const html = await response.text();

  const htmlFindings = analyzeHtmlResponsive(html);
  const viewportFindings = await analyzeViewportResponsive(url);

  const findings = [
    ...htmlFindings.filter((finding) => finding.level === "critical"),
    ...viewportFindings,
  ];

  const score = calculateResponsiveScore(findings);
  const path = getPathFromUrl(url);

  return {
    url,
    path,
    score,
    findings,
    page: {
      path,
      score,
      critical: findings.filter(
        (finding) => finding.level === "critical" || finding.level === "high",
      ).length,
      warning: findings.filter(
        (finding) => finding.level === "medium" || finding.level === "low",
      ).length,
      check: buildTimeLabel(index),
      testedViewports: RESPONSIVE_VIEWPORTS.map((viewport) => viewport.name),
    },
  };
}

function analyzeHtmlResponsive(html: string) {
  const findings: ResponsiveFinding[] = [];

  const hasViewport = Boolean(
    /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html),
  );

  if (!hasViewport) {
    findings.push(
      createResponsiveFinding({
        title: "Viewport meta etiketi eksik",
        desc: "Mobil cihazlarda doğru ölçekleme için viewport meta etiketi bulunamadı.",
        level: "critical",
        icon: "mobile",
        solution:
          '<meta name="viewport" content="width=device-width, initial-scale=1"> etiketi ekleyin.',
        causes: [
          "Head veya layout dosyasında viewport meta etiketi tanımlanmamış olabilir.",
          "Sayfa mobil cihazlarda masaüstü genişliğinde render ediliyor olabilir.",
        ],
      }),
    );
  }

  return findings;
}

function mergeFindings(pageResults: SinglePageResponsiveResult[]) {
  const map = new Map<string, ResponsiveFinding>();

  pageResults.forEach((result) => {
    result.findings.forEach((finding) => {
      const key = `${finding.title}-${finding.level}`;
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          ...finding,
          affectedPages: [result.path],
          affectedCount: 1,
          causes: finding.causes ?? [],
          evidence: finding.evidence ?? [],
          affectedViewports: finding.affectedViewports ?? [],
        });

        return;
      }

      if (!existing.affectedPages.includes(result.path)) {
        existing.affectedPages.push(result.path);
        existing.affectedCount = existing.affectedPages.length;
      }

      existing.causes = Array.from(
        new Set([...(existing.causes ?? []), ...(finding.causes ?? [])]),
      );

      existing.evidence = Array.from(
        new Set([...(existing.evidence ?? []), ...(finding.evidence ?? [])]),
      );

      existing.affectedViewports = Array.from(
        new Set([
          ...(existing.affectedViewports ?? []),
          ...(finding.affectedViewports ?? []),
        ]),
      );
    });
  });

  return Array.from(map.values());
}

function buildTargetUrls(baseUrl: string, selectedPages?: string[]) {
  const pages = selectedPages?.length ? selectedPages : ["/"];

  return Array.from(
    new Set(
      pages.map((page) => {
        if (page === "home" || page === "/home" || page === "/") {
          return baseUrl;
        }

        if (/^https?:\/\//i.test(page)) {
          return normalizeUrl(page);
        }

        const normalizedPath = page.startsWith("/") ? page : `/${page}`;

        return `${new URL(baseUrl).origin}${normalizedPath}`;
      }),
    ),
  );
}

function normalizeUrl(url: string) {
  const trimmed = url.trim();

  if (!trimmed) {
    throw new Error("URL boş olamaz.");
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.replace(/\/$/, "");
  }

  return `https://${trimmed}`.replace(/\/$/, "");
}

function getPathFromUrl(url: string) {
  const path = new URL(url).pathname;

  if (!path || path === "/") return "/";

  return path;
}

function calculateResponsiveScore(findings: ResponsiveFinding[]) {
  let score = 100;

  findings.forEach((finding) => {
    if (finding.level === "critical") score -= 20;
    if (finding.level === "high") score -= 12;
    if (finding.level === "medium") score -= 7;
    if (finding.level === "low") score -= 3;
  });

  return Math.max(0, Math.min(100, score));
}

function buildTimeLabel(index: number) {
  const baseHour = 14;
  const baseMinute = 30 + index;

  return `Bugün ${String(baseHour).padStart(2, "0")}:${String(
    baseMinute,
  ).padStart(2, "0")}`;
}