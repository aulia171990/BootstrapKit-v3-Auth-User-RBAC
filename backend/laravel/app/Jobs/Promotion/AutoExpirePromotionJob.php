<?php

namespace App\Jobs\Promotion;

use App\Models\Promotion\Promotion;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class AutoExpirePromotionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public string $promotionId, public string $expiresAt) {}

    public function handle(): void
    {
        $promotion = Promotion::find($this->promotionId);

        if ($promotion && strtolower((string) $promotion->expires_at) === strtolower($this->expiresAt)) {
            $promotion->forceFill(['status' => 'expired'])->save();
        }
    }
}
