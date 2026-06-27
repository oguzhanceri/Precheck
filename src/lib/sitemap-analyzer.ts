export type SitemapPage = {
  url: string;
  path: string;
};

const MAX_SITEMAP_PAGES = 3;

export async function getSitemapPages(siteUrl: string): Promise<SitemapPage[]> {
  const baseUrl = new URL(siteUrl);
  const sitemapUrl = `${baseUrl.origin}/sitemap.xml`;

  try {
    const response = await fetch(sitemapUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "AetherAnalyticsBot/1.0",
      },
    });

    if (!response.ok) {
      return [buildPage(siteUrl)];
    }

    const xml = await response.text();

    const urls = Array.from(xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi))
      .map((match) => match[1]?.trim())
      .filter((url): url is string => Boolean(url))
      .filter((url) => isSameDomainUrl(siteUrl, url))
      .filter((url) => !url.endsWith(".xml"))
      .slice(0, MAX_SITEMAP_PAGES);

    if (!urls.length) {
      return [buildPage(siteUrl)];
    }

    return urls.map((url) => buildPage(url));
  } catch {
    return [buildPage(siteUrl)];
  }
}

function buildPage(url: string): SitemapPage {
  try {
    const parsedUrl = new URL(url);

    return {
      url: parsedUrl.toString().replace(/\/$/, ""),
      path: parsedUrl.pathname || "/",
    };
  } catch {
    return {
      url,
      path: "/",
    };
  }
}

function isSameDomainUrl(baseUrl: string, targetUrl: string) {
  try {
    const baseHost = normalizeHost(new URL(baseUrl).hostname);
    const targetHost = normalizeHost(new URL(targetUrl).hostname);

    return baseHost === targetHost;
  } catch {
    return false;
  }
}

function normalizeHost(hostname: string) {
  return hostname.toLowerCase().replace(/^www\./, "");
}