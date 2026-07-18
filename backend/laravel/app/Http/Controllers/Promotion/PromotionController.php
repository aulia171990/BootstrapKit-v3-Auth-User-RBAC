<?php

namespace App\Http\Controllers\Promotion;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Promotion\CampaignService;
use App\Services\Promotion\PromotionService;
use App\Services\Promotion\VoucherService;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function __construct(
        private PromotionService $promotions,
        private VoucherService $vouchers,
        private CampaignService $campaigns,
    ) {}

    public function index(Request $request)
    {
        return ApiResponse::success($this->promotions->paginateActive((int) ($request->input('per_page', 20))));
    }

    public function show(Request $request, string $id)
    {
        return ApiResponse::success($this->promotions->find($id) ?? (object) []);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:100'],
            'discount_type' => ['required', 'string', 'in:percentage,fixed,cashback'],
            'discount_value' => ['required', 'integer', 'min:0'],
            'min_fare' => ['nullable', 'integer', 'min:0'],
            'max_discount' => ['nullable', 'integer', 'min:0'],
            'max_usage' => ['nullable', 'integer', 'min:1'],
            'max_usage_per_user' => ['nullable', 'integer', 'min:1'],
            'daily_limit' => ['nullable', 'integer', 'min:1'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date'],
            'rules' => ['nullable', 'array'],
            'rules.*.type' => ['required', 'string'],
            'rules.*.operator' => ['required', 'string'],
            'rules.*.value' => ['nullable', 'array'],
            'rules.*.comparison_value' => ['nullable', 'array'],
        ]);

        $promotion = $this->promotions->create($validated);

        return ApiResponse::success($promotion, 'Promotion created', 201);
    }

    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'in:draft,active,paused,expired'],
            'discount_value' => ['nullable', 'integer', 'min:0'],
            'min_fare' => ['nullable', 'integer', 'min:0'],
            'max_discount' => ['nullable', 'integer', 'min:0'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $promotion = $this->promotions->find($id);

        if (! $promotion) {
            return ApiResponse::error('Promotion not found', 404);
        }

        $promotion->forceFill($validated)->save();

        return ApiResponse::success($promotion, 'Promotion updated');
    }

    public function destroy(Request $request, string $id)
    {
        $promotion = $this->promotions->find($id);

        if (! $promotion) {
            return ApiResponse::error('Promotion not found', 404);
        }

        $promotion->forceFill(['status' => 'expired'])->save();

        return ApiResponse::success(null, 'Promotion expired');
    }

    public function validatePromotion(Request $request)
    {
        $validated = $request->validate([
            'promotion_id' => ['required', 'string'],
            'fare' => ['required', 'integer', 'min:0'],
            'city' => ['nullable', 'string'],
            'vehicle_type' => ['nullable', 'string'],
            'service_type' => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string'],
        ]);

        $promotion = $this->promotions->validate($validated['promotion_id'], $validated);

        return ApiResponse::success($promotion, 'Promotion is valid');
    }

    public function applyPromotion(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'promotion_id' => ['required', 'string'],
            'fare' => ['required', 'integer', 'min:0'],
            'city' => ['nullable', 'string'],
            'vehicle_type' => ['nullable', 'string'],
            'service_type' => ['nullable', 'string'],
            'payment_method' => ['nullable', 'string'],
            'booking_id' => ['nullable', 'string'],
        ]);

        $context = array_merge($validated, ['user_id' => $user?->id]);

        return ApiResponse::success($this->promotions->apply($validated['promotion_id'], $context), 'Promotion applied');
    }

    public function history(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'promotion_id' => ['nullable', 'string'],
        ]);

        $history = app(\App\Repositories\Promotion\PromotionRedemptionRepository::class)->userRedemptions(
            (string) $user->id,
            $validated['promotion_id'] ?? null,
        );

        return ApiResponse::success($history);
    }
}
