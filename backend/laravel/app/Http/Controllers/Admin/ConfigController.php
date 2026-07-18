<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Admin\ConfigService;
use Illuminate\Http\Request;

class ConfigController extends Controller
{
    public function __construct(private ConfigService $config) {}

    public function index()
    {
        return ApiResponse::success($this->config->list());
    }

    public function update(Request $request)
    {
        $updated = $this->config->update($request->all());

        return ApiResponse::success($updated, 'Config updated');
    }
}
