<?php

use App\Gateways\Map\MapProviderInterface;
use App\Gateways\Map\OpenStreetMapProvider;

return [
    'default' => env('MAP_DEFAULT_PROVIDER', 'openstreetmap'),
    'providers' => [
        'openstreetmap' => [
            'driver' => OpenStreetMapProvider::class,
            'enabled' => true,
        ],
    ],
];
