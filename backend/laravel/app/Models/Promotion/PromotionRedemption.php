<?php

namespace App\Models\Promotion;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PromotionRedemption extends Model
{
    use HasUuids;

    protected $fillable = [
        'promotion_id', 'promotion_code_id', 'user_id', 'booking_id',
        'payment_id', 'trip_id', 'order_id', 'wallet_transaction_id',
        'amount_used', 'currency', 'discount_type', 'status',
        'context', 'confirmed_at', 'reversed_at',
    ];

    protected $casts = [
        'amount_used' => 'integer',
        'context' => 'array',
        'confirmed_at' => 'datetime',
        'reversed_at' => 'datetime',
    ];

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function code(): BelongsTo
    {
        return $this->belongsTo(PromotionCode::class, 'promotion_code_id');
    }
}
