# Auth Service — Production Hardening

Modul autentikasi siap produksi untuk platform ride-hailing (ojol).
Dibangun di atas Laravel 11 + tymon/jwt-auth, dengan RBAC, anti-brute-force,
dan alur passwordless/reset.

## Fitur

| Fitur | Endpoint | Auth |
|-------|----------|------|
| Register | `POST /api/v1/auth/register` | publik |
| Login (email+password) | `POST /api/v1/auth/login` | publik |
| OTP request | `POST /api/v1/auth/otp/request` | publik |
| OTP login (passwordless) | `POST /api/v1/auth/otp/login` | publik |
| Password reset request | `POST /api/v1/auth/password/email` | publik |
| Password reset | `POST /api/v1/auth/password/reset` | publik |
| Email verify | `POST /api/v1/auth/email/verify` | publik |
| Refresh token | `POST /api/v1/auth/refresh` | token |
| Logout | `POST /api/v1/auth/logout` | token |
| Logout all devices | `POST /api/v1/auth/logout-all` | token |
| Profil saya | `GET /api/v1/auth/me` | token |
| Change password | `POST /api/v1/auth/password/change` | token |
| Resend email verification | `POST /api/v1/auth/email/verify/resend` | token |

## Keamanan (production-ready)

- **No privilege escalation**: `role` tidak pernah diambil dari input register.
  Self-registration selalu menjadi `customer`.
- **Account lockout**: 5 percobaan gagal → akun terkunci 15 menit
  (`User::MAX_FAILED_ATTEMPTS`, `User::LOCKOUT_MINUTES`).
- **Login throttle**: rate-limit 5/menit per IP+email pada endpoint login.
- **Status enforcement**: akun `suspended`/`banned` (`status = 0 / -1`) ditolak login.
- **Logout-all (session revocation)**: setiap token JWT menyimpan `security_stamp`
  claim; `logout-all`/`reset-password`/`change-password` merotasi stamp → semua
  JWT lama ditolak oleh `AuthenticateApi` middleware.
- **Anti user-enumeration**: response OTP/reset identik untuk akun ada/tidak ada;
  pesan login error generik.
- **Password policy**: min 8 karakter + `confirmed` (registration & reset).
- **Single-use, expiring tokens**: `verification_tokens` (OTP/reset/verify)
  hanya berlaku 10 menit dan sekali pakai.
- **Clean DTO**: respons pakai `UserResource` — tidak pernah bocor `password`,
  `remember_token`, atau `security_stamp`.

## RBAC

- Tabel `roles` (customer/driver/admin) + `permissions` + pivot `permission_role`
  (seed: `PermissionSeeder`).
- Helper: `User::hasRole('admin')`, `User::hasPermission('user.manage')`.
- Middleware: `auth.api` (jwt), `role:admin,driver`, `permission:user.manage`.
  Gate `role` & `permission` terdaftar di `AuthServiceProvider`.
- Contoh penerapan nyata: `DriverController@index` hanya menampilkan semua driver
  bila user punya permission `order.view.all` (admin).

## Struktur

```
app/Models/User.php            # status, lockout, stamp, relasi + helper RBAC
app/Models/Role.php            # + relasi permissions()
app/Models/Permission.php      # + relasi roles()
app/Models/VerificationToken.php
app/Services/AuthService.php          # semua logika auth
app/Services/VerificationTokenService.php
app/Http/Controllers/Auth/AuthController.php
app/Http/Resources/UserResource.php
app/Http/Middleware/AuthenticateApi.php   # klaim stamp + status
app/Http/Middleware/CheckPermission.php
app/Exceptions/Auth/*          # AuthException hierarchy (envelope 401)
```

## Test

```bash
cd backend/laravel
vendor/bin/phpunit            # 17 tests, 75 assertions (in-memory SQLite)
php artisan migrate           # diverifikasi pada PostgreSQL 16
```
