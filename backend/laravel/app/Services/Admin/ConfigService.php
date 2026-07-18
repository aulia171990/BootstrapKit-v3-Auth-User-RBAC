<?php

namespace App\Services\Admin;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

class ConfigService
{
    private array $managedKeys = [
        'payment.providers',
        'dispatch.max_distance_km',
        'notification.channels',
    ];

    public function list(): array
    {
        return Cache::remember('admin:config:allowed', 3600, function () {
            $out = [];
            foreach ($this->managedKeys as $key) {
                $out[$key] = Config::get($key);
            }

            return $out;
        });
    }

    public function update(array $values): array
    {
        $updated = [];
        foreach ($values as $key => $value) {
            if (in_array($key, $this->managedKeys, true)) {
                Cache::forget('admin:config:allowed');
                $updated[$key] = $value;
            }
        }

        return $updated;
    }
}
