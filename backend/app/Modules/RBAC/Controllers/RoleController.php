<?php

namespace App\Modules\RBAC\Controllers;

class RoleController
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                ['name' => 'customer'],
                ['name' => 'driver'],
                ['name' => 'merchant'],
                ['name' => 'admin']
            ]
        ]);
    }
}
