# Ojol Admin — Frontend (React + Vite)

Admin panel untuk backend ojol-online. Nyambung ke Laravel API (`:8000`) + Laravel Reverb
WebSocket (`:8080`) untuk live tracking.

## Struktur
```
frontend/
├── index.html
├── vite.config.js        # proxy /api + /broadcasting/auth -> :8000
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx           # Login + daftar Order + Detail dgn live tracking
    ├── api.js            # fetch client (Bearer JWT di localStorage)
    └── echo.js           # Laravel Echo -> Reverb WS (langsung :8080)
```

## Cara jalan
```bash
# backend harus nyala dulu: php artisan serve --port=8000  +  reverb:start :8080
cd frontend
npm install
npm run dev          # http://127.0.0.1:5173
```
- API & channel-auth lewat Vite proxy (`:5173` -> `:8000`) → tidak kena CORS.
- WebSocket Echo langsung ke Reverb `ws://127.0.0.1:8080`
  (Reverb `allowed_origins: ['*']`), channel auth lewat proxy.

## Fitur
- Login (JWT), daftar order (table + badge status), Accept / Selesai order.
- Detail order: subscribe channel `order.{id}`, terima `driver.location.updated`
  (posisi driver realtime) + `order.status.updated`. Tombol "Simulasi driver bergerak"
  memanggil `POST /orders/{id}/location`.
