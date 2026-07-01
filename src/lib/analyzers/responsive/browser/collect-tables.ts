import { shouldIgnoreResponsiveElement } from "./ignore";

type CollectTablesParams = {
  viewportWidth: number;
};

export function collectRiskyTables({
  viewportWidth,
}: CollectTablesParams): number {
  return Array.from(document.querySelectorAll<HTMLElement>("table")).filter(
    (table) => {
      if (shouldIgnoreResponsiveElement(table)) {
        return false;
      }

      return table.scrollWidth > viewportWidth + 2;
    },
  ).length;
}
