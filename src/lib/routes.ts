export function createReportHref(scanId: string) {
  return `/report?scanId=${encodeURIComponent(scanId)}`;
}

export function createScannerHref(url?: string | null) {
  if (!url) return "/scanner";

  return `/scanner?url=${encodeURIComponent(url)}`;
}