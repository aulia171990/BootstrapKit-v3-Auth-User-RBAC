<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [];

    public function boot(): void
    {
        $this->registerPolicies();

        // Auto-map: any ability name that matches a permission code passes.
        Gate::before(function (User $user, string $ability) {
            if ($user->hasPermission($ability)) {
                return true;
            }
        });

        // Role gate: user holds the given role.
        Gate::define('role', function (User $user, string $role) {
            return $user->hasRole($role);
        });

        // Permission gate: user holds the given permission (via a role).
        Gate::define('permission', function (User $user, string $permission) {
            return $user->hasPermission($permission);
        });
    }
}
