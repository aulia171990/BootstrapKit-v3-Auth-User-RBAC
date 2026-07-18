<?php

namespace App\Http\Controllers\Pricing;

use App\Events\FareCalculated;
use App\Events\FareEstimated;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\AuditLog;
use App\Models\PricingRule;
use App\Repositories\PricingLogRepository;
use App\Repositories\PricingRuleRepository;
use App\Services\AirportFeeService;
use App\Services\FareEstimatorService;
use App\Services\PricingEngineService;
use App\Services\PricingRuleResolver;
use App\Services\SurgePricingService;
use App\Services\TollFeeService;
use App\Services\WaitingFeeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PricingController extends Controller
{
    public function __construct(
        private FareEstimatorService $estimator,
        private PricingEngineService $engine,
        private PricingRuleResolver $ruleResolver,
        private SurgePricingService $surge,
        private WaitingFeeService $waiting,
        private TollFeeService $toll,
        private AirportFeeService $airport,
        private PricingRuleRepository $rules,
        private PricingLogRepository $logs,
    ) {}

    public function estimate(Request $request)
    {
        $this->requirePermission('pricing.view');

        $result = $this->estimator->estimate($request->validated());

        FareEstimated::dispatch($result->toArray(), $request->input('booking_id'), $request->input('trip_id'));

        return ApiResponse::success($result->toArray());
    }

    public function calculate(Request $request)
    {
        $this->requirePermission('pricing.calculate');

        $result = $this->engine->estimate(app(\App\DTOs\Pricing\CalculationInput::class)->fromArray($request->validated()));

        FareCalculated::dispatch($result->toArray(), $request->input('booking_id'), $request->input('trip_id'));

        return ApiResponse::success($result->toArray());
    }

    public function rules(Request $request)
    {
        $this->requirePermission('pricing.view');

        return ApiResponse::success(
            PricingRule::query()
                ->orderByDesc('effective_from')
                ->paginate(20)
        );
    }

    public function storeRule(\App\Http\Requests\Pricing\StorePricingRuleRequest $request)
    {
        $this->requirePermission('pricing.manage');
        $this->ensureNoConflictingRule($request->validated());

        $rule = $this->rules->create($request->validated());

        $this->recordAudit(AuditLog::ACTION_TRIP_CREATED, [
            'pricing_rule_id' => $rule->id,
            'action' => 'pricing_rule_created',
            'input' => $rule->toArray(),
        ]);
        \App\Events\PricingRuleChanged::dispatch($rule->id, 'created');

        return ApiResponse::success($rule, 'Pricing rule created', 201);
    }

    public function updateRule(Request $request, PricingRule $rule)
    {
        $this->requirePermission('pricing.manage');

        $rule = $this->rules->update($rule, $request->validate([
            'base_fare' => 'sometimes|numeric|min:0',
            'minimum_fare' => 'sometimes|numeric|min:0',
            'per_km_rate' => 'sometimes|numeric|min:0',
            'per_minute_rate' => 'sometimes|numeric|min:0',
            'active' => 'sometimes|boolean',
            'effective_from' => 'sometimes|date',
            'effective_until' => 'sometimes|date|after:effective_from',
        ]));

        $this->recordAudit(AuditLog::ACTION_TRIP_CREATED, [
            'pricing_rule_id' => $rule->id,
            'action' => 'pricing_rule_updated',
            'input' => $rule->toArray(),
        ]);
        \App\Events\PricingRuleChanged::dispatch($rule->id, 'updated');

        return ApiResponse::success($rule);
    }

    public function deleteRule(Request $request, PricingRule $rule)
    {
        $this->requirePermission('pricing.manage');

        $rule->update(['active' => false]);

        $this->recordAudit(AuditLog::ACTION_TRIP_CREATED, [
            'pricing_rule_id' => $rule->id,
            'action' => 'pricing_rule_deleted',
        ]);
        \App\Events\PricingRuleChanged::dispatch($rule->id, 'deleted');

        return ApiResponse::success(null, 'Pricing rule deactivated');
    }

    public function history(Request $request)
    {
        $this->requirePermission('pricing.audit');

        return ApiResponse::success(
            $this->logs->recent($request->only(['booking_id', 'trip_id', 'pricing_rule_id']))
        );
    }

    protected function requirePermission(string $permission): void
    {
        $user = request()->user();
        if (! $user || ! $user->hasPermission($permission)) {
            abort(403, 'Akses ditolak');
        }
    }

    protected function recordAudit(string $action, array $context = []): void
    {
        if (! Auth::check()) {
            return;
        }

        AuditLog::create(array_merge($context, [
            'user_id' => Auth::id(),
            'action' => $action,
            'ip_address' => request()->ip(),
            'actor_email' => Auth::user()?->email,
        ]));
    }

    private function ensureNoConflictingRule(array $data): void
    {
        $exists = PricingRule::query()
            ->where('city', $data['city'])
            ->where('service_type', $data['service_type'] ?? null)
            ->where('vehicle_type', $data['vehicle_type'] ?? null)
            ->where('active', true)
            ->exists();

        if ($exists) {
            abort(409, 'Conflicting active pricing rule exists for this combination.');
        }
    }
}
