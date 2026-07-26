# BootstrapKit-v3-Auth-User-RBAC

## Run

### Backend
```bash
cd backend/laravel
php artisan serve --port=8000
php artisan reverb:start --host=127.0.0.1 --port=8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
npm run build
npx vitest run
```

### Mobile
```bash
cd mobile
flutter pub get
flutter analyze
flutter run
```

## Test

### Backend
```bash
cd backend/laravel
vendor/bin/phpunit
vendor/bin/phpunit tests/Unit/
```

### Frontend
```bash
cd frontend
npx vitest run
```

### Mobile
```bash
cd mobile
flutter test
```
