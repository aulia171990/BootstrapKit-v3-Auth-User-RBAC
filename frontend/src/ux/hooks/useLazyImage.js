import { useState, useEffect, useRef } from 'react';

export default function useLazyImage(src) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!src) { setLoaded(false); setError(false); return; }

    const img = new Image();
    imgRef.current = img;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '200px' },
    );
    observerRef.current = observer;

    const placeholder = document.createElement('div');
    observer.observe(placeholder);

    img.onload = () => { setLoaded(true); setError(false); };
    img.onerror = () => { setError(true); setLoaded(false); };

    return () => {
      observer.disconnect();
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { loaded, error };
}
