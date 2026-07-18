<?php
namespace App\Jobs\Trip;

use App\Events\Trip\DriverArrived;
use App\Events\Trip\PassengerPickedUp;
use App\Events\Trip\TripCancelled;
use App\Events\Trip\TripCompleted;
use App\Events\Trip\TripCreated;
use App\Events\Trip\TripSOSActivated;
use App\Events\Trip\TripStarted;
use App\Events\Trip\TripUpdated;
use App\Models\Trip;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class TripBroadcastStatusChanged implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Trip $trip,
        public string $event,
        public ?string $reason = null,
        public ?string $message = null,
    ) {}

    public function handle(): void
    {
        switch ($this->event) {
            case 'trip.created':
                TripCreated::dispatch($this->trip);
                break;
            case 'trip.started':
                TripStarted::dispatch($this->trip);
                break;
            case 'trip.completed':
                TripCompleted::dispatch($this->trip);
                break;
            case 'trip.cancelled':
                TripCancelled::dispatch($this->trip, $this->reason);
                break;
            case 'trip.sos':
                TripSOSActivated::dispatch($this->trip);
                break;
            case 'trip.driver_arrived':
                DriverArrived::dispatch($this->trip);
                break;
            case 'trip.passenger_picked_up':
                PassengerPickedUp::dispatch($this->trip);
                break;
            default:
                TripUpdated::dispatch($this->trip, $this->message ?? 'updated');
        }
    }
}
