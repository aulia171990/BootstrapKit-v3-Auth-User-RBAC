<?php

namespace App\Models\Promotion;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class PromotionUsage extends Model
{
    use HasUuids;

    protected $table = 'promotion_usage';

    public $timestamps = true;

    protected $fillable = [
        'promotion_id', 'user_id', 'booking_id', 'date', 'count',
    ];

    protected $casts = [
        'date' => 'date',
        'count' => 'integer',
    ];

    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
