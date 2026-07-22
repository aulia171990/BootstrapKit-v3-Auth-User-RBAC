export function getAnimationClass(type, { direction = 'up', duration = 'base' } = {}) {
  const prefix = 'ds-anim';
  switch (type) {
    case 'fade': return `${prefix}-fade`;
    case 'slide': return `${prefix}-slide-${direction}`;
    case 'scale': return `${prefix}-scale`;
    case 'pop': return `${prefix}-pop`;
    case 'slideFade': return `${prefix}-slide-fade-${direction}`;
    default: return '';
  }
}

export function getAnimationDuration(duration) {
  const map = { instant: '0ms', fast: '150ms', base: '200ms', slow: '300ms', slower: '500ms' };
  return map[duration] || map.base;
}

export function getAnimationDelay(index, stagger = 50) {
  return `${index * stagger}ms`;
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
