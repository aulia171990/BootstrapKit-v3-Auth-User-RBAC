# Ojol Online — Production Deployment

## Prerequisites

| Component | Requirement |
|---|---|
| PHP 8.3+ | Extensions: `bcmath`, `pgsql`, `sqlite3`, `redis` (for production) |
| PostgreSQL 15+ | Database server |
| Redis 7+ | For queue, cache, session (production) |
| Node.js 20+ | For frontend builds |
| nginx | Reverse proxy for API, WebSocket, and static files |
| Composer | PHP dependency manager |
| Supervisor | To daemonize queue worker + Reverb |

---

## 1. Backend — Laravel

### 1.1 Environment

```bash
cd backend/laravel
cp .env.example .env
php artisan key:generate
php artisan jwt:secret --force
```

Set these in `.env`:

| Variable | Value | Notes |
|---|---|---|
| `APP_ENV` | `production` | |
| `APP_DEBUG` | `false` | |
| `APP_URL` | `https://your-domain.com` | **Must update from `http://localhost:8000`** |
| `DB_PASSWORD` | strong random | Already set; keep safe |
| `LOG_CHANNEL` | `daily` | Log rotation, 14 days |
| `LOG_LEVEL` | `warning` | No debug noise in production |
| `QUEUE_CONNECTION` | `redis` | Currently `sync`; needs phpredis |
| `CACHE_STORE` | `redis` | Currently `file`; needs phpredis |
| `SESSION_DRIVER` | `redis` | Currently `file`; needs phpredis |

### 1.2 Database

```bash
php artisan migrate --seed
```

### 1.3 Config Cache

```bash
php artisan config:cache
php artisan route:cache
```

### 1.4 Queue Worker (production)

Install phpredis extension, then:

```bash
sudo apt install php8.3-redis
```

Update `.env`:
```
QUEUE_CONNECTION=redis
CACHE_STORE=redis
SESSION_DRIVER=redis
```

Run worker via Supervisor:

```ini
[program:ojol-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/ojol/backend/laravel/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=2
user=www-data
```

### 1.5 Reverb WebSocket

Update `.env`:
```
REVERB_HOST=127.0.0.1
REVERB_PORT=8080
REVERB_SCHEME=http
```

Run via Supervisor:

```ini
[program:ojol-reverb]
command=php /var/www/ojol/backend/laravel/artisan reverb:start --host=127.0.0.1 --port=8080
autostart=true
autorestart=true
user=www-data
```

---

## 2. Frontend — Admin Tenant

```bash
cd frontend
npm ci
npm run build
# → dist/
```

## 3. Frontend — Passenger Tenant

```bash
cd frontend
VITE_APP_TENANT=passenger \
VITE_REVERB_KEY=<from .env> \
VITE_REVERB_HOST=<REVERB_HOST> \
VITE_REVERB_PORT=8080 \
npx vite build --outDir=dist-passenger
# → dist-passenger/
```

---

## 4. nginx

See `deploy/nginx.conf` for the full config. Summary:

| Subdomain | Serves | Port |
|---|---|---|
| `admin.your-domain.com` | `dist/` (admin SPA) | 80/443 |
| `passenger.your-domain.com` | `dist-passenger/` (passenger SPA) | 80/443 |
| `api.your-domain.com` | Proxies to Laravel :8000 + Reverb :8080 | 80/443 |

Key rules:
- SPA fallback: `try_files $uri $uri/ /index.html`
- API: `proxy_pass http://127.0.0.1:8000`
- WebSocket: `proxy_pass http://127.0.0.1:8080` with `Upgrade` + `Connection` headers

---

## 5. SSL

```bash
sudo certbot --nginx -d admin.your-domain.com -d passenger.your-domain.com -d api.your-domain.com
```

---

## 6. Final Checklist

- [ ] `APP_URL` set to production domain
- [ ] phpredis installed, queue/cache/session → `redis`
- [ ] `config:cache` and `route:cache` run
- [ ] nginx SSL configured
- [ ] Supervisor running queue worker + Reverb
- [ ] Restrictive CSP verified (WebSocket origin in `connect-src`)
- [ ] Reverb `allowed_origins` set to `APP_URL`
- [ ] Log level `warning`, channel `daily`
- [ ] Monitoring: Laravel horizon or custom health checks
