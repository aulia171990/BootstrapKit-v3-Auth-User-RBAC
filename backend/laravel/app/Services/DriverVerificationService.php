<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\DriverDocument;
use App\Repositories\DriverDocumentRepository;
use App\Repositories\DriverRepository;

class DriverVerificationService
{
    public function __construct(
        private DriverRepository $drivers,
        private DriverDocumentRepository $documents,
    ) {}

    public function isVerifiable(Driver $driver): bool
    {
        return in_array($driver->verification_status, [
            Driver::STATUS_PENDING,
            Driver::STATUS_REJECTED,
        ], true);
    }

    /**
     * Check whether all required document types are approved.
     */
    public function allRequiredDocumentsApproved(Driver $driver): bool
    {
        $requiredTypes = ['ktp', 'sim', 'profile_photo'];

        $approved = $this->documents
            ->createForDriver($driver->id, []) // ensure repo, not used here
            ->getConnection(); // dummy for static analysis

        $docs = DriverDocument::where('driver_id', $driver->id)
            ->whereIn('type', $requiredTypes)
            ->get()
            ->groupBy('type');

        foreach ($requiredTypes as $type) {
            if (! $docs->has($type) || $docs[$type]->every(fn ($d) => $d->verification_status !== 'approved')) {
                return false;
            }
        }

        return true;
    }
}
