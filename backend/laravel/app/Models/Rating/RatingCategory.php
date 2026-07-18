<?php

namespace App\Models\Rating;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class RatingCategory extends Model
{
    use HasUuids;

    protected $fillable = ['code', 'name', 'context', 'status'];

    protected $casts = [
        'status' => 'string',
    ];
}
