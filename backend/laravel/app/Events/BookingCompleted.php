<?php
namespace App\Events;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Booking;

class BookingUpdated { use Dispatchable, SerializesModels; public function __construct(public Booking $booking) {} }
