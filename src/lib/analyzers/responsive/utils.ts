import type { ElementCause, ResponsiveFinding } from "./types";

export function createResponsiveFinding(
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

export function formatElementCause(element: ElementCause) {
  const selector = [
    element.tag,
    element.id ? `#${element.id}` : "",
    element.className
      ? `.${element.className.split(" ").filter(Boolean).slice(0, 3).join(".")}`
      : "",
  ].join("");

  const details = [
    element.width ? `genişlik: ${element.width}px` : "",
    element.height ? `yükseklik: ${element.height}px` : "",
    element.right ? `sağ sınır: ${element.right}px` : "",
    element.cssWidth ? `css width: ${element.cssWidth}` : "",
    element.minWidth ? `min-width: ${element.minWidth}` : "",
    element.maxWidth ? `max-width: ${element.maxWidth}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return `${selector || element.tag} (${details})`;
}

export function createResponsiveFindingKey(finding: {
  title: string;
  desc?: string;
}) {
  return finding.title.toLowerCase().trim().replace(/\s+/g, " ");
}

export function mergeResponsiveFindings<
  T extends {
    title: string;
    causes?: string[];
    evidence?: string[];
    affectedPages?: string[];
    affectedCount?: number;
    affectedViewports?: string[];
  },
>(findings: T[]): T[] {
  const map = new Map<string, T>();

  findings.forEach((finding) => {
    const key = createResponsiveFindingKey(finding);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        ...finding,
        causes: finding.causes ? [...finding.causes] : [],
        evidence: finding.evidence ? [...finding.evidence] : [],
        affectedPages: finding.affectedPages ? [...finding.affectedPages] : [],
        affectedViewports: finding.affectedViewports
          ? [...finding.affectedViewports]
          : [],
        affectedCount: finding.affectedCount ?? 0,
      });
      return;
    }

    const causes = new Set([
      ...(existing.causes ?? []),
      ...(finding.causes ?? []),
    ]);

    const evidence = new Set([
      ...(existing.evidence ?? []),
      ...(finding.evidence ?? []),
    ]);

    const affectedPages = new Set([
      ...(existing.affectedPages ?? []),
      ...(finding.affectedPages ?? []),
    ]);

    const affectedViewports = new Set([
      ...(existing.affectedViewports ?? []),
      ...(finding.affectedViewports ?? []),
    ]);

    existing.causes = Array.from(causes).slice(0, 12);
    existing.evidence = Array.from(evidence).slice(0, 12);
    existing.affectedPages = Array.from(affectedPages);
    existing.affectedViewports = Array.from(affectedViewports);
    existing.affectedCount = existing.affectedPages.length;
  });

  return Array.from(map.values());
}