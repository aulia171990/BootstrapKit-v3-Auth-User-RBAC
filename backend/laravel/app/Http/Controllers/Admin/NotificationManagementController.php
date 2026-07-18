<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Notification\NotificationService;
use Illuminate\Http\Request;

class NotificationManagementController extends Controller
{
    public function __construct(private NotificationService $notifications) {}

    public function templates()
    {
        return ApiResponse::success([]);
    }
}
