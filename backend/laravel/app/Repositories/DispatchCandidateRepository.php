<?php

namespace App\Repositories;

use App\Models\DispatchCandidate;

class DispatchCandidateRepository
{
    public function createMany(string $dispatchJobId, array $candidates): void
    {
        foreach ($candidates as $candidate) {
            DispatchCandidate::create(array_merge($candidate, ['dispatch_job_id' => $dispatchJobId]));
        }
    }

    public function getTop(string $dispatchJobId, int $limit = 5): array
    {
        return DispatchCandidate::where('dispatch_job_id', $dispatchJobId)
            ->orderByDesc('score')
            ->limit($limit)
            ->get()
            ->all();
    }

    public function markSent(string $id, array $data): void
    {
        DispatchCandidate::where('id', $id)->update(array_merge($data, ['offer_sent_at' => now()]));
    }
}
