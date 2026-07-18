<?php

return [
    'default' => env('PAYMENT_DEFAULT_PROVIDER', 'cashless'),
    'providers' => [
        'cash' => [
            'driver' => \App\Gateways\Payment\CashGateway::class,
            'enabled' => true,
        ],
        'cashless' => [
            'driver' => \App\Gateways\Payment\CashlessGateway::class,
            'enabled' => true,
        ],
    ],
];
