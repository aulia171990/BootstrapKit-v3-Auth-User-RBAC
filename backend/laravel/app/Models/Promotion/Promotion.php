<?php

namespace App\Models\Promotion;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Promotion extends Model
{
    use HasUuids;

    protected $fillable = [
        'campaign_id', 'code', 'name', 'description', 'type', 'status',
        'discount_type', 'discount_value', 'currency',
        'min_fare', 'max_discount', 'max_usage', 'max_usage_per_user', 'daily_limit',
        'city_restriction', 'vehicle_type_restriction', 'service_type_restriction',
        'customer_segment', 'payment_method_restriction',
        'starts_at', 'expires_at', 'metadata',
    ];

    protected $casts = [
        'min_fare' => 'integer',
        'max_discount' => 'integer',
        'max_usage' => 'integer',
        'max_usage_per_user' => 'integer',
        'daily_limit' => 'integer',
        'discount_value' => 'integer',
        'city_restriction' => 'array',
        'vehicle_type_restriction' => 'array',
        'service_type_restriction' => 'array',
        'customer_segment' => 'array',
        'payment_method_restriction' => 'array',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function campaign(): BelongsTo
    {
        return $this->belongsTo(PromotionCampaign::class, 'campaign_id');
    }

    public function rules(): HasMany
    {
        return $this->hasMany(PromotionRule::class);
    }

    public function codes(): HasMany
    {
        return $this->hasMany(PromotionCode::class);
    }

    public function usages(): HasMany
    {
        return $this->hasMany(PromotionUsage::class);
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(PromotionRedemption::class);
    }
}
