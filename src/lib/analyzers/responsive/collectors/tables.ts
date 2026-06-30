export function collectRiskyTables(params: {
  viewportWidth: number;
}) {
  const { viewportWidth } = params;

  return Array.from(
    document.querySelectorAll<HTMLElement>("table"),
  ).filter((table) => {
    const rect = table.getBoundingClientRect();
    const parent = table.parentElement;
    const parentStyles = parent ? window.getComputedStyle(parent) : null;

    const hasScrollWrapper =
      parentStyles?.overflowX === "auto" ||
      parentStyles?.overflowX === "scroll";

    return rect.width > viewportWidth && !hasScrollWrapper;
  }).length;
}