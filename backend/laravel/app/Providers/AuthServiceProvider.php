<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [];

    public function boot(): void
    {
        $this->registerPolicies();

        // RBAC gate sederhana: user punya role tertentu.
        Gate::define('role', function ($user, string $role) {
            return $user->roles()->where('name', $role)->exists();
        });
    }
}
