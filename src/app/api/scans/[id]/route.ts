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
  affectedPages: string[];
  affectedCount: number;
  causes: string[];
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
      affectedPages: finding.affectedPages
        ? JSON.parse(finding.affectedPages)
        : [],
      affectedCount: finding.affectedCount ?? 0,
      causes: finding.causes ? JSON.parse(finding.causes) : [],
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
      value.includes("visual") ||
      value.includes("gorsel") ||
      value.includes("mobil") ||
      value.includes("tas") ||
      value.includes("spacing") ||
      value.includes("link") ||
      value.includes("autocomplete") ||
      value.includes("placeholder") ||
      value.includes("paragraf") ||
      value.includes("cta") ||
      value.includes("navigasyon") ||
      value.includes("tablo") ||
      value.includes("medya") ||
      value.includes("breakpoint") ||
      value.includes("genis") ||
      value.includes("sabit genislik") ||
      value.includes("min-width") ||
      value.includes("overflow")
    );
  });

  if (!uxFindings.length) return [];

  const suggestions: Suggestion[] = [];

  const hasEmptyLinks = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return (
      value.includes("bos") ||
      value.includes("aciklamasiz") ||
      value.includes("link")
    );
  });

  const hasAutocomplete = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("autocomplete");
  });

  const hasPlaceholderLabel = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("placeholder") || value.includes("label");
  });

  const hasLongParagraphs = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("uzun paragraf") || value.includes("paragraf");
  });

  const hasNavigation = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("navigasyon") || value.includes("menu");
  });

  const hasCta = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("cta") || value.includes("aksiyon");
  });

  const hasViewport = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("viewport") || value.includes("mobil");
  });

  const hasResponsiveTable = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("tablo responsive") || value.includes("tablo");
  });

  const hasWideMedia = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return (
      value.includes("genis medya") ||
      value.includes("medya elemanlari") ||
      value.includes("medya")
    );
  });

  const hasBreakpoint = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("breakpoint");
  });

  const hasFixedWidth = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("sabit genislik") || value.includes("fixed width");
  });

  const hasMinWidth = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("min-width");
  });

  const hasOverflowX = uxFindings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("overflow-x") || value.includes("overflow");
  });

  if (hasEmptyLinks) {
    suggestions.push({
      title: "Link açıklamalarını tamamlayın",
      desc: "Boş veya açıklamasız linkler kullanıcıların ve ekran okuyucuların link amacını anlamasını zorlaştırır.",
      impact: "Orta",
      actions: [
        "İkon linklere aria-label ekleyin.",
        "Görsel linklerde alt metin veya görünür açıklama kullanın.",
        "Sadece ikonla verilen aksiyonları metinle destekleyin.",
      ],
    });
  }

  if (hasAutocomplete) {
    suggestions.push({
      title: "Form otomatik doldurma deneyimini iyileştirin",
      desc: "Autocomplete eksik olduğunda kullanıcılar ad, e-posta ve telefon gibi alanları tekrar tekrar manuel doldurmak zorunda kalır.",
      impact: "Orta",
      actions: [
        'E-posta alanlarında autocomplete="email" kullanın.',
        'Telefon alanlarında autocomplete="tel" kullanın.',
        "Ad-soyad alanlarında name, given-name veya family-name değerlerini kullanın.",
      ],
    });
  }

  if (hasPlaceholderLabel) {
    suggestions.push({
      title: "Form label yapısını güçlendirin",
      desc: "Placeholder metni kalıcı olmadığı için kullanıcı inputa yazmaya başladığında alanın ne istediğini unutabilir.",
      impact: "Orta",
      actions: [
        "Placeholder yerine görünür label kullanın.",
        "Label kullanılamıyorsa aria-label veya aria-labelledby ekleyin.",
        "Input id değeri ile label for değerinin eşleştiğinden emin olun.",
      ],
    });
  }

  if (hasLongParagraphs) {
    suggestions.push({
      title: "İçerik okunabilirliğini artırın",
      desc: "Çok uzun paragraflar özellikle mobilde taranabilirliği ve okuma konforunu düşürür.",
      impact: "Düşük",
      actions: [
        "Uzun paragrafları daha kısa bloklara bölün.",
        "Ara başlık, madde listesi ve vurgu metinleri kullanın.",
        "Mobilde 3-5 satırı aşan metin bloklarını sadeleştirin.",
      ],
    });
  }

  if (hasNavigation) {
    suggestions.push({
      title: "Navigasyon seçeneklerini sadeleştirin",
      desc: "Çok fazla menü linki kullanıcının karar verme süresini artırabilir ve mobil menüyü karmaşıklaştırabilir.",
      impact: "Düşük",
      actions: [
        "Ana menüde sadece en kritik sayfaları bırakın.",
        "İkincil linkleri footer veya alt menü alanına taşıyın.",
        "Mobil menüde kategori bazlı gruplama kullanın.",
      ],
    });
  }

  if (hasCta) {
    suggestions.push({
      title: "Sayfa aksiyonunu belirginleştirin",
      desc: "Belirgin CTA olmadığında kullanıcı sayfada hangi adımı atması gerektiğini kolayca anlayamayabilir.",
      impact: "Orta",
      actions: [
        "Hero alanına net bir CTA ekleyin.",
        "CTA metnini 'Teklif Al', 'Demo İste', 'İletişime Geç' gibi aksiyon odaklı yazın.",
        "Birincil ve ikincil CTA stillerini görsel olarak ayırın.",
      ],
    });
  }

  if (hasViewport) {
    suggestions.push({
      title: "Mobil viewport yapılandırmasını düzeltin",
      desc: "Viewport eksik olduğunda sayfa mobil cihazlarda yanlış ölçeklenebilir.",
      impact: "Yüksek",
      actions: [
        '<meta name="viewport" content="width=device-width, initial-scale=1"> etiketini ekleyin.',
        "Mobil kırılımlarda sayfanın yatay scroll üretmediğini kontrol edin.",
        "Sabit genişlik verilen elemanları responsive hale getirin.",
      ],
    });
  }

  if (hasResponsiveTable) {
    suggestions.push({
      title: "Mobil tablo görünümünü düzenleyin",
      desc: "Tablolar küçük ekranlarda yatay taşma oluşturabilir ve kullanıcıyı zorunlu yatay kaydırmaya yönlendirebilir.",
      impact: "Orta",
      actions: [
        "Tabloları overflow-x: auto olan bir wrapper içine alın.",
        "Mobilde tabloyu kart yapısına dönüştürmeyi değerlendirin.",
        "Kolon sayısını ve minimum genişlikleri mobilde azaltın.",
      ],
    });
  }

  if (hasWideMedia) {
    suggestions.push({
      title: "Medya elemanlarını responsive hale getirin",
      desc: "Geniş görsel, video veya iframe elemanları küçük ekranlarda taşma ve yatay scroll riski oluşturabilir.",
      impact: "Orta",
      actions: [
        "Görsel, video ve iframe elemanlarına max-width: 100% uygulayın.",
        "height: auto kullanarak oranların bozulmasını önleyin.",
        "Embed iframe yapıları için responsive aspect-ratio wrapper kullanın.",
      ],
    });
  }

  if (hasBreakpoint) {
    suggestions.push({
      title: "Responsive breakpoint kontrollerini güçlendirin",
      desc: "Sayfada breakpoint izi bulunmaması mobil ve tablet görünümde kırılma riskini artırabilir.",
      impact: "Düşük",
      actions: [
        "320px, 375px, 768px ve 1024px viewportlarda manuel kontrol yapın.",
        "Mobilde grid, tablo ve medya alanlarının taşmadığını doğrulayın.",
        "Harici CSS kullanılıyorsa breakpointlerin doğru yüklendiğini kontrol edin.",
      ],
    });
  }

  if (hasFixedWidth) {
    suggestions.push({
      title: "Sabit genişlikleri responsive hale getirin",
      desc: "Büyük px tabanlı width değerleri küçük ekranlarda taşma ve kırılma oluşturabilir.",
      impact: "Yüksek",
      actions: [
        "width değerlerini max-width veya width: 100% ile sınırlandırın.",
        "Desktop ölçüleri için breakpoint bazlı class kullanın.",
        "Kart, tablo ve medya alanlarında clamp() veya responsive grid kullanın.",
      ],
    });
  }

  if (hasMinWidth) {
    suggestions.push({
      title: "min-width kaynaklı taşma riskini azaltın",
      desc: "Büyük min-width değerleri mobilde elemanların daralmasını engelleyebilir.",
      impact: "Yüksek",
      actions: [
        "Mobil breakpointlerde min-width değerlerini kaldırın.",
        "Elemanlara max-width: 100% ekleyin.",
        "Grid ve flex çocuklarında min-width: 0 kullanımını değerlendirin.",
      ],
    });
  }

  if (hasOverflowX) {
    suggestions.push({
      title: "Yatay taşmanın gerçek sebebini düzeltin",
      desc: "overflow-x kullanımı taşmayı gizleyebilir; asıl genişlik problemi çözülmediğinde mobil deneyim bozulabilir.",
      impact: "Orta",
      actions: [
        "overflow-x: hidden yerine taşan elemanı tespit edin.",
        "Geniş tablo, medya ve slider alanlarını ayrı ayrı kontrol edin.",
        "Kök layout içinde 100vw + padding kaynaklı taşma olup olmadığını inceleyin.",
      ],
    });
  }

  return suggestions.slice(0, 5);
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
