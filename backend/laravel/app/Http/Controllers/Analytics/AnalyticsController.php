<?php

namespace App\Http\Controllers\Analytics;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Analytics\AnalyticsService;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsService $analytics) {}

    public function dashboard(Request $request)
    {
        $data = $this->analytics->dashboard($request->only(['date', 'range', 'from', 'to']));

        return ApiResponse::success($data);
    }

    public function kpi(Request $request)
    {
        $data = app(\App\Services\Analytics\KPIService::class)->today($request->input('date'));

        return ApiResponse::success($data);
    }

    public function revenue(Request $request)
    {
        $service = app(\App\Services\Analytics\ReportService::class);
        $data = $service->trips($request->input('range', 'daily'), $request->input('from'), $request->input('to'));

        return ApiResponse::success($data);
    }

    public function trips(Request $request)
    {
        $service = app(\App\Services\Analytics\ReportService::class);
        $data = $service->trips($request->input('range', 'daily'), $request->input('from'), $request->input('to'));

        return ApiResponse::success($data);
    }

    public function export(Request $request)
    {
        $request->validate([
            'type' => ['required', 'string', 'in:trips'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
        ]);

        return $this->analytics->export($request->input('type'), $request->input('from'), $request->input('to'));
    }

    public function aggregate(Request $request)
    {
        $request->validate([
            'date' => ['nullable', 'date'],
        ]);

        $this->analytics->aggregate($request->input('date'));

        return ApiResponse::success(null, 'Aggregation job dispatched');
    }
}
