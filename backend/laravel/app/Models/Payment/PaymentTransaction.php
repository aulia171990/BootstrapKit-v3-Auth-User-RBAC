<?php

namespace App\Models\Payment;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'booking_id',
        'trip_id',
        'payment_method_id',
        'type',
        'status',
        'amount',
        'currency',
        'reference',
        'provider_reference',
        'payload',
        'response',
        'processed_at',
        'failure_reason',
    ];

    protected $casts = [
        'payload' => 'array',
        'response' => 'array',
        'processed_at' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function splits(): HasMany
    {
        return $this->hasMany(\App\Models\Payment\PaymentSplit::class);
    }
}
