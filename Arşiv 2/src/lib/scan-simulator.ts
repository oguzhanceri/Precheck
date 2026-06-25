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

type DemoFinding = {
  title: string;
  description: string;
  level: string;
  category: string;
  tone: string;
  solution: string;
};

type DemoVital = {
  metric: string;
  value: string;
  status: string;
  average: string;
  trend: string;
  tone: string;
  width: string;
};

type DemoPage = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  lastChecked: string;
};

type DemoReport = {
  scores: {
    overallScore: number;
    performanceScore: number;
    seoScore: number;
    accessibilityScore: number;
    uxScore: number;
    securityScore: number;
  };
  findings: DemoFinding[];
  vitals: DemoVital[];
  pages: DemoPage[];
};

type SiteProfile = {
  key: string;
  baseScores: {
    performanceScore: number;
    seoScore: number;
    accessibilityScore: number;
    uxScore: number;
    securityScore: number;
  };
  pages: string[];
  findings: DemoFinding[];
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
    if (scan.status === "completed") {
      const report = buildDemoReport(scan);

      await ensureScanScores(scan.id, scan, report);
      await createDemoReportData(scan.id, report);
    }

    return getScanWithRelations(scanId);
  }

  const elapsed = Date.now() - scan.createdAt.getTime();

  const calculatedProgress = Math.min(
    100,
    Math.max(scan.progress, Math.round((elapsed / SCAN_DURATION_MS) * 100)),
  );

  if (calculatedProgress >= 100) {
    const report = buildDemoReport(scan);

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

    await createDemoReportData(scanId, report);

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

async function ensureScanScores(
  scanId: string,
  scan: ScanSeed,
  report: DemoReport,
) {
  const hasScores =
    typeof scan.overallScore === "number" &&
    typeof scan.performanceScore === "number" &&
    typeof scan.seoScore === "number" &&
    typeof scan.accessibilityScore === "number" &&
    typeof scan.uxScore === "number" &&
    typeof scan.securityScore === "number";

  if (hasScores) return;

  await prisma.scan.update({
    where: { id: scanId },
    data: {
      overallScore: report.scores.overallScore,
      performanceScore: report.scores.performanceScore,
      seoScore: report.scores.seoScore,
      accessibilityScore: report.scores.accessibilityScore,
      uxScore: report.scores.uxScore,
      securityScore: report.scores.securityScore,
    },
  });
}

async function createDemoReportData(scanId: string, report: DemoReport) {
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
      data: report.findings.map((finding) => ({
        scanId,
        title: finding.title,
        description: finding.description,
        level: finding.level,
        category: finding.category,
        tone: finding.tone,
        solution: finding.solution,
      })),
    });
  }

  if (vitalCount === 0) {
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

  if (pageCount === 0) {
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

function buildDemoReport(scan: ScanSeed): DemoReport {
  const profile = getSiteProfile(scan.url);
  const activeModules = getActiveModules(scan.selectedModules);
  const seed = hashString(`${scan.id}:${scan.url}:${profile.key}:${activeModules.join("-")}`);
  const random = createSeededRandom(seed);

  const performanceScore = buildModuleScore(
    profile.baseScores.performanceScore,
    "performance",
    activeModules,
    random,
    55,
    99,
  );

  const seoScore = buildModuleScore(
    profile.baseScores.seoScore,
    "seo",
    activeModules,
    random,
    55,
    99,
  );

  const accessibilityScore = buildModuleScore(
    profile.baseScores.accessibilityScore,
    "accessibility",
    activeModules,
    random,
    55,
    99,
  );

  const uxScore = buildUxScore(
    profile.baseScores.uxScore,
    activeModules,
    random,
  );

  const securityScore = buildModuleScore(
    profile.baseScores.securityScore,
    "security",
    activeModules,
    random,
    60,
    99,
  );

  const overallScore = buildOverallScore(
    {
      performanceScore,
      seoScore,
      accessibilityScore,
      uxScore,
      securityScore,
    },
    activeModules,
  );

  const scores = {
    overallScore,
    performanceScore,
    seoScore,
    accessibilityScore,
    uxScore,
    securityScore,
  };

  return {
    scores,
    findings: buildFindings(profile, scores, activeModules, random),
    vitals: shouldIncludePerformanceLike(activeModules)
      ? buildVitals(scores, random)
      : buildHealthyVitals(scores, random),
    pages: buildPages(scan, profile, scores, activeModules, random),
  };
}

function buildModuleScore(
  baseScore: number,
  module: ModuleKey,
  activeModules: ModuleKey[],
  random: () => number,
  min: number,
  max: number,
) {
  if (!isModuleEnabled(activeModules, module)) {
    return clampNumber(baseScore + randomInt(random, 2, 9), 75, 99);
  }

  return clampNumber(baseScore + randomInt(random, -10, 7), min, max);
}

function buildUxScore(
  baseScore: number,
  activeModules: ModuleKey[],
  random: () => number,
) {
  const uxModules: ModuleKey[] = [
    "ux",
    "responsive",
    "interaction",
    "visual",
    "forms",
  ];

  const hasUxModule = uxModules.some((module) =>
    isModuleEnabled(activeModules, module),
  );

  if (!hasUxModule) {
    return clampNumber(baseScore + randomInt(random, 2, 9), 75, 99);
  }

  return clampNumber(baseScore + randomInt(random, -10, 7), 55, 99);
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
  const allModulesEnabled = activeModules.length === 0;

  if (allModulesEnabled) {
    return Math.round(
      scores.performanceScore * 0.25 +
        scores.seoScore * 0.22 +
        scores.accessibilityScore * 0.16 +
        scores.uxScore * 0.22 +
        scores.securityScore * 0.15,
    );
  }

  const selectedScores: number[] = [];

  if (isModuleEnabled(activeModules, "performance")) {
    selectedScores.push(scores.performanceScore);
  }

  if (isModuleEnabled(activeModules, "seo")) {
    selectedScores.push(scores.seoScore);
  }

  if (isModuleEnabled(activeModules, "accessibility")) {
    selectedScores.push(scores.accessibilityScore);
  }

  if (isModuleEnabled(activeModules, "security")) {
    selectedScores.push(scores.securityScore);
  }

  if (
    isModuleEnabled(activeModules, "ux") ||
    isModuleEnabled(activeModules, "responsive") ||
    isModuleEnabled(activeModules, "interaction") ||
    isModuleEnabled(activeModules, "visual") ||
    isModuleEnabled(activeModules, "forms")
  ) {
    selectedScores.push(scores.uxScore);
  }

  if (!selectedScores.length) {
    return Math.round(
      scores.performanceScore * 0.25 +
        scores.seoScore * 0.22 +
        scores.accessibilityScore * 0.16 +
        scores.uxScore * 0.22 +
        scores.securityScore * 0.15,
    );
  }

  return Math.round(
    selectedScores.reduce((total, score) => total + score, 0) /
      selectedScores.length,
  );
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

function shouldIncludePerformanceLike(activeModules: ModuleKey[]) {
  return (
    activeModules.length === 0 ||
    activeModules.includes("performance") ||
    activeModules.includes("ux") ||
    activeModules.includes("responsive") ||
    activeModules.includes("interaction")
  );
}

function isFindingAllowed(finding: DemoFinding, activeModules: ModuleKey[]) {
  if (activeModules.length === 0) return true;

  const category = normalizeText(finding.category);
  const title = normalizeText(finding.title);
  const value = `${category} ${title}`;

  if (
    activeModules.includes("performance") &&
    (category.includes("performance") ||
      value.includes("performans") ||
      value.includes("lcp") ||
      value.includes("css") ||
      value.includes("js") ||
      value.includes("bundle") ||
      value.includes("dosya boyutu") ||
      value.includes("render-blocking") ||
      value.includes("webp") ||
      value.includes("avif"))
  ) {
    return true;
  }

  if (
    activeModules.includes("seo") &&
    (category.includes("seo") ||
      value.includes("meta") ||
      value.includes("structured") ||
      value.includes("schema") ||
      value.includes("h1") ||
      value.includes("h2") ||
      value.includes("h3") ||
      value.includes("hiyerarsi") ||
      value.includes("hierarchy") ||
      value.includes("ic link") ||
      value.includes("iç link") ||
      value.includes("linkleme"))
  ) {
    return true;
  }

  if (
    activeModules.includes("accessibility") &&
    (category.includes("accessibility") ||
      value.includes("erisilebilirlik") ||
      value.includes("erişilebilirlik") ||
      value.includes("alt metin") ||
      value.includes("label") ||
      value.includes("focus") ||
      value.includes("kontrast"))
  ) {
    return true;
  }

  if (
    activeModules.includes("security") &&
    (category.includes("security") ||
      value.includes("guvenlik") ||
      value.includes("güvenlik") ||
      value.includes("csp") ||
      value.includes("hsts") ||
      value.includes("x-frame") ||
      value.includes("referrer-policy"))
  ) {
    return true;
  }

  if (
    (activeModules.includes("ux") ||
      activeModules.includes("responsive") ||
      activeModules.includes("interaction") ||
      activeModules.includes("visual") ||
      activeModules.includes("forms")) &&
    (category.includes("ux") ||
      value.includes("ui") ||
      value.includes("mobil") ||
      value.includes("responsive") ||
      value.includes("spacing") ||
      value.includes("cta") ||
      value.includes("form") ||
      value.includes("input") ||
      value.includes("hover") ||
      value.includes("click") ||
      value.includes("tas") ||
      value.includes("taş") ||
      value.includes("hizalama") ||
      value.includes("gorsel") ||
      value.includes("görsel"))
  ) {
    return true;
  }

  return false;
}

function getSiteProfile(url: string): SiteProfile {
  const value = url.toLowerCase();

  if (
    value.includes("shop") ||
    value.includes("store") ||
    value.includes("eticaret") ||
    value.includes("e-ticaret") ||
    value.includes("urun") ||
    value.includes("product") ||
    value.includes("sepet") ||
    value.includes("cart")
  ) {
    return {
      key: "ecommerce",
      baseScores: {
        performanceScore: 78,
        seoScore: 84,
        accessibilityScore: 82,
        uxScore: 80,
        securityScore: 88,
      },
      pages: ["/", "/urunler", "/urun/ornek-urun", "/sepet", "/odeme"],
      findings: [
        {
          title: "Ürün görselleri optimize edilmemiş",
          description:
            "Ürün listeleme ve detay sayfalarında büyük görsel dosyaları yükleniyor.",
          level: "YÜKSEK",
          category: "Performance",
          tone: "red",
          solution:
            "Ürün görsellerini WebP/AVIF formatına çevirin, responsive image kullanın ve lazy loading stratejisini aktif edin.",
        },
        {
          title: "Sepet adımında mobil hizalama sorunu",
          description:
            "Mobil viewportta sepet özeti ve ödeme butonu dar ekranlarda sıkışıyor.",
          level: "ORTA",
          category: "UX",
          tone: "orange",
          solution:
            "Sepet ve checkout alanlarında flex/grid kırılımlarını kontrol edin. Mobilde tek kolon akış kullanın.",
        },
        {
          title: "Ürün sayfalarında eksik structured data",
          description:
            "Product schema işaretlemeleri eksik olduğu için zengin sonuç görünürlüğü düşebilir.",
          level: "ORTA",
          category: "SEO",
          tone: "orange",
          solution:
            "Ürün adı, fiyat, stok, görsel ve değerlendirme alanlarını içeren Product schema ekleyin.",
        },
        {
          title: "Form alanlarında label eksikleri",
          description:
            "Checkout formundaki bazı inputlar erişilebilir label veya aria-label içermiyor.",
          level: "ORTA",
          category: "Accessibility",
          tone: "orange",
          solution:
            "Tüm ödeme ve adres inputlarına görünür label veya uygun aria-label ekleyin.",
        },
        {
          title: "Checkout güvenlik başlıkları eksik",
          description:
            "Ödeme akışında bazı temel güvenlik headerları eksik görünüyor.",
          level: "ORTA",
          category: "Security",
          tone: "orange",
          solution:
            "HSTS, CSP, X-Frame-Options ve Referrer-Policy headerlarını ödeme sayfalarında doğrulayın.",
        },
      ],
    };
  }

  if (
    value.includes("blog") ||
    value.includes("haber") ||
    value.includes("news") ||
    value.includes("article") ||
    value.includes("yazi")
  ) {
    return {
      key: "content",
      baseScores: {
        performanceScore: 86,
        seoScore: 78,
        accessibilityScore: 84,
        uxScore: 87,
        securityScore: 89,
      },
      pages: ["/", "/blog", "/blog/ornek-yazi", "/kategori/haberler", "/arsiv"],
      findings: [
        {
          title: "Eksik meta description",
          description:
            "Bazı içerik sayfalarında meta description alanı eksik veya tekrar ediyor.",
          level: "ORTA",
          category: "SEO",
          tone: "orange",
          solution:
            "Her yazı için özgün, 140-160 karakter aralığında meta description hazırlayın.",
        },
        {
          title: "Başlık hiyerarşisi tutarsız",
          description:
            "Bazı içerik sayfalarında H1 sonrası H2/H3 sıralaması düzensiz ilerliyor.",
          level: "ORTA",
          category: "SEO",
          tone: "orange",
          solution:
            "Sayfa başına tek H1 kullanın. Alt başlıkları mantıksal H2/H3 akışına göre düzenleyin.",
        },
        {
          title: "İç linkleme zayıf",
          description:
            "İlgili yazılar ve kategori geçişleri yeterince görünür değil.",
          level: "BİLGİ",
          category: "UX",
          tone: "yellow",
          solution:
            "Yazı sonlarına ilgili içerikler, kategori bağlantıları ve önerilen okuma alanları ekleyin.",
        },
      ],
    };
  }

  if (
    value.includes("landing") ||
    value.includes("campaign") ||
    value.includes("kampanya") ||
    value.includes("lp")
  ) {
    return {
      key: "landing",
      baseScores: {
        performanceScore: 82,
        seoScore: 80,
        accessibilityScore: 78,
        uxScore: 86,
        securityScore: 90,
      },
      pages: ["/", "/features", "/pricing", "/contact"],
      findings: [
        {
          title: "CTA buton kontrastı düşük",
          description:
            "Hero alanındaki ana aksiyon butonu bazı arka planlarda yeterli kontrast üretmiyor.",
          level: "ORTA",
          category: "Accessibility",
          tone: "orange",
          solution:
            "Buton metni ile arka plan arasında yeterli kontrast oranı sağlayın. Hover ve focus durumlarını ayrıca kontrol edin.",
        },
        {
          title: "Hero görseli LCP süresini artırıyor",
          description:
            "İlk ekrandaki büyük görsel LCP metriğini olumsuz etkiliyor.",
          level: "YÜKSEK",
          category: "Performance",
          tone: "red",
          solution:
            "Hero görselini sıkıştırın, preload kullanın ve kritik görseli modern formatta sunun.",
        },
        {
          title: "Form gönderim geri bildirimi zayıf",
          description:
            "İletişim formu gönderim sonrası kullanıcıya yeterli başarı/hata mesajı göstermiyor.",
          level: "ORTA",
          category: "UX",
          tone: "orange",
          solution:
            "Form submit sonrası loading, success ve error durumlarını görünür hale getirin.",
        },
      ],
    };
  }

  if (
    value.includes("demo") ||
    value.includes("kurumsal") ||
    value.includes("corporate") ||
    value.includes("company") ||
    value.includes("pentayazilim") ||
    value.includes("kuleks")
  ) {
    return {
      key: "corporate",
      baseScores: {
        performanceScore: 88,
        seoScore: 83,
        accessibilityScore: 82,
        uxScore: 86,
        securityScore: 91,
      },
      pages: ["/", "/hakkimizda", "/hizmetler", "/projeler", "/iletisim"],
      findings: [
        {
          title: "Kurumsal sayfalarda meta açıklama eksikleri",
          description:
            "Hakkımızda ve hizmet sayfalarında meta description alanları eksik veya çok kısa.",
          level: "ORTA",
          category: "SEO",
          tone: "orange",
          solution:
            "Kurumsal sayfalara hizmet odaklı ve benzersiz meta description metinleri ekleyin.",
        },
        {
          title: "Mobilde taşan içerik",
          description:
            "Bazı kurumsal içerik blokları küçük viewportlarda yatay taşma oluşturuyor.",
          level: "YÜKSEK",
          category: "UX",
          tone: "red",
          solution:
            "Sabit genişlik verilen elemanları kontrol edin. max-width, overflow ve responsive grid ayarlarını düzenleyin.",
        },
        {
          title: "Görsellerde alt metin eksikleri",
          description:
            "Referans/proje görsellerinin bir kısmında açıklayıcı alt metin bulunmuyor.",
          level: "ORTA",
          category: "Accessibility",
          tone: "orange",
          solution:
            "İçerik anlamı taşıyan görseller için kısa ve açıklayıcı alt metinler ekleyin.",
        },
      ],
    };
  }

  return {
    key: "default",
    baseScores: {
      performanceScore: 86,
      seoScore: 84,
      accessibilityScore: 85,
      uxScore: 87,
      securityScore: 90,
    },
    pages: ["/", "/hakkimizda", "/hizmetler", "/blog", "/iletisim"],
    findings: [
      {
        title: "Eksik meta description",
        description:
          "Bazı sayfalarda meta description alanı eksik veya önerilen uzunluğun altında.",
        level: "ORTA",
        category: "SEO",
        tone: "orange",
        solution:
          "Öncelikli sayfalara 140-160 karakter aralığında özgün meta description ekleyin.",
      },
      {
        title: "LCP süresi iyileştirilebilir",
        description:
          "İlk ekrandaki görsel veya render-blocking kaynaklar LCP süresini artırıyor.",
        level: "YÜKSEK",
        category: "Performance",
        tone: "red",
        solution:
          "Hero görselini optimize edin, preload kullanın ve kritik CSS’i küçültün.",
      },
      {
        title: "Mobil spacing tutarsızlığı",
        description:
          "Mobil görünümde bazı modüllerde dikey boşluklar tutarsız görünüyor.",
        level: "BİLGİ",
        category: "UX",
        tone: "yellow",
        solution:
          "Mobil breakpointlerde section padding değerlerini ortak bir ritme göre düzenleyin.",
      },
    ],
  };
}

function buildFindings(
  profile: SiteProfile,
  scores: DemoReport["scores"],
  activeModules: ModuleKey[],
  random: () => number,
): DemoFinding[] {
  const commonFindings: DemoFinding[] = [
    {
      title: "Güvenlik başlıkları eksik",
      description:
        "Bazı güvenlik headerları eksik olduğu için temel güvenlik skoru etkileniyor.",
      level: scores.securityScore < 82 ? "YÜKSEK" : "ORTA",
      category: "Security",
      tone: scores.securityScore < 82 ? "red" : "orange",
      solution:
        "HSTS, CSP, X-Frame-Options ve X-Content-Type-Options headerlarını sunucu tarafında yapılandırın.",
    },
    {
      title: "Focus state görünürlüğü zayıf",
      description:
        "Klavye ile gezinen kullanıcılar için bazı interaktif elemanlarda focus durumu yeterince belirgin değil.",
      level: "ORTA",
      category: "Accessibility",
      tone: "orange",
      solution:
        "Buton, link ve form alanlarında görünür focus ring kullanın. outline kaldırıldıysa yerine erişilebilir bir stil ekleyin.",
    },
    {
      title: "CSS/JS dosya boyutu yüksek",
      description:
        "Kullanılmayan JavaScript veya CSS parçaları ilk yükleme süresini artırıyor.",
      level: scores.performanceScore < 80 ? "YÜKSEK" : "ORTA",
      category: "Performance",
      tone: scores.performanceScore < 80 ? "red" : "orange",
      solution:
        "Kullanılmayan kodları ayırın, bundle analizini çalıştırın ve kritik olmayan scriptleri defer/lazy yükleyin.",
    },
    {
      title: "Form doğrulama mesajları yetersiz",
      description:
        "Bazı form alanlarında hata mesajları yeterince açıklayıcı değil.",
      level: "BİLGİ",
      category: "UX",
      tone: "yellow",
      solution:
        "Form hata mesajlarını alan bazlı ve kullanıcıya çözüm gösterecek şekilde düzenleyin.",
    },
  ];

  const fullPool = shuffleArray([...profile.findings, ...commonFindings], random);
  const filteredPool = fullPool.filter((finding) =>
    isFindingAllowed(finding, activeModules),
  );

  const pool = filteredPool.length ? filteredPool : fullPool;

  const issueCount =
    scores.overallScore < 76
      ? 5
      : scores.overallScore < 84
        ? 4
        : scores.overallScore < 92
          ? 3
          : 2;

  return pool.slice(0, Math.min(issueCount, pool.length));
}

function buildVitals(
  scores: DemoReport["scores"],
  random: () => number,
): DemoVital[] {
  const lcp = buildLcp(scores.performanceScore, random);
  const cls = buildCls(scores.uxScore, random);
  const inp = buildInp(scores.performanceScore, scores.uxScore, random);

  return [lcp, cls, inp];
}

function buildHealthyVitals(
  scores: DemoReport["scores"],
  random: () => number,
): DemoVital[] {
  const safeScores = {
    ...scores,
    performanceScore: clampNumber(scores.performanceScore + randomInt(random, 3, 8), 82, 99),
    uxScore: clampNumber(scores.uxScore + randomInt(random, 3, 8), 82, 99),
  };

  return buildVitals(safeScores, random);
}

function buildLcp(score: number, random: () => number): DemoVital {
  const value =
    score >= 90
      ? randomFloat(random, 1.6, 2.3)
      : score >= 78
        ? randomFloat(random, 2.4, 3.7)
        : randomFloat(random, 3.8, 5.2);

  const status = value <= 2.5 ? "İyi" : value <= 4 ? "İyileştirilmeli" : "Kötü";
  const tone = value <= 2.5 ? "green" : "orange";

  return {
    metric: "LCP (Largest Contentful Paint)",
    value: `${value.toFixed(1)} sn`,
    status,
    average: "2.5 sn",
    trend: tone === "green" ? "↘ İyileşti" : "↗ Yavaşladı",
    tone,
    width: `${clampNumber(Math.round(score * 0.82), 42, 92)}%`,
  };
}

function buildCls(score: number, random: () => number): DemoVital {
  const value =
    score >= 90
      ? randomFloat(random, 0.01, 0.06)
      : score >= 78
        ? randomFloat(random, 0.07, 0.14)
        : randomFloat(random, 0.15, 0.26);

  const status = value <= 0.1 ? "İyi" : value <= 0.25 ? "İyileştirilmeli" : "Kötü";
  const tone = value <= 0.1 ? "green" : "orange";

  return {
    metric: "CLS (Cumulative Layout Shift)",
    value: value.toFixed(2),
    status,
    average: "0.10",
    trend: tone === "green" ? "→ Sabit" : "↗ Kötüleşti",
    tone,
    width: `${clampNumber(Math.round(score * 0.9), 42, 94)}%`,
  };
}

function buildInp(
  performanceScore: number,
  uxScore: number,
  random: () => number,
): DemoVital {
  const blendedScore = Math.round((performanceScore + uxScore) / 2);

  const value =
    blendedScore >= 90
      ? randomInt(random, 90, 160)
      : blendedScore >= 78
        ? randomInt(random, 170, 280)
        : randomInt(random, 290, 520);

  const status = value <= 200 ? "İyi" : value <= 500 ? "İyileştirilmeli" : "Kötü";
  const tone = value <= 200 ? "green" : "orange";

  return {
    metric: "INP (Interaction to Next Paint)",
    value: `${value} ms`,
    status,
    average: "200 ms",
    trend: tone === "green" ? "↘ İyileşti" : "↗ Kötüleşti",
    tone,
    width: `${clampNumber(Math.round(blendedScore * 0.78), 38, 90)}%`,
  };
}

function buildPages(
  scan: ScanSeed,
  profile: SiteProfile,
  scores: DemoReport["scores"],
  activeModules: ModuleKey[],
  random: () => number,
): DemoPage[] {
  const selectedPages = parseStringArray(scan.selectedPages);
  const sourcePages = selectedPages.length ? selectedPages : profile.pages;
  const uniquePages = Array.from(
    new Set(sourcePages.map((page) => normalizePagePath(page))),
  );

  const pageCount = clampNumber(randomInt(random, 3, 5), 3, uniquePages.length || 3);
  const pages = uniquePages.slice(0, pageCount);

  const selectedModulesPenalty =
    activeModules.length === 0 ? 0 : Math.max(0, 5 - activeModules.length);

  return pages.map((path, index) => {
    const offset = randomInt(random, -14, 8) - index * 2 - selectedModulesPenalty;
    const score = clampNumber(scores.overallScore + offset, 45, 98);

    const critical = score < 70 ? randomInt(random, 1, 3) : score < 80 ? 1 : 0;
    const warning =
      score >= 90
        ? randomInt(random, 0, 1)
        : score >= 80
          ? randomInt(random, 1, 3)
          : randomInt(random, 3, 6);

    return {
      path,
      score,
      critical,
      warning,
      lastChecked: `Bugün ${buildTimeLabel(index)}`,
    };
  });
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

function normalizePagePath(path: string) {
  const trimmed = path.trim();

  if (!trimmed) return "/";

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      return url.pathname || "/";
    }
  } catch {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function buildTimeLabel(index: number) {
  const baseHour = 14;
  const baseMinute = 30 + index;

  return `${String(baseHour).padStart(2, "0")}:${String(baseMinute).padStart(2, "0")}`;
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

function hashString(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let state = seed || 1;

  return () => {
    state = Math.imul(1664525, state) + 1013904223;
    return ((state >>> 0) % 1000000) / 1000000;
  };
}

function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomFloat(random: () => number, min: number, max: number) {
  return random() * (max - min) + min;
}

function shuffleArray<T>(items: T[], random: () => number) {
  const cloned = [...items];

  for (let index = cloned.length - 1; index > 0; index -= 1) {
    const targetIndex = Math.floor(random() * (index + 1));
    const temp = cloned[index];

    cloned[index] = cloned[targetIndex];
    cloned[targetIndex] = temp;
  }

  return cloned;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}