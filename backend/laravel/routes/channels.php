<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    $order = \App\Models\Order::find($orderId);
    if (! $order) {
        return false;
    }

    return $user->id === $order->customer_id
        || ($order->driver && $user->driver?->id === $order->driver_id);
});

Broadcast::channel('driver.{driverId}', function ($user, $driverId) {
    return $user->driver?->id === $driverId;
});
