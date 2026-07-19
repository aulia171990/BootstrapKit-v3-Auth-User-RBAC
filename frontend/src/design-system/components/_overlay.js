import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/** Render children into document.body (avoids stacking/overflow issues). */
export function usePortal(children, open) {
  if (typeof document === 'undefined' || !open) return null;
  return createPortal(children, document.body);
}

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/** Trap Tab focus inside a container while `active`; focus first element on mount. */
export function useFocusTrap(ref, active) {
  const prevFocus = useRef(null);
  useEffect(() => {
    if (!active || !ref.current) return;
    prevFocus.current = document.activeElement;
    const node = ref.current;
    const focusables = () => Array.from(node.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    const first = focusables()[0];
    (first || node).focus({ preventScroll: true });

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) { e.preventDefault(); return; }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      prevFocus.current?.focus?.({ preventScroll: true });
    };
  }, [active, ref]);
}
