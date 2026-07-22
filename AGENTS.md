# AGENTS.md — BootstrapKit-v3 / Ojol Online

Monorepo with 3 apps sharing the same `/api/v1` endpoints:

| Path | Stack | Entrypoint |
|------|-------|------------|
| `backend/laravel/` | Laravel 11, JWT (tymon/jwt-auth), Reverb WS, PostgreSQL, Redis | `public/index.php` |
| `frontend/` | React 18, Vite 5, Vitest, Laravel Echo + Pusher protocol | `src/main.jsx` |
| `mobile/` | Flutter 3.4+, Provider, `shared_preferences`, polling tracking | `lib/main.dart` |

## Commands

### Backend
```bash
cd backend/laravel
# setup (once)
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret --force
php artisan migrate --seed

# run (2 terminals)
php artisan serve --port=8000
php artisan reverb:start --host=127.0.0.1 --port=8080

# test (in-memory SQLite)
vendor/bin/phpunit
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # :5173, proxies /api + /broadcasting/auth -> :8000
npm run build
npm run preview
npx vitest run       # jsdom, globals, tests in design-system/ + passenger/
```

### Mobile
```bash
cd mobile
flutter pub get
flutter analyze
flutter run
```
Mobile uses polling (3s) for live tracking; WS upgrade prepared in `lib/config.dart`.

## Architecture

- **API**: all routes under `/api/v1`. Auth: public (login, register, refresh, OTP, password reset), `auth.api` middleware (JWT), `verified`, `role`, `permission` gates.
- **Real-time**: Laravel Reverb WS on `ws://127.0.0.1:8080` (Pusher protocol). Echo subscribes to private channels like `order.{id}`. Channel auth via `/broadcasting/auth` (proxied through Vite). WebSocket connects directly to :8080 (not proxied).
- **RBAC**: roles (customer/driver/admin), permissions, pivot `permission_role`. Seed via `PermissionSeeder`. Middleware: `role:admin,driver`, `permission:user.manage`.
- **Frontend tenant**: `VITE_APP_TENANT` env var. `admin` (default) renders sidebar admin panel; `passenger` renders passenger app (`src/passenger/`).
- **Passenger app** has its own set of tests under `src/passenger/*/__tests__/` covering trip UX, wallet, booking, activity, safety, communication flows.
- **Session revocation**: JWT carries `security_stamp` claim; `logout-all`, password change/reset rotate the stamp, invalidating all old JWTs.
- **No CI, no Docker, no Makefile**.

## Testing

- Backend: PHPUnit 11, `phpunit.xml` configures in-memory SQLite. The default testsuite only runs `tests/Feature/`. Unit tests exist in `tests/Unit/` but are not included in the default suite — run with `vendor/bin/phpunit tests/Unit/` to include them.
- Frontend: Vitest 2, jsdom env, `globals: true`. `vitest.config.js` include patterns restrict to `design-system/` and `passenger/` only — admin components have no tests. Run focused: `npx vitest run src/passenger/trip/__tests__/`.
- Mobile: `flutter test` uses `flutter_test` SDK.

## Key env variables

**Backend** (`.env`): `DB_CONNECTION=pgsql`, `JWT_TTL=60`, `JWT_REFRESH_TTL=20160`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_APP_ID`.
**Frontend** (Vite): `VITE_APP_TENANT`, `VITE_REVERB_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT`.

## Gotchas

- PHP extensions `bcmath`, `pgsql`, `sqlite3` must be installed (not always present).
- `POST /auth/refresh` opts out of `auth.api` middleware intentionally — refresh uses an opaque refresh token, not an access token.
- `POST /auth/register` never accepts `role` from input; self-registration always gets `customer` role.
- Account lockout after 5 failed attempts (15 min). Login throttled at 5/min per IP+email.
- Reverb `allowed_origins: ['*']` for dev. WS port 8080 is NOT proxied through Vite; Echo connects directly.
- `.env.example` does not include Reverb vars (`REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_APP_ID`, `REVERB_APP_SECRET`); they must be configured separately after `cp .env.example .env`.
