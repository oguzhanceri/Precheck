type SeoFindingLevel = "critical" | "high" | "medium" | "low";

type SeoFinding = {
  title: string;
  desc: string;
  level: SeoFindingLevel;
  icon: string;
  category: "seo";
  solution: string;
};

type SeoSuggestion = {
  title: string;
  desc: string;
  impact: "Yüksek" | "Orta" | "Düşük";
  actions: string[];
  category: "seo";
};

type SeoPageResult = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  check: string;
};

type SeoAnalyzeOptions = {
  selectedPages?: string[];
};

type SinglePageSeoResult = {
  url: string;
  path: string;
  score: number;
  findings: SeoFinding[];
  page: SeoPageResult;
};

export async function analyzeSeo(url: string, options: SeoAnalyzeOptions = {}) {
  const baseUrl = normalizeUrl(url);
  const targetUrls = buildTargetUrls(baseUrl, options.selectedPages);

  const globalChecks = await runGlobalSeoChecks(baseUrl);
  const pageResults = await Promise.all(
    targetUrls.map((targetUrl, index) =>
      analyzeSeoPage(targetUrl, globalChecks, index),
    ),
  );

  const findings = mergeFindings(pageResults);
  const pages = pageResults.map((result) => result.page);

  const score = pages.length
    ? Math.round(
        pages.reduce((total, page) => total + page.score, 0) / pages.length,
      )
    : 0;

  const suggestions = buildSeoSuggestions(findings);

  return {
    score,
    findings,
    suggestions,
    pages,
  };
}

async function analyzeSeoPage(
  url: string,
  globalChecks: {
    robotsTxt: boolean;
    sitemapXml: boolean;
  },
  index: number,
): Promise<SinglePageSeoResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PrecheckAI/1.0; +https://precheck.ai)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`SEO analizi başarısız oldu. HTTP ${response.status}`);
  }

  const html = await response.text();

  const findings = analyzeHtml(html, globalChecks);
  const score = calculateSeoScore(findings);
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

