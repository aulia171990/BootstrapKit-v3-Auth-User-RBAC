<?php

namespace App\Models\Payment;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentMethod extends Model
{
    protected $fillable = ['code', 'name', 'type', 'config', 'priority', 'active'];

    protected $casts = [
        'config' => 'array',
        'active' => 'boolean',
    ];

    public function transactions(): HasMany
    {
        return $this->hasMany(\App\Models\Payment\PaymentTransaction::class);
    }
}
