<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\Auth\AuthException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Http\Responses\ApiResponse;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

/**
 * Thin HTTP layer. Holds NO auth logic — every operation is delegated to
 * AuthService. The service returns the freshly loaded User alongside the
 * token, so this controller never queries the User model itself.
 */
class AuthController extends Controller
{
    public function __construct(
        private AuthService $auth,
    ) {
        // These endpoints are public.
        $this->middleware('auth.api', ['except' => [
            'register',
            'login',
            'requestOtp',
            'loginWithOtp',
            'requestPasswordReset',
            'resetPassword',
            'verifyEmail',
        ]]);
    }

    // ── Public ───────────────────────────────────────────────────
    public function register(RegisterRequest $request)
    {
        // AuthService returns ['token', 'token_type', 'expires_in', 'user'].
        $result = $this->auth->register($request->validated(), $this->deviceContext($request));

        return $this->respondWithToken($result, UserResource::make($result['user']), 201);
    }

    public function login(LoginRequest $request)
    {
        $this->ensureNotThrottled($request, 'login', 5, 1);

        $data = $request->validated();

        try {
            $result = $this->auth->login($data['email'], $data['password'], $this->deviceContext($request), $request->ip());
        } catch (AuthException $e) {
            RateLimiter::hit($this->throttleKey($request, 'login'));
            return $e->render();
        }

        RateLimiter::clear($this->throttleKey($request, 'login'));

        return $this->respondWithToken($result, UserResource::make($result['user']));
    }

    public function requestOtp(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string', // email or phone
        ]);

        $this->ensureNotThrottled($request, 'otp-request', 5, 1);

        $this->auth->requestOtp($request->identifier, $request->ip());

        RateLimiter::clear($this->throttleKey($request, 'otp-request'));

        return ApiResponse::success(
            null,
            'Kode OTP telah dikirim'
        );
    }

    public function loginWithOtp(Request $request)
    {
        $data = $request->validate([
            'identifier' => 'required|string',
            'code'       => 'required|string',
        ]);

        $this->ensureNotThrottled($request, 'otp-login', 5, 1);

        try {
            $result = $this->auth->loginWithOtp($data['identifier'], $data['code'], $this->deviceContext($request), $request->ip());
        } catch (AuthException $e) {
            RateLimiter::hit($this->throttleKey($request, 'otp-login'));
            return $e->render();
        }

        RateLimiter::clear($this->throttleKey($request, 'otp-login'));

        return $this->respondWithToken($result, UserResource::make($result['user']));
    }

    public function requestPasswordReset(ForgotPasswordRequest $request)
    {
        $token = $this->auth->requestPasswordReset($request->validated()['identifier']);

        return ApiResponse::success(
            ['token' => $token],
            'Jika akun terdaftar, instruksi reset telah dikirim'
        );
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $data = $request->validated();

        $ok = $this->auth->resetPassword(
            $data['email'],
            $data['token'],
            $data['password']
        );

        if (! $ok) {
            return ApiResponse::error('Token reset tidak valid atau kedaluwarsa', 422);
        }

        return ApiResponse::success(null, 'Password berhasil direset');
    }

    public function verifyEmail(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|string|email',
            'code'  => 'required|string',
        ]);

        $ok = $this->auth->verifyEmail($data['email'], $data['code'], $request->ip());

        return $ok
            ? ApiResponse::success(null, 'Email terverifikasi')
            : ApiResponse::error('Kode verifikasi tidak valid', 422);
    }

    // ── Authenticated ────────────────────────────────────────────
    public function refresh(Request $request)
    {
        $request->validate([
            'refresh_token' => 'required|string',
        ]);

        return $this->respondWithToken($this->auth->refresh($request->input('refresh_token'), $this->deviceContext($request)));
    }

    public function logout(Request $request)
    {
        $this->auth->logout($request->user(), $request->input('refresh_token'), $request->ip());

        return ApiResponse::success(null, 'Logout success');
    }

    public function logoutAll(Request $request)
    {
        $this->auth->logoutAll($request->user(), $request->ip());

        return ApiResponse::success(null, 'Logout dari semua perangkat');
    }

    public function me(Request $request)
    {
        return ApiResponse::success(UserResource::make($request->user()));
    }

    // ── Device management ────────────────────────────────────────
    public function devices(Request $request)
    {
        $list = $this->auth->listDevices($request->user());

        return ApiResponse::success($list);
    }

    public function revokeDevice(Request $request, string $deviceId)
    {
        $ok = $this->auth->revokeDevice($request->user(), $deviceId);

        if (! $ok) {
            return ApiResponse::error('Perangkat tidak ditemukan', 404);
        }

        return ApiResponse::success(null, 'Perangkat dicabut aksesnya');
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $data = $request->validated();

        try {
            $this->auth->changePassword($request->user(), $data['current_password'], $data['password'], $request->ip());
        } catch (AuthException $e) {
            return $e->render();
        }

        return ApiResponse::success(null, 'Password berhasil diubah');
    }

    public function resendEmailVerification(Request $request)
    {
        $this->auth->resendEmailVerification($request->user());

        return ApiResponse::success(null, 'Kode verifikasi email dikirim ulang');
    }

    // ── Helpers ──────────────────────────────────────────────────
    /**
     * Build the device fingerprint passed to AuthService. device_id /
     * platform come from the request (body or X- headers); ip + user_agent
     * from the transport. Returns null when no device_id is supplied so
     * callers that don't track devices stay unaffected.
     */
    private function deviceContext(Request $request): ?array
    {
        $deviceId = $request->input('device_id')
            ?? $request->header('X-Device-Id');

        if (empty($deviceId)) {
            return null;
        }

        return [
            'device_id'  => $deviceId,
            'platform'   => $request->input('platform', $request->header('X-Platform')),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ];
    }

    private function respondWithToken(array $result, $user = null, int $status = 200)
    {
        // Normalise to the app's success envelope. If a user object was
        // passed it overrides whatever the service attached (kept for call
        // sites that build the DTO themselves).
        $data = $result;
        if ($user) {
            $data['user'] = $user;
        }

        return ApiResponse::success($data, 'success', $status);
    }

    private function throttleKey(Request $request, string $scope): string
    {
        return $scope . ':' . $request->ip() . ':' . strtolower((string) $request->input('email', ''));
    }

    private function ensureNotThrottled(Request $request, string $scope, int $max, int $decayMinutes): void
    {
        $key = $this->throttleKey($request, $scope);

        if (RateLimiter::tooManyAttempts($key, $max)) {
            $seconds = RateLimiter::availableIn($key);
            throw new \Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException(
                $seconds,
                "Terlalu banyak percobaan. Coba lagi dalam {$seconds} detik."
            );
        }
    }
}
