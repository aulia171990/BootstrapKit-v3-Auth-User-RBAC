<?php

namespace App\Models\Promotion;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PromotionCampaign extends Model
{
    use HasUuids;

    protected $fillable = [
        'code', 'name', 'description', 'type', 'status',
        'starts_at', 'ends_at', 'budget', 'currency', 'metadata',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'budget' => 'integer',
        'metadata' => 'array',
    ];

    public function promotions(): HasMany
    {
        return $this->hasMany(Promotion::class, 'campaign_id');
    }
}
