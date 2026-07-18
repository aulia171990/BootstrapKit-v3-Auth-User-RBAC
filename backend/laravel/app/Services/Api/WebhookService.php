<?php

namespace App\Services\Api;

use App\Models\Api\ApiWebhook;
use App\Models\Api\ApiWebhookDelivery;
use App\Repositories\Api\ApiWebhookRepository;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Events\Api\WebhookDeliveryFailed;

class WebhookService
{
    public function __construct(private ApiWebhookRepository $webhooks) {}

    public function register(string $clientId, array $data): ApiWebhook
    {
        return $this->webhooks->create([
            'api_client_id' => $clientId,
            'url' => $data['url'],
            'events' => $data['events'] ?? [],
            'secret' => $data['secret'] ?? Str::random(32),
            'is_active' => true,
        ]);
    }

    public function deliver(string $webhookId, string $event, array $payload): ApiWebhookDelivery
    {
        $webhook = $this->webhooks->find($webhookId);

        if (! $webhook) {
            throw new \RuntimeException('Webhook not found');
        }

        $delivery = ApiWebhookDelivery::create([
            'api_webhook_id' => $webhookId,
            'event' => $event,
            'status' => 'pending',
            'attempt' => 1,
            'error' => null,
            'response' => null,
            'next_attempt_at' => now()->addMinutes(5),
        ]);

        try {
            $response = Http::timeout(10)
                ->withHeaders(['X-Webhook-Secret' => $webhook->secret])
                ->post($webhook->url, $payload);

            $delivery->update([
                'status' => $response->successful() ? 'delivered' : 'failed',
                'response' => $response->body(),
                'delivered_at' => now(),
            ]);
        } catch (\Throwable $exception) {
            $delivery->update([
                'error' => $exception->getMessage(),
                'next_attempt_at' => now()->addMinutes(5),
            ]);

            event(new WebhookDeliveryFailed($delivery));
        }

        return $delivery;
    }

    public function retryFailed(): void
    {
        ApiWebhookDelivery::where('next_attempt_at', '<=', now())
            ->where('attempt', '<', 5)
            ->each(function ($delivery) {
                $this->deliver($delivery->api_webhook_id, $delivery->event, $delivery->response ?? []);
            });
    }
}
