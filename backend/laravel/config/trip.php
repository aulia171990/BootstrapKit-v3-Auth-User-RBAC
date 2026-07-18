<?php

return [
    'use_queue' => env('TRIP_QUEUE', true),
    'eligible_statuses' => [
        'approved',
        'verified',
        'online',
        'available',
    ],
    'disabled_statuses' => [
        'suspended',
    ],
    'auto_arrive_radius' => env('TRIP_AUTO_ARRIVE_RADIUS', 50),
    'sos_auto_alert' => true,
];