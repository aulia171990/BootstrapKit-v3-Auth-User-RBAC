import { useState, useRef, useCallback } from 'react';

export default function useSwipe({ threshold = 50, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown } = {}) {
  const [swiping, setSwiping] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const startRef = useRef({ x: 0, y: 0 });
  const trackingRef = useRef(false);

  const onTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    startRef.current = { x: touch.clientX, y: touch.clientY };
    trackingRef.current = true;
    setSwiping(true);
  }, []);

  const onTouchMove = useCallback((e) => {
    if (!trackingRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startRef.current.x;
    const dy = touch.clientY - startRef.current.y;
    setOffset({ x: dx, y: dy });
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!trackingRef.current) return;
    trackingRef.current = false;
    setSwiping(false);

    const { x: dx, y: dy } = offset;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) >= threshold) {
        if (dx > 0) onSwipeRight?.();
        else onSwipeLeft?.();
      }
    } else {
      if (Math.abs(dy) >= threshold) {
        if (dy > 0) onSwipeDown?.();
        else onSwipeUp?.();
      }
    }

    setOffset({ x: 0, y: 0 });
  }, [offset, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  const swipeHandlers = {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };

  return { swiping, offset, swipeHandlers, setOffset };
}
