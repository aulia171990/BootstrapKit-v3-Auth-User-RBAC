<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Events\OrderMatched;
use App\Events\OrderStatusUpdated;
use App\Events\DriverLocationUpdated;
use App\Models\Driver;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\User;
use App\Services\DriverLocationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    // List order: customer → miliknya; admin → semua
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->roles()->where('name', 'admin')->exists()) {
            $orders = Order::with(['customer', 'driver'])->paginate(20);
        } elseif ($user->roles()->where('name', 'driver')->exists()) {
            $driver = $user->driver;
            $orders = Order::where('driver_id', $driver?->id)->with(['customer', 'driver'])->paginate(20);
        } else {
            $orders = Order::where('customer_id', $user->id)->with(['customer', 'driver'])->paginate(20);
        }

        return response()->json(['success' => true, 'data' => $orders]);
    }

    // Customer buat order
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pickup_lat'     => 'required|numeric',
            'pickup_lng'     => 'required|numeric',
            'pickup_address' => 'sometimes|string',
            'dropoff_lat'    => 'required|numeric',
            'dropoff_lng'    => 'required|numeric',
            'dropoff_address'=> 'sometimes|string',
            'distance_km'    => 'sometimes|numeric|min:0',
            'price'          => 'sometimes|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $data['customer_id'] = $request->user()->id;
        $data['status'] = Order::STATUS_PENDING;

        $order = Order::create($data);
        $this->recordHistory($order, Order::STATUS_PENDING, 'Order dibuat');

        // ── Matching otomatis: cari driver terdekat & broadcast ──
        $candidates = app(DriverLocationService::class)->nearest(
            (float) $order->pickup_lat,
            (float) $order->pickup_lng
        );

        if (! empty($candidates)) {
            OrderMatched::dispatch($order, $candidates);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order dibuat',
            'data' => $order,
            'candidates' => collect($candidates)->map(fn ($d) => [
                'driver_id' => $d->id,
                'distance_km' => round($d->distance ?? 0, 2),
            ]),
        ], 201);
    }

    public function show(Order $order)
    {
        return response()->json(['success' => true, 'data' => $order->load(['customer', 'driver', 'histories'])]);
    }

    // Driver terima order
    public function accept(Request $request, Order $order)
    {
        if ($order->status !== Order::STATUS_PENDING) {
            return response()->json(['success' => false, 'message' => 'Order tidak bisa diterima'], 422);
        }

        $driver = $request->user()->driver;
        if (! $driver) {
            return response()->json(['success' => false, 'message' => 'Profil driver belum dibuat'], 404);
        }

        $order->update([
            'driver_id' => $driver->id,
            'status' => Order::STATUS_ACCEPTED,
        ]);
        $driver->update(['status' => Driver::STATUS_ON_TRIP]);
        $this->recordHistory($order, Order::STATUS_ACCEPTED, 'Diterima driver');

        // Realtime: kabari customer bahwa driver sudah menerima order.
        \App\Events\OrderStatusUpdated::dispatch($order, Order::STATUS_ACCEPTED, 'Diterima driver');

        return response()->json(['success' => true, 'message' => 'Order diterima', 'data' => $order]);
    }

    // Update status order
    public function updateStatus(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:accepted,ongoing,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $status = $validator->validated()['status'];
        $order->update(['status' => $status]);
        $this->recordHistory($order, $status);

        if ($status === Order::STATUS_COMPLETED) {
            if ($driver = $order->driver) {
                $driver->update(['status' => Driver::STATUS_ONLINE]);
            }
        }

        // Realtime: kabari customer & driver tentang perubahan status.
        \App\Events\OrderStatusUpdated::dispatch(
            $order->load('driver'),
            $status,
            'Status diubah menjadi ' . $status
        );

        return response()->json(['success' => true, 'message' => 'Status diupdate', 'data' => $order]);
    }

    // Lacak posisi driver (customer)
    public function track(Request $request, Order $order)
    {
        $driver = $order->driver;
        if (! $driver) {
            return response()->json(['success' => false, 'message' => 'Belum ada driver'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'order_id' => $order->id,
                'status' => $order->status,
                'driver' => $driver->only('id', 'latitude', 'longitude', 'status', 'vehicle_type'),
            ],
        ]);
    }

    // Driver push posisi live selama trip → broadcast ke customer (realtime).
    public function updateLocation(Request $request, Order $order)
    {
        $validator = Validator::make($request->all(), [
            'latitude'  => 'required|numeric',
            'longitude' => 'required|numeric',
            'heading'   => 'sometimes|numeric',
            'speed'     => 'sometimes|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $driver = $order->driver;
        if (! $driver) {
            return response()->json(['success' => false, 'message' => 'Belum ada driver'], 404);
        }

        // Hanya driver yang ditugaskan yang boleh push posisi.
        if ($request->user()->driver?->id !== $driver->id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $lat = (float) $request->latitude;
        $lng = (float) $request->longitude;

        // Simpan posisi terbaru + index ke Redis GEO (fail-safe).
        $driver->update(['latitude' => $lat, 'longitude' => $lng]);
        app(DriverLocationService::class)->upsert($driver->id, $lat, $lng);

        // Broadcast ke channel order.{id} (customer menerima realtime).
        DriverLocationUpdated::dispatch(
            $order->load('driver'),
            $lat,
            $lng,
            $request->heading !== null ? (float) $request->heading : null,
            $request->speed !== null ? (float) $request->speed : null
        );

        return response()->json([
            'success' => true,
            'message' => 'Posisi dikirim',
            'data' => [
                'order_id' => $order->id,
                'driver' => $driver->only('id', 'latitude', 'longitude', 'status'),
            ],
        ]);
    }

    protected function recordHistory(Order $order, string $status, ?string $note = null): void
    {
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'status' => $status,
            'note' => $note,
        ]);
    }
}
