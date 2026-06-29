import { analyzeResponsive } from "@/lib/responsive-analyzer";
import { analyzeUx } from "@/lib/ux-analyzer";
import { analyzeSecurity } from "@/lib/security-analyzer";
import { analyzeAccessibility } from "@/lib/accessibility-analyzer";
import type { PerformanceAnalysisResult } from "@/lib/performance-analyzer";
import { analyzePerformance } from "@/lib/performance-analyzer";
import { analyzeSeo } from "@/lib/seo-analyzer";
import { getSitemapPages } from "@/lib/sitemap-analyzer";
import { prisma } from "@/lib/prisma";

const SCAN_DURATION_MS = 15000;

type ModuleKey =
  | "performance"
  | "seo"
  | "accessibility"
  | "ux"
  | "security"
  | "responsive"
  | "interaction"
  | "visual"
  | "forms";

type ScanSeed = {
  id: string;
  url: string;
  site: string;
  selectedPages: string | null;
  selectedModules: string | null;
  selectedDevices: string | null;
  overallScore: number | null;
  performanceScore: number | null;
  seoScore: number | null;
  accessibilityScore: number | null;
  uxScore: number | null;
  securityScore: number | null;
};

type ReportFinding = {
  title: string;
  description: string;
  level: string;
  category: string;
  tone: string;
  solution: string;
  causes?: string[];
  affectedPages?: string[];
  affectedCount?: number;
};

type ReportVital = {
  metric: string;
  value: string;
  status: string;
  average: string;
  trend: string;
  tone: string;
  width: string;
};

type ReportPage = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  lastChecked: string;
};

type ReportData = {
  scores: {
    overallScore: number;
    performanceScore: number;
    seoScore: number;
    accessibilityScore: number;
    uxScore: number;
    securityScore: number;
  };
  findings: ReportFinding[];
  vitals: ReportVital[];
  pages: ReportPage[];
};

export function normalizeUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("URL boş olamaz.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  const url = new URL(withProtocol);

  return url.toString().replace(/\/$/, "");
}

export function getSiteName(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export async function getScanWithProgress(scanId: string) {
  const scan = await prisma.scan.findUnique({
    where: { id: scanId },
  });

  if (!scan) return null;

  if (scan.status !== "running") {
    return getScanWithRelations(scanId);
  }

  const elapsed = Date.now() - scan.createdAt.getTime();

  const calculatedProgress = Math.min(
    100,
    Math.max(scan.progress, Math.round((elapsed / SCAN_DURATION_MS) * 100)),
  );

  if (calculatedProgress >= 100) {
    const report = await buildRealReport(scan);

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "completed",
        progress: 100,
        overallScore: report.scores.overallScore,
        performanceScore: report.scores.performanceScore,
        seoScore: report.scores.seoScore,
        accessibilityScore: report.scores.accessibilityScore,
        uxScore: report.scores.uxScore,
        securityScore: report.scores.securityScore,
        completedAt: new Date(),
      },
    });

    await createReportData(scanId, report);

    return getScanWithRelations(scanId);
  }

  await prisma.scan.update({
    where: { id: scanId },
    data: {
      progress: calculatedProgress,
    },
  });

  return getScanWithRelations(scanId);
}

