import { shouldIgnoreResponsiveElement } from "./ignore";

export function collectNavigationOverflow(): boolean {
  const nav = document.querySelector<HTMLElement>(
    "nav, header nav, [data-nav], [data-menu], .menu, .navbar",
  );

  if (!nav) return false;

  if (shouldIgnoreResponsiveElement(nav)) {
    return false;
  }

  return nav.scrollWidth > nav.clientWidth + 2;
}