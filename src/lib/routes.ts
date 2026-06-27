export function createReportHref(scanId: string) {
  return `/report?scanId=${encodeURIComponent(scanId)}`;
}

export function createLiveHref(scanId: string, url?: string | null) {
  const params = new URLSearchParams({ scanId });

  if (url) {
    params.set("url", url);
  }

  return `/live?${params.toString()}`;
}

export function createScannerHref(url?: string | null) {
  if (!url) return "/scanner";

  return `/scanner?url=${encodeURIComponent(url)}`;
}
