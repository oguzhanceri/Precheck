import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getScanWithProgress } from "@/lib/scan-simulator";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ScanWithRelations = NonNullable<
  Awaited<ReturnType<typeof getScanWithProgress>>
>;

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

type SerializedFinding = {
  id: string;
  title: string;
  desc: string;
  description: string;
  level: string;
  severity: string;
  category: string;
  tone: string;
  solution: string;
  createdAt: Date;
};

type Suggestion = {
  title: string;
  desc: string;
  impact: string;
  actions: string[];
};

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
        ...(typeof body.progress === "number"
          ? { progress: body.progress }
          : {}),
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
  const selectedModules = parseJsonArray(scan.selectedModules);
  const activeModules = selectedModules
    .map((item) => normalizeModuleKey(String(item)))
    .filter((item): item is ModuleKey => item !== null);

  const filteredFindings = scan.findings.filter((finding) =>
    isFindingAllowedForModules(finding.category, finding.title, activeModules),
  );

  const serializedFindings: SerializedFinding[] = filteredFindings.map(
    (finding) => ({
      id: finding.id,
      title: finding.title,
      desc: finding.description,
      description: finding.description,
      level: finding.level,
      severity: finding.level,
      category: finding.category,
      tone: finding.tone,
      solution:
        finding.solution ??
        "Bu bulgu için ilgili sayfa veya modül üzerinde manuel kontrol yapın.",
      createdAt: finding.createdAt,
    }),
  );

  return {
    id: scan.id,
    url: scan.url,
    site: scan.site,
    status: scan.status,
    progress: scan.progress,

    scopeType: scan.scopeType,
    crawlDepth: scan.crawlDepth,
    selectedDevices: parseJsonArray(scan.selectedDevices),
    selectedModules,
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

    findings: serializedFindings,

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

    suggestions: buildSuggestions(serializedFindings, activeModules),
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

function isFindingAllowedForModules(
  categoryValue: string,
  titleValue: string,
  activeModules: ModuleKey[],
) {
  if (!activeModules.length) return true;

  const category = normalizeText(categoryValue);
  const title = normalizeText(titleValue);

  if (
    activeModules.includes("performance") &&
    category.includes("performance")
  ) {
    return true;
  }

  if (activeModules.includes("seo") && category.includes("seo")) {
    return true;
  }

  if (
    activeModules.includes("accessibility") &&
    (category.includes("accessibility") || category.includes("erisilebilirlik"))
  ) {
    return true;
  }

  if (activeModules.includes("security") && category.includes("security")) {
    return true;
  }

  const uxModules: ModuleKey[] = [
    "ux",
    "responsive",
    "interaction",
    "visual",
    "forms",
  ];

  const uxEnabled = uxModules.some((module) => activeModules.includes(module));

  if (uxEnabled && category.includes("ux")) {
    return true;
  }

  if (uxEnabled && category.includes("responsive")) {
    return true;
  }

  if (uxEnabled && category.includes("forms")) {
    return true;
  }

  if (uxEnabled && category.includes("interaction")) {
    return true;
  }

  if (uxEnabled && title.includes("mobilde tasan")) {
    return true;
  }

  return false;
}

function buildSuggestions(
  findings: SerializedFinding[],
  activeModules: ModuleKey[],
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  const allModulesEnabled = activeModules.length === 0;
  const seoEnabled = allModulesEnabled || activeModules.includes("seo");
  const performanceEnabled =
    allModulesEnabled || activeModules.includes("performance");
  const uxEnabled =
    allModulesEnabled ||
    activeModules.includes("ux") ||
    activeModules.includes("responsive") ||
    activeModules.includes("interaction") ||
    activeModules.includes("visual") ||
    activeModules.includes("forms");
  const accessibilityEnabled =
    allModulesEnabled || activeModules.includes("accessibility");
  const securityEnabled =
    allModulesEnabled || activeModules.includes("security");

  if (seoEnabled) {
    suggestions.push(...buildSeoSuggestions(findings));
  }

  if (uxEnabled) {
    suggestions.push(...buildUxSuggestions(findings));
  }

  if (performanceEnabled) {
    suggestions.push(...buildPerformanceSuggestions(findings));
  }

  if (accessibilityEnabled) {
    suggestions.push(...buildAccessibilitySuggestions(findings));
  }

  if (securityEnabled) {
    suggestions.push(...buildSecuritySuggestions(findings));
  }

  if (!suggestions.length) {
    suggestions.push({
      title: "Seçili modülde kritik sorun bulunamadı",
      desc: "Tarama sonucunda seçili modül kapsamında kritik bir problem tespit edilmedi.",
      impact: "Düşük",
      actions: [
        "Yine de sayfa bazlı manuel kontrol yapın.",
        "İçerik veya tasarım değişikliklerinden sonra tekrar analiz çalıştırın.",
      ],
    });
  }

  return suggestions;
}

function buildSeoSuggestions(findings: SerializedFinding[]): Suggestion[] {
  const seoFindings = findings.filter((finding) =>
    normalizeText(finding.category).includes("seo"),
  );

  const suggestions: Suggestion[] = [];

  if (!seoFindings.length) return suggestions;

  const hasSeoAnalyzeError = seoFindings.some((finding) =>
    normalizeText(finding.title).includes("gercek seo analizi tamamlanamadi"),
  );

  if (hasSeoAnalyzeError) {
    return [
      {
        title: "SEO analizi tamamlanamadı",
        desc: "Hedef site bot isteklerini engellemiş veya sunucu analiz isteğine hata döndürmüş olabilir.",
        impact: "Orta",
        actions: [
          "HTTP durum kodunu kontrol edin.",
          "CDN, firewall veya bot koruması ayarlarını inceleyin.",
        ],
      },
    ];
  }

  const hasTitleOrMeta = seoFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return (
      value.includes("title") ||
      value.includes("meta description") ||
      value.includes("meta aciklama")
    );
  });

  const hasHeading = seoFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("h1") || value.includes("h2") || value.includes("h3");
  });

  const hasImageAlt = seoFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return (
      value.includes("alt etiketi") ||
      value.includes("alt attribute") ||
      value.includes("gorsel")
    );
  });

  const hasCanonicalOrSitemap = seoFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return (
      value.includes("canonical") ||
      value.includes("sitemap") ||
      value.includes("robots")
    );
  });

  const hasSocialTags = seoFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("opengraph") || value.includes("twitter card");
  });

  if (hasTitleOrMeta) {
    suggestions.push({
      title: "Title ve meta description alanlarını düzeltin",
      desc: "Arama sonuçlarında daha iyi görünmek için title ve meta description değerlerini sayfa bazlı optimize edin.",
      impact: "Yüksek",
      actions: [
        "Her sayfa için benzersiz title yazın.",
        "Meta description değerlerini 140-160 karakter aralığında hazırlayın.",
      ],
    });
  }

  if (hasHeading) {
    suggestions.push({
      title: "Başlık hiyerarşisini sadeleştirin",
      desc: "Sayfada doğru H1/H2/H3 yapısı hem SEO hem de okunabilirlik için önemlidir.",
      impact: "Orta",
      actions: [
        "Sayfa başına tek H1 kullanın.",
        "Alt başlıkları H2 ve H3 sırasına göre düzenleyin.",
      ],
    });
  }

  if (hasImageAlt) {
    suggestions.push({
      title: "Görsel alt metinlerini tamamlayın",
      desc: "Alt metinler hem arama motorlarına hem de erişilebilirlik araçlarına görselin bağlamını anlatır.",
      impact: "Orta",
      actions: [
        "İçerik anlamı taşıyan görsellere kısa ve açıklayıcı alt metin ekleyin.",
        "Dekoratif görsellerde boş alt değeri kullanın.",
      ],
    });
  }

  if (hasCanonicalOrSitemap) {
    suggestions.push({
      title: "Teknik SEO dosyalarını tamamlayın",
      desc: "Canonical, robots.txt ve sitemap.xml dosyaları indekslenebilirlik açısından önemlidir.",
      impact: "Orta",
      actions: [
        "Canonical URL değerini kontrol edin.",
        "robots.txt ve sitemap.xml dosyalarının erişilebilir olduğundan emin olun.",
      ],
    });
  }

  if (hasSocialTags) {
    suggestions.push({
      title: "Sosyal paylaşım etiketlerini ekleyin",
      desc: "OpenGraph ve Twitter Card etiketleri paylaşım önizlemelerini iyileştirir.",
      impact: "Düşük",
      actions: [
        "og:title, og:description ve og:image ekleyin.",
        "twitter:card ve ilgili Twitter/X meta etiketlerini ekleyin.",
      ],
    });
  }

  return suggestions;
}

