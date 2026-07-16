# Ojol Online — Mobile App (Flutter)

Frontend mobile untuk backend ojol-online (Laravel 11 + JWT). Cocok untuk
peran **customer** dan **driver** (admin tetap di panel React).

## Fitur
- Login / Register (JWT, token disimpan di `shared_preferences`).
- Daftar order (pelanggan: order sendiri; driver: order yg diambil; admin: semua).
- Buat order baru (customer) dengan pickup/dropoff + harga.
- Detail order + **live tracking** driver via polling 3 detik (`GET /orders/{id}/track`).
- Aksi per-role: driver terima/mulai/selesaikan trip; customer bayar (cash).
- Badge status (pending/accepted/ongoing/completed/cancelled) seragam dgn frontend React.

> Realtime: v1 pakai polling. Upgrade ke Laravel Reverb WebSocket sudah
> disiapkan di `lib/config.dart` (`ApiConfig.wsHost/wsPort`).

## Struktur
```
mobile/
├── pubspec.yaml
├── analysis_options.yaml
└── lib/
    ├── main.dart              # bootstrap + router
    ├── config.dart            # ApiConfig (baseUrl, wsHost)
    ├── models.dart            # User, Driver, Order, Payment (fromJson)
    ├── api_client.dart        # HTTP client JWT + semua endpoint
    ├── auth_provider.dart     # state global (Provider)
    ├── widgets.dart           # statusBadge + money formatter
    └── screens/
        ├── login_screen.dart        # login + register
        ├── orders_screen.dart       # list order + FAB buat order
        ├── create_order_screen.dart # form order baru
        └── order_detail_screen.dart # detail + live tracking
```

## Endpoint yang dipakai (sama persis dgn React)
```
POST /api/v1/auth/register   POST /api/v1/auth/login
POST /api/v1/auth/logout     GET  /api/v1/auth/me
GET  /api/v1/orders          POST /api/v1/orders
GET  /api/v1/orders/{id}     POST /api/v1/orders/{id}/accept
PATCH /api/v1/orders/{id}/status
GET  /api/v1/orders/{id}/track
POST /api/v1/orders/{id}/pay
```

## Cara jalan
```bash
# 1) Backend Laravel harus nyala (lihat README backend):
#    php artisan serve --port=8000
#    (reverb:start :8080 untuk WS — opsional di v1)

# 2) Mobile:
cd mobile
flutter pub get
flutter analyze        # cek error/warning
flutter run            # pilih device/emulator
```

## Koneksi ke backend
Edit `lib/config.dart` (atau `lib/main.dart` sebelum `runApp`):

| Target                | baseUrl                       |
|-----------------------|-------------------------------|
| Android emulator      | `http://10.0.2.2:8000` (default) |
| iOS simulator         | `http://127.0.0.1:8000`       |
| Device fisik          | `http://192.168.x.x:8000` (IP LAN) |

Pastikan Laravel `CORS`/`APP_URL` mengizinkan origin mobile (atau matikan
CORS saat dev). Auth endpoint pakai header `Authorization: Bearer <jwt>`.

## Catatan
- Belum ada map widget (Google Maps); tracking hanya menampilkan koordinat
  driver secara numerik. Bisa ditambah `google_maps_flutter` nanti.
- `pushLocation` (driver update posisi live) belum di-expose ke UI driver
  (butuh `geolocator`); ada di `ApiClient.pushLocation()` siap pakai.
