<?php

namespace App\Models\Api;

use Illuminate\Database\Eloquent\Model;

class ApiScope extends Model
{
    protected $fillable = ['code', 'name', 'module', 'description'];

    public function isSystem(): bool
    {
        return in_array($this->code, ['trips.read', 'trips.write', 'bookings.read', 'payments.read', 'notifications.read'], true);
    }
}
