<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;

class SupportController extends Controller
{
    public function liveTrips()
    {
        return ApiResponse::success([]);
    }
}
