<?php

namespace App\Repositories\Rating;

use App\Models\Rating\RatingCategory;

class RatingCategoryRepository
{
    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, RatingCategory>
     */
    public function active(string $context = 'driver')
    {
        return RatingCategory::where('status', 'active')
            ->where('context', $context)
            ->orderBy('name')
            ->get();
    }
}
