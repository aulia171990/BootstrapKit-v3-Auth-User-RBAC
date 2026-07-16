<?php

namespace App\Modules\User\Controllers;

use Illuminate\Http\Request;

class UserController
{
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => 'uuid',
                'name' => 'Demo User',
                'email' => 'demo@example.com'
            ]
        ]);
    }

    public function update(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Profile updated'
        ]);
    }
}
