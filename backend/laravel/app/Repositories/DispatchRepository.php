<?php

namespace App\Repositories;

use App\Models\DispatchJob;

class DispatchRepository
{
    public function create(array $data): DispatchJob
    {
        return DispatchJob::create($data);
    }

    public function findOrFail(string $id): DispatchJob
    {
        return DispatchJob::with(['candidates', 'attempts'])->findOrFail($id);
    }

    public function update(DispatchJob $job, array $data): DispatchJob
    {
        $job->forceFill($data)->save();

        return $job->fresh();
    }
}
