type UxFindingLevel = "critical" | "high" | "medium" | "low";

type UxFinding = {
  title: string;
  desc: string;
  level: UxFindingLevel;
  icon: string;
  category: "ux";
  solution: string;
  causes: string[];
  affectedPages: string[];
  affectedCount: number;
};

type UxPageResult = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  check: string;
};

type UxAnalyzeOptions = {
  selectedPages?: string[];
};

type SinglePageUxResult = {
  url: string;
  path: string;
  score: number;
  findings: UxFinding[];
  page: UxPageResult;
};

export async function analyzeUx(url: string, options: UxAnalyzeOptions = {}) {
  const baseUrl = normalizeUrl(url);
  const targetUrls = buildTargetUrls(baseUrl, options.selectedPages);

  const pageResults = await Promise.all(
    targetUrls.map((targetUrl, index) => analyzeUxPage(targetUrl, index)),
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

async function analyzeUxPage(
  url: string,
  index: number,
): Promise<SinglePageUxResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PrecheckAI/1.0; +https://precheck.ai)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`UX analizi başarısız oldu. HTTP ${response.status}`);
  }

  const html = await response.text();
  const findings = analyzeHtmlUx(html);
  const score = calculateUxScore(findings);
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

function analyzeHtmlUx(html: string) {
  const findings: UxFinding[] = [];

  const hasViewport = Boolean(
    /<meta[^>]+name=["']viewport["'][^>]*>/i.test(html),
  );

  const linkMatches = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ?? [];
  const buttonMatches = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];
  const inputMatches = html.match(/<input\b[^>]*>/gi) ?? [];
  const labelMatches = html.match(/<label\b[^>]*>/gi) ?? [];
  const paragraphMatches = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) ?? [];
  const navMatches = html.match(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi) ?? [];

  const emptyLinks = linkMatches.filter((link) => {
    const ariaLabel = matchAttrFromTag(link, "aria-label");
    const title = matchAttrFromTag(link, "title");
    const text = stripHtml(link).trim();

    return !ariaLabel && !title && !text;
  });

  const inputsWithoutAutocomplete = inputMatches.filter((input) => {
    const type = matchAttrFromTag(input, "type")?.toLowerCase() ?? "text";

    if (
      type === "hidden" ||
      type === "submit" ||
      type === "button" ||
      type === "checkbox" ||
      type === "radio" ||
      type === "file"
    ) {
      return false;
    }

    return !matchAttrFromTag(input, "autocomplete");
  });

  const placeholderWithoutLabel = inputMatches.filter((input) => {
    const placeholder = matchAttrFromTag(input, "placeholder");
    if (!placeholder) return false;

    const id = matchAttrFromTag(input, "id");
    const ariaLabel = matchAttrFromTag(input, "aria-label");
    const ariaLabelledBy = matchAttrFromTag(input, "aria-labelledby");

    if (ariaLabel || ariaLabelledBy) return false;
    if (!id) return true;

    return !new RegExp(`<label[^>]+for=["']${escapeRegExp(id)}["']`, "i").test(
      html,
    );
  });

  const longParagraphs = paragraphMatches.filter((paragraph) => {
    const text = stripHtml(paragraph).trim();

    return text.length > 450;
  });

  const navLinkCount = navMatches.reduce((total, nav) => {
    const links = nav.match(/<a\b[^>]*>/gi) ?? [];

    return total + links.length;
  }, 0);

  const ctaCandidates = [...linkMatches, ...buttonMatches].filter((item) => {
    const text = normalizeText(stripHtml(item));

    return (
      text.includes("iletisim") ||
      text.includes("teklif") ||
      text.includes("basvur") ||
      text.includes("satın al") ||
      text.includes("satin al") ||
      text.includes("demo") ||
      text.includes("randevu") ||
      text.includes("contact") ||
      text.includes("get started") ||
      text.includes("start") ||
      text.includes("buy") ||
      text.includes("request")
    );
  });

  if (!hasViewport) {
    findings.push(
      createUxFinding({
        title: "Viewport meta etiketi eksik",
        desc: "Mobil cihazlarda doğru ölçekleme için viewport meta etiketi bulunamadı.",
        level: "high",
        icon: "mobile",
        solution:
          '<meta name="viewport" content="width=device-width, initial-scale=1"> etiketi ekleyin.',
        causes: [
          "Layout veya document dosyasında viewport meta etiketi tanımlanmamış olabilir.",
          "Mobil uyumluluk için temel head ayarı eksik kalmış olabilir.",
        ],
      }),
    );
  }

  if (emptyLinks.length > 0) {
    findings.push(
      createUxFinding({
        title: "Boş veya açıklamasız linkler",
        desc: `${emptyLinks.length} linkte okunabilir metin, title veya aria-label bulunamadı.`,
        level: "medium",
        icon: "link",
        solution:
          "Linklerin amacını anlatan metin ekleyin. İkon linklerde aria-label kullanın.",
        causes: [
          "Link sadece ikon veya görselden oluşuyor olabilir.",
          "Görsel linklerde alt metin eksik olabilir.",
          "Etkileşimli alanın amacı kullanıcıya açıklanmamış olabilir.",
        ],
      }),
    );
  }

  if (inputsWithoutAutocomplete.length > 0) {
    findings.push(
      createUxFinding({
        title: "Formlarda autocomplete eksik",
        desc: `${inputsWithoutAutocomplete.length} form alanında autocomplete attribute bulunamadı.`,
        level: "low",
        icon: "form-input",
        solution:
          "Ad, e-posta, telefon gibi alanlarda uygun autocomplete değerleri kullanın.",
        causes: [
          "Form component’i autocomplete değerini desteklemiyor olabilir.",
          "Input alanları kullanıcı deneyimi açısından optimize edilmemiş olabilir.",
          "Tarayıcı otomatik doldurma deneyimi devre dışı kalmış olabilir.",
        ],
      }),
    );
  }

  if (placeholderWithoutLabel.length > 0) {
    findings.push(
      createUxFinding({
        title: "Placeholder label yerine kullanılmış",
        desc: `${placeholderWithoutLabel.length} form alanında placeholder var ancak label veya aria-label bulunamadı.`,
        level: "medium",
        icon: "input",
        solution:
          "Placeholder yerine kalıcı label kullanın. Gerekirse aria-label ekleyin.",
        causes: [
          "Form tasarımında label alanları görsel olarak kaldırılmış olabilir.",
          "Placeholder metni label gibi kullanılmış olabilir.",
          "Input id ve label for eşleşmesi eksik olabilir.",
        ],
      }),
    );
  }

  if (longParagraphs.length > 0) {
    findings.push(
      createUxFinding({
        title: "Çok uzun paragraflar",
        desc: `${longParagraphs.length} paragraf 450 karakterden uzun. Bu durum okunabilirliği azaltabilir.`,
        level: "low",
        icon: "text",
        solution:
          "Uzun paragrafları daha kısa bloklara bölün, ara başlık ve liste yapıları kullanın.",
        causes: [
          "İçerik editöründe uzun metinler tek paragraf olarak girilmiş olabilir.",
          "Sayfa içerikleri okunabilirlik için bölümlendirilmemiş olabilir.",
          "Mobilde metin taranabilirliği zayıflayabilir.",
        ],
      }),
    );
  }

  if (navLinkCount > 18) {
    findings.push(
      createUxFinding({
        title: "Navigasyonda fazla link var",
        desc: `Navigasyon alanlarında toplam ${navLinkCount} link tespit edildi.`,
        level: "low",
        icon: "menu",
        solution:
          "Menüyü önceliklendirin, ikincil linkleri alt menü veya footer alanına taşıyın.",
        causes: [
          "Ana navigasyonda çok fazla sayfa doğrudan gösteriliyor olabilir.",
          "Mega menü yapısı kullanıcıya fazla seçenek sunuyor olabilir.",
          "Mobil menüde karar verme yükü artabilir.",
        ],
      }),
    );
  }

  if (ctaCandidates.length === 0) {
    findings.push(
      createUxFinding({
        title: "Belirgin CTA bulunamadı",
        desc: "Sayfada kullanıcıyı yönlendiren belirgin bir aksiyon butonu/linki tespit edilemedi.",
        level: "medium",
        icon: "target",
        solution:
          "Sayfanın amacına uygun iletişim, teklif al, başvur veya demo iste gibi net bir CTA ekleyin.",
        causes: [
          "Sayfa kullanıcıyı sonraki adıma yönlendirmiyor olabilir.",
          "CTA metinleri yeterince açıklayıcı olmayabilir.",
          "Aksiyon linkleri görsel olarak buton gibi ayrışmıyor olabilir.",
        ],
      }),
    );
  }

  return findings;
}

function createUxFinding(
  finding: Omit<UxFinding, "category" | "affectedPages" | "affectedCount">,
): UxFinding {
  return {
    ...finding,
    category: "ux",
    affectedPages: [],
    affectedCount: 0,
  };
}

function mergeFindings(pageResults: SinglePageUxResult[]) {
  const map = new Map<string, UxFinding>();

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

function calculateUxScore(findings: UxFinding[]) {
  let score = 100;

  findings.forEach((finding) => {
    if (finding.level === "critical") score -= 18;
    if (finding.level === "high") score -= 12;
    if (finding.level === "medium") score -= 7;
    if (finding.level === "low") score -= 3;
  });

  return Math.max(0, Math.min(100, score));
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