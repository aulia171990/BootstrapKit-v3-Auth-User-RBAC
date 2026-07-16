<?php

namespace App\Services;

use App\Models\Driver;
use Illuminate\Support\Facades\Redis;

class DriverLocationService
{
    public const GEO_KEY = 'drivers:geo';

    /**
     * Simpan posisi driver ke Redis GEO (jika Redis tersedia).
     * Gagal silently — matching tetap jalan via fallback DB.
     */
    public function upsert(string $driverId, float $lat, float $lng): void
    {
        try {
            Redis::geoadd(self::GEO_KEY, $lng, $lat, (string) $driverId);
        } catch (\Throwable $e) {
            // Redis tidak tersedia — abaikan, fallback ke DB Haversine.
        }
    }

    /**
     * Cari N driver online terdekat.
     * Prioritas: Redis GEO (GEORADIUS). Fallback: query Haversine ke PostgreSQL.
     */
    public function nearest(float $lat, float $lng, int $limit = 5, float $radiusKm = 10): array
    {
        try {
            $ids = Redis::georadius(self::GEO_KEY, $lng, $lat, $radiusKm, 'km', [
                'WITHDIST' => true,
                'ASC' => true,
                'COUNT' => $limit,
            ]);
            if (! empty($ids)) {
                return $this->hydrate($ids, true);
            }
        } catch (\Throwable $e) {
            // fall through to DB
        }

        return $this->nearestByDb($lat, $lng, $limit, $radiusKm);
    }

    protected function nearestByDb(float $lat, float $lng, int $limit, float $radiusKm): array
    {
        $haversine = '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))';

        $sub = Driver::query()
            ->where('status', Driver::STATUS_ONLINE)
            ->whereNotNull('latitude')
            ->selectRaw('*')
            ->selectRaw($haversine . ' AS distance', [$lat, $lng, $lat]);

        return Driver::fromSub($sub, 'd')
            ->where('distance', '<=', $radiusKm)
            ->orderBy('distance')
            ->limit($limit)
            ->with('user')
            ->get()
            ->all();
    }

    protected function hydrate(array $ids, bool $fromRedis): array
    {
        // $ids: [['member', dist], ...] (WITHDIST)
        $drivers = [];
        foreach ($ids as $row) {
            $driver = Driver::with('user')->find($row[0]);
            if ($driver) {
                $driver->distance = (float) $row[1];
                $drivers[] = $driver;
            }
        }

        return $drivers;
    }
}
