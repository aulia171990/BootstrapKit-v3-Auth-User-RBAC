<?php

namespace App\Http\Controllers\Booking;

use App\Events\BookingCancelled;
use App\Events\BookingCompleted;
use App\Events\BookingCreated;
use App\Events\BookingExpired;
use App\Events\BookingScheduled;
use App\Events\BookingUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\Booking\CancelBookingRequest;
use App\Http\Requests\Booking\CreateBookingRequest;
use App\Http\Requests\Booking\ScheduleBookingRequest;
use App\Http\Requests\Booking\UpdateBookingRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Booking;
use App\Services\BookingCancellationService;
use App\Services\BookingFareService;
use App\Services\BookingHistoryService;
use App\Services\BookingService;
use App\Services\BookingValidationService;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function __construct(
        private BookingService $bookingService,
        private BookingFareService $fareService,
        private BookingValidationService $validationService,
        private BookingCancellationService $cancellationService,
        private BookingHistoryService $historyService,
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->hasRole('admin')) {
            $bookings = Booking::with(['customer', 'driver'])->paginate(20);
        } else {
            $bookings = Booking::with(['customer', 'driver'])
                ->where('customer_id', $user->id)
                ->orWhere('driver_id', $user->driver?->id)
                ->paginate(20);
        }

        return ApiResponse::success($bookings);
    }

    public function show(Request $request, Booking $booking)
    {
        $this->authorizeBooking($request, $booking);

        return ApiResponse::success($booking->load(['stops', 'passengers', 'fares', 'statusHistory', 'cancellation', 'notes']));
    }

    public function store(CreateBookingRequest $request)
    {
        $user = $request->user();
        $this->validationService->ensureCustomerCanBook($user);

        $booking = $this->bookingService->create($request->validated(), $user->id);

        if (! empty($request->stops)) {
            $booking->stops()->createMany($request->stops);
        }

        if (! empty($request->passengers)) {
            $booking->passengers()->createMany($request->passengers);
        }

        $farePayload = $this->fareService->calculate($booking);
        $this->fareService->create(array_merge($farePayload, ['booking_id' => $booking->id]));

        return ApiResponse::success($booking->load(['stops', 'passengers', 'fares']), 'Booking created', 201);
    }

    public function update(UpdateBookingRequest $request, Booking $booking)
    {
        $this->authorizeBooking($request, $booking);
        $this->assertUpdatable($booking);

        $booking = $this->bookingService->update($booking, $request->validated());

        return ApiResponse::success($booking->load(['stops', 'passengers', 'fares']), 'Booking updated');
    }

    public function destroy(Request $request, Booking $booking)
    {
        $this->authorizeBooking($request, $booking);

        $this->bookingService->cancel($booking, 'Deleted by user', $request->user()->email);

        return ApiResponse::success(null, 'Booking deleted');
    }

    public function cancel(CancelBookingRequest $request, Booking $booking)
    {
        $this->authorizeBooking($request, $booking);

        $this->cancellationService->cancel(
            $booking->id,
            $request->reason,
            $request->cancelled_by ?? $request->user()->email
        );

        return ApiResponse::success($booking->fresh()->load('cancellation'), 'Booking cancelled');
    }

    public function schedule(ScheduleBookingRequest $request, Booking $booking)
    {
        $this->authorizeBooking($request, $booking);
        $this->assertUpdatable($booking);

        $booking = $this->bookingService->schedule($booking, $request->scheduled_at);

        return ApiResponse::success($booking, 'Booking scheduled');
    }

    public function history(Request $request)
    {
        $user = $request->user();
        $bookingId = $request->query('booking_id');

        if ($bookingId) {
            $this->authorizeBooking($request, Booking::findOrFail($bookingId));

            return ApiResponse::success($this->historyService->history($bookingId));
        }

        $bookings = Booking::where('customer_id', $user->id)
            ->whereIn('status', [
                Booking::STATUS_COMPLETED,
                Booking::STATUS_CANCELLED,
                Booking::STATUS_EXPIRED,
            ])
            ->orderByDesc('completed_at')
            ->get();

        return ApiResponse::success($bookings);
    }

    public function upcoming(Request $request)
    {
        $user = $request->user();

        return ApiResponse::success($this->historyService->upcomingForCustomer($user->id));
    }

    protected function authorizeBooking(Request $request, Booking $booking): void
    {
        $user = $request->user();

        if (! $user->hasRole('admin') && $user->id !== $booking->customer_id) {
            abort(403, 'Akses ditolak');
        }
    }

    protected function assertUpdatable(Booking $booking): void
    {
        if (in_array($booking->status, [
            Booking::STATUS_COMPLETED,
            Booking::STATUS_CANCELLED,
            Booking::STATUS_EXPIRED,
        ], true)) {
            abort(422, 'Booking cannot be updated in its current state.');
        }
    }
}
