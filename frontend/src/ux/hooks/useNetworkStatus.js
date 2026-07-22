import { useState, useEffect, useCallback } from 'react';

export default function useNetworkStatus() {
  const [status, setStatus] = useState({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    since: typeof navigator !== 'undefined' ? new Date() : new Date(),
    type: null,
    effectiveType: null,
    downlink: null,
    rtt: null,
  });

  const updateOnline = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      online: navigator.onLine,
      since: new Date(),
      type: navigator.connection?.type || null,
      effectiveType: navigator.connection?.effectiveType || null,
      downlink: navigator.connection?.downlink || null,
      rtt: navigator.connection?.rtt || null,
    }));
  }, []);

  const updateConnection = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      type: navigator.connection?.type || null,
      effectiveType: navigator.connection?.effectiveType || null,
      downlink: navigator.connection?.downlink || null,
      rtt: navigator.connection?.rtt || null,
    }));
  }, []);

  useEffect(() => {
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateConnection);
    }
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateConnection);
      }
    };
  }, [updateOnline, updateConnection]);

  const isSlowConnection = status.online && (
    status.effectiveType === 'slow-2g' || status.effectiveType === '2g'
  );

  return { ...status, isSlowConnection };
}
