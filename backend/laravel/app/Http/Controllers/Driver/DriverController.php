<?php

namespace App\Http\Controllers\Driver;

use App\Events\DriverApproved;
use App\Events\DriverRejected;
use App\Events\DriverSuspended;
use App\Events\DriverStatusChanged;
use App\Http\Controllers\Controller;
use App\Http\Requests\Driver\ApproveDriverRequest;
use App\Http\Requests\Driver\LocationUpdateRequest;
use App\Http\Requests\Driver\UpdateDriverRequest;
use App\Http\Requests\Driver\UploadDocumentRequest;
use App\Http\Responses\ApiResponse;
use App\Models\AuditLog;
use App\Models\Driver;
use App\Repositories\LocationRepository;
use App\Services\DriverLocationService;
use App\Services\DriverService;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    public function __construct(
        private DriverService $driverService,
        private DriverLocationService $locationService,
        private LocationRepository $locationRepository,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->hasPermission('driver.view')) {
            return ApiResponse::success(Driver::with('user')->paginate(20));
        }

        $driver = $user->driver;
        if (! $driver) {
            return ApiResponse::error('Profil driver belum dibuat', 404);
        }

        return ApiResponse::success($driver->load('user'));
    }

    public function show(Driver $driver)
    {
        return ApiResponse::success($driver->load('user', 'documents', 'vehicles'));
    }

    public function update(UpdateDriverRequest $request, Driver $driver)
    {
        $this->authorizeOwnerOrAdmin($request, $driver);

        $driver = $this->driverService->updateProfile(
            (string) $driver->user_id,
            $request->validated()
        );

        return ApiResponse::success($driver, 'Driver updated');
    }

    public function approve(ApproveDriverRequest $request, Driver $driver)
    {
        $this->authorize('driver.approve');

        $driver = $this->driverService->approve($driver, $request->user()->id);

        $this->recordAudit(AuditLog::ACTION_DRIVER_APPROVED, $request->user(), $driver, [
            'note' => $request->note,
        ]);

        return ApiResponse::success($driver, 'Driver approved');
    }

    public function reject(Request $request, Driver $driver)
    {
        $this->authorize('driver.reject');

        $driver = $this->driverService->reject($driver, $request->user()->id, $request->input('note'));

        $this->recordAudit(AuditLog::ACTION_DRIVER_REJECTED, $request->user(), $driver, [
            'note' => $request->input('note'),
        ]);

        return ApiResponse::success($driver, 'Driver rejected');
    }

    public function suspend(Request $request, Driver $driver)
    {
        $this->authorize('driver.suspend');

        $driver = $this->driverService->suspend($driver, $request->user()->id, $request->input('note'));

        $this->recordAudit(AuditLog::ACTION_DRIVER_SUSPENDED, $request->user(), $driver, [
            'note' => $request->input('note'),
        ]);

        return ApiResponse::success($driver, 'Driver suspended');
    }

    public function online(Request $request, Driver $driver)
    {
        $this->authorizeOwnerOrAdmin($request, $driver);

        $driver = $this->driverService->goOnline($driver);

        DriverStatusChanged::dispatch($driver);

        return ApiResponse::success($driver, 'Driver online');
    }

    public function offline(Request $request, Driver $driver)
    {
        $this->authorizeOwnerOrAdmin($request, $driver);

        $driver = $this->driverService->goOffline($driver);

        DriverStatusChanged::dispatch($driver);

        return ApiResponse::success($driver, 'Driver offline');
    }

    public function updateLocation(LocationUpdateRequest $request)
    {
        $user = $request->user();

        $driver = $user->driver ?? \App\Repositories\DriverRepository::findByUserId((string) $user->id);
        if (! $driver) {
            return ApiResponse::error('Profil driver belum dibuat', 404);
        }

        $this->locationService->recordLocation(
            (string) $driver->id,
            $request->validated('lat'),
            $request->validated('lng'),
        );

        return ApiResponse::success([
            'driver_id' => $driver->id,
            'latitude' => (float) $request->input('lat'),
            'longitude' => (float) $request->input('lng'),
        ], 'Location updated');
    }

    public function nearby(Request $request)
    {
        $request->validate([
            'lat' => 'required|numeric',
            'lng' => 'required|numeric',
            'radius' => 'nullable|numeric|min:0.5|max:50',
        ]);

        $user = $request->user();
        if ($user->driver) {
            $this->locationRepository->recordDriverLocation(
                (string) $user->driver->id,
                (float) $request->input('lat'),
                (float) $request->input('lng'),
            );
        }

        $available = \App\Services\DriverAvailabilityService::findAvailableForUser(
            $user,
            (float) $request->input('lat'),
            (float) $request->input('lng'),
            (float) ($request->filled('radius') ? $request->input('radius') : 5),
        );

        return ApiResponse::success($available, 'Nearby drivers');
    }

    public function documents(Request $request, Driver $driver)
    {
        $this->authorizeOwnerOrAdmin($request, $driver);

        return ApiResponse::success($driver->documents()->get());
    }

    public function uploadDocument(UploadDocumentRequest $request, Driver $driver)
    {
        $this->authorizeOwnerOrAdmin($request, $driver);

        $document = $driver->documents()->create($request->validated() + ['verification_status' => 'pending']);

        $this->recordAudit(AuditLog::ACTION_DOCUMENT_UPLOADED, $request->user(), $driver, [
            'document_type' => $request->type,
        ]);

        return ApiResponse::success($document, 'Document uploaded', 201);
    }

    protected function authorizeOwnerOrAdmin(Request $request, Driver $driver): void
    {
        $user = $request->user();
        if ($user->hasRole('admin') || $user->id === $driver->user_id) {
            return;
        }

        abort(403, 'Akses ditolak');
    }

    protected function requirePermission(string $permission): void
    {
        $user = request()->user();
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'Akses ditolak');
        }
    }

    protected function recordAudit(string $action, $user, Driver $driver, array $context = []): void
    {
        AuditLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'ip_address' => request()->ip(),
            'actor_email' => $user->email,
            'context' => array_merge(['driver_id' => $driver->id], $context),
        ]);
    }
}
