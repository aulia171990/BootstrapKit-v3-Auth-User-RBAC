<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Pagination\AbstractPaginator;

/**
 * Single source of truth for the API envelope.
 *
 * Every endpoint in this project returns:
 * {
 *     "success": bool,
 *     "message": string,
 *     "data":    mixed,
 *     "meta":    object,   // pagination/timing metadata; {} when unused
 *     "errors":  array     // validation / field errors; [] when none
 * }
 *
 * Usage:
 *   ApiResponse::success($data, 'OK');
 *   ApiResponse::created($data, 'Dibuat');
 *   ApiResponse::error('Pesan', 403, $errors);
 *   ApiResponse::validation($validator->errors()->toArray());
 *
 * Passing a paginator as $data auto-fills meta with pagination info while
 * leaving the paginator intact in `data` (so existing clients keep working).
 */
final class ApiResponse
{
    /**
     * @param mixed                $data   Primary payload (resource, array, paginator…).
     * @param string               $message Human-readable status message.
     * @param int                  $status HTTP status code.
     * @param array<string,mixed>|null $meta Optional override for meta.
     */
    public static function success(
        mixed $data = null,
        string $message = 'success',
        int $status = 200,
        ?array $meta = null,
    ): JsonResponse {
        if ($meta === null && $data instanceof AbstractPaginator) {
            $meta = self::paginationMeta($data);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data ?? (object) [],
            'meta'    => $meta ?? (object) [],
            'errors'  => [],
        ], $status);
    }

    public static function created(mixed $data = null, string $message = 'created'): JsonResponse
    {
        return self::success($data, $message, 201);
    }

    /**
     * @param array<string,mixed>|null $meta
     */
    public static function error(
        string $message,
        int $status = 400,
        array $errors = [],
        mixed $data = null,
        ?array $meta = null,
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data'    => $data ?? (object) [],
            'meta'    => $meta ?? (object) [],
            'errors'  => $errors,
        ], $status);
    }

    /**
     * @param array<string,array<int,string>> $errors
     */
    public static function validation(array $errors, string $message = 'Validation error', int $status = 422): JsonResponse
    {
        return self::error($message, $status, $errors);
    }

    /**
     * @return array<string,mixed>
     */
    private static function paginationMeta(AbstractPaginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'per_page'     => $paginator->perPage(),
            'total'        => $paginator->total(),
            'last_page'    => $paginator->lastPage(),
            'from'         => $paginator->firstItem(),
            'to'           => $paginator->lastItem(),
        ];
    }
}
