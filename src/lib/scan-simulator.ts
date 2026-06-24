import { prisma } from "@/lib/prisma";

const SCAN_DURATION_MS = 15000;

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
    if (scan.status === "completed") {
      await createDemoReportData(scanId);
    }

    return getScanWithRelations(scanId);
  }

  const elapsed = Date.now() - scan.createdAt.getTime();

  const calculatedProgress = Math.min(
    100,
    Math.max(scan.progress, Math.round((elapsed / SCAN_DURATION_MS) * 100)),
  );

  if (calculatedProgress >= 100) {
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: "completed",
        progress: 100,
        overallScore: 92,
        performanceScore: 95,
        seoScore: 88,
        accessibilityScore: 90,
        uxScore: 94,
        securityScore: 91,
        completedAt: new Date(),
      },
    });

    await createDemoReportData(scanId);

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

async function createDemoReportData(scanId: string) {
  const [findingCount, vitalCount, pageCount] = await Promise.all([
    prisma.finding.count({
      where: { scanId },
    }),
    prisma.vital.count({
      where: { scanId },
    }),
    prisma.pageResult.count({
      where: { scanId },
    }),
  ]);

  if (findingCount === 0) {
    await prisma.finding.createMany({
      data: [
        {
          scanId,
          title: "Eksik meta description",
          description: "24 sayfada meta description alanı eksik.",
          level: "ORTA",
          category: "SEO",
          tone: "orange",
          solution:
            "Öncelikli sayfalara 140-160 karakter aralığında özgün meta description ekleyin.",
        },
        {
          scanId,
          title: "Mobilde taşan içerik",
          description: "Ana sayfada viewport dışına taşan eleman tespit edildi.",
          level: "ORTA",
          category: "UX",
          tone: "orange",
          solution:
            "Mobil breakpointlerde sabit genişlikleri kontrol edin. max-width ve overflow yönetimini düzenleyin.",
        },
        {
          scanId,
          title: "LCP süresi yüksek",
          description: "Hero görseli LCP süresini artırıyor.",
          level: "YÜKSEK",
          category: "Performance",
          tone: "red",
          solution:
            "Hero görselini WebP/AVIF formatına çevirin, preload kullanın ve kritik CSS’i optimize edin.",
        },
      ],
    });
  }

  if (vitalCount === 0) {
    await prisma.vital.createMany({
      data: [
        {
          scanId,
          metric: "LCP (Largest Contentful Paint)",
          value: "2.3 sn",
          status: "İyi",
          average: "2.5 sn",
          trend: "↘ İyileşti",
          tone: "green",
          width: "78%",
        },
        {
          scanId,
          metric: "CLS (Cumulative Layout Shift)",
          value: "0.07",
          status: "İyi",
          average: "0.10",
          trend: "→ Sabit",
          tone: "green",
          width: "86%",
        },
        {
          scanId,
          metric: "INP (Interaction to Next Paint)",
          value: "145 ms",
          status: "İyileştirilmeli",
          average: "100 ms",
          trend: "↗ Kötüleşti",
          tone: "orange",
          width: "58%",
        },
      ],
    });
  }

  if (pageCount === 0) {
    await prisma.pageResult.createMany({
      data: [
        {
          scanId,
          path: "/",
          score: 82,
          critical: 0,
          warning: 3,
          lastChecked: "Bugün 14:30",
        },
        {
          scanId,
          path: "/hakkimizda",
          score: 76,
          critical: 1,
          warning: 2,
          lastChecked: "Bugün 14:31",
        },
        {
          scanId,
          path: "/iletisim",
          score: 88,
          critical: 0,
          warning: 1,
          lastChecked: "Bugün 14:32",
        },
      ],
    });
  }
}