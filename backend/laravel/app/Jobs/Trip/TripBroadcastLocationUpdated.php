<?php
namespace App\Jobs\Trip;

use App\Events\Trip\TripUpdated;
use App\Models\Trip;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class TripBroadcastLocationUpdated implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Trip $trip,
        public array $payload,
    ) {}

    public function handle(): void
    {
        TripUpdated::dispatch($this->trip, 'location.updated');
    }
}
