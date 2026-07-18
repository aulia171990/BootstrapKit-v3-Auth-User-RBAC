<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Admin\WalletManagementService;
use Illuminate\Http\Request;

class WalletManagementController extends Controller
{
    public function __construct(private WalletManagementService $wallets) {}

    public function index(Request $request)
    {
        return ApiResponse::success($this->wallets->list((int) $request->input('per_page', 20)));
    }
}
