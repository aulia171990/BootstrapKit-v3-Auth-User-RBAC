<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Admin\DriverManagementService;
use Illuminate\Http\Request;

class DriverManagementController extends Controller
{
    public function __construct(private DriverManagementService $drivers) {}

    public function index(Request $request)
    {
        return ApiResponse::success($this->drivers->index((int) $request->input('per_page', 20)));
    }

    public function approve(Request $request, string $driverId)
    {
        $this->drivers->approve($driverId, (string) $request->user()->id);

        return ApiResponse::success(null, 'Driver approved');
    }
}
