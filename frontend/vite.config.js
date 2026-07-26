import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxy ke backend Laravel (port 8000):
//  - /api              -> HTTP API
//  - /broadcasting/auth-> HTTP POST (channel auth) -> HARUS http, bukan ws
//  - /broadcasting     -> WebSocket upgrade (Pusher/Reverb) -> ws:true
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/broadcasting/auth': 'http://127.0.0.1:8000',
      '/broadcasting': { target: 'ws://127.0.0.1:8080', ws: true },
    },
  },
});
