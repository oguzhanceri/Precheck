import { shouldIgnoreResponsiveElement } from "./ignore";

type CollectMediaParams = {
  viewportWidth: number;
};

export function collectRiskyMedia({ viewportWidth }: CollectMediaParams): number {
  return Array.from(
    document.querySelectorAll<HTMLElement>("img, video, canvas, svg"),
  ).filter((media) => {
    if (shouldIgnoreResponsiveElement(media)) {
      return false;
    }

    const rect = media.getBoundingClientRect();

    return rect.width > viewportWidth + 2;
  }).length;
}