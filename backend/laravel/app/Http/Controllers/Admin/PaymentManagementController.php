<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Admin\PaymentManagementService;
use Illuminate\Http\Request;

class PaymentManagementController extends Controller
{
    public function __construct(private PaymentManagementService $payments) {}

    public function index(Request $request)
    {
        return ApiResponse::success($this->payments->list((int) $request->input('per_page', 20)));
    }
}
