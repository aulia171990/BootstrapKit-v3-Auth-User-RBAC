import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * usePullToRefresh — mobile pull-to-refresh on a scroll container.
 * Triggers `onRefresh` when the user pulls down past `threshold` while the
 * container is scrolled to the top. Touch-only (pointer) + a wheel fallback.
 * @returns { containerRef, pullDistance, refreshing }
 */
export function usePullToRefresh(onRefresh, { threshold = 64 } = {}) {
  const containerRef = useRef(null);
  const startY = useRef(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const begin = (y) => { startY.current = y; };
  const move = (y, el) => {
    if (startY.current == null || refreshing) return;
    if (el.scrollTop > 0) { setPullDistance(0); return; }
    const delta = Math.max(0, y - startY.current);
    if (delta > 0) setPullDistance(Math.min(delta * 0.5, threshold * 1.5));
  };
  const end = useCallback(async () => {
    if (refreshing) return;
    if (pullDistance >= threshold) {
      setRefreshing(true); setPullDistance(threshold);
      try { await onRefresh?.(); } finally { setRefreshing(false); setPullDistance(0); }
    } else {
      setPullDistance(0);
    }
    startY.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pullDistance, refreshing, threshold, onRefresh]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ts = (e) => begin(e.touches[0].clientY);
    const tm = (e) => move(e.touches[0].clientY, el);
    const te = () => end();
    el.addEventListener('touchstart', ts, { passive: true });
    el.addEventListener('touchmove', tm, { passive: true });
    el.addEventListener('touchend', te);
    return () => {
      el.removeEventListener('touchstart', ts);
      el.removeEventListener('touchmove', tm);
      el.removeEventListener('touchend', te);
    };
  }, [end]);

  return { containerRef, pullDistance, refreshing, setPullDistance };
}