function analyzeHtml(
  html: string,
  globalChecks: {
    robotsTxt: boolean;
    sitemapXml: boolean;
  },
) {
  const title = matchContent(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const metaDescription = getMetaContent(html, "description");

  const canonical = matchAttr(
    html,
    /<link[^>]+rel=["'][^"']*canonical[^"']*["'][^>]*>/i,
    "href",
  );

  const h1Matches = html.match(/<h1\b[^>]*>/gi) ?? [];
  const imgMatches = html.match(/<img\b[^>]*>/gi) ?? [];

  const imagesWithoutAlt = imgMatches.filter((img) => {
    const alt = matchAttrFromTag(img, "alt");

    return alt === null;
  });

  const hasViewport = Boolean(
    /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html),
  );

  const hasOpenGraph = Boolean(/<meta[^>]+property=["']og:/i.test(html));
  const hasTwitterCard = Boolean(/<meta[^>]+name=["']twitter:/i.test(html));

  const findings: SeoFinding[] = [];

  if (!title) {
    findings.push({
      title: "Title etiketi eksik",
      desc: "Sayfada <title> etiketi bulunamadı.",
      level: "critical",
      icon: "warning",
      category: "seo",
      solution:
        "Her sayfaya benzersiz, açıklayıcı ve 50-60 karakter aralığında title etiketi ekleyin.",
    });
  } else if (title.length < 20 || title.length > 65) {
    findings.push({
      title: "Title uzunluğu ideal değil",
      desc: `Title uzunluğu ${title.length} karakter. İdeal aralık genellikle 50-60 karakterdir.`,
      level: "medium",
      icon: "timer",
      category: "seo",
      solution:
        "Title metnini sayfanın ana konusunu anlatacak şekilde 50-60 karakter civarında düzenleyin.",
    });
  }

  if (!metaDescription) {
    findings.push({
      title: "Meta description eksik",
      desc: "Sayfada meta description etiketi bulunamadı.",
      level: "high",
      icon: "warning",
      category: "seo",
      solution:
        "Sayfaya özgün, 140-160 karakter aralığında meta description ekleyin.",
    });
  } else if (metaDescription.length < 70 || metaDescription.length > 170) {
    findings.push({
      title: "Meta description uzunluğu ideal değil",
      desc: `Meta description uzunluğu ${metaDescription.length} karakter.`,
      level: "medium",
      icon: "timer",
      category: "seo",
      solution:
        "Meta description metnini sayfayı özetleyen 140-160 karakterlik özgün bir açıklama haline getirin.",
    });
  }

  if (h1Matches.length === 0) {
    findings.push({
      title: "H1 etiketi eksik",
      desc: "Sayfada ana başlık için H1 etiketi bulunamadı.",
      level: "high",
      icon: "warning",
      category: "seo",
      solution: "Sayfanın ana konusunu anlatan tek bir H1 etiketi ekleyin.",
    });
  }

  if (h1Matches.length > 1) {
    findings.push({
      title: "Birden fazla H1 kullanılmış",
      desc: `Sayfada ${h1Matches.length} adet H1 etiketi bulundu.`,
      level: "medium",
      icon: "timer",
      category: "seo",
      solution:
        "Ana konu için tek H1 kullanın. Diğer başlıkları H2/H3 hiyerarşisine taşıyın.",
    });
  }

  if (!canonical) {
    findings.push({
      title: "Canonical etiketi eksik",
      desc: "Sayfada canonical link etiketi bulunamadı.",
      level: "medium",
      icon: "link",
      category: "seo",
      solution:
        "Kopya içerik riskini azaltmak için sayfanın doğru canonical URL’ini ekleyin.",
    });
  }

  if (imagesWithoutAlt.length > 0) {
    findings.push({
      title: "Alt etiketi eksik görseller",
      desc: `${imagesWithoutAlt.length} görselde alt attribute bulunamadı.`,
      level: "medium",
      icon: "image",
      category: "seo",
      solution:
        "Anlam taşıyan görsellere açıklayıcı alt metin ekleyin. Dekoratif görsellerde alt değeri boş bırakılabilir.",
    });
  }

  if (!globalChecks.robotsTxt) {
    findings.push({
      title: "robots.txt bulunamadı",
      desc: "Site kök dizininde robots.txt dosyası tespit edilemedi.",
      level: "low",
      icon: "file",
      category: "seo",
      solution:
        "Arama motoru botları için robots.txt dosyası oluşturun ve sitemap yolunu belirtin.",
    });
  }

  if (!globalChecks.sitemapXml) {
    findings.push({
      title: "sitemap.xml bulunamadı",
      desc: "Site kök dizininde sitemap.xml dosyası tespit edilemedi.",
      level: "medium",
      icon: "file",
      category: "seo",
      solution:
        "Arama motorlarının sayfaları daha kolay keşfetmesi için sitemap.xml oluşturun.",
    });
  }

  if (!hasViewport) {
    findings.push({
      title: "Viewport meta etiketi eksik",
      desc: "Mobil uyum için viewport meta etiketi bulunamadı.",
      level: "medium",
      icon: "mobile",
      category: "seo",
      solution:
        '<meta name="viewport" content="width=device-width, initial-scale=1"> etiketi ekleyin.',
    });
  }

  if (!hasOpenGraph) {
    findings.push({
      title: "OpenGraph etiketleri eksik",
      desc: "Sosyal medya paylaşım önizlemeleri için og:* etiketleri bulunamadı.",
      level: "low",
      icon: "share",
      category: "seo",
      solution: "og:title, og:description ve og:image etiketlerini ekleyin.",
    });
  }

  if (!hasTwitterCard) {
    findings.push({
      title: "Twitter Card etiketleri eksik",
      desc: "Twitter/X paylaşım önizlemeleri için twitter:* etiketleri bulunamadı.",
      level: "low",
      icon: "share",
      category: "seo",
      solution:
        "twitter:card, twitter:title, twitter:description ve twitter:image etiketlerini ekleyin.",
    });
  }

  return findings;
}

function buildTargetUrls(baseUrl: string, selectedPages?: string[]) {
  const pages = selectedPages?.length ? selectedPages : ["/"];

  const uniqueUrls = Array.from(
    new Set(
      pages.map((page) => {
        if (page === "home") return baseUrl;
        if (page === "/home") return baseUrl;
        if (page === "/") return baseUrl;

        try {
          if (/^https?:\/\//i.test(page)) {
            return normalizeUrl(page);
          }
        } catch {
          return baseUrl;
        }

        const normalizedPath = page.startsWith("/") ? page : `/${page}`;

        return `${new URL(baseUrl).origin}${normalizedPath}`;
      }),
    ),
  );

  return uniqueUrls;
}

async function runGlobalSeoChecks(baseUrl: string) {
  const [robotsTxt, sitemapXml] = await Promise.all([
    checkPublicFile(baseUrl, "/robots.txt"),
    checkPublicFile(baseUrl, "/sitemap.xml"),
  ]);

  return {
    robotsTxt,
    sitemapXml,
  };
}

function mergeFindings(pageResults: SinglePageSeoResult[]) {
  const map = new Map<string, SeoFinding>();

  pageResults.forEach((result) => {
    result.findings.forEach((finding) => {
      const key = `${finding.title}-${finding.level}`;

      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          ...finding,
          desc:
            pageResults.length > 1
              ? `${result.path}: ${finding.desc}`
              : finding.desc,
        });
        return;
      }

      if (pageResults.length > 1 && !existing.desc.includes(result.path)) {
        existing.desc = `${existing.desc} | ${result.path}: ${finding.desc}`;
      }
    });
  });

  return Array.from(map.values());
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

  if (!path || path === "/") return "/home";

  return path;
}

function matchContent(html: string, regex: RegExp) {
  const match = html.match(regex);

  if (!match?.[1]) return null;

  return stripHtml(match[1]).trim();
}

function getMetaContent(html: string, name: string) {
  const regex = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]*>|<meta[^>]+content=["'][^"']*["'][^>]+name=["']${name}["'][^>]*>`,
    "i",
  );

  const tag = html.match(regex)?.[0];

  if (!tag) return null;

  return matchAttrFromTag(tag, "content");
}

function matchAttr(html: string, tagRegex: RegExp, attr: string) {
  const tag = html.match(tagRegex)?.[0];

  if (!tag) return null;

  return matchAttrFromTag(tag, attr);
}

function matchAttrFromTag(tag: string, attr: string) {
  const regex = new RegExp(`${attr}=["']([^"']*)["']`, "i");
  const match = tag.match(regex);

  if (!match) return null;

  return match[1].trim();
}

async function checkPublicFile(baseUrl: string, path: string) {
  try {
    const origin = new URL(baseUrl).origin;
    const response = await fetch(`${origin}${path}`, {
      method: "GET",
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ");
}

function calculateSeoScore(findings: SeoFinding[]) {
  let score = 100;

  findings.forEach((finding) => {
    if (finding.level === "critical") score -= 18;
    if (finding.level === "high") score -= 12;
    if (finding.level === "medium") score -= 7;
    if (finding.level === "low") score -= 3;
  });

  return Math.max(0, Math.min(100, score));
}

function buildSeoSuggestions(findings: SeoFinding[]): SeoSuggestion[] {
  const suggestions: SeoSuggestion[] = [];

  const hasTitleOrMeta = findings.some((finding) => {
    const value = normalizeText(finding.title);

    return (
      value.includes("title") ||
      value.includes("meta description") ||
      value.includes("meta aciklama")
    );
  });

  const hasHeading = findings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("h1") || value.includes("h2") || value.includes("h3");
  });

  const hasImageAlt = findings.some((finding) => {
    const value = normalizeText(finding.title);

    return (
      value.includes("alt etiketi") ||
      value.includes("alt attribute") ||
      value.includes("gorsel")
    );
  });

  const hasCanonicalOrSitemap = findings.some((finding) => {
    const value = normalizeText(finding.title);

    return (
      value.includes("canonical") ||
      value.includes("sitemap") ||
      value.includes("robots")
    );
  });

  const hasSocialTags = findings.some((finding) => {
    const value = normalizeText(finding.title);

    return value.includes("opengraph") || value.includes("twitter card");
  });

  if (hasTitleOrMeta) {
    suggestions.push({
      title: "Title ve meta description alanlarını düzeltin",
      desc: "Arama sonuçlarında daha iyi görünmek için title ve meta description değerlerini sayfa bazlı optimize edin.",
      impact: "Yüksek",
      category: "seo",
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
      category: "seo",
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
      category: "seo",
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
      category: "seo",
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
      category: "seo",
      actions: [
        "og:title, og:description ve og:image ekleyin.",
        "twitter:card ve ilgili Twitter/X meta etiketlerini ekleyin.",
      ],
    });
  }

  if (!suggestions.length) {
    suggestions.push({
      title: "SEO temelleri sağlıklı görünüyor",
      desc: "Bu sayfada temel SEO kontrollerinde kritik bir sorun tespit edilmedi.",
      impact: "Düşük",
      category: "seo",
      actions: [
        "İçerik kalitesini ve anahtar kelime hedeflemesini geliştirmeye devam edin.",
        "Yeni içerikler sonrası tekrar analiz çalıştırın.",
      ],
    });
  }

  return suggestions;
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

function buildTimeLabel(index: number) {
  const baseHour = 14;
  const baseMinute = 30 + index;

  return `Bugün ${String(baseHour).padStart(2, "0")}:${String(
    baseMinute,
  ).padStart(2, "0")}`;
}