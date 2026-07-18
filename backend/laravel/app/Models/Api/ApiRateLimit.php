<?php

namespace App\Models\Api;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiRateLimit extends Model
{
    public $timestamps = false;

    protected $fillable = ['api_client_id', 'subject_type', 'subject_id', 'route', 'limit', 'remaining', 'resets_at'];

    protected $casts = [
        'resets_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(ApiClient::class, 'api_client_id');
    }
}