export function getScanWithRelations(scanId: string) {
  return prisma.scan.findUnique({
    where: { id: scanId },
    include: {
      findings: {
        orderBy: { createdAt: "asc" },
      },
      vitals: {
        orderBy: { createdAt: "asc" },
      },
      pages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

async function createReportData(scanId: string, report: ReportData) {
  await Promise.all([
    prisma.finding.deleteMany({
      where: { scanId },
    }),
    prisma.vital.deleteMany({
      where: { scanId },
    }),
    prisma.pageResult.deleteMany({
      where: { scanId },
    }),
  ]);

  if (report.findings.length) {
    await prisma.finding.createMany({
      data: report.findings.map((finding) => ({
        scanId,
        title: finding.title,
        description: finding.description,
        level: finding.level,
        category: finding.category,
        tone: finding.tone,
        solution: finding.solution,
        causes: finding.causes ? JSON.stringify(finding.causes) : null,
        affectedPages: finding.affectedPages
          ? JSON.stringify(finding.affectedPages)
          : null,
        affectedCount: finding.affectedCount ?? null,
      })),
    });
  }

  if (report.vitals.length) {
    await prisma.vital.createMany({
      data: report.vitals.map((vital) => ({
        scanId,
        metric: vital.metric,
        value: vital.value,
        status: vital.status,
        average: vital.average,
        trend: vital.trend,
        tone: vital.tone,
        width: vital.width,
      })),
    });
  }

  if (report.pages.length) {
    await prisma.pageResult.createMany({
      data: report.pages.map((page) => ({
        scanId,
        path: page.path,
        score: page.score,
        critical: page.critical,
        warning: page.warning,
        lastChecked: page.lastChecked,
      })),
    });
  }
}

async function buildRealReport(scan: ScanSeed): Promise<ReportData> {
  const activeModules = getActiveModules(scan.selectedModules);
  const sitemapPages = await getSitemapPages(scan.url);

  let performanceScore = 0;
  let seoScore = 0;
  let accessibilityScore = 0;
  let uxScore = 0;
  let securityScore = 0;

  let findings: ReportFinding[] = [];
  let vitals: ReportVital[] = [];
  let pages: ReportPage[] = [];

  const shouldRunPerformance = isModuleEnabled(activeModules, "performance");
  const shouldRunSeo = isModuleEnabled(activeModules, "seo");
  const shouldRunAccessibility = isModuleEnabled(activeModules, "accessibility");
  const shouldRunSecurity = isModuleEnabled(activeModules, "security");

  const shouldRunUx =
    isModuleEnabled(activeModules, "ux") ||
    isModuleEnabled(activeModules, "interaction") ||
    isModuleEnabled(activeModules, "visual") ||
    isModuleEnabled(activeModules, "forms");

  const shouldRunResponsive = isModuleEnabled(activeModules, "responsive");

  if (shouldRunPerformance) {
    try {
      const performanceResults: PerformanceAnalysisResult[] = [];

      for (const page of sitemapPages) {
        const result = await analyzePerformance(page.url);
        performanceResults.push(result);
      }

      const firstPerformanceResult = performanceResults[0];

      performanceScore = Math.round(
        performanceResults.reduce((total, result) => total + result.score, 0) /
          performanceResults.length,
      );

      vitals = firstPerformanceResult.vitals.map((vital) =>
        mapPerformanceVitalToReportVital(vital, firstPerformanceResult.score),
      );

      const allPerformanceFindings = performanceResults.flatMap(
        (result, index) =>
          result.findings.map((finding) => ({
            title: finding.title,
            description: finding.desc,
            level: normalizeFindingLevel(finding.level),
            category: "Performance",
            tone: getToneFromLevel(finding.level),
            solution: finding.solution,
            causes: finding.causes ?? [],
            affectedPages: [
              sitemapPages[index]?.path ?? getPathFromUrl(scan.url),
            ],
            affectedCount: 1,
          })),
      );

      findings = [...findings, ...dedupeFindings(allPerformanceFindings)];

      pages = sitemapPages.map((page, index) =>
        buildSinglePageResult({
          url: page.url,
          score: performanceResults[index]?.score ?? 0,
          findings:
            performanceResults[index]?.findings.map((finding) => ({
              title: finding.title,
              description: finding.desc,
              level: normalizeFindingLevel(finding.level),
              category: "Performance",
              tone: getToneFromLevel(finding.level),
              solution: finding.solution,
            })) ?? [],
        }),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Performance analizi sırasında bilinmeyen bir hata oluştu.";

      performanceScore = 0;

      findings.push({
        title: "Performance analizi tamamlanamadı",
        description: message,
        level: "ORTA",
        category: "Performance",
        tone: "orange",
        solution:
          "PageSpeed API erişimini, hedef URL erişilebilirliğini ve API kota durumunu kontrol edin.",
      });

      pages = [
        {
          path: getPathFromUrl(scan.url),
          score: 0,
          critical: 0,
          warning: 1,
          lastChecked: "Analiz tamamlanamadı",
        },
      ];
    }
  }

  if (shouldRunSeo) {
    try {
      const seoResult = await analyzeSeo(scan.url, {
        selectedPages: sitemapPages.map((page) => page.path),
      });

      seoScore = seoResult.score;

      findings = [
        ...findings,
        ...seoResult.findings.map((finding) => ({
          title: finding.title,
          description: finding.desc,
          level: normalizeFindingLevel(finding.level),
          category: "SEO",
          tone: getToneFromLevel(finding.level),
          solution: finding.solution,
          causes: finding.causes ?? [],
          affectedPages: finding.affectedPages ?? [],
          affectedCount: finding.affectedCount ?? 0,
        })),
      ];

      const seoPages = seoResult.pages.map((page) => ({
        path: page.path,
        score: page.score,
        critical: page.critical,
        warning: page.warning,
        lastChecked: page.check,
      }));

      if (seoPages.length) pages = seoPages;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "SEO analizi sırasında bilinmeyen bir hata oluştu.";

      seoScore = 0;

      findings.push({
        title: "SEO analizi tamamlanamadı",
        description: message,
        level: "ORTA",
        category: "SEO",
        tone: "orange",
        solution:
          "Site bot isteklerini engelliyor olabilir. HTTP durum kodunu, firewall/CDN ayarlarını veya user-agent engelini kontrol edin.",
      });

      if (!pages.length) {
        pages = [
          {
            path: getPathFromUrl(scan.url),
            score: 0,
            critical: 0,
            warning: 1,
            lastChecked: "Analiz tamamlanamadı",
          },
        ];
      }
    }
  }

  if (shouldRunAccessibility) {
    try {
      const accessibilityResult = await analyzeAccessibility(scan.url, {
        selectedPages: sitemapPages.map((page) => page.path),
      });

      accessibilityScore = accessibilityResult.score;

      findings = [
        ...findings,
        ...accessibilityResult.findings.map((finding) => ({
          title: finding.title,
          description: finding.desc,
          level: normalizeFindingLevel(finding.level),
          category: "Accessibility",
          tone: getToneFromLevel(finding.level),
          solution: finding.solution,
          causes: finding.causes ?? [],
          affectedPages: finding.affectedPages ?? [],
          affectedCount: finding.affectedCount ?? 0,
        })),
      ];

      const accessibilityPages = accessibilityResult.pages.map((page) => ({
        path: page.path,
        score: page.score,
        critical: page.critical,
        warning: page.warning,
        lastChecked: page.check,
      }));

      if (accessibilityPages.length && !pages.length) {
        pages = accessibilityPages;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Accessibility analizi sırasında bilinmeyen bir hata oluştu.";

      accessibilityScore = 0;

      findings.push({
        title: "Accessibility analizi tamamlanamadı",
        description: message,
        level: "ORTA",
        category: "Accessibility",
        tone: "orange",
        solution:
          "Hedef sayfanın HTML çıktısını, bot erişimini ve sayfa erişilebilirliğini kontrol edin.",
      });
    }
  }

  if (shouldRunSecurity) {
    try {
      const securityResult = await analyzeSecurity(scan.url, {
        selectedPages: sitemapPages.map((page) => page.path),
      });

      securityScore = securityResult.score;

      findings = [
        ...findings,
        ...securityResult.findings.map((finding) => ({
          title: finding.title,
          description: finding.desc,
          level: normalizeFindingLevel(finding.level),
          category: "Security",
          tone: getToneFromLevel(finding.level),
          solution: finding.solution,
          causes: finding.causes ?? [],
          affectedPages: finding.affectedPages ?? [],
          affectedCount: finding.affectedCount ?? 0,
        })),
      ];

      const securityPages = securityResult.pages.map((page) => ({
        path: page.path,
        score: page.score,
        critical: page.critical,
        warning: page.warning,
        lastChecked: page.check,
      }));

      if (securityPages.length && !pages.length) {
        pages = securityPages;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Security analizi sırasında bilinmeyen bir hata oluştu.";

      securityScore = 0;

      findings.push({
        title: "Security analizi tamamlanamadı",
        description: message,
        level: "ORTA",
        category: "Security",
        tone: "orange",
        solution:
          "HTTP response headerlarını, sunucu yapılandırmasını ve CDN ayarlarını kontrol edin.",
      });
    }
  }

  if (shouldRunUx) {
    try {
      const uxResult = await analyzeUx(scan.url, {
        selectedPages: sitemapPages.map((page) => page.path),
      });

      uxScore = uxResult.score;

      findings = [
        ...findings,
        ...uxResult.findings.map((finding) => ({
          title: finding.title,
          description: finding.desc,
          level: normalizeFindingLevel(finding.level),
          category: "UX",
          tone: getToneFromLevel(finding.level),
          solution: finding.solution,
          causes: finding.causes ?? [],
          affectedPages: finding.affectedPages ?? [],
          affectedCount: finding.affectedCount ?? 0,
        })),
      ];

      const uxPages = uxResult.pages.map((page) => ({
        path: page.path,
        score: page.score,
        critical: page.critical,
        warning: page.warning,
        lastChecked: page.check,
      }));

      if (uxPages.length && !pages.length) {
        pages = uxPages;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "UX analizi sırasında bilinmeyen bir hata oluştu.";

      uxScore = 0;

      findings.push({
        title: "UX analizi tamamlanamadı",
        description: message,
        level: "ORTA",
        category: "UX",
        tone: "orange",
        solution:
          "Hedef sayfanın HTML çıktısını, form yapılarını ve navigasyon alanlarını kontrol edin.",
      });
    }
  }

  if (shouldRunResponsive) {
    try {
      const responsiveResult = await analyzeResponsive(scan.url, {
        selectedPages: sitemapPages.map((page) => page.path),
      });

      findings = [
        ...findings,
        ...responsiveResult.findings.map((finding) => ({
          title: finding.title,
          description: finding.desc,
          level: normalizeFindingLevel(finding.level),
          category: "Responsive",
          tone: getToneFromLevel(finding.level),
          solution: finding.solution,
          causes: finding.causes ?? [],
          affectedPages: finding.affectedPages ?? [],
          affectedCount: finding.affectedCount ?? 0,
        })),
      ];

      const responsivePages = responsiveResult.pages.map((page) => ({
        path: page.path,
        score: page.score,
        critical: page.critical,
        warning: page.warning,
        lastChecked: page.check,
      }));

      if (responsivePages.length && !pages.length) {
        pages = responsivePages;
      }

      uxScore = uxScore
        ? Math.round((uxScore + responsiveResult.score) / 2)
        : responsiveResult.score;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Responsive analizi sırasında bilinmeyen bir hata oluştu.";

      findings.push({
        title: "Responsive analizi tamamlanamadı",
        description: message,
        level: "ORTA",
        category: "Responsive",
        tone: "orange",
        solution:
          "Sayfanın HTML çıktısını, CSS yapılarını ve responsive breakpoint ayarlarını kontrol edin.",
      });
    }
  }

  if (!pages.length) {
    pages = [
      {
        path: getPathFromUrl(scan.url),
        score: 0,
        critical: 0,
        warning: 0,
        lastChecked: "Bugün",
      },
    ];
  }

  const scoreInput = {
    performanceScore,
    seoScore,
    accessibilityScore,
    uxScore,
    securityScore,
  };

  return {
    scores: {
      ...scoreInput,
      overallScore: buildOverallScore(scoreInput, activeModules),
    },
    findings,
    vitals,
    pages,
  };
}

function buildOverallScore(
  scores: {
    performanceScore: number;
    seoScore: number;
    accessibilityScore: number;
    uxScore: number;
    securityScore: number;
  },
  activeModules: ModuleKey[],
) {
  const selectedScores: number[] = [];

  if (
    isModuleEnabled(activeModules, "performance") &&
    scores.performanceScore > 0
  ) {
    selectedScores.push(scores.performanceScore);
  }

  if (isModuleEnabled(activeModules, "seo") && scores.seoScore > 0) {
    selectedScores.push(scores.seoScore);
  }

  if (
    isModuleEnabled(activeModules, "accessibility") &&
    scores.accessibilityScore > 0
  ) {
    selectedScores.push(scores.accessibilityScore);
  }

  if (isModuleEnabled(activeModules, "security") && scores.securityScore > 0) {
    selectedScores.push(scores.securityScore);
  }

  if (
    (isModuleEnabled(activeModules, "ux") ||
      isModuleEnabled(activeModules, "responsive") ||
      isModuleEnabled(activeModules, "interaction") ||
      isModuleEnabled(activeModules, "visual") ||
      isModuleEnabled(activeModules, "forms")) &&
    scores.uxScore > 0
  ) {
    selectedScores.push(scores.uxScore);
  }

  if (!selectedScores.length) return 0;

  return Math.round(
    selectedScores.reduce((total, score) => total + score, 0) /
      selectedScores.length,
  );
}

function buildSinglePageResult({
  url,
  score,
  findings,
}: {
  url: string;
  score: number;
  findings: ReportFinding[];
}): ReportPage {
  const critical = findings.filter(
    (finding) => finding.level === "KRİTİK",
  ).length;

  const warning = findings.filter(
    (finding) => finding.level === "YÜKSEK" || finding.level === "ORTA",
  ).length;

  return {
    path: getPathFromUrl(url),
    score,
    critical,
    warning,
    lastChecked: "Bugün",
  };
}

function getActiveModules(value: string | null): ModuleKey[] {
  const rawItems = parseStringArray(value);

  const modules = rawItems
    .map((item) => normalizeModuleKey(item))
    .filter((item): item is ModuleKey => Boolean(item));

  return Array.from(new Set(modules));
}

function normalizeModuleKey(value: string): ModuleKey | null {
  const normalized = normalizeText(value);

  if (
    normalized.includes("performance") ||
    normalized.includes("performans") ||
    normalized.includes("speed") ||
    normalized.includes("core web") ||
    normalized.includes("vitals")
  ) {
    return "performance";
  }

  if (
    normalized.includes("seo") ||
    normalized.includes("meta") ||
    normalized.includes("search")
  ) {
    return "seo";
  }

  if (
    normalized.includes("accessibility") ||
    normalized.includes("erisilebilirlik") ||
    normalized.includes("erişilebilirlik") ||
    normalized.includes("a11y")
  ) {
    return "accessibility";
  }

  if (
    normalized.includes("security") ||
    normalized.includes("guvenlik") ||
    normalized.includes("güvenlik")
  ) {
    return "security";
  }

  if (
    normalized.includes("responsive") ||
    normalized.includes("mobil") ||
    normalized.includes("mobile") ||
    normalized.includes("breakpoint")
  ) {
    return "responsive";
  }

  if (
    normalized.includes("interaction") ||
    normalized.includes("etkilesim") ||
    normalized.includes("etkileşim") ||
    normalized.includes("click") ||
    normalized.includes("hover")
  ) {
    return "interaction";
  }

  if (
    normalized.includes("visual") ||
    normalized.includes("gorsel") ||
    normalized.includes("görsel") ||
    normalized.includes("image")
  ) {
    return "visual";
  }

  if (
    normalized.includes("form") ||
    normalized.includes("input") ||
    normalized.includes("validation")
  ) {
    return "forms";
  }

  if (
    normalized.includes("ux") ||
    normalized.includes("ui") ||
    normalized.includes("user experience") ||
    normalized.includes("kullanici") ||
    normalized.includes("kullanıcı")
  ) {
    return "ux";
  }

  return null;
}

function isModuleEnabled(activeModules: ModuleKey[], module: ModuleKey) {
  return activeModules.length === 0 || activeModules.includes(module);
}

function parseStringArray(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (typeof item === "string") return item;

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;

          const candidates = [
            record.id,
            record.value,
            record.key,
            record.label,
            record.title,
            record.name,
            record.path,
            record.url,
          ];

          const found = candidates.find(
            (candidate) => typeof candidate === "string" && candidate.trim(),
          );

          if (typeof found === "string") return found;
        }

        return "";
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getPathFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname || "/";
  } catch {
    return "/";
  }
}

function normalizeFindingLevel(level: string) {
  if (level === "critical") return "KRİTİK";
  if (level === "high") return "YÜKSEK";
  if (level === "medium") return "ORTA";
  if (level === "low") return "BİLGİ";

  return "ORTA";
}

function getToneFromLevel(level: string) {
  if (level === "critical" || level === "high") return "red";
  if (level === "medium") return "orange";

  return "yellow";
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("İ", "i")
    .replaceAll("i̇", "i")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .trim();
}

function mapPerformanceVitalToReportVital(
  vital: {
    metric: string;
    value: string;
    rawValue: number | null;
    status: "good" | "needs-improvement" | "poor";
  },
  performanceScore: number,
): ReportVital {
  return {
    metric: getPerformanceMetricLabel(vital.metric),
    value: vital.value,
    status: getPerformanceStatusLabel(vital.status),
    average: getPerformanceAverage(vital.metric),
    trend: vital.status === "good" ? "↘ İyi" : "↗ İyileştirilmeli",
    tone: getPerformanceTone(vital.status),
    width: `${clampNumber(Math.round(performanceScore * 0.9), 35, 95)}%`,
  };
}

function getPerformanceMetricLabel(metric: string) {
  if (metric === "LCP") return "LCP (Largest Contentful Paint)";
  if (metric === "CLS") return "CLS (Cumulative Layout Shift)";
  if (metric === "INP") return "INP (Interaction to Next Paint)";
  if (metric === "FCP") return "FCP (First Contentful Paint)";
  if (metric === "Speed Index") return "Speed Index";
  if (metric === "TBT") return "TBT (Total Blocking Time)";

  return metric;
}

function getPerformanceStatusLabel(
  status: "good" | "needs-improvement" | "poor",
) {
  if (status === "good") return "İyi";
  if (status === "needs-improvement") return "İyileştirilmeli";

  return "Kötü";
}

function getPerformanceTone(status: "good" | "needs-improvement" | "poor") {
  if (status === "good") return "green";
  if (status === "needs-improvement") return "orange";

  return "red";
}

function getPerformanceAverage(metric: string) {
  if (metric === "LCP") return "2.5 sn";
  if (metric === "CLS") return "0.10";
  if (metric === "INP") return "200 ms";
  if (metric === "FCP") return "1.8 sn";
  if (metric === "Speed Index") return "3.4 sn";
  if (metric === "TBT") return "200 ms";

  return "-";
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function dedupeFindings(findings: ReportFinding[]) {
  const map = new Map<string, ReportFinding>();

  const levelPriority: Record<string, number> = {
    KRİTİK: 4,
    YÜKSEK: 3,
    ORTA: 2,
    BİLGİ: 1,
  };

  findings.forEach((finding) => {
    const key = `${finding.category}-${finding.title}`;

    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        ...finding,
        affectedPages: finding.affectedPages ?? [],
        affectedCount: finding.affectedPages?.length ?? 0,
      });
      return;
    }

    const existingPages = existing.affectedPages ?? [];
    const currentPages = finding.affectedPages ?? [];

    const mergedPages = Array.from(
      new Set([...existingPages, ...currentPages]),
    );

    const existingPriority = levelPriority[existing.level] ?? 0;
    const currentPriority = levelPriority[finding.level] ?? 0;

    map.set(key, {
      ...(currentPriority > existingPriority ? finding : existing),
      affectedPages: mergedPages,
      affectedCount: mergedPages.length,
    });
  });

  return Array.from(map.values());
}
