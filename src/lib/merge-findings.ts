export type FindingWithPage = {
  title: string;
  desc: string;
  level: "critical" | "high" | "medium" | "low";
  icon: string;
  category: "performance";
  solution: string;
  page?: string;
  path?: string;
};

export type MergedFinding = FindingWithPage & {
  affectedPages: string[];
  affectedCount: number;
  
};

export function mergeDuplicateFindings<T extends FindingWithPage>(
  findings: T[]
): (T & { affectedPages: string[]; affectedCount: number })[] {
  const map = new Map<
    string,
    T & { affectedPages: string[]; affectedCount: number }
  >();

  findings.forEach((finding) => {
    const pagePath = finding.path || finding.page || "Bilinmeyen sayfa";

    const key = [
    finding.category,
    finding.title.toLowerCase().trim(),
    ].join("__");

    const existing = map.get(key);

    if (existing) {
      if (!existing.affectedPages.includes(pagePath)) {
        existing.affectedPages.push(pagePath);
        existing.affectedCount = existing.affectedPages.length;
      }
      return;
    }

    map.set(key, {
      ...finding,
      affectedPages: [pagePath],
      affectedCount: 1,
    });
  });

  return Array.from(map.values());
}