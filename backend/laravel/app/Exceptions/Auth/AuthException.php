<?php

namespace App\Exceptions\Auth;

use Exception;
use Illuminate\Http\JsonResponse;

/**
 * Shared base for auth failures. Maps to a 401 with the app's
 * standard { success, message, data, meta, errors } envelope.
 */
abstract class AuthException extends Exception
{
    protected int $httpStatus = 401;
    protected string $errorMessage = 'Authentication failed';

    public function render(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->errorMessage,
            'data'    => (object) [],
            'meta'    => (object) [],
            'errors'  => [],
        ], $this->httpStatus);
    }
}
