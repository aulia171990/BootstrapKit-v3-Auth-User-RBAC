<?php

namespace App\Http\Controllers\Operation;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Operation\OperationsService;
use Illuminate\Http\Request;

class OperationController extends Controller
{
    public function __construct(private OperationsService $operations) {}

    public function dashboard(Request $request)
    {
        return ApiResponse::success($this->operations->dashboard());
    }

    public function incidents(Request $request)
    {
        $filters = $request->only(['status', 'type', 'priority', 'trip_id']);
        $perPage = (int) $request->input('per_page', 20);

        return ApiResponse::success($this->operations->incidents($filters, $perPage));
    }

    public function storeIncident(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:sos,payment_failed,dispatch_failed,safety,other'],
            'status' => ['sometimes', 'string', 'in:open,acknowledged,escalated,resolved,closed'],
            'priority' => ['sometimes', 'string', 'in:low,medium,high,critical'],
            'description' => ['nullable', 'string'],
            'trip_id' => ['nullable', 'string'],
            'driver_id' => ['nullable', 'string'],
            'customer_id' => ['nullable', 'string'],
        ]);

        $validated['created_by'] = (string) $request->user()->id;
        $incident = app(\App\Services\Operation\IncidentService::class)->create($validated);

        return ApiResponse::success($incident, 'Incident created', 201);
    }

    public function updateIncident(Request $request, string $id)
    {
        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:open,acknowledged,escalated,resolved,closed'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,critical'],
            'description' => ['nullable', 'string'],
            'assigned_to' => ['nullable', 'string'],
        ]);

        $incident = app(\App\Repositories\Operation\OperationIncidentRepository::class)->update($id, array_merge($validated, ['action' => 'update']));

        return ApiResponse::success($incident, 'Incident updated');
    }

    public function sos(Request $request)
    {
        return ApiResponse::success(app(\App\Services\Operation\SOSService::class)->listActive());
    }

    public function manualDispatch(Request $request)
    {
        $validated = $request->validate([
            'trip_id' => ['nullable', 'string'],
            'driver_id' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $action = app(\App\Services\Operation\ManualDispatchService::class)->dispatch($validated, (string) $request->user()->id);

        return ApiResponse::success($action, 'Manual dispatch initiated', 201);
    }

    public function reassignDriver(Request $request)
    {
        $validated = $request->validate([
            'trip_id' => ['required', 'string'],
            'driver_id' => ['required', 'string'],
        ]);

        return ApiResponse::success(['message' => 'Driver reassigned'], 'Driver reassigned');
    }

    public function forceDriverOffline(Request $request)
    {
        $request->validate([
            'driver_id' => ['required', 'string'],
        ]);

        return ApiResponse::success(null, 'Driver forced offline');
    }

    public function alerts(Request $request)
    {
        return ApiResponse::success($this->operations->alerts((int) $request->input('per_page', 50)));
    }
}
