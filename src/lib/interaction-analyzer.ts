type InteractionFindingLevel = "critical" | "high" | "medium" | "low";

type InteractionFinding = {
  title: string;
  desc: string;
  level: InteractionFindingLevel;
  icon: string;
  category: "interaction";
  solution: string;
  causes: string[];
  affectedPages: string[];
  affectedCount: number;
};

type InteractionPageResult = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  check: string;
};

type InteractionAnalyzeOptions = {
  selectedPages?: string[];
};

type SinglePageInteractionResult = {
  url: string;
  path: string;
  score: number;
  findings: InteractionFinding[];
  page: InteractionPageResult;
};

export async function analyzeInteraction(
  url: string,
  options: InteractionAnalyzeOptions = {},
) {
  const baseUrl = normalizeUrl(url);
  const targetUrls = buildTargetUrls(baseUrl, options.selectedPages);

  const pageResults = await Promise.all(
    targetUrls.map((targetUrl, index) =>
      analyzeInteractionPage(targetUrl, index),
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

async function analyzeInteractionPage(
  url: string,
  index: number,
): Promise<SinglePageInteractionResult> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PrecheckAI/1.0; +https://precheck.ai)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Interaction analizi başarısız oldu. HTTP ${response.status}`);
  }

  const html = await response.text();
  const findings = analyzeHtmlInteraction(html);
  const score = calculateInteractionScore(findings);
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

function analyzeHtmlInteraction(html: string) {
  const findings: InteractionFinding[] = [];

  const buttonMatches = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];
  const linkMatches = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ?? [];
  const clickableDivs = html.match(/<(div|span|li|section|article)\b[^>]*onclick=["'][^"']*["'][^>]*>/gi) ?? [];
  const onclickMatches = html.match(/onclick=["'][^"']*["']/gi) ?? [];
  const tabindexMatches = html.match(/tabindex=["']([^"']+)["']/gi) ?? [];
  const roleButtonMatches = html.match(/<[^>]+role=["']button["'][^>]*>/gi) ?? [];
  const ariaExpandedTriggers = html.match(/<[^>]+aria-expanded=["'][^"']*["'][^>]*>/gi) ?? [];
  const dropdownCandidates = html.match(/<[^>]+(dropdown|menu|accordion|collapse)[^>]*>/gi) ?? [];
  const modalCandidates = html.match(/<[^>]+(modal|dialog)[^>]*>/gi) ?? [];
  const idMatches = html.match(/\sid=["']([^"']+)["']/gi) ?? [];
  const disabledButtons = buttonMatches.filter((button) =>
    /\sdisabled(?:=["'][^"']*["'])?/i.test(button),
  );

  const emptyButtons = buttonMatches.filter((button) => {
    const ariaLabel = matchAttrFromTag(button, "aria-label");
    const title = matchAttrFromTag(button, "title");
    const text = stripHtml(button).trim();

    return !ariaLabel && !title && !text;
  });

  const emptyLinks = linkMatches.filter((link) => {
    const ariaLabel = matchAttrFromTag(link, "aria-label");
    const title = matchAttrFromTag(link, "title");
    const text = stripHtml(link).trim();

    return !ariaLabel && !title && !text;
  });

  const unsafeHrefLinks = linkMatches.filter((link) => {
    const href = matchAttrFromTag(link, "href");

    return href === "#" || href === "javascript:void(0)" || href === "javascript:;";
  });

  const positiveTabindex = tabindexMatches.filter((item) => {
    const match = item.match(/tabindex=["']([^"']+)["']/i);
    const value = match?.[1] ? Number(match[1]) : 0;

    return value > 0;
  });

  const roleButtonWithoutKeyboard = roleButtonMatches.filter((tag) => {
    const hasTabindex = /tabindex=["'][^"']+["']/i.test(tag);
    const hasKeyboardHandler = /onkeydown|onkeyup|onkeypress/i.test(tag);

    return !hasTabindex || !hasKeyboardHandler;
  });

  const clickableWithoutKeyboard = clickableDivs.filter((tag) => {
    const hasTabindex = /tabindex=["'][^"']+["']/i.test(tag);
    const hasKeyboardHandler = /onkeydown|onkeyup|onkeypress/i.test(tag);
    const hasRoleButton = /role=["']button["']/i.test(tag);

    return !hasTabindex || !hasKeyboardHandler || !hasRoleButton;
  });

  const ids = idMatches
    .map((item) => {
      const match = item.match(/\sid=["']([^"']+)["']/i);
      return match?.[1] ?? "";
    })
    .filter(Boolean);

  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const uniqueDuplicateIds = Array.from(new Set(duplicateIds));

  const hasSkipLink = /<a\b[^>]+href=["']#(?:main|content|ana-icerik|icerik)["'][^>]*>/i.test(
    html,
  );

  const modalWithoutDialogRole = modalCandidates.filter((tag) => {
    const hasRoleDialog = /role=["']dialog["']|role=["']alertdialog["']/i.test(tag);
    const hasAriaModal = /aria-modal=["']true["']/i.test(tag);

    return !hasRoleDialog || !hasAriaModal;
  });

  const dropdownWithoutAriaExpanded =
    dropdownCandidates.length > 0 && ariaExpandedTriggers.length === 0;

  if (emptyButtons.length > 0) {
    findings.push(
      createInteractionFinding({
        title: "Açıklamasız butonlar",
        desc: `${emptyButtons.length} butonda görünen metin, aria-label veya title bulunamadı.`,
        level: "high",
        icon: "mouse-pointer",
        solution:
          "İkon veya boş görünen butonlara aria-label ekleyin ya da buton içinde açıklayıcı metin kullanın.",
        causes: [
          "Buton sadece ikon ile oluşturulmuş olabilir.",
          "Ekran okuyucular için buton amacı belirtilmemiş olabilir.",
          "Buton component’i aria-label değerini zorunlu tutmuyor olabilir.",
        ],
      }),
    );
  }

  if (emptyLinks.length > 0) {
    findings.push(
      createInteractionFinding({
        title: "Açıklamasız linkler",
        desc: `${emptyLinks.length} linkte okunabilir metin, aria-label veya title bulunamadı.`,
        level: "medium",
        icon: "link",
        solution:
          "Linklerin amacını belirten metin ekleyin. İkon linklerde aria-label kullanın.",
        causes: [
          "Link yalnızca ikon veya görselden oluşuyor olabilir.",
          "Görsel linklerde alt metin bulunmuyor olabilir.",
          "Kullanıcı linkin ne işe yaradığını anlamakta zorlanabilir.",
        ],
      }),
    );
  }

  if (unsafeHrefLinks.length > 0) {
    findings.push(
      createInteractionFinding({
        title: "Geçersiz href kullanan linkler",
        desc: `${unsafeHrefLinks.length} linkte # veya javascript tabanlı geçersiz href kullanımı bulundu.`,
        level: "medium",
        icon: "link",
        solution:
          "Gerçek navigasyon için doğru href kullanın. Buton davranışı için <button> elementi tercih edin.",
        causes: [
          "Buton gibi davranan linkler yanlış elementle yazılmış olabilir.",
          "Boş href geçici olarak bırakılmış olabilir.",
          "Klavye ve ekran okuyucu davranışı beklenenden farklı olabilir.",
        ],
      }),
    );
  }

  if (clickableWithoutKeyboard.length > 0) {
    findings.push(
      createInteractionFinding({
        title: "Klavye erişimi olmayan tıklanabilir elemanlar",
        desc: `${clickableWithoutKeyboard.length} tıklanabilir div/span/li elemanında keyboard erişimi eksik olabilir.`,
        level: "high",
        icon: "keyboard",
        solution:
          "Tıklanabilir div/span yerine button kullanın. Gerekirse role, tabindex ve keyboard event ekleyin.",
        causes: [
          "Etkileşimli alan semantik olmayan HTML elementiyle yazılmış olabilir.",
          "Klavye kullanıcıları bu aksiyona erişemeyebilir.",
          "role, tabindex veya keyboard event eksik olabilir.",
        ],
      }),
    );
  }

  if (onclickMatches.length > 8) {
    findings.push(
      createInteractionFinding({
        title: "Inline onclick kullanımı fazla",
        desc: `${onclickMatches.length} yerde inline onclick kullanımı tespit edildi.`,
        level: "low",
        icon: "code",
        solution:
          "Inline onclick yerine event listener veya framework event sistemi kullanın.",
        causes: [
          "Etkileşimler HTML içine doğrudan yazılmış olabilir.",
          "Kod bakım ve test edilebilirlik açısından zorlaşabilir.",
          "Ayrıştırılmış event yönetimi kullanılmıyor olabilir.",
        ],
      }),
    );
  }

  if (positiveTabindex.length > 0) {
    findings.push(
      createInteractionFinding({
        title: "Pozitif tabindex kullanımı",
        desc: `${positiveTabindex.length} yerde pozitif tabindex değeri bulundu.`,
        level: "medium",
        icon: "keyboard",
        solution:
          "tabindex değerlerini 0 veya -1 ile sınırlayın. Doğal DOM sırasını bozmayın.",
        causes: [
          "Klavye odak sırası manuel olarak değiştirilmiş olabilir.",
          "Kullanıcı beklenmeyen odak sırası yaşayabilir.",
          "Tab navigasyonu erişilebilirlik açısından karmaşıklaşabilir.",
        ],
      }),
    );
  }

  if (roleButtonWithoutKeyboard.length > 0) {
    findings.push(
      createInteractionFinding({
        title: "role='button' keyboard desteği eksik",
        desc: `${roleButtonWithoutKeyboard.length} role='button' elemanında tabindex veya keyboard event eksik.`,
        level: "high",
        icon: "keyboard",
        solution:
          "role='button' kullanılan elemanlara tabindex='0' ve Enter/Space keyboard desteği ekleyin veya doğrudan <button> kullanın.",
        causes: [
          "Semantik button yerine div/span kullanılmış olabilir.",
          "Klavye kullanıcıları butonu aktive edemeyebilir.",
          "Etkileşim davranışı sadece mouse/touch için tasarlanmış olabilir.",
        ],
      }),
    );
  }

  if (dropdownWithoutAriaExpanded) {
    findings.push(
      createInteractionFinding({
        title: "Dropdown/accordion aria-expanded eksik",
        desc: "Dropdown, menu, accordion veya collapse yapısı tespit edildi ancak aria-expanded kullanımı bulunamadı.",
        level: "medium",
        icon: "menu",
        solution:
          "Açılıp kapanan trigger elemanlarda aria-expanded ve aria-controls kullanın.",
        causes: [
          "Dropdown durumu ekran okuyuculara aktarılmıyor olabilir.",
          "Açılır menü component’i erişilebilirlik durumunu yönetmiyor olabilir.",
          "Kullanıcı menünün açık/kapalı olduğunu anlayamayabilir.",
        ],
      }),
    );
  }

  if (uniqueDuplicateIds.length > 0) {
    findings.push(
      createInteractionFinding({
        title: "Tekrarlanan id değerleri",
        desc: `${uniqueDuplicateIds.length} farklı id değeri sayfada birden fazla kullanılmış.`,
        level: "medium",
        icon: "code",
        solution:
          "Her id değerini sayfa içinde benzersiz yapın. Component tekrarlarında unique id üretin.",
        causes: [
          "Aynı component birden fazla kez render edilirken sabit id kullanılmış olabilir.",
          "Label, aria-controls veya anchor hedefleri yanlış elemana bağlanabilir.",
          "JavaScript selectorları beklenmeyen elemanı hedefleyebilir.",
        ],
      }),
    );
  }

  if (!hasSkipLink) {
    findings.push(
      createInteractionFinding({
        title: "Skip link bulunamadı",
        desc: "Klavye kullanıcıları için ana içeriğe hızlı geçiş linki tespit edilmedi.",
        level: "low",
        icon: "keyboard",
        solution:
          'Sayfanın başına <a href="#main" className="sr-only focus:not-sr-only">İçeriğe geç</a> benzeri skip link ekleyin.',
        causes: [
          "Klavye kullanıcıları her sayfada menüyü tekrar geçmek zorunda kalabilir.",
          "Ana içerik hedef id’si tanımlanmamış olabilir.",
          "Erişilebilir navigasyon yapısı eksik olabilir.",
        ],
      }),
    );
  }

  if (modalWithoutDialogRole.length > 0) {
    findings.push(
      createInteractionFinding({
        title: "Modal/dialog erişilebilirlik bilgisi eksik",
        desc: `${modalWithoutDialogRole.length} modal/dialog benzeri elemanda role='dialog' veya aria-modal eksik olabilir.`,
        level: "medium",
        icon: "layout",
        solution:
          "Modal yapılarında role='dialog', aria-modal='true', aria-labelledby ve focus yönetimi kullanın.",
        causes: [
          "Modal component’i ekran okuyucu semantiği taşımıyor olabilir.",
          "Focus trap veya ESC ile kapatma davranışı eksik olabilir.",
          "Kullanıcı modal açıldığında bağlam değişimini anlamayabilir.",
        ],
      }),
    );
  }

  if (disabledButtons.length > 3) {
    findings.push(
      createInteractionFinding({
        title: "Çok sayıda disabled buton var",
        desc: `${disabledButtons.length} disabled buton tespit edildi.`,
        level: "low",
        icon: "mouse-pointer",
        solution:
          "Disabled butonların neden devre dışı olduğunu kullanıcıya açıklayın veya gerekli koşulları görünür hale getirin.",
        causes: [
          "Form aksiyonu gerekli alanlar doldurulana kadar kapalı olabilir.",
          "Kullanıcı butonun neden çalışmadığını anlayamayabilir.",
          "Disabled durum için açıklayıcı helper text eksik olabilir.",
        ],
      }),
    );
  }

  return findings;
}

function createInteractionFinding(
  finding: Omit<
    InteractionFinding,
    "category" | "affectedPages" | "affectedCount"
  >,
): InteractionFinding {
  return {
    ...finding,
    category: "interaction",
    affectedPages: [],
    affectedCount: 0,
  };
}

function mergeFindings(pageResults: SinglePageInteractionResult[]) {
  const map = new Map<string, InteractionFinding>();

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

function calculateInteractionScore(findings: InteractionFinding[]) {
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