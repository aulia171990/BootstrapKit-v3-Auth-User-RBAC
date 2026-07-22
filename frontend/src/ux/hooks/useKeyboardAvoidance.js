import { useState, useEffect } from 'react';

const INITIAL = typeof window !== 'undefined' ? window.innerHeight : 0;

export default function useKeyboardAvoidance() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    let initialHeight = window.innerHeight;

    const handleResize = () => {
      const current = window.innerHeight;
      const diff = initialHeight - current;

      if (diff > 100) {
        setIsKeyboardOpen(true);
        setKeyboardHeight(diff);
      } else if (diff < -100) {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const keyboardAvoidStyle = isKeyboardOpen
    ? { paddingBottom: keyboardHeight }
    : {};

  return { keyboardHeight, isKeyboardOpen, keyboardAvoidStyle };
}
