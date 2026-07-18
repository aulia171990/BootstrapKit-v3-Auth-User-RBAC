<?php

namespace App\Events\Api;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Api\ApiWebhookDelivery;

class WebhookDeliveryFailed
{
    use Dispatchable, SerializesModels;

    public function __construct(public ApiWebhookDelivery $delivery) {}
}
