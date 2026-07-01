const IGNORED_STRUCTURE_SELECTORS = [
  ".swiper",
  ".swiper-wrapper",
  ".swiper-slide",
  ".slick-slider",
  ".slick-track",
  ".slick-slide",
  ".splide",
  ".splide__track",
  ".splide__slide",
  ".embla",
  ".embla__container",
  ".embla__slide",
  ".keen-slider",
  ".keen-slider__slide",
];

const IGNORED_OVERLAY_KEYWORDS = [
  "popup",
  "modal",
  "overlay",
  "drawer",
  "mega-menu",
  "search",
];

function includesKeyword(value: string, keywords: string[]) {
  const normalized = value.toLowerCase();

  return keywords.some((keyword) => normalized.includes(keyword));
}

export function shouldIgnoreResponsiveElement(element: HTMLElement) {
  if (element === document.documentElement || element === document.body) {
    return true;
  }

  if (IGNORED_STRUCTURE_SELECTORS.some((selector) => element.matches(selector))) {
    return true;
  }

  if (element.closest(IGNORED_STRUCTURE_SELECTORS.join(","))) {
    return true;
  }

  const className = element.className.toString();
  const id = element.id;

  return (
    includesKeyword(className, IGNORED_OVERLAY_KEYWORDS) ||
    includesKeyword(id, IGNORED_OVERLAY_KEYWORDS)
  );
}