<?php

namespace App\Events\Api;

use App\Models\Api\ApiWebhookDelivery;

class WebhookDeliveryFailed
{
    public function __construct(public ApiWebhookDelivery $delivery) {}
}