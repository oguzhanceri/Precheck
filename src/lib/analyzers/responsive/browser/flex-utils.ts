export function isLayoutFlexContainer(element: HTMLElement) {
  const rect = element.getBoundingClientRect();

  if (rect.width < 120) return false;
  if (rect.height < 20) return false;

  if (element.children.length < 2) return false;

  const visibleChildren = Array.from(element.children).filter((child) => {
    if (!(child instanceof HTMLElement)) return false;

    const childRect = child.getBoundingClientRect();

    return childRect.width > 0 && childRect.height > 0;
  });

  if (visibleChildren.length < 2) return false;

  const hasMeaningfulText = element.textContent?.trim().length ?? 0;

  if (hasMeaningfulText <= 2 && visibleChildren.length <= 2) {
    return false;
  }

  return true;
}