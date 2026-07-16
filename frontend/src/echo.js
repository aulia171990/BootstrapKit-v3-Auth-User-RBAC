// Laravel Echo (Pusher protocol) -> Reverb WebSocket (self-hosted, no Pusher cloud).
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo = null;

export function getEcho(token) {
  if (echo) return echo;
  echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_KEY || 'ojol_local_key',
    // WebSocket langsung ke server Reverb (port 8080). Reverb mengizinkan
    // semua origin (allowed_origins: ['*']) sehingga tidak kena CORS.
    // Channel auth (/broadcasting/auth) tetap lewat origin Vite (proxy -> :8000).
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    forceTLS: false,
    disableClusters: true,
    disableStats: true,
    enabledTransports: ['ws'],
    cluster: 'mt1',
    authEndpoint: '/broadcasting/auth',
    auth: { headers: { Authorization: 'Bearer ' + token, Accept: 'application/json' } },
  });
  return echo;
}

export function leaveEcho() {
  if (echo) {
    echo.disconnect();
    echo = null;
  }
}
