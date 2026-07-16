<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasUuids;

    protected $fillable = [
        'order_id',
        'method',   // cash | cashless
        'amount',
        'status',   // unpaid | paid
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'float',
        'paid_at' => 'datetime',
    ];

    public const METHOD_CASH = 'cash';
    public const METHOD_CASHLESS = 'cashless';

    public const STATUS_UNPAID = 'unpaid';
    public const STATUS_PAID = 'paid';

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
