type ResponsiveFindingLevel = "critical" | "high" | "medium" | "low";

type ResponsiveFinding = {
  title: string;
  desc: string;
  level: ResponsiveFindingLevel;
  icon: string;
  category: "responsive";
  solution: string;
  causes: string[];
  affectedPages: string[];
  affectedCount: number;
};

type ResponsivePageResult = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  check: string;
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
    throw new Error(`Responsive analizi başarısız oldu. HTTP ${response.status}`);
  }

  const html = await response.text();
  const findings = analyzeHtmlResponsive(html);
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
    },
  };
}

function analyzeHtmlResponsive(html: string) {
  const findings: ResponsiveFinding[] = [];

  const hasViewport = Boolean(
    /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html),
  );

  const styleBlocks = html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) ?? [];
  const inlineStyleMatches = html.match(/style=["'][^"']*["']/gi) ?? [];
  const tableMatches = html.match(/<table\b[^>]*>/gi) ?? [];
  const imgMatches = html.match(/<img\b[^>]*>/gi) ?? [];
  const videoMatches = html.match(/<video\b[^>]*>/gi) ?? [];
  const iframeMatches = html.match(/<iframe\b[^>]*>/gi) ?? [];

  const allCssText = [...styleBlocks, ...inlineStyleMatches].join("\n");

  const fixedWidthMatches = allCssText.match(
    /(?:^|[;{\s])width\s*:\s*(?:[5-9]\d{2,}|[1-9]\d{3,})px/gi,
  ) ?? [];

  const minWidthMatches = allCssText.match(
    /(?:^|[;{\s])min-width\s*:\s*(?:[3-9]\d{2,}|[1-9]\d{3,})px/gi,
  ) ?? [];

  const overflowXMatches = allCssText.match(
    /overflow-x\s*:\s*(scroll|auto|hidden)/gi,
  ) ?? [];

  const fixedPositionMatches = allCssText.match(/position\s*:\s*fixed/gi) ?? [];

  const mediaQueryMatches = allCssText.match(/@media\b/gi) ?? [];

  const riskyTables = tableMatches.length;

  const wideMedia = [...imgMatches, ...videoMatches, ...iframeMatches].filter(
    (tag) => {
      const width = matchAttrFromTag(tag, "width");
      const style = matchAttrFromTag(tag, "style");

      const numericWidth = width ? Number(width.replace(/[^\d]/g, "")) : 0;

      if (numericWidth >= 700) return true;

      if (
        style &&
        /width\s*:\s*(?:[7-9]\d{2,}|[1-9]\d{3,})px/i.test(style)
      ) {
        return true;
      }

      return false;
    },
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

  if (fixedWidthMatches.length > 0) {
    findings.push(
      createResponsiveFinding({
        title: "Sabit genişlik kullanımı tespit edildi",
        desc: `${fixedWidthMatches.length} yerde büyük px tabanlı width kullanımı bulundu.`,
        level: "high",
        icon: "layout",
        solution:
          "Sabit px width değerlerini max-width, width: 100%, clamp() veya responsive class yapısına çevirin.",
        causes: [
          "Componentlerde masaüstü tasarım ölçüleri doğrudan px olarak verilmiş olabilir.",
          "Mobil breakpointlerde width değerleri override edilmiyor olabilir.",
          "Kart, tablo veya medya alanları responsive davranmayabilir.",
        ],
      }),
    );
  }

  if (minWidthMatches.length > 0) {
    findings.push(
      createResponsiveFinding({
        title: "Büyük min-width değerleri var",
        desc: `${minWidthMatches.length} yerde mobilde taşma riski oluşturabilecek min-width bulundu.`,
        level: "high",
        icon: "maximize",
        solution:
          "Büyük min-width değerlerini mobil breakpointlerde kaldırın veya max-width: 100% ile sınırlayın.",
        causes: [
          "Desktop layout için verilen min-width mobilde devam ediyor olabilir.",
          "Grid veya card componentleri küçük ekranlarda daralamıyor olabilir.",
          "Yatay scroll riski oluşabilir.",
        ],
      }),
    );
  }

  if (overflowXMatches.length > 0) {
    findings.push(
      createResponsiveFinding({
        title: "overflow-x kullanımı tespit edildi",
        desc: `${overflowXMatches.length} yerde overflow-x kullanımı bulundu. Bu gerçek taşma sorununu gizliyor olabilir.`,
        level: "medium",
        icon: "move-horizontal",
        solution:
          "overflow-x ile gizlemek yerine taşan elemanın gerçek genişlik sebebini düzeltin.",
        causes: [
          "Sayfada yatay taşma oluştuğu için overflow-x: hidden kullanılmış olabilir.",
          "Tablo, slider veya geniş medya alanları mobilde taşabilir.",
          "Kök layout genişliği viewport dışına çıkıyor olabilir.",
        ],
      }),
    );
  }

  if (riskyTables > 0) {
    findings.push(
      createResponsiveFinding({
        title: "Tablo responsive riski",
        desc: `${riskyTables} tablo bulundu. Tablolar mobilde yatay taşma oluşturabilir.`,
        level: "medium",
        icon: "table",
        solution:
          "Tabloları mobilde scroll container içine alın veya kart yapısına dönüştürün.",
        causes: [
          "Tablo kolonları küçük ekranlarda daralamıyor olabilir.",
          "table-layout ve wrapper yapısı responsive ayarlanmamış olabilir.",
          "Mobilde kullanıcı yatay scroll yapmak zorunda kalabilir.",
        ],
      }),
    );
  }

  if (wideMedia.length > 0) {
    findings.push(
      createResponsiveFinding({
        title: "Geniş medya elemanları tespit edildi",
        desc: `${wideMedia.length} medya elemanında mobilde taşma riski oluşturan genişlik bulundu.`,
        level: "medium",
        icon: "image",
        solution:
          "Görsel, video ve iframe elemanlarına max-width: 100%; height: auto; kurallarını uygulayın.",
        causes: [
          "Medya elemanlarına sabit width verilmiş olabilir.",
          "Iframe veya video embedleri responsive wrapper içinde olmayabilir.",
          "Mobil breakpointlerde medya genişliği yeniden hesaplanmıyor olabilir.",
        ],
      }),
    );
  }

  if (fixedPositionMatches.length > 5) {
    findings.push(
      createResponsiveFinding({
        title: "Çok fazla fixed pozisyonlu eleman var",
        desc: `${fixedPositionMatches.length} yerde position: fixed kullanımı bulundu.`,
        level: "low",
        icon: "pin",
        solution:
          "Mobilde fixed elemanların viewportu kapatmadığından ve içerik üzerine binmediğinden emin olun.",
        causes: [
          "Header, floating button, cookie bar veya modal yapıları fixed konumlandırılmış olabilir.",
          "Mobilde fixed elemanlar form alanlarını veya CTA'ları kapatabilir.",
          "Z-index ve yükseklik yönetimi karmaşıklaşabilir.",
        ],
      }),
    );
  }

  if (mediaQueryMatches.length === 0) {
    findings.push(
      createResponsiveFinding({
        title: "Responsive breakpoint izi bulunamadı",
        desc: "Sayfa HTML içindeki stil bloklarında media query tespit edilemedi.",
        level: "low",
        icon: "monitor",
        solution:
          "CSS dosyaları harici yükleniyorsa sorun olmayabilir. Ancak sayfanın mobil breakpointlerini manuel kontrol edin.",
        causes: [
          "Responsive stiller harici CSS dosyalarında olabilir.",
          "Sayfada breakpoint kullanılmıyor olabilir.",
          "Mobil görünüm sadece global framework classlarıyla yönetiliyor olabilir.",
        ],
      }),
    );
  }

  return findings;
}

function createResponsiveFinding(
  finding: Omit<
    ResponsiveFinding,
    "category" | "affectedPages" | "affectedCount"
  >,
): ResponsiveFinding {
  return {
    ...finding,
    category: "responsive",
    affectedPages: [],
    affectedCount: 0,
  };
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