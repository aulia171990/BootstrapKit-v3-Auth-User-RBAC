<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Admin\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboard) {}

    public function stats()
    {
        return ApiResponse::success($this->dashboard->stats());
    }

    public function alerts()
    {
        return ApiResponse::success($this->dashboard->recentAlerts());
    }

    public function health()
    {
        return ApiResponse::success($this->dashboard->health());
    }

    public function reports()
    {
        return ApiResponse::success($this->dashboard->reports());
    }
}
