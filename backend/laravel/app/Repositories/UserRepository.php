<?php

namespace App\Repositories;

use App\Models\Role;
use App\Models\User;

/**
 * Eloquent abstraction for the User model.
 *
 * Every User query / persistence in the auth flow goes through here so that
 * service classes never touch Eloquent directly. Domain behaviour that already
 * lives on the User model (regenerateStamp, recordLogin, clearFailedLogin,
 * isActive, isLocked) is intentionally left on the model.
 */
class UserRepository
{
    public function create(array $attributes): User
    {
        return User::create($attributes);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Resolve a user by email OR phone — used by OTP / password-reset flows
     * where the caller only has a free-form identifier.
     */
    public function resolveByIdentifier(string $identifier): ?User
    {
        return User::where('email', $identifier)
            ->orWhere('phone', $identifier)
            ->first();
    }

    /**
     * Attach the safe default role for self-registration. Never privileged —
     * this is the single guard against privilege escalation via the register
     * payload (the role is never read from request input).
     */
    public function attachDefaultRole(User $user): void
    {
        $role = Role::firstOrCreate(
            ['name' => User::DEFAULT_ROLE],
            ['description' => 'Pengguna yang memesan layanan']
        );

        $user->roles()->attach($role->id);
    }

    public function save(User $user): void
    {
        $user->save();
    }

    /**
     * Paginated users that have the given role (e.g. 'customer').
     */
    public function allForRole(string $roleName, int $perPage = 20)
    {
        $role = Role::where('name', $roleName)->first();
        if (! $role) {
            return new \Illuminate\Pagination\LengthAwarePaginator([], 0, $perPage);
        }
        return User::join('role_user', 'users.id', '=', 'role_user.user_id')
            ->where('role_user.role_id', $role->id)
            ->orderByDesc('users.created_at')
            ->select('users.*')
            ->paginate($perPage);
    }
}
