<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Channel auth memakai middleware JWT (auth.api) agar client
        // (Laravel Echo) bisa subscribe channel privat dengan Bearer token.
        Broadcast::routes(['middleware' => ['auth.api']]);

        require base_path('routes/channels.php');
    }
}
