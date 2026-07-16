# Ojol Online — Backend (Laravel 11)

Backend aplikasi ojol-online. Dibangun di atas BootstrapKit-v3 (Auth/RBAC JWT).
Modul yang SUDAH JADI: **Auth+RBAC**, **Driver**, **Order**, **Payment**, **Auto-Matching**, **Tracking WebSocket (Realtime)**.

## Struktur
```
backend/laravel/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/AuthController.php       # register, login, logout, me
│   │   │   ├── Driver/DriverController.php   # profil, location, nearby
│   │   │   ├── Order/OrderController.php     # buat, accept, status, track, location
│   │   │   └── Payment/PaymentController.php # bayar, cek status pembayaran
│   │   └── Middleware/
│   │       ├── AuthenticateApi.php           # guard JWT (auth.api)
│   │       └── CheckRole.php                 # middleware role
│   ├── Events/
│   │   │   ├── OrderMatched.php              # broadcast ke driver kandidat (matching)
│   │   │   ├── DriverLocationUpdated.php     # live tracking posisi driver
│   │   │   └── OrderStatusUpdated.php        # perubahan status order
│   ├── Models/                               # User, Role, Permission, Driver, Order, OrderStatusHistory, Payment
│   ├── Providers/
│   │   └── BroadcastServiceProvider.php      # /broadcasting/auth (JWT) + channels
│   └── Services/DriverLocationService.php     # Redis GEO (fallback Haversine)
├── config/                                   # app, auth, database, jwt, broadcasting, reverb, dsb
├── database/
│   ├── migrations/                           # users, roles, permissions, drivers, orders, payments
│   └── seeders/RoleSeeder.php                # seed role customer/driver/admin + admin demo
├── routes/api.php                            # endpoint v1
└── .env.example
```

## Endpoint (prefix /api/v1)
- Auth : `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- Driver: `GET|POST /drivers`, `GET|PUT /drivers/{id}`, `POST /drivers/location`, `GET /drivers/nearby`
- Order : `GET|POST /orders`, `GET /orders/{id}`, `POST /orders/{id}/accept`,
          `PATCH /orders/{id}/status`, `GET /orders/{id}/track`,
          `POST /orders/{id}/location`  ← driver push posisi live (realtime)
- Payment: `POST /orders/{id}/pay`, `GET /orders/{id}/payment`

## Realtime Tracking (WebSocket — Laravel Reverb)
Driver mem-broadcast posisi & perubahan status order ke channel privat `order.{id}`
(customer + driver yang terlibat berlangganan via Laravel Echo).
- Event: `driver.location.updated` (posisi driver) & `order.status.updated` (status order).
- Channel auth: `POST /broadcasting/auth` pakai Bearer JWT (hanya customer/driver order tsb
  yang diizinkan — lihat `routes/channels.php`).
- Server WebSocket: `php artisan reverb:start --host=127.0.0.1 --port=8080`
- Konfigurasi klien (Laravel Echo): `broadcaster: 'pusher'`, `key: REVERB_APP_KEY`,
  `wsHost: 127.0.0.1`, `wsPort: 8080`, `forceTLS: false`, `disableClusters: true`.

## Cara menjalankan (perlu sudo untuk install extension PHP)
```bash
cd backend/laravel

# 1) Install extension PHP yang wajib (bcmath & pgsql tidak ada by default di CLI ini)
sudo apt update
sudo apt install -y php8.3-bcmath php8.3-pgsql php8.3-sqlite3

# 2) Install dependency (sudah dilakukan sekali, Lewati jika vendor/ ada)
composer install

# 3) Set env
cp .env.example .env
php artisan key:generate
php artisan jwt:secret --force

# 4) Siapkan database PostgreSQL, lalu
php artisan migrate --seed

# 5) Jalankan HTTP API + WebSocket server (2 terminal)
php artisan serve --port=8000
php artisan reverb:start --host=127.0.0.1 --port=8080
```

## Catatan verifikasi (yang SUDAH dijalankan di environment ini)
- `php -l` di semua file PHP → **OK** (tidak ada error sintaks).
- `composer install` → **OK** (Laravel 11.54 + tymon/jwt-auth 2.3 + laravel/reverb 1.10).
- `php artisan --version` → **Laravel Framework 11.54.0**.
- E2E Tracking (ad-hoc, real): HTTP flow + Reverb boot + Laravel Echo client (Node)
  subscribe ke `order.{id}` dengan JWT customer → driver push lokasi & ubah status
  → client menerima `driver.location.updated` + `order.status.updated` secara realtime.
- Negative: user lain (bukan customer/driver order) DITOLAK saat subscribe channel privat.

## Yang masih perlu dibuat
- Frontend mobile (Flutter app) — admin React sudah jadi (lihat ../frontend).
