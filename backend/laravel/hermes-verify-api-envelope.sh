#!/usr/bin/env bash
# Fresh standalone verification of the standard API response envelope.
# Boots a temporary Laravel testbed in SQLite, hits real endpoints, and
# asserts every response contains success/message/data/meta/errors.
set -euo pipefail

LARAVEL=/home/vaio/ojol-online/BootstrapKit-v3-Auth-User-RBAC/backend/laravel
cd "$LARAVEL"

echo "==> Syntax check (all touched files)"
for f in app/Http/Responses/ApiResponse.php bootstrap/app.php \
         app/Http/Controllers/Auth/AuthController.php \
         app/Http/Controllers/Driver/DriverController.php \
         app/Http/Controllers/Order/OrderController.php \
         app/Http/Controllers/Payment/PaymentController.php \
         app/Exceptions/Auth/AuthException.php \
         app/Http/Middleware/AuthenticateApi.php \
         app/Http/Middleware/VerifiedMiddleware.php \
         tests/Feature/ApiResponseEnvelopeTest.php; do
  php -l "$f" >/dev/null && echo "ok  $f"
done

echo "==> Run envelope test suite"
vendor/bin/phpunit --filter ApiResponseEnvelopeTest --no-coverage 2>&1 | tail -8

echo "==> Check no stray inline response()->json envelopes remain"
STRAY=$(grep -rn "response()->json" app/ | wc -l || true)
echo "stray response()->json count: $STRAY"
[ "$STRAY" = "0" ] && echo "PASS: no inline envelopes" || echo "WARN: $STRAY inline envelope(s) remain"
