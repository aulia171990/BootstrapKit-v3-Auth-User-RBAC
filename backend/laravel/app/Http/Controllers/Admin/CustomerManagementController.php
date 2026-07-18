<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Admin\CustomerManagementService;
use Illuminate\Http\Request;

class CustomerManagementController extends Controller
{
    public function __construct(private CustomerManagementService $customers) {}

    public function index(Request $request)
    {
        return ApiResponse::success($this->customers->paginated((int) $request->input('per_page', 20)));
    }
}
