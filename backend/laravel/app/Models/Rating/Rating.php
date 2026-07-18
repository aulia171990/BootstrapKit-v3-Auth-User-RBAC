<?php

namespace App\Models\Rating;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Rating extends Model
{
    use HasUuids;

    protected $fillable = [
        'trip_id', 'rater_user_id', 'rated_user_id', 'score', 'comment',
        'is_anonymous', 'category_scores', 'status', 'reported_at', 'moderated_at',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'score' => 'integer',
        'category_scores' => 'array',
        'reported_at' => 'datetime',
        'moderated_at' => 'datetime',
    ];

    public function rater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rater_user_id');
    }

    public function rated(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rated_user_id');
    }

    public function review()
    {
        return $this->hasOne(RatingReview::class);
    }

    public function reports()
    {
        return $this->hasMany(RatingReport::class);
    }
}
