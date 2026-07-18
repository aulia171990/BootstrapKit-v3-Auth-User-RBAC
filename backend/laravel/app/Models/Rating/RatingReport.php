<?php

namespace App\Models\Rating;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RatingReport extends Model
{
    use HasUuids;

    protected $fillable = [
        'rating_id', 'review_id', 'reporter_user_id', 'reason', 'notes', 'status', 'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
        'status' => 'string',
    ];

    public function rating(): BelongsTo
    {
        return $this->belongsTo(Rating::class);
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(RatingReview::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_user_id');
    }
}
