<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Admin\TripManagementService;
use Illuminate\Http\Request;

class TripManagementController extends Controller
{
    public function __construct(private TripManagementService $trips) {}

    public function index(Request $request)
    {
        return ApiResponse::success($this->trips->paginated((int) $request->input('per_page', 20)));
    }
}
