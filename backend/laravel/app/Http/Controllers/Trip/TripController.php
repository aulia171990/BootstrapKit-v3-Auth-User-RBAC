<?php

namespace App\Http\Controllers\Trip;

use App\DTOs\Trip\CancelTripData;
use App\DTOs\Trip\CompleteTripData;
use App\DTOs\Trip\CreateTripData;
use App\DTOs\Trip\SOSData;
use App\DTOs\Trip\StartTripData;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\AuditLog;
use App\Models\Trip;
use App\Services\Trip\TripCancellationService;
use App\Services\Trip\TripFareService;
use App\Services\Trip\TripLifecycleService;
use App\Services\Trip\TripSOSService;
use App\Services\Trip\TripTrackingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TripController extends Controller
{
    public function __construct(
        private TripLifecycleService $lifecycle,
        private TripTrackingService $tracking,
        private TripFareService $fare,
        private TripCancellationService $cancellation,
        private TripSOSService $sos,
    ) {}

    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('trip.view');

        $trips = Trip::query()
            ->with(['customer', 'driver'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return ApiResponse::success($trips);
    }

    public function show(Request $request, Trip $trip): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('trip.view');

        return ApiResponse::success($trip);
    }

    public function arrive(Request $request, Trip $trip): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('trip.update');

        $updated = $this->lifecycle->arrive($trip, $request->user());

        $this->recordAudit(AuditLog::ACTION_DRIVER_OFFER_SENT, $updated);

        return ApiResponse::success($updated, 'Driver arrived');
    }

    public function pickup(Request $request, Trip $trip): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('trip.update');

        $updated = $this->lifecycle->pickup($trip, $request->user());

        $this->recordAudit(AuditLog::ACTION_DRIVER_ASSIGNED, $updated);

        return ApiResponse::success($updated, 'Passenger picked up');
    }

    public function start(Request $request, Trip $trip): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('trip.update');

        $dto = StartTripData::fromRequest($request);

        $updated = $this->lifecycle->start($trip, $request->user(), $dto);

        $this->recordAudit(AuditLog::ACTION_DISPATCH_STARTED, $updated);

        return ApiResponse::success($updated, 'Trip started');
    }

    public function complete(Request $request, Trip $trip): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('trip.complete');

        $dto = CompleteTripData::fromRequest($request);

        $updated = $this->lifecycle->complete($trip, $request->user(), $dto);

        $this->fare->updateFare($updated, $dto->finalFare, $dto->actualDistance, $dto->actualDuration);

        $this->recordAudit(AuditLog::ACTION_DRIVER_ASSIGNED, $updated);

        return ApiResponse::success($updated, 'Trip completed');
    }

    public function cancel(Request $request, Trip $trip): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('trip.cancel');

        $dto = CancelTripData::fromRequest($request);

        $updated = $this->cancellation->cancel($trip, $dto->reason);

        $this->recordAudit(AuditLog::ACTION_DISPATCH_FAILED, $updated);

        return ApiResponse::success($updated, 'Trip cancelled');
    }

    public function sos(Request $request, Trip $trip): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('trip.manage');

        $dto = SOSData::fromRequest($request);

        $updated = $this->sos->trigger($trip, $dto->note);

        $this->recordAudit(AuditLog::ACTION_TRIP_SOS, $updated);

        return ApiResponse::success($updated, 'SOS activated');
    }

    public function timeline(Request $request, Trip $trip): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('trip.view');

        $items = $trip->statusHistory()
            ->orderByDesc('occurred_at')
            ->get();

        return ApiResponse::success($items);
    }

    public function locations(Request $request, Trip $trip): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('trip.view');

        $items = $trip->locations()
            ->orderByDesc('recorded_at')
            ->paginate(50);

        return ApiResponse::success($items);
    }

    protected function requirePermission(string $permission): void
    {
        $user = request()->user();
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'Akses ditolak');
        }
    }

    protected function recordAudit(string $action, Trip $trip): void
    {
        if (! Auth::check()) {
            return;
        }

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'ip_address' => request()->ip(),
            'actor_email' => Auth::user()?->email,
            'context' => ['trip_id' => $trip->id, 'trip_code' => $trip->trip_code],
        ]);
    }
}