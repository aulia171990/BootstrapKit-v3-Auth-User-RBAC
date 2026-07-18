<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Admin\AuditService;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function __construct(private AuditService $audits) {}

    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $action = $request->input('action');

        return ApiResponse::success($this->audits->paginated($perPage, $action));
    }
}
