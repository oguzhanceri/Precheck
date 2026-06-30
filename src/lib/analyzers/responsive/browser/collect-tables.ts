type CollectTablesParams = {
  viewportWidth: number;
};

export function collectRiskyTables({
  viewportWidth,
}: CollectTablesParams): number {
  return Array.from(document.querySelectorAll<HTMLElement>("table")).filter(
    (table) => {
      return table.scrollWidth > viewportWidth + 2;
    },
  ).length;
}