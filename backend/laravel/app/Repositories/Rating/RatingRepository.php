<?php

namespace App\Repositories\Rating;

use App\Models\Rating\Rating;
use Illuminate\Database\Eloquent\Builder;

class RatingRepository
{
    public function create(array $data): Rating
    {
        return Rating::create($data);
    }

    public function find(string $id): ?Rating
    {
        return Rating::find($id);
    }

    public function findByTripParticipant(string $tripId, string $raterId, string $ratedId): ?Rating
    {
        return Rating::where('trip_id', $tripId)
            ->where('rater_user_id', $raterId)
            ->where('rated_user_id', $ratedId)
            ->first();
    }

    /**
     * @return array<string,mixed>
     */
    public function statsForUser(string $userId): array
    {
        $ratings = Rating::where('rated_user_id', $userId)->get();

        $count = $ratings->count();
        $average = $count > 0 ? (float) $ratings->avg('score') : 0.0;
        $distribution = [];
        foreach (range(1, 5) as $star) {
            $distribution[$star] = $ratings->where('score', $star)->count();
        }

        $categoryAverages = [];
        foreach ($ratings as $rating) {
            if (is_array($rating->category_scores)) {
                foreach ($rating->category_scores as $category => $value) {
                    $categoryAverages[$category][] = (float) $value;
                }
            }
        }

        foreach ($categoryAverages as $category => $values) {
            $categoryAverages[$category] = round(array_sum($values) / count($values), 2);
        }

        return [
            'average' => round($average, 2),
            'count' => $count,
            'distribution' => $distribution,
            'category_averages' => $categoryAverages,
        ];
    }

    /**
     * @return \Illuminate\Contracts\Pagination\Paginator<Rating>
     */
    public function paginateActive(int $perPage = 20)
    {
        return Rating::where('status', 'active')->latest()->paginate($perPage);
    }
}
