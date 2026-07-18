<?php

namespace App\Http\Controllers\Dispatch;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\AuditLog;
use App\Models\DispatchJob;
use App\Services\DispatchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DispatchController extends Controller
{
    public function __construct(private DispatchService $dispatch) {}

    public function start(Request $request, Booking $booking): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('dispatch.manage');

        $job = $this->dispatch->start($booking, [
            'requested_by' => $request->user()->id,
        ]);

        $this->recordAudit(AuditLog::ACTION_DISPATCH_STARTED, $request->user(), $job);

        return ApiResponse::success($job, 'Dispatch started', 201);
    }

    public function show(Request $request, string $dispatchJob): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('dispatch.view');

        $job = $this->dispatch->dispatches->findOrFail($dispatchJob);

        return ApiResponse::success($job);
    }

    public function retry(Request $request, string $dispatchJob): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('dispatch.retry');

        $this->dispatch->retry($dispatchJob);

        $job = $this->dispatch->dispatches->findOrFail($dispatchJob);

        $this->recordAudit(AuditLog::ACTION_DISPATCH_STARTED, $request->user(), $job);

        return ApiResponse::success($job, 'Dispatch retried');
    }

    public function cancel(Request $request, string $dispatchJob): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('dispatch.manage');

        $job = $this->dispatch->dispatches->findOrFail($dispatchJob);

        $this->recordAudit(AuditLog::ACTION_DISPATCH_FAILED, $request->user(), $job, ['note' => 'Cancelled by admin']);

        return ApiResponse::success($job, 'Dispatch cancelled');
    }

    public function jobs(Request $request): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('dispatch.view');

        $jobs = DispatchJob::query()
            ->orderByDesc('started_at')
            ->paginate(20);

        return ApiResponse::success($jobs);
    }

    public function history(Request $request): \Illuminate\Http\JsonResponse
    {
        $this->requirePermission('dispatch.history');

        $jobs = DispatchJob::query()
            ->whereIn('status', ['failed', 'completed'])
            ->orderByDesc('started_at')
            ->paginate(20);

        return ApiResponse::success($jobs);
    }

    protected function requirePermission(string $permission): void
    {
        $user = request()->user();
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'Akses ditolak');
        }
    }

    protected function recordAudit(string $action, $user, DispatchJob $job, array $context = []): void
    {
        AuditLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'ip_address' => request()->ip(),
            'actor_email' => $user->email,
            'context' => array_merge(['dispatch_job_id' => $job->id], $context),
        ]);
    }
}