<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->bindMapProvider();
    }

    private function bindMapProvider(): void
    {
        if (! interface_exists(\App\Gateways\Map\MapProviderInterface::class)) {
            return;
        }

        $this->app->singleton(\App\Gateways\Map\MapProviderInterface::class, \App\Gateways\Map\OpenStreetMapProvider::class);
    }
}
