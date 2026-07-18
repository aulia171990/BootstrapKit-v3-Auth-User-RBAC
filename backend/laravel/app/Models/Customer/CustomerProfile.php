<?php

namespace App\Models\Customer;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerProfile extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'display_name',
        'gender',
        'date_of_birth',
        'language',
        'avatar_url',
        'referral_code',
        'verification_status',
        'status',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(CustomerAddress::class);
    }

    public function favoritePlaces(): HasMany
    {
        return $this->hasMany(CustomerFavoritePlace::class);
    }

    public function emergencyContacts(): HasMany
    {
        return $this->hasMany(CustomerEmergencyContact::class);
    }

    public function preference(): HasMany
    {
        return $this->hasMany(CustomerPreference::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(CustomerReferral::class);
    }
}
