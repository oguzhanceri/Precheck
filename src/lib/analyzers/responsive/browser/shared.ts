import type { ElementCause } from "../types";

export function getAllElements() {
  return Array.from(document.querySelectorAll<HTMLElement>("*"));
}

export function toElementCause(element: HTMLElement): ElementCause {
  const tag = element.tagName.toLowerCase();

  return {
    tag,
  };
}