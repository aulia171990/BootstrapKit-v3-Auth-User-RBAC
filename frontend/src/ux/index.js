/* ============================================================
   Global UX Layer
   ------------------------------------------------------------
   Single entry point for all UX infrastructure consumed by
   Passenger App, Driver App, Admin Dashboard, and OCC.
   ============================================================ */

import './ux.css';

// ── Design System (for init) ───────────────────────────────
import { theme } from '../design-system/index.js';

// ── Hooks ──────────────────────────────────────────────────
export { default as useNetworkStatus } from './hooks/useNetworkStatus.js';
export { default as useReducedMotion } from './hooks/useReducedMotion.js';
export { default as useHaptic } from './hooks/useHaptic.js';
export { default as useKeyboardAvoidance } from './hooks/useKeyboardAvoidance.js';
export { default as useSwipe } from './hooks/useSwipe.js';
export { default as useLazyImage } from './hooks/useLazyImage.js';

// ── Internationalization ───────────────────────────────────
export {
  t, setLocale, getLocale, getAvailableLocales, initLocale,
  formatDate, formatTime, formatDateTime, formatCurrency, formatNumber,
  pluralize, onLocaleChange,
} from './i18n/index.js';

// ── Motion ─────────────────────────────────────────────────
export {
  getAnimationClass, getAnimationDuration, getAnimationDelay, prefersReducedMotion,
} from './motion.js';

// ── Performance ────────────────────────────────────────────
export {
  prefetch, preloadImage, preloadFont,
  debounce, throttle, memoize, measureRender, chunkArray,
} from './performance.js';

// ── Mobile ─────────────────────────────────────────────────
export {
  nativeShare, isNativeShareSupported, openDeepLink,
  getSafeAreaTop, getSafeAreaBottom,
} from './mobile.js';

// ── Theme high-contrast extension ──────────────────────────
export function setHighContrast(enabled) {
  const root = document.documentElement;
  if (enabled) {
    root.setAttribute('data-theme', 'high-contrast');
    try { localStorage.setItem('ds-theme', 'high-contrast'); } catch {}
  } else {
    const saved = localStorage.getItem('ds-theme-prev') || 'system';
    root.setAttribute('data-theme', saved);
    try { localStorage.setItem('ds-theme', saved); } catch {}
  }
}

export function setFontSize(size) {
  const root = document.documentElement;
  if (size === 'large') {
    root.setAttribute('data-font-size', 'large');
    try { localStorage.setItem('ds-font-size', 'large'); } catch {}
  } else {
    root.removeAttribute('data-font-size');
    try { localStorage.setItem('ds-font-size', 'normal'); } catch {}
  }
}

export function initUX() {
  theme.init();
  initLocale();
  try {
    const fontSize = localStorage.getItem('ds-font-size');
    if (fontSize === 'large') setFontSize('large');
  } catch {}
}