function buildUxSuggestions(findings: SerializedFinding[]): Suggestion[] {
  const uxFindings = findings.filter((finding) => {
    const value = normalizeText(`${finding.category} ${finding.title}`);

    return (
      value.includes("ux") ||
      value.includes("responsive") ||
      value.includes("form") ||
      value.includes("interaction") ||
      value.includes("mobil") ||
      value.includes("tas") ||
      value.includes("spacing")
    );
  });

  if (!uxFindings.length) return [];

  return [
    {
      title: "Mobil deneyim sorunlarını giderin",
      desc: "Mobil viewport, form ve etkileşim sorunları kullanıcı deneyimini doğrudan etkiler.",
      impact: "Yüksek",
      actions: [
        "Sabit width verilen elemanları kontrol edin.",
        "Form hata mesajlarını alan bazlı ve açıklayıcı hale getirin.",
      ],
    },
  ];
}

function buildPerformanceSuggestions(
  findings: SerializedFinding[],
): Suggestion[] {
  const performanceFindings = findings.filter((finding) => {
    const value = normalizeText(`${finding.category} ${finding.title}`);

    return (
      value.includes("performance") ||
      value.includes("performans") ||
      value.includes("lcp") ||
      value.includes("fcp") ||
      value.includes("speed index") ||
      value.includes("tbt") ||
      value.includes("javascript") ||
      value.includes("css") ||
      value.includes("main thread") ||
      value.includes("render-blocking") ||
      value.includes("gorsel") ||
      value.includes("image")
    );
  });

  if (!performanceFindings.length) return [];

  const suggestions: Suggestion[] = [];

  const hasLcp = performanceFindings.some((finding) =>
    normalizeText(finding.title).includes("lcp"),
  );

  const hasFcp = performanceFindings.some((finding) =>
    normalizeText(finding.title).includes("fcp"),
  );

  const hasSpeedIndex = performanceFindings.some((finding) =>
    normalizeText(finding.title).includes("speed index"),
  );

  const hasUnusedJs = performanceFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("javascript") || value.includes("js");
  });

  const hasUnusedCss = performanceFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("css");
  });

  const hasMainThread = performanceFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("main thread") || value.includes("ana is parcacigi");
  });

  const hasRenderBlocking = performanceFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return (
      value.includes("render-blocking") || value.includes("render blocking")
    );
  });

  const hasImageIssue = performanceFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return (
      value.includes("gorsel") ||
      value.includes("image") ||
      value.includes("webp") ||
      value.includes("avif")
    );
  });

  if (hasLcp) {
    suggestions.push({
      title: "LCP süresini düşürün",
      desc: "Sayfanın ana içerik öğesi geç yüklendiği için ilk yükleme deneyimi zayıflıyor.",
      impact: "Yüksek",
      actions: [
        "Hero görselini WebP/AVIF formatına çevirin.",
        "LCP öğesi için preload kullanın.",
        "Kritik CSS dışındaki stilleri geciktirin.",
      ],
    });
  }

  if (hasFcp || hasRenderBlocking) {
    suggestions.push({
      title: "İlk render süresini iyileştirin",
      desc: "Render-blocking CSS/JS kaynakları ilk içeriğin geç görünmesine neden olabilir.",
      impact: "Yüksek",
      actions: [
        "Kritik CSS’i ayırıp öncelikli yükleyin.",
        "Gereksiz scriptleri defer veya async yükleyin.",
        "Font dosyaları için preload ve font-display kullanın.",
      ],
    });
  }

  if (hasSpeedIndex) {
    suggestions.push({
      title: "Görsel tamamlanma süresini azaltın",
      desc: "Sayfanın görsel olarak tamamlanması beklenenden uzun sürüyor.",
      impact: "Orta",
      actions: [
        "İlk ekrandaki büyük medya dosyalarını küçültün.",
        "Aşağıdaki görsellerde lazy loading kullanın.",
        "Animasyon ve ağır scriptleri ilk yüklemeden sonra çalıştırın.",
      ],
    });
  }

  if (hasUnusedJs || hasMainThread) {
    suggestions.push({
      title: "JavaScript yükünü azaltın",
      desc: "Kullanılmayan veya ağır JavaScript kodları ana thread’i meşgul ediyor.",
      impact: "Yüksek",
      actions: [
        "Bundle analyzer ile büyük paketleri tespit edin.",
        "Route bazlı code splitting uygulayın.",
        "Dynamic import ile ağır modülleri sonradan yükleyin.",
      ],
    });
  }

  if (hasUnusedCss) {
    suggestions.push({
      title: "Kullanılmayan CSS’i temizleyin",
      desc: "Sayfada kullanılmayan CSS kuralları ilk yüklenen dosya boyutunu artırıyor.",
      impact: "Orta",
      actions: [
        "Tailwind content path ayarlarını kontrol edin.",
        "Global CSS içinde kullanılmayan classları temizleyin.",
        "Sayfa bazlı CSS yükleme stratejisi kullanın.",
      ],
    });
  }

  if (hasImageIssue) {
    suggestions.push({
      title: "Görsel optimizasyonunu tamamlayın",
      desc: "Büyük veya eski formatlı görseller performans skorunu düşürebilir.",
      impact: "Yüksek",
      actions: [
        "Görselleri WebP veya AVIF formatında servis edin.",
        "Mobil için daha küçük görsel varyasyonları üretin.",
        "srcset ve sizes değerlerini doğru tanımlayın.",
      ],
    });
  }

  return suggestions.slice(0, 4);
}

