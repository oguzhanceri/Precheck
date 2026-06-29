type SecurityFindingLevel = "critical" | "high" | "medium" | "low";

type SecurityFinding = {
  title: string;
  desc: string;
  level: SecurityFindingLevel;
  icon: string;
  category: "security";
  solution: string;
  causes: string[];
  affectedPages: string[];
  affectedCount: number;
};

type SecurityPageResult = {
  path: string;
  score: number;
  critical: number;
  warning: number;
  check: string;
};

type SecurityAnalyzeOptions = {
  selectedPages?: string[];
};

type SinglePageSecurityResult = {
  url: string;
  path: string;
  score: number;
  findings: SecurityFinding[];
  page: SecurityPageResult;
};

export async function analyzeSecurity(
  url: string,
  options: SecurityAnalyzeOptions = {},
) {
  const baseUrl = normalizeUrl(url);
  const targetUrls = buildTargetUrls(baseUrl, options.selectedPages);

  const pageResults = await Promise.all(
    targetUrls.map((targetUrl, index) => analyzeSecurityPage(targetUrl, index)),
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

async function analyzeSecurityPage(
  url: string,
  index: number,
): Promise<SinglePageSecurityResult> {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PrecheckAI/1.0; +https://precheck.ai)",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Security analizi başarısız oldu. HTTP ${response.status}`);
  }

  const findings = analyzeSecurityHeaders(url, response.headers);
  const score = calculateSecurityScore(findings);
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

function analyzeSecurityHeaders(url: string, headers: Headers) {
  const findings: SecurityFinding[] = [];

  const parsedUrl = new URL(url);
  const isHttps = parsedUrl.protocol === "https:";

  const csp = headers.get("content-security-policy");
  const hsts = headers.get("strict-transport-security");
  const xFrame = headers.get("x-frame-options");
  const xContentType = headers.get("x-content-type-options");
  const referrerPolicy = headers.get("referrer-policy");
  const permissionsPolicy = headers.get("permissions-policy");

  if (!isHttps) {
    findings.push(
      createSecurityFinding({
        title: "HTTPS kullanılmıyor",
        desc: "Sayfa güvenli HTTPS protokolü yerine HTTP üzerinden servis ediliyor.",
        level: "critical",
        icon: "shield-alert",
        solution:
          "Siteyi HTTPS üzerinden servis edin ve HTTP isteklerini HTTPS'e yönlendirin.",
        causes: [
          "SSL sertifikası yapılandırılmamış olabilir.",
          "HTTP → HTTPS yönlendirmesi eksik olabilir.",
          "Sunucu veya CDN HTTPS zorlaması yapmıyor olabilir.",
        ],
      }),
    );
  }

  if (!csp) {
    findings.push(
      createSecurityFinding({
        title: "Content-Security-Policy eksik",
        desc: "CSP header bulunamadı. Bu durum XSS gibi istemci tarafı saldırı risklerini artırabilir.",
        level: "high",
        icon: "shield",
        solution:
          "script-src, style-src, img-src ve default-src kurallarını içeren kontrollü bir Content-Security-Policy header ekleyin.",
        causes: [
          "Sunucu veya CDN seviyesinde CSP header tanımlanmamış olabilir.",
          "Frontend framework middleware/header konfigürasyonu eksik olabilir.",
          "Üçüncü parti scriptler nedeniyle CSP yapılandırması ertelenmiş olabilir.",
        ],
      }),
    );
  }

  if (isHttps && !hsts) {
    findings.push(
      createSecurityFinding({
        title: "Strict-Transport-Security eksik",
        desc: "HSTS header bulunamadı. Tarayıcıların siteyi her zaman HTTPS üzerinden açması zorlanmıyor.",
        level: "medium",
        icon: "lock",
        solution:
          'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload header değerini uygun şekilde ekleyin.',
        causes: [
          "HTTPS aktif olmasına rağmen HSTS header eklenmemiş olabilir.",
          "CDN veya reverse proxy güvenlik headerlarını iletmiyor olabilir.",
          "Header konfigürasyonu sadece bazı route'larda uygulanıyor olabilir.",
        ],
      }),
    );
  }

  if (!xFrame) {
    findings.push(
      createSecurityFinding({
        title: "X-Frame-Options eksik",
        desc: "Sayfanın iframe içinde gömülmesini sınırlayan X-Frame-Options header bulunamadı.",
        level: "medium",
        icon: "layout",
        solution:
          "Clickjacking riskini azaltmak için X-Frame-Options: SAMEORIGIN veya DENY kullanın.",
        causes: [
          "Sunucu güvenlik headerları yapılandırılmamış olabilir.",
          "CSP frame-ancestors politikası kullanılmadığı halde X-Frame-Options da eksik olabilir.",
          "CDN header override ayarları bu headerı kaldırıyor olabilir.",
        ],
      }),
    );
  }

  if (!xContentType) {
    findings.push(
      createSecurityFinding({
        title: "X-Content-Type-Options eksik",
        desc: "Tarayıcının MIME type sniffing yapmasını engelleyen header bulunamadı.",
        level: "medium",
        icon: "file-warning",
        solution: "X-Content-Type-Options: nosniff header değerini ekleyin.",
        causes: [
          "Temel güvenlik headerları sunucuya eklenmemiş olabilir.",
          "Static asset ve HTML response headerları ayrı yönetiliyor olabilir.",
          "Reverse proxy bazı headerları düşürüyor olabilir.",
        ],
      }),
    );
  }

  if (!referrerPolicy) {
    findings.push(
      createSecurityFinding({
        title: "Referrer-Policy eksik",
        desc: "Tarayıcının referrer bilgisini hangi durumlarda göndereceğini belirleyen header bulunamadı.",
        level: "low",
        icon: "link",
        solution:
          "Referrer-Policy: strict-origin-when-cross-origin veya daha kısıtlayıcı uygun bir politika ekleyin.",
        causes: [
          "Gizlilik headerları henüz yapılandırılmamış olabilir.",
          "Sunucu varsayılan referrer davranışına bırakılmış olabilir.",
          "Header ayarı CDN veya framework config içinde eksik olabilir.",
        ],
      }),
    );
  }

  if (!permissionsPolicy) {
    findings.push(
      createSecurityFinding({
        title: "Permissions-Policy eksik",
        desc: "Kamera, mikrofon, konum gibi tarayıcı özelliklerini sınırlandıran Permissions-Policy header bulunamadı.",
        level: "low",
        icon: "settings",
        solution:
          "Kullanılmayan tarayıcı API'lerini kapatan Permissions-Policy header ekleyin.",
        causes: [
          "Tarayıcı özellik izinleri sunucu seviyesinde sınırlandırılmamış olabilir.",
          "Proje içinde kamera, mikrofon veya geolocation gibi izinler için politika tanımlanmamış olabilir.",
          "CDN veya hosting güvenlik header şablonu eksik olabilir.",
        ],
      }),
    );
  }

  return findings;
}

function createSecurityFinding(
  finding: Omit<
    SecurityFinding,
    "category" | "affectedPages" | "affectedCount"
  >,
): SecurityFinding {
  return {
    ...finding,
    category: "security",
    affectedPages: [],
    affectedCount: 0,
  };
}

function mergeFindings(pageResults: SinglePageSecurityResult[]) {
  const map = new Map<string, SecurityFinding>();

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

function calculateSecurityScore(findings: SecurityFinding[]) {
  let score = 100;

  findings.forEach((finding) => {
    if (finding.level === "critical") score -= 22;
    if (finding.level === "high") score -= 14;
    if (finding.level === "medium") score -= 8;
    if (finding.level === "low") score -= 4;
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