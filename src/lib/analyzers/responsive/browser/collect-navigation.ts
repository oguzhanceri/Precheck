export function collectNavigationOverflow(): boolean {
  const nav = document.querySelector<HTMLElement>(
    "nav, header nav, [data-nav], [data-menu], .menu, .navbar",
  );

  return nav ? nav.scrollWidth > nav.clientWidth + 2 : false;
}