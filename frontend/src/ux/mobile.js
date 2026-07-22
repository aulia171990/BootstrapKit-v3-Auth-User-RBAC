export function nativeShare({ title, text, url }) {
  if (typeof navigator === 'undefined') return Promise.reject(new Error('Not available'));
  if (!navigator.share) {
    const fallback = url || text || title;
    if (fallback) {
      navigator.clipboard?.writeText(fallback).catch(() => {});
    }
    return Promise.reject(new Error('Web Share API not supported'));
  }
  return navigator.share({ title, text, url }).catch(() => {});
}

export function isNativeShareSupported() {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

export function openDeepLink(url, fallbackUrl) {
  const start = Date.now();
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(() => {
    document.body.removeChild(iframe);
    if (Date.now() - start < 1500 && fallbackUrl) {
      window.location.href = fallbackUrl;
    }
  }, 2000);
}

export function getSafeAreaTop() {
  if (typeof getComputedStyle === 'undefined') return 0;
  const env = getComputedStyle(document.documentElement).getPropertyValue('--ds-safe-area-top');
  return env ? parseInt(env) : 0;
}

export function getSafeAreaBottom() {
  if (typeof getComputedStyle === 'undefined') return 0;
  const env = getComputedStyle(document.documentElement).getPropertyValue('--ds-safe-area-bottom');
  return env ? parseInt(env) : 0;
}
