import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getScanWithProgress } from "@/lib/scan-simulator";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ScanWithRelations = NonNullable<Awaited<ReturnType<typeof getScanWithProgress>>>;

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const scan = await getScanWithProgress(id);

    if (!scan) {
      return NextResponse.json(
        {
          message: "Tarama bulunamadı.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      scan: serializeScan(scan),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Tarama verisi alınırken hata oluştu.";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const scan = await prisma.scan.update({
      where: {
        id,
      },
      data: {
        ...(typeof body.status === "string" ? { status: body.status } : {}),
        ...(typeof body.progress === "number" ? { progress: body.progress } : {}),
        ...(body.status === "cancelled" ||
        body.status === "completed" ||
        body.status === "failed"
          ? { completedAt: new Date() }
          : {}),
      },
      include: {
        findings: true,
        vitals: true,
        pages: true,
      },
    });

    return NextResponse.json({
      scan: serializeScan(scan),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Tarama güncellenirken hata oluştu.";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 400,
      },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.scan.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Tarama silinirken hata oluştu.";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 400,
      },
    );
  }
}

function serializeScan(scan: ScanWithRelations) {
  return {
    id: scan.id,
    url: scan.url,
    site: scan.site,
    status: scan.status,
    progress: scan.progress,

    scopeType: scan.scopeType,
    crawlDepth: scan.crawlDepth,
    selectedDevices: parseJsonArray(scan.selectedDevices),
    selectedModules: parseJsonArray(scan.selectedModules),
    selectedPages: parseJsonArray(scan.selectedPages),

    overallScore: scan.overallScore,
    performanceScore: scan.performanceScore,
    seoScore: scan.seoScore,
    accessibilityScore: scan.accessibilityScore,
    uxScore: scan.uxScore,
    securityScore: scan.securityScore,

    scores: {
      performance: scan.performanceScore ?? 0,
      seo: scan.seoScore ?? 0,
      accessibility: scan.accessibilityScore ?? 0,
      ux: scan.uxScore ?? 0,
      security: scan.securityScore ?? 0,
    },

    startedAt: scan.startedAt,
    completedAt: scan.completedAt,
    createdAt: scan.createdAt,
    updatedAt: scan.updatedAt,

    findings: scan.findings.map((finding) => ({
      id: finding.id,
      title: finding.title,
      desc: finding.description,
      description: finding.description,
      level: finding.level,
      severity: finding.level,
      category: finding.category,
      tone: finding.tone,
      solution: finding.solution,
      createdAt: finding.createdAt,
    })),

    vitals: scan.vitals.map((vital) => ({
      id: vital.id,
      metric: vital.metric,
      value: vital.value,
      status: vital.status,
      avg: vital.average,
      average: vital.average,
      trend: vital.trend,
      tone: vital.tone,
      width: vital.width,
      createdAt: vital.createdAt,
    })),

    pages: scan.pages.map((page) => ({
      id: page.id,
      path: page.path,
      score: page.score,
      critical: page.critical,
      criticalCount: page.critical,
      warning: page.warning,
      warningCount: page.warning,
      check: page.lastChecked,
      lastChecked: page.lastChecked,
      createdAt: page.createdAt,
    })),

    suggestions: buildSuggestions(scan),
  };
}

function parseJsonArray(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildSuggestions(scan: ScanWithRelations) {
  const suggestions = [];

  const hasSeoFinding = scan.findings.some(
    (finding) =>
      finding.category.toLowerCase().includes("seo") ||
      finding.title.toLowerCase().includes("meta"),
  );

  const hasUxFinding = scan.findings.some(
    (finding) =>
      finding.category.toLowerCase().includes("ux") ||
      finding.title.toLowerCase().includes("mobil") ||
      finding.title.toLowerCase().includes("taşan"),
  );

  const hasPerformanceFinding = scan.findings.some(
    (finding) =>
      finding.category.toLowerCase().includes("performance") ||
      finding.title.toLowerCase().includes("lcp") ||
      finding.title.toLowerCase().includes("performans"),
  );

  if (hasSeoFinding) {
    suggestions.push({
      title: "Meta description alanlarını tamamlayın",
      desc: "SEO skorunu artırmak için eksik meta description alanlarını sayfa bazlı özgün içeriklerle doldurun.",
      impact: "Yüksek",
      actions: [
        "Öncelikli olarak ana sayfa, kategori ve hizmet sayfalarından başlayın.",
        "Her açıklamayı 140-160 karakter aralığında hazırlayın.",
      ],
    });
  }

  if (hasUxFinding) {
    suggestions.push({
      title: "Mobil taşma sorunlarını giderin",
      desc: "Mobil viewport dışına çıkan elemanlar kullanıcı deneyimini ve responsive kalite skorunu düşürür.",
      impact: "Yüksek",
      actions: [
        "Sabit width verilen elemanları kontrol edin.",
        "Grid, flex ve medya sorgularında max-width kullanın.",
      ],
    });
  }

  if (hasPerformanceFinding) {
    suggestions.push({
      title: "LCP performansını iyileştirin",
      desc: "Hero görseli veya render-blocking kaynaklar LCP süresini artırıyor olabilir.",
      impact: "Yüksek",
      actions: [
        "Hero görselini WebP/AVIF formatına çevirin.",
        "Kritik CSS ve preload stratejisini kontrol edin.",
      ],
    });
  }

  if (!suggestions.length) {
    suggestions.push({
      title: "Genel frontend kalite kontrolü yapın",
      desc: "Tarama sonucunda küçük iyileştirme alanları tespit edildi.",
      impact: "Orta",
      actions: [
        "Bulgular sekmesindeki maddeleri sayfa bazlı kontrol edin.",
        "Düzeltmelerden sonra tekrar analiz çalıştırın.",
      ],
    });
  }

  return suggestions;
}