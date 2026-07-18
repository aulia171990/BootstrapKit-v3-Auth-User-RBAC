<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Admin\PromotionManagementService;
use Illuminate\Http\Request;

class PromotionManagementController extends Controller
{
    public function __construct(private PromotionManagementService $promotions) {}

    public function index(Request $request)
    {
        return ApiResponse::success($this->promotions->list((int) $request->input('per_page', 20)));
    }
}
