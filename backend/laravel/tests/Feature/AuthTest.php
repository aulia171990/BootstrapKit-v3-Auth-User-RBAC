<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\LoginAttempt;
use App\Models\Role;
use App\Models\User;
use App\Models\VerificationToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->artisan('migrate')->assertSuccessful();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        // Rate-limiter state lives in the array cache and leaks across tests;
        // reset it so each test starts clean.
        app('cache')->flush();
    }

    // ── Registration ─────────────────────────────────────────────
    public function test_register_returns_token_and_user(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name'     => 'Budi',
            'email'    => 'budi@ojol.test',
            'phone'    => '6281200000011',
            'password' => 'Newsecret1!',
            'password_confirmation' => 'Newsecret1!',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success', 'message',
                'data' => ['token', 'token_type', 'expires_in', 'refresh_token', 'user'],
            ])
            ->assertJsonPath('data.user.roles.0', 'customer');

        $this->assertDatabaseHas('users', ['email' => 'budi@ojol.test']);
        // A refresh token row was persisted server-side.
        $this->assertDatabaseHas('refresh_tokens', [
            'user_id' => User::where('email', 'budi@ojol.test')->first()->id,
        ]);
    }

    public function test_register_rejects_privilege_escalation_role(): void
    {
        // Even if an attacker sends role=admin, the account must be a plain customer.
        $response = $this->postJson('/api/v1/auth/register', [
            'name'     => 'Hacker',
            'email'    => 'hacker@ojol.test',
            'phone'    => '6281200000022',
            'password' => 'Newsecret1!',
            'password_confirmation' => 'Newsecret1!',
            'role'     => 'admin',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.user.roles.0', 'customer');

        $user = User::where('email', 'hacker@ojol.test')->first();
        $this->assertFalse($user->hasRole('admin'));
    }

    public function test_register_enforces_password_min_length_and_confirmation(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'X', 'email' => 'x@ojol.test', 'phone' => '6281200000033',
            'password' => 'short', 'password_confirmation' => 'short',
        ])->assertStatus(422);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'X', 'email' => 'x@ojol.test', 'phone' => '6281200000033',
            'password' => 'Secret123!', 'password_confirmation' => 'different',
        ])->assertStatus(422);
    }

    public function test_register_rejects_duplicate_email_or_phone(): void
    {
        $payload = ['name' => 'Ab', 'email' => 'dup@ojol.test', 'phone' => '6281200000044',
            'password' => 'Newsecret1!', 'password_confirmation' => 'Newsecret1!'];

        $this->postJson('/api/v1/auth/register', $payload)->assertStatus(201);
        $this->postJson('/api/v1/auth/register', $payload)->assertStatus(422);
    }

    // ── Login ────────────────────────────────────────────────────
    public function test_login_endpoint_exists(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email'    => 'admin@ojol.test',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['success', 'data' => ['token', 'token_type', 'expires_in', 'refresh_token']]);
    }

    public function test_login_wrong_password_returns_401(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'WrongPass1!',
        ])->assertStatus(401)->assertJsonPath('success', false);
    }

    public function test_login_locks_account_after_max_failed_attempts(): void
    {
        $user = User::where('email', 'admin@ojol.test')->first();

        // Drive the lockout policy directly so the HTTP rate-limiter (5/min)
        // does not mask the account-level lockout we are asserting.
        for ($i = 0; $i < User::MAX_FAILED_ATTEMPTS; $i++) {
            $user->registerFailedLogin();
        }

        $this->assertTrue($user->fresh()->isLocked());

        // A correct password is still rejected while locked.
        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
        ])->assertStatus(401)->assertJsonPath('success', false);
    }

    public function test_login_clears_failed_attempts_on_success(): void
    {
        $this->postJson('/api/v1/auth/login', ['email' => 'admin@ojol.test', 'password' => 'bad']);

        $this->postJson('/api/v1/auth/login', ['email' => 'admin@ojol.test', 'password' => 'password'])
            ->assertStatus(200);

        $user = User::where('email', 'admin@ojol.test')->first();
        $this->assertEquals(0, $user->failed_login_attempts);
        $this->assertNotNull($user->last_login_at);
    }

    // ── Login Security ───────────────────────────────────────────
    public function test_exponential_backoff_scales_penalty(): void
    {
        $user = User::where('email', 'admin@ojol.test')->first();
        $user->clearFailedLogin();

        // 1st failure → 1m, 2nd → 2m, 3rd → 4m, 4th → 8m (capped at 15m).
        $user->registerFailedLogin();
        $this->assertLessThanOrEqual(1, now()->diffInMinutes($user->fresh()->locked_until));
        $this->assertGreaterThanOrEqual(0, now()->diffInMinutes($user->fresh()->locked_until));
        $user->registerFailedLogin();
        $this->assertGreaterThanOrEqual(1, now()->diffInMinutes($user->fresh()->locked_until));
        $this->assertLessThanOrEqual(2, now()->diffInMinutes($user->fresh()->locked_until));
        $user->registerFailedLogin();
        $this->assertGreaterThanOrEqual(3, now()->diffInMinutes($user->fresh()->locked_until));
        $this->assertLessThanOrEqual(4, now()->diffInMinutes($user->fresh()->locked_until));
        $user->registerFailedLogin();
        $this->assertGreaterThanOrEqual(7, now()->diffInMinutes($user->fresh()->locked_until));
    }

    public function test_max_failures_hard_lockout_reset_counter(): void
    {
        $user = User::where('email', 'admin@ojol.test')->first();
        $user->clearFailedLogin();

        for ($i = 0; $i < User::MAX_FAILED_ATTEMPTS; $i++) {
            $user->registerFailedLogin();
        }

        $fresh = $user->fresh();
        $this->assertTrue($fresh->isLocked());
        $this->assertEquals(0, $fresh->failed_login_attempts);
        $this->assertGreaterThanOrEqual(14, now()->diffInMinutes($fresh->locked_until));
        $this->assertLessThanOrEqual(15, now()->diffInMinutes($fresh->locked_until));
    }

    public function test_login_failure_is_logged_with_ip(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'WrongPass1!',
        ])->assertStatus(401);

        $this->assertDatabaseHas('login_attempts', [
            'email' => 'admin@ojol.test',
            'success' => false,
            'type' => 'password',
        ]);
        $attempt = LoginAttempt::where('email', 'admin@ojol.test')->latest()->first();
        $this->assertNotEmpty($attempt->ip_address);
    }

    public function test_login_success_is_logged(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
        ])->assertStatus(200);

        $this->assertDatabaseHas('login_attempts', [
            'email' => 'admin@ojol.test',
            'success' => true,
            'type' => 'password',
        ]);
    }

    public function test_otp_request_is_ip_logged(): void
    {
        $this->postJson('/api/v1/auth/otp/request', ['identifier' => 'admin@ojol.test'])
            ->assertStatus(200);

        $this->assertDatabaseHas('login_attempts', [
            'email' => 'admin@ojol.test',
            'type' => 'otp_request',
        ]);
    }

    public function test_otp_login_throttled_after_limit(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/otp/login', [
                'identifier' => 'admin@ojol.test', 'code' => '000000',
            ])->assertStatus(401);
        }
        // 6th attempt in the same minute is rate-limited (429).
        $this->postJson('/api/v1/auth/otp/login', [
            'identifier' => 'admin@ojol.test', 'code' => '000000',
        ])->assertStatus(429);
    }

    // ── Audit Logging ────────────────────────────────────────────
    public function test_audit_logs_login_logout_register_password_change(): void
    {
        // Register
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Audit User', 'email' => 'audit1@ojol.test', 'phone' => '6281000000099',
            'password' => 'Secret1!', 'password_confirmation' => 'Secret1!',
        ])->assertStatus(201);
        $this->assertDatabaseHas('audit_logs', ['action' => 'register', 'actor_email' => 'audit1@ojol.test']);

        // Login
        $this->postJson('/api/v1/auth/login', ['email' => 'audit1@ojol.test', 'password' => 'Secret1!'])
            ->assertStatus(200);
        $this->assertDatabaseHas('audit_logs', ['action' => 'login', 'actor_email' => 'audit1@ojol.test']);

        // Verify email so the verified-gated password/change is reachable.
        \App\Models\VerificationToken::create([
            'user_id' => \App\Models\User::where('email', 'audit1@ojol.test')->first()->id,
            'type' => \App\Models\VerificationToken::TYPE_EMAIL_VERIFICATION,
            'code' => '999888', 'expires_at' => now()->addMinutes(10),
        ]);
        $this->postJson('/api/v1/auth/verify-email', ['email' => 'audit1@ojol.test', 'code' => '999888'])->assertStatus(200);

        // Password change (authed)
        $token = $this->postJson('/api/v1/auth/login', ['email' => 'audit1@ojol.test', 'password' => 'Secret1!'])
            ->json('data.token');
        $this->withHeader('Authorization', 'Bearer ' . $token);
        $this->postJson('/api/v1/auth/password/change', ['current_password' => 'Secret1!', 'password' => 'Newsecret1!', 'password_confirmation' => 'Newsecret1!'])
            ->assertStatus(200);
        $this->assertDatabaseHas('audit_logs', ['action' => 'password_change', 'actor_email' => 'audit1@ojol.test']);

        // Re-login: the password change rotated the security stamp, so the
        // previous token is now invalid (logout-everywhere semantics).
        $token = $this->postJson('/api/v1/auth/login', ['email' => 'audit1@ojol.test', 'password' => 'Newsecret1!'])
            ->json('data.token');

        // Logout
        $this->withHeader('Authorization', 'Bearer ' . $token);
        $this->postJson('/api/v1/auth/logout')->assertStatus(200);
        $this->assertDatabaseHas('audit_logs', ['action' => 'logout', 'actor_email' => 'audit1@ojol.test']);
    }

    public function test_audit_logs_failed_login_and_email_verification(): void
    {
        // Failed login
        $this->withServerVariables(['REMOTE_ADDR' => '198.51.100.7'])
            ->postJson('/api/v1/auth/login', ['email' => 'admin@ojol.test', 'password' => 'WrongPass1!'])
            ->assertStatus(401);
        $this->assertDatabaseHas('audit_logs', ['action' => 'failed_login', 'actor_email' => 'admin@ojol.test', 'ip_address' => '198.51.100.7']);

        // Email verification success
        $user = User::factory()->create();
        $code = \App\Models\VerificationToken::create([
            'user_id' => $user->id, 'type' => \App\Models\VerificationToken::TYPE_EMAIL_VERIFICATION,
            'code' => '111222', 'expires_at' => now()->addMinutes(10),
        ]);
        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => '111222'])
            ->assertStatus(200);
        $this->assertDatabaseHas('audit_logs', ['action' => 'email_verification', 'actor_email' => $user->email, 'user_id' => $user->id]);
    }

    public function test_audit_logs_token_refresh(): void
    {
        $login = $this->postJson('/api/v1/auth/login', ['email' => 'admin@ojol.test', 'password' => 'password', 'device_id' => 'aud-dev', 'platform' => 'ios'])->json('data');
        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $login['refresh_token']])->assertStatus(200);
        $this->assertDatabaseHas('audit_logs', ['action' => 'token_refresh', 'actor_email' => 'admin@ojol.test']);
    }

    public function test_audit_log_captures_ip_and_context(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.99'])
            ->postJson('/api/v1/auth/login', ['email' => 'admin@ojol.test', 'password' => 'password', 'device_id' => 'ctx-dev', 'platform' => 'web'])
            ->assertStatus(200);
        $row = AuditLog::where('action', 'login')->where('actor_email', 'admin@ojol.test')->latest()->first();
        $this->assertEquals('203.0.113.99', $row->ip_address);
        $this->assertEquals('web', $row->context['platform']);
    }

    public function test_otp_login_flow(): void
    {
        // request OTP — but we need the code; pull from DB.
        $this->postJson('/api/v1/auth/otp/request', ['identifier' => 'admin@ojol.test'])
            ->assertStatus(200);

        $token = VerificationToken::where('user_id', User::where('email', 'admin@ojol.test')->first()->id)
            ->where('type', VerificationToken::TYPE_OTP_LOGIN)
            ->firstOrFail();

        // Wrong code rejected.
        $this->postJson('/api/v1/auth/otp/login', [
            'identifier' => 'admin@ojol.test', 'code' => '000000',
        ])->assertStatus(401);

        // Correct code logs in.
        $this->postJson('/api/v1/auth/otp/login', [
            'identifier' => 'admin@ojol.test', 'code' => $token->code,
        ])->assertStatus(200)->assertJsonStructure(['data' => ['token', 'refresh_token']]);

        // OTP is single-use.
        $this->postJson('/api/v1/auth/otp/login', [
            'identifier' => 'admin@ojol.test', 'code' => $token->code,
        ])->assertStatus(401);
    }

    public function test_otp_request_does_not_leak_existence(): void
    {
        // Same 200 response for unknown identifier (anti-enumeration).
        $this->postJson('/api/v1/auth/otp/request', ['identifier' => 'nobody@ojol.test'])
            ->assertStatus(200);
    }

    // ── Email verification ───────────────────────────────────────
    public function test_email_verification_flow(): void
    {
        $user = User::factory()->create(['email_verified' => false]);

        $tok = VerificationToken::create([
            'user_id' => $user->id,
            'type' => VerificationToken::TYPE_EMAIL_VERIFICATION,
            'code' => '123456',
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => 'wrong'])
            ->assertStatus(422)->assertJsonPath('success', false);

        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => '123456'])
            ->assertStatus(200)->assertJsonPath('success', true);

        $this->assertTrue($user->fresh()->email_verified);
    }

    // ── Email verification endpoints (new URIs) ──────────────────
    public function test_verify_email_endpoint_returns_422_on_wrong_code(): void
    {
        $user = User::factory()->create(['email_verified' => false]);
        VerificationToken::create([
            'user_id' => $user->id,
            'type' => VerificationToken::TYPE_EMAIL_VERIFICATION,
            'code' => '999999',
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => '000000'])
            ->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_resend_verification_requires_auth_and_succeeds(): void
    {
        $user = User::factory()->create(['email_verified' => false]);
        $token = JWTAuth::fromUser($user);

        $this->bearer($token)->postJson('/api/v1/auth/resend-verification')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('verification_tokens', [
            'user_id' => $user->id,
            'type' => VerificationToken::TYPE_EMAIL_VERIFICATION,
        ]);
    }

    public function test_resend_verification_requires_authentication(): void
    {
        $this->postJson('/api/v1/auth/resend-verification')->assertStatus(401);
    }

    // ── Verified-gate on sensitive endpoints ─────────────────────
    public function test_unverified_user_is_forbidden_on_sensitive_endpoint(): void
    {
        $user = User::factory()->create(['email_verified' => false]);
        $token = JWTAuth::fromUser($user);

        // password/change is behind the verified gate.
        $this->bearer($token)
            ->postJson('/api/v1/auth/password/change', [
                'current_password' => 'password',
                'password' => 'Newpass1!', 'password_confirmation' => 'Newpass1!',
            ])
            ->assertStatus(403)
            ->assertJsonPath('success', false);
    }

    public function test_verified_user_can_reach_sensitive_endpoint(): void
    {
        $user = User::factory()->create(['email_verified' => true]);
        $token = JWTAuth::fromUser($user);

        // Even a wrong current password must reach the service (422/401),
        // proving the verified gate did not block it.
        $this->bearer($token)
            ->postJson('/api/v1/auth/password/change', [
                'current_password' => 'wrong-pw',
                'password' => 'Newpass1!', 'password_confirmation' => 'Newpass1!',
            ])
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_unverified_user_cannot_create_order(): void
    {
        $user = User::factory()->create(['email_verified' => false]);
        $token = JWTAuth::fromUser($user);

        // POST /orders is behind the verified gate; an unauthenticated-shaped
        // payload (no real driver) must still 403, not 422/500.
        $this->bearer($token)
            ->postJson('/api/v1/orders', ['driver_id' => '00000000-0000-0000-0000-000000000000'])
            ->assertStatus(403);
    }

    public function test_readable_endpoints_remain_open_to_any_authed_user(): void
    {
        // GET /drivers (index/show) is intentionally NOT behind the verified gate.
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
        ])->json('data.token');

        $this->bearer($login)->getJson('/api/v1/drivers')->assertStatus(200);
    }

    // ── Password reset ───────────────────────────────────────────
    public function test_password_reset_flow(): void
    {
        $user = User::factory()->create();

        // Request a reset link via the broker; token is returned in the body
        // (in production it would be emailed instead).
        $token = $this->postJson('/api/v1/auth/password/email', ['identifier' => $user->email])
            ->assertStatus(200)
            ->json('data.token');
        $this->assertNotEmpty($token);

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'Newsecret1!',
            'password_confirmation' => 'Newsecret1!',
        ])->assertStatus(200)->assertJsonPath('success', true);

        // New password works; old one does not.
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'Newsecret1!'])
            ->assertStatus(200);
    }

    public function test_password_reset_rejects_unknown_token(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'token' => 'not-a-real-token',
            'password' => 'Newsecret1!',
            'password_confirmation' => 'Newsecret1!',
        ])->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_password_reset_request_is_idempotent_envelope(): void
    {
        // Unknown identifier still returns 200 (anti-enumeration).
        $this->postJson('/api/v1/auth/password/email', ['identifier' => 'ghost@ojol.test'])
            ->assertStatus(200);
    }

    public function test_password_reset_token_expires(): void
    {
        $user = User::factory()->create();
        $token = $this->postJson('/api/v1/auth/password/email', ['identifier' => $user->email])
            ->json('data.token');
        $this->assertNotEmpty($token);

        // config/auth.php expire is 15 min; force the stored token to be old.
        \DB::table('password_reset_tokens')->where('email', $user->email)
            ->update(['created_at' => now()->subMinutes(20)]);

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'Newsecret1!',
            'password_confirmation' => 'Newsecret1!',
        ])->assertStatus(422)->assertJsonPath('success', false);
    }

    // ── Token lifecycle ──────────────────────────────────────────
    public function test_logout_all_invalidates_existing_token(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
        ])->json('data.token');

        // logout-all
        $this->bearer($login)->postJson('/api/v1/auth/logout-all')->assertStatus(200);

        // Old token now rejected (security stamp rotated).
        $this->bearer($login)->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    public function test_logout_is_idempotent(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
        ])->json('data.token');

        $this->bearer($login)->postJson('/api/v1/auth/logout')->assertStatus(200);
        // Calling again with the now-invalid token should not 500.
        $this->bearer($login)->postJson('/api/v1/auth/logout')->assertStatus(401);
    }

    public function test_refresh_returns_new_token(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
        ])->json('data');

        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $login['refresh_token']])
            ->assertStatus(200)
            ->assertJsonStructure(['data' => ['token', 'expires_in', 'refresh_token']]);
    }

    public function test_refresh_rotates_and_blacklists_old_token(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
        ])->json('data');

        $old = $login['refresh_token'];

        // First refresh succeeds and returns a NEW refresh token.
        $r1 = $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $old])
            ->assertStatus(200)
            ->json('data');
        $this->assertNotEquals($old, $r1['refresh_token'], 'refresh must rotate the token');

        // The old refresh token is now blacklisted — reuse must fail.
        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $old])
            ->assertStatus(401);

        // The new refresh token still works.
        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $r1['refresh_token']])
            ->assertStatus(200);
    }

    public function test_refresh_requires_token(): void
    {
        $this->postJson('/api/v1/auth/refresh', [])
            ->assertStatus(422);
    }

    public function test_refresh_with_logout_revokes_token(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
        ])->json('data');

        // Logout presenting the refresh token revokes it server-side.
        $this->bearer($login['token'])
            ->postJson('/api/v1/auth/logout', ['refresh_token' => $login['refresh_token']])
            ->assertStatus(200);

        // The refresh token can no longer be used.
        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $login['refresh_token']])
            ->assertStatus(401);
    }

    public function test_protected_endpoint_requires_token(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    // ── Device management ────────────────────────────────────────
    public function test_login_records_device_and_lists_it(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
            'device_id' => 'dev-AAA', 'platform' => 'android',
        ])->json('data.token');

        $devices = $this->bearer($login)->getJson('/api/v1/auth/devices')
            ->assertStatus(200)
            ->json('data');

        $this->assertCount(1, $devices);
        $this->assertEquals('dev-AAA', $devices[0]['device_id']);
        $this->assertEquals('android', $devices[0]['platform']);
        $this->assertNotNull($devices[0]['last_seen']);
    }

    public function test_revoke_device_revokes_its_refresh_token(): void
    {
        // Two devices log in.
        $d1 = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
            'device_id' => 'dev-ONE', 'platform' => 'ios',
        ])->json('data');
        $d2 = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
            'device_id' => 'dev-TWO', 'platform' => 'web',
        ])->json('data');

        // Revoke device ONE via its management endpoint.
        $this->bearer($d1['token'])
            ->deleteJson('/api/v1/auth/devices/dev-ONE')
            ->assertStatus(200);

        // dev-ONE's refresh token is now dead; dev-TWO's still works.
        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $d1['refresh_token']])
            ->assertStatus(401);
        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $d2['refresh_token']])
            ->assertStatus(200);

        // Listing shows zero active devices.
        $this->bearer($d2['token'])->getJson('/api/v1/auth/devices')
            ->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_revoke_unknown_device_returns_404(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
        ])->json('data.token');

        $this->bearer($login)->deleteJson('/api/v1/auth/devices/nope')
            ->assertStatus(404);
    }

    public function test_devices_requires_auth(): void
    {
        $this->getJson('/api/v1/auth/devices')->assertStatus(401);
        $this->deleteJson('/api/v1/auth/devices/x')->assertStatus(401);
    }

    // ── RBAC ─────────────────────────────────────────────────────
    public function test_user_has_expected_permissions_from_role(): void
    {
        $customer = User::factory()->create();
        $customer->roles()->attach(Role::where('name', 'customer')->first()->id);

        $this->assertTrue($customer->hasPermission('order.create'));
        $this->assertFalse($customer->hasPermission('user.manage'));

        $admin = User::where('email', 'admin@ojol.test')->first();
        $this->assertTrue($admin->hasPermission('user.manage'));
    }

    public function test_admin_can_list_all_drivers_via_permission(): void
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test', 'password' => 'password',
        ])->json('data.token');

        $this->bearer($login)->getJson('/api/v1/drivers')
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'data']);
    }

    public function test_customer_cannot_list_all_drivers(): void
    {
        $cust = User::factory()->create();
        $cust->roles()->attach(Role::where('name', 'customer')->first()->id);
        $token = JWTAuth::fromUser($cust);

        // Non-admin sees only their own driver profile (404 if none),
        // never the full driver directory.
        $this->bearer($token)->getJson('/api/v1/drivers')
            ->assertStatus(404);
    }

    // ── Factory helper ───────────────────────────────────────────
    protected function bearer(string $token): static
    {
        return $this->withHeader('Authorization', 'Bearer ' . $token);
    }
}
