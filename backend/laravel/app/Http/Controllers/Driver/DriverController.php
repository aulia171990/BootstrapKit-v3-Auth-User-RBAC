<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Driver;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DriverController extends Controller
{
    // List driver (admin only) atau profil sendiri (driver/customer)
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->hasPermission('order.view.all')) {
            return ApiResponse::success(Driver::with('user')->paginate(20));
        }

        $driver = $user->driver;
        if (! $driver) {
            return ApiResponse::error('Profil driver belum dibuat', 404);
        }

        return ApiResponse::success($driver->load('user'));
    }

    // Buat / update profil driver
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'license_plate' => 'required|string|max:20',
            'vehicle_type'  => 'required|in:motorcycle,car',
        ]);

        if ($validator->fails()) {
            return ApiResponse::validation($validator->errors()->toArray());
        }

        $driver = Driver::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'license_plate' => $request->license_plate,
                'vehicle_type'  => $request->vehicle_type,
                'status'        => Driver::STATUS_OFFLINE,
            ]
        );

        return ApiResponse::created($driver, 'Profil driver tersimpan');
    }

    public function show(Driver $driver)
    {
        return ApiResponse::success($driver->load('user'));
    }

    public function update(Request $request, Driver $driver)
    {
        $this->authorizeOwner($request, $driver);

        $validator = Validator::make($request->all(), [
            'license_plate' => 'sometimes|string|max:20',
            'vehicle_type'  => 'sometimes|in:motorcycle,car',
            'status'        => 'sometimes|in:offline,online,on_trip',
        ]);

        if ($validator->fails()) {
            return ApiResponse::validation($validator->errors()->toArray());
        }

        $driver->update($validator->validated());

        return ApiResponse::success($driver, 'Driver diupdate');
    }

    // Update lokasi (real-time). Untuk produksi: push ke Redis GEO.
    public function updateLocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return ApiResponse::validation($validator->errors()->toArray());
        }

        $driver = $request->user()->driver;
        if (! $driver) {
            return ApiResponse::error('Profil driver belum dibuat', 404);
        }

        $driver->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            // Jangan timpa status on_trip saat driver sedang trip (live ping).
            'status' => $driver->status === Driver::STATUS_ON_TRIP
                ? Driver::STATUS_ON_TRIP
                : Driver::STATUS_ONLINE,
        ]);

        // Index ke Redis GEO untuk matching (fail-safe kalau Redis mati).
        app(\App\Services\DriverLocationService::class)->upsert(
            $driver->id, (float) $request->latitude, (float) $request->longitude
        );

        // Broadcast posisi terbaru ke semua order yang sedang ditangani
        // driver ini dan masih aktif (accepted / ongoing) → live tracking.
        $this->broadcastLiveLocation($driver, (float) $request->latitude, (float) $request->longitude);

        return ApiResponse::success($driver->only('latitude', 'longitude', 'status'), 'Lokasi diupdate');
    }

    /**
     * Broadcast posisi driver ke channel order yang sedang aktif.
     * Hanya order dengan driver_id == driver ini dan status accepted/ongoing
     * yang menerima update (customer melihat driver bergerak realtime).
     */
    protected function broadcastLiveLocation(Driver $driver, float $lat, float $lng): void
    {
        $active = \App\Models\Order::query()
            ->where('driver_id', $driver->id)
            ->whereIn('status', [\App\Models\Order::STATUS_ACCEPTED, \App\Models\Order::STATUS_ONGOING])
            ->with('driver')
            ->get();

        foreach ($active as $order) {
            \App\Events\DriverLocationUpdated::dispatch($order, $lat, $lng);
        }
    }

    // Cari driver terdekat (untuk matching)
    public function nearby(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius_km' => 'sometimes|numeric|min:0.1|max:50',
        ]);

        if ($validator->fails()) {
            return ApiResponse::validation($validator->errors()->toArray());
        }

        $radius = $request->input('radius_km', 5);
        $lat = $request->lat;
        $lng = $request->lng;

        // Haversine dibungkus subquery agar kompatibel Postgres & SQLite
        // (Postgres tidak mengizinkan HAVING memakai alias kolom hasil select).
        $haversine = '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))';

        $sub = Driver::query()
            ->where('status', Driver::STATUS_ONLINE)
            ->selectRaw('*')
            ->selectRaw($haversine . ' AS distance', [$lat, $lng, $lat]);

        $drivers = Driver::fromSub($sub, 'd')
            ->where('distance', '<=', $radius)
            ->orderBy('distance')
            ->with('user')
            ->get();

        return ApiResponse::success($drivers);
    }

    protected function authorizeOwner(Request $request, Driver $driver): void
    {
        if ($request->user()->id !== $driver->user_id) {
            abort(403, 'Akses ditolak');
        }
    }
}