function buildAccessibilitySuggestions(
  findings: SerializedFinding[],
): Suggestion[] {
  const accessibilityFindings = findings.filter((finding) => {
    const value = normalizeText(`${finding.category} ${finding.title}`);

    return (
      value.includes("accessibility") ||
      value.includes("erisilebilirlik") ||
      value.includes("label") ||
      value.includes("focus") ||
      value.includes("kontrast") ||
      value.includes("alt metin")
    );
  });

  if (!accessibilityFindings.length) return [];

  return [
    {
      title: "Erişilebilirlik kontrollerini tamamlayın",
      desc: "Label, focus, kontrast ve açıklayıcı metinler erişilebilir kullanıcı deneyimi için kritiktir.",
      impact: "Orta",
      actions: [
        "Form alanlarında görünür label veya aria-label kullanın.",
        "Klavye focus stillerini görünür hale getirin.",
      ],
    },
  ];
}

function buildSecuritySuggestions(findings: SerializedFinding[]): Suggestion[] {
  const securityFindings = findings.filter((finding) => {
    const value = normalizeText(`${finding.category} ${finding.title}`);

    return (
      value.includes("security") ||
      value.includes("guvenlik") ||
      value.includes("csp") ||
      value.includes("hsts") ||
      value.includes("x-frame") ||
      value.includes("referrer-policy")
    );
  });

  if (!securityFindings.length) return [];

  return [
    {
      title: "Temel güvenlik başlıklarını yapılandırın",
      desc: "Güvenlik headerları tarayıcı tarafı saldırı yüzeyini azaltmaya yardımcı olur.",
      impact: "Orta",
      actions: [
        "HSTS, CSP ve X-Frame-Options headerlarını kontrol edin.",
        "Referrer-Policy ve X-Content-Type-Options değerlerini ekleyin.",
      ],
    },
  ];
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
    normalized.includes("a11y")
  ) {
    return "accessibility";
  }

  if (normalized.includes("security") || normalized.includes("guvenlik")) {
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
    normalized.includes("click") ||
    normalized.includes("hover")
  ) {
    return "interaction";
  }

  if (
    normalized.includes("visual") ||
    normalized.includes("gorsel") ||
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
    normalized.includes("kullanici")
  ) {
    return "ux";
  }

  return null;
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
