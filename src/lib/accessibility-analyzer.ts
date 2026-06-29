type AccessibilityFindingLevel = "critical" | "high" | "medium" | "low";

type AccessibilityFinding = {
  title: string;
  desc: string;
  level: AccessibilityFindingLevel;
  icon: string;
  category: "accessibility";
  solution: string;
  causes: string[];
  affectedPages: string[];
  affectedCount: number;
};

type AccessibilityPageResult = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  check: string;
};

type AccessibilityAnalyzeOptions = {
  selectedPages?: string[];
};

type SinglePageAccessibilityResult = {
  url: string;
  path: string;
  score: number;
  findings: AccessibilityFinding[];
  page: AccessibilityPageResult;
};

export async function analyzeAccessibility(
  url: string,
  options: AccessibilityAnalyzeOptions = {},
) {
  const baseUrl = normalizeUrl(url);
  const targetUrls = buildTargetUrls(baseUrl, options.selectedPages);

  const pageResults = await Promise.all(
    targetUrls.map((targetUrl, index) =>
      analyzeAccessibilityPage(targetUrl, index),
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

async function analyzeAccessibilityPage(
  url: string,
  index: number,
): Promise<SinglePageAccessibilityResult> {
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
      `Accessibility analizi başarısız oldu. HTTP ${response.status}`,
    );
  }

  const html = await response.text();
  const findings = analyzeHtmlAccessibility(html);
  const score = calculateAccessibilityScore(findings);
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

function analyzeHtmlAccessibility(html: string) {
  const findings: AccessibilityFinding[] = [];

  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? "";
  const hasLang = /\slang=["'][^"']+["']/i.test(htmlTag);

  const imgMatches = html.match(/<img\b[^>]*>/gi) ?? [];
  const buttonMatches = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];
  const inputMatches = html.match(/<input\b[^>]*>/gi) ?? [];
  const labelMatches = html.match(/<label\b[^>]*>/gi) ?? [];
  const linkMatches = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ?? [];
  const headingMatches = html.match(/<h[1-6]\b[^>]*>/gi) ?? [];

  const imagesWithoutAlt = imgMatches.filter((img) => {
    const alt = matchAttrFromTag(img, "alt");
    return alt === null;
  });

  const buttonsWithoutName = buttonMatches.filter((button) => {
    const ariaLabel = matchAttrFromTag(button, "aria-label");
    const title = matchAttrFromTag(button, "title");
    const text = stripHtml(button).trim();

    return !ariaLabel && !title && !text;
  });

  const inputsWithoutLabel = inputMatches.filter((input) => {
    const type = matchAttrFromTag(input, "type")?.toLowerCase();

    if (type === "hidden" || type === "submit" || type === "button") {
      return false;
    }

    const id = matchAttrFromTag(input, "id");
    const ariaLabel = matchAttrFromTag(input, "aria-label");
    const ariaLabelledBy = matchAttrFromTag(input, "aria-labelledby");

    if (ariaLabel || ariaLabelledBy) return false;
    if (!id) return true;

    return !new RegExp(`<label[^>]+for=["']${escapeRegExp(id)}["']`, "i").test(
      html,
    );
  });

  const emptyLinks = linkMatches.filter((link) => {
    const ariaLabel = matchAttrFromTag(link, "aria-label");
    const title = matchAttrFromTag(link, "title");
    const text = stripHtml(link).trim();

    return !ariaLabel && !title && !text;
  });

  const headingLevels = headingMatches
    .map((heading) => {
      const match = heading.match(/<h([1-6])\b/i);
      return match ? Number(match[1]) : null;
    })
    .filter((level): level is number => level !== null);

  const hasHeadingOrderIssue = headingLevels.some((level, index) => {
    if (index === 0) return false;

    const previous = headingLevels[index - 1];

    return level - previous > 1;
  });

  if (!hasLang) {
    findings.push(
      createAccessibilityFinding({
        title: "HTML lang attribute eksik",
        desc: "Sayfanın ana dilini belirten lang attribute bulunamadı.",
        level: "medium",
        icon: "globe",
        solution:
          '<html lang="tr"> gibi doğru dil kodu ile lang attribute ekleyin.',
        causes: [
          "Layout veya document yapısında html lang değeri tanımlanmamış olabilir.",
          "Çok dilli yapı varsa aktif dil html etiketine basılmıyor olabilir.",
        ],
      }),
    );
  }

  if (imagesWithoutAlt.length > 0) {
    findings.push(
      createAccessibilityFinding({
        title: "Alt metni eksik görseller",
        desc: `${imagesWithoutAlt.length} görselde alt attribute bulunamadı.`,
        level: "high",
        icon: "image",
        solution:
          "Anlam taşıyan tüm görsellere açıklayıcı alt metin ekleyin. Dekoratif görsellerde alt değerini boş bırakın.",
        causes: [
          "Görsel component’i alt değerini zorunlu tutmuyor olabilir.",
          "CMS tarafında görsel açıklaması boş bırakılmış olabilir.",
          "Dekoratif olmayan görseller erişilebilir açıklama olmadan eklenmiş olabilir.",
        ],
      }),
    );
  }

  if (buttonsWithoutName.length > 0) {
    findings.push(
      createAccessibilityFinding({
        title: "Erişilebilir adı olmayan butonlar",
        desc: `${buttonsWithoutName.length} butonda görünen metin, aria-label veya title bulunamadı.`,
        level: "high",
        icon: "mouse-pointer",
        solution:
          "İkon butonlara aria-label ekleyin veya buton içinde açıklayıcı metin kullanın.",
        causes: [
          "İkon butonlar yalnızca SVG veya icon font ile oluşturulmuş olabilir.",
          "Buton component’i aria-label değerini zorunlu tutmuyor olabilir.",
          "Ekran okuyucular için açıklayıcı metin eklenmemiş olabilir.",
        ],
      }),
    );
  }

  if (inputsWithoutLabel.length > 0) {
    findings.push(
      createAccessibilityFinding({
        title: "Label eksik form alanları",
        desc: `${inputsWithoutLabel.length} form alanında label veya aria-label bulunamadı.`,
        level: "high",
        icon: "form-input",
        solution:
          "Her input için görünür label, aria-label veya aria-labelledby kullanın.",
        causes: [
          "Form alanları placeholder ile açıklanmış ama label eklenmemiş olabilir.",
          "Input id değeri ile label for değeri eşleşmiyor olabilir.",
          "Form component’i erişilebilir label üretmiyor olabilir.",
        ],
      }),
    );
  }

  if (emptyLinks.length > 0) {
    findings.push(
      createAccessibilityFinding({
        title: "Açıklayıcı metni olmayan linkler",
        desc: `${emptyLinks.length} linkte okunabilir metin veya aria-label bulunamadı.`,
        level: "medium",
        icon: "link",
        solution:
          "Linklerin içine açıklayıcı metin ekleyin veya ikon linklerde aria-label kullanın.",
        causes: [
          "Link yalnızca ikon veya görselden oluşuyor olabilir.",
          "Ekran okuyucu için link amacı belirtilmemiş olabilir.",
          "Görsel linklerde alt metin veya aria-label eksik olabilir.",
        ],
      }),
    );
  }

  if (hasHeadingOrderIssue) {
    findings.push(
      createAccessibilityFinding({
        title: "Başlık sırası atlanmış",
        desc: "Sayfada heading hiyerarşisinde seviye atlama tespit edildi.",
        level: "medium",
        icon: "heading",
        solution:
          "Başlıkları H1 > H2 > H3 sırasına göre düzenleyin. H2 olmadan H3/H4 kullanmayın.",
        causes: [
          "Component başlıkları görsel boyuta göre seçilmiş olabilir.",
          "İçerik editöründe heading seviyeleri yanlış kullanılmış olabilir.",
          "Sayfa içinde semantik başlık sırası korunmamış olabilir.",
        ],
      }),
    );
  }

  return findings;
}

function createAccessibilityFinding(
  finding: Omit<
    AccessibilityFinding,
    "category" | "affectedPages" | "affectedCount"
  >,
): AccessibilityFinding {
  return {
    ...finding,
    category: "accessibility",
    affectedPages: [],
    affectedCount: 0,
  };
}

function mergeFindings(pageResults: SinglePageAccessibilityResult[]) {
  const map = new Map<string, AccessibilityFinding>();

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

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function calculateAccessibilityScore(findings: AccessibilityFinding[]) {
  let score = 100;

  findings.forEach((finding) => {
    if (finding.level === "critical") score -= 18;
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