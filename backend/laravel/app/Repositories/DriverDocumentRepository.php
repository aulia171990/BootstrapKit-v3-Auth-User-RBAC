<?php

namespace App\Repositories;

use App\Models\DriverDocument;

class DriverDocumentRepository
{
    public function findOrFail(string $id): DriverDocument
    {
        return DriverDocument::findOrFail($id);
    }

    public function createForDriver(string $driverId, array $data): DriverDocument
    {
        return DriverDocument::create(array_merge($data, [
            'driver_id' => $driverId,
            'verification_status' => 'pending',
        ]));
    }

    public function approve(string $id, ?string $reviewedBy): DriverDocument
    {
        $document = $this->findOrFail($id);
        $document->forceFill([
            'verification_status' => 'approved',
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
        ])->save();

        return $document->fresh();
    }

    public function reject(string $id, ?string $reviewedBy, ?string $note = null): DriverDocument
    {
        $document = $this->findOrFail($id);
        $document->forceFill([
            'verification_status' => 'rejected',
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
        ])->save();

        return $document->fresh();
    }
}
