import type { ElementCause } from "../types";

export type CollectedMediaElement = ElementCause & {
  tagName: string;
  src?: string;
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
};

export function collectMediaElements(): CollectedMediaElement[] {
  const mediaElements = Array.from(
    document.querySelectorAll("img, picture, video, source"),
  );

  return mediaElements.map((element) => {
    const el = element as HTMLElement;
    const rect = el.getBoundingClientRect();

    const img = el instanceof HTMLImageElement ? el : null;
    const video = el instanceof HTMLVideoElement ? el : null;
    const source = el instanceof HTMLSourceElement ? el : null;

    const tag = el.tagName.toLowerCase();

    const src =
      img?.currentSrc ||
      img?.src ||
      video?.currentSrc ||
      video?.src ||
      source?.src ||
      undefined;

    return {
      selector: tag,
      tag,
      tagName: tag,
      src,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      naturalWidth: img?.naturalWidth,
      naturalHeight: img?.naturalHeight,
      text: el.textContent?.trim().slice(0, 120) || undefined,
    };
  });
}