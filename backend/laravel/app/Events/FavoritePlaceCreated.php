<?php

namespace App\Events;

use App\Models\Customer\CustomerFavoritePlace;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FavoritePlaceCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public CustomerFavoritePlace $favorite) {}
}
