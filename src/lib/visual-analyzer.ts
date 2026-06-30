type VisualFindingLevel = "critical" | "high" | "medium" | "low";

type VisualFinding = {
  title: string;
  desc: string;
  level: VisualFindingLevel;
  icon: string;
  category: "visual";
  solution: string;
  causes: string[];
  affectedPages: string[];
  affectedCount: number;
};

type VisualPageResult = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  check: string;
};

type VisualAnalyzeOptions = {
  selectedPages?: string[];
};

type SinglePageVisualResult = {
  url: string;
  path: string;
  score: number;
  findings: VisualFinding[];
  page: VisualPageResult;
};

export async function analyzeVisual(
  url: string,
  options: VisualAnalyzeOptions = {},
) {
  const baseUrl = normalizeUrl(url);
  const targetUrls = buildTargetUrls(baseUrl, options.selectedPages);

  const pageResults = await Promise.all(
    targetUrls.map((targetUrl, index) => analyzeVisualPage(targetUrl, index)),
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

async function analyzeVisualPage(
  url: string,
  index: number,
): Promise<SinglePageVisualResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PrecheckAI/1.0; +https://precheck.ai)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Visual analizi başarısız oldu. HTTP ${response.status}`);
  }

  const html = await response.text();
  const findings = analyzeHtmlVisual(html);
  const score = calculateVisualScore(findings);
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
    },
  };
}

