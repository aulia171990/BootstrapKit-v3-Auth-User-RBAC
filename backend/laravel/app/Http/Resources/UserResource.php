<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Cleans up the user payload returned to clients.
 * Never leaks password / remember_token / internal counters.
 */
class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        /** @var User $this */
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'phone'          => $this->phone,
            'status'         => $this->status,
            'email_verified' => $this->email_verified,
            'phone_verified' => $this->phone_verified,
            'roles'          => $this->roles->pluck('name'),
            'last_login_at'  => $this->last_login_at,
            'created_at'     => $this->created_at,
        ];
    }
}
