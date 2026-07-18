<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DriverBankAccount extends Model
{
    use HasUuids;

    protected $fillable = [
        'driver_id',
        'bank_name',
        'account_number',
        'account_holder_name',
        'account_holder_id',
        'is_primary',
    ];

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }
}