function analyzeHtmlVisual(html: string) {
  const findings: VisualFinding[] = [];

  const imgMatches = html.match(/<img\b[^>]*>/gi) ?? [];
  const pictureMatches = html.match(/<picture\b[^>]*>[\s\S]*?<\/picture>/gi) ?? [];
  const sourceMatches = html.match(/<source\b[^>]*>/gi) ?? [];
  const videoMatches = html.match(/<video\b[^>]*>/gi) ?? [];
  const iframeMatches = html.match(/<iframe\b[^>]*>/gi) ?? [];
  const styleMatches = html.match(/style=["'][^"']*["']/gi) ?? [];
  const styleBlocks = html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) ?? [];

  const imagesWithoutDimensions = imgMatches.filter((img) => {
    const width = matchAttrFromTag(img, "width");
    const height = matchAttrFromTag(img, "height");

    return !width || !height;
  });

  const imagesWithoutLazy = imgMatches.filter((img) => {
    const loading = matchAttrFromTag(img, "loading");

    return loading !== "lazy" && !/fetchpriority=["']high["']/i.test(img);
  });

  const imagesWithoutSrcset = imgMatches.filter((img) => {
    const src = matchAttrFromTag(img, "src") ?? "";
    const srcset = matchAttrFromTag(img, "srcset");

    if (src.startsWith("data:")) return false;
    if (src.toLowerCase().endsWith(".svg")) return false;

    return !srcset;
  });

  const imagesWithoutSizes = imgMatches.filter((img) => {
    const srcset = matchAttrFromTag(img, "srcset");
    const sizes = matchAttrFromTag(img, "sizes");

    return Boolean(srcset) && !sizes;
  });

  const oldFormatImages = imgMatches.filter((img) => {
    const src = (matchAttrFromTag(img, "src") ?? "").toLowerCase();

    return (
      src.includes(".jpg") ||
      src.includes(".jpeg") ||
      src.includes(".png")
    );
  });

  const veryWideImages = imgMatches.filter((img) => {
    const width = Number((matchAttrFromTag(img, "width") ?? "").replace(/[^\d]/g, ""));

    return width >= 1600;
  });

  const stretchedImageRisk = imgMatches.filter((img) => {
    const width = matchAttrFromTag(img, "width");
    const height = matchAttrFromTag(img, "height");
    const style = matchAttrFromTag(img, "style") ?? "";

    return (
      Boolean(width && !height) ||
      Boolean(height && !width) ||
      /width\s*:\s*100%/i.test(style) && !/height\s*:\s*auto/i.test(style)
    );
  });

  const backgroundImages = [...styleMatches, ...styleBlocks].filter((style) =>
    /background-image\s*:|background\s*:[^;]*url\(/i.test(style),
  );

  const nonResponsiveEmbeds = [...videoMatches, ...iframeMatches].filter((tag) => {
    const width = Number((matchAttrFromTag(tag, "width") ?? "").replace(/[^\d]/g, ""));
    const style = matchAttrFromTag(tag, "style") ?? "";

    return (
      width >= 700 ||
      /width\s*:\s*(?:[7-9]\d{2,}|[1-9]\d{3,})px/i.test(style)
    );
  });

  const pngIconRisk = imgMatches.filter((img) => {
    const src = (matchAttrFromTag(img, "src") ?? "").toLowerCase();
    const width = Number((matchAttrFromTag(img, "width") ?? "").replace(/[^\d]/g, ""));
    const height = Number((matchAttrFromTag(img, "height") ?? "").replace(/[^\d]/g, ""));

    return src.includes(".png") && width > 0 && height > 0 && width <= 128 && height <= 128;
  });

  const pictureWithoutModernSource = pictureMatches.filter((picture) => {
    return !/type=["']image\/(webp|avif)["']/i.test(picture);
  });

  if (imagesWithoutDimensions.length > 0) {
    findings.push(
      createVisualFinding({
        title: "Görsellerde width/height eksik",
        desc: `${imagesWithoutDimensions.length} görselde width veya height attribute bulunamadı. Bu durum layout shift riskini artırabilir.`,
        level: "medium",
        icon: "image",
        solution:
          "Görseller için width ve height değerlerini ekleyin veya aspect-ratio ile alanı önceden ayırın.",
        causes: [
          "CMS görsel boyutlarını HTML çıktısına basmıyor olabilir.",
          "Görseller component içinde boyut bilgisi olmadan render ediliyor olabilir.",
          "Tarayıcı görsel yüklenene kadar alan yüksekliğini hesaplayamıyor olabilir.",
        ],
      }),
    );
  }

  if (imagesWithoutLazy.length > 3) {
    findings.push(
      createVisualFinding({
        title: "Lazy loading eksik görseller",
        desc: `${imagesWithoutLazy.length} görselde loading='lazy' veya fetchpriority ayarı bulunamadı.`,
        level: "medium",
        icon: "image",
        solution:
          "İlk ekran dışındaki görsellerde loading='lazy', hero görselinde fetchpriority='high' kullanın.",
        causes: [
          "Tüm görseller varsayılan olarak eager yükleniyor olabilir.",
          "Hero ve aşağı sayfa görselleri önceliklendirilmemiş olabilir.",
          "Görsel component’i lazy loading attribute üretmiyor olabilir.",
        ],
      }),
    );
  }

  if (imagesWithoutSrcset.length > 0) {
    findings.push(
      createVisualFinding({
        title: "Responsive image srcset eksik",
        desc: `${imagesWithoutSrcset.length} görselde srcset bulunamadı.`,
        level: "medium",
        icon: "image",
        solution:
          "Farklı ekran boyutları için srcset ve sizes kullanarak uygun görsel varyasyonlarını servis edin.",
        causes: [
          "Mobil ve desktop için aynı görsel dosyası servis ediliyor olabilir.",
          "CMS veya image component responsive varyasyon üretmiyor olabilir.",
          "Küçük ekranlarda gereğinden büyük görseller indiriliyor olabilir.",
        ],
      }),
    );
  }

  if (imagesWithoutSizes.length > 0) {
    findings.push(
      createVisualFinding({
        title: "sizes attribute eksik",
        desc: `${imagesWithoutSizes.length} görselde srcset olmasına rağmen sizes attribute bulunamadı.`,
        level: "low",
        icon: "image",
        solution:
          "srcset kullanan görsellerde tarayıcının doğru varyasyonu seçebilmesi için sizes attribute ekleyin.",
        causes: [
          "Responsive görsel stratejisi eksik tamamlanmış olabilir.",
          "Tarayıcı yanlış boyutta görsel seçebilir.",
          "Mobilde gereksiz büyük görsel indirilebilir.",
        ],
      }),
    );
  }

  if (oldFormatImages.length > 0) {
    findings.push(
      createVisualFinding({
        title: "Eski format görseller kullanılıyor",
        desc: `${oldFormatImages.length} görsel JPG/PNG formatında servis ediliyor.`,
        level: "low",
        icon: "image",
        solution:
          "Uygun görselleri WebP veya AVIF formatına dönüştürün. PNG'yi sadece transparan ihtiyaçlarda kullanın.",
        causes: [
          "Görseller modern formatlara dönüştürülmemiş olabilir.",
          "CMS upload pipeline WebP/AVIF üretmiyor olabilir.",
          "Eski assetler optimize edilmeden kullanılıyor olabilir.",
        ],
      }),
    );
  }

  if (veryWideImages.length > 0) {
    findings.push(
      createVisualFinding({
        title: "Çok geniş görseller var",
        desc: `${veryWideImages.length} görselde 1600px ve üzeri width attribute tespit edildi.`,
        level: "medium",
        icon: "image",
        solution:
          "Mobil ve tablet için daha küçük görsel varyasyonları üretin. Büyük görselleri sadece gerekli breakpointlerde yükleyin.",
        causes: [
          "Desktop görseller mobilde de servis ediliyor olabilir.",
          "srcset/sizes stratejisi eksik olabilir.",
          "Görsel dosyaları gereğinden büyük yükleniyor olabilir.",
        ],
      }),
    );
  }

  if (stretchedImageRisk.length > 0) {
    findings.push(
      createVisualFinding({
        title: "Görsel oran bozulma riski",
        desc: `${stretchedImageRisk.length} görselde oran bozulması veya stretch riski tespit edildi.`,
        level: "medium",
        icon: "image",
        solution:
          "Görsellerde width/height oranını koruyun, height:auto veya object-fit kullanın.",
        causes: [
          "Görsel sadece tek eksende boyutlandırılmış olabilir.",
          "CSS width:100% kullanılırken height:auto eklenmemiş olabilir.",
          "Kart içindeki görseller object-fit olmadan zorlanıyor olabilir.",
        ],
      }),
    );
  }

  if (backgroundImages.length > 0) {
    findings.push(
      createVisualFinding({
        title: "Background image kullanımı var",
        desc: `${backgroundImages.length} yerde CSS background-image kullanımı tespit edildi.`,
        level: "low",
        icon: "image",
        solution:
          "İçerik anlamı taşıyan görseller için background-image yerine img/picture kullanın.",
        causes: [
          "Görseller CSS background olarak kullanıldığı için alt metin alamıyor olabilir.",
          "Responsive varyasyon ve lazy loading kontrolü zorlaşabilir.",
          "SEO ve erişilebilirlik açısından görsel bağlamı kaybolabilir.",
        ],
      }),
    );
  }

  if (nonResponsiveEmbeds.length > 0) {
    findings.push(
      createVisualFinding({
        title: "Video/iframe responsive riski",
        desc: `${nonResponsiveEmbeds.length} video veya iframe elemanında genişlik kaynaklı taşma riski bulundu.`,
        level: "medium",
        icon: "video",
        solution:
          "Video ve iframe embedlerini aspect-ratio kullanan responsive wrapper içine alın.",
        causes: [
          "Embed kodu sabit width ile eklenmiş olabilir.",
          "Mobil breakpointlerde iframe genişliği override edilmiyor olabilir.",
          "Video alanı küçük ekranlarda yatay taşma oluşturabilir.",
        ],
      }),
    );
  }

  if (pngIconRisk.length > 0) {
    findings.push(
      createVisualFinding({
        title: "PNG ikon kullanımı riski",
        desc: `${pngIconRisk.length} küçük PNG görsel ikon olarak kullanılıyor olabilir.`,
        level: "low",
        icon: "image",
        solution:
          "İkonlarda mümkünse SVG veya icon font kullanın. Retina ekranlar için yüksek çözünürlüklü varyasyon sağlayın.",
        causes: [
          "Küçük ikonlar PNG formatında eklenmiş olabilir.",
          "Retina ekranlarda ikonlar bulanık görünebilir.",
          "SVG yerine raster ikon kullanımı ölçeklenebilirliği azaltabilir.",
        ],
      }),
    );
  }

  if (pictureWithoutModernSource.length > 0) {
    findings.push(
      createVisualFinding({
        title: "Picture içinde modern format eksik",
        desc: `${pictureWithoutModernSource.length} picture elemanında WebP veya AVIF source bulunamadı.`,
        level: "low",
        icon: "image",
        solution:
          "picture içinde AVIF/WebP source tanımlayın ve fallback olarak JPG/PNG bırakın.",
        causes: [
          "Picture yapısı kullanılmış ama modern format stratejisi tamamlanmamış olabilir.",
          "Tarayıcılar daha küçük modern formatları seçemiyor olabilir.",
          "Fallback görsel her durumda yükleniyor olabilir.",
        ],
      }),
    );
  }

  return findings;
}

function createVisualFinding(
  finding: Omit<VisualFinding, "category" | "affectedPages" | "affectedCount">,
): VisualFinding {
  return {
    ...finding,
    category: "visual",
    affectedPages: [],
    affectedCount: 0,
  };
}

function mergeFindings(pageResults: SinglePageVisualResult[]) {
  const map = new Map<string, VisualFinding>();

  pageResults.forEach((result) => {
    result.findings.forEach((finding) => {
      const key = `${finding.title}-${finding.level}`;

      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          ...finding,
          affectedPages: [result.path],
          affectedCount: 1,
        });
        return;
      }

      if (!existing.affectedPages.includes(result.path)) {
        existing.affectedPages.push(result.path);
        existing.affectedCount = existing.affectedPages.length;
      }

      existing.causes = Array.from(
        new Set([...existing.causes, ...finding.causes]),
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

function matchAttrFromTag(tag: string, attr: string) {
  const regex = new RegExp(`${attr}=["']([^"']*)["']`, "i");
  const match = tag.match(regex);

  if (!match) return null;

  return match[1].trim();
}

function calculateVisualScore(findings: VisualFinding[]) {
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