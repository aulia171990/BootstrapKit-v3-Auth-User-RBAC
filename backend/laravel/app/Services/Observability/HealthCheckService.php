<?php

namespace App\Services\Observability;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;

class HealthCheckService
{
    public function database(): array
    {
        try {
            DB::connection()->getPdo();

            return ['database' => ['status' => 'ok']];
        } catch (\Throwable $e) {
            return ['database' => ['status' => 'error', 'message' => $e->getMessage()]];
        }
    }

    public function cache(): array
    {
        try {
            Cache::put('observability_health_check', true, 10);
            $ok = Cache::get('observability_health_check') === true;

            return ['cache' => ['status' => $ok ? 'ok' : 'error']];
        } catch (\Throwable $e) {
            return ['cache' => ['status' => 'error', 'message' => $e->getMessage()]];
        }
    }

    public function queue(): array
    {
        try {
            Artisan::call('queue:work --once --stop-when-empty');
        } catch (\Throwable $e) {
            return ['queue' => ['status' => 'error', 'message' => $e->getMessage()]];
        }

        return ['queue' => ['status' => 'ok']];
    }

    public function storage(): array
    {
        try {
            $ok = is_writable(storage_path('app'));

            return ['storage' => ['status' => $ok ? 'ok' : 'error']];
        } catch (\Throwable $e) {
            return ['storage' => ['status' => 'error', 'message' => $e->getMessage()]];
        }
    }

    public function check(string $name): array
    {
        $method = $name;

        if (method_exists($this, $method)) {
            return $this->$method();
        }

        return [$name => ['status' => 'unknown']];
    }
}
