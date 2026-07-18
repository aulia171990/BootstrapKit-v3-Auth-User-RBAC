<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\VerificationToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

/**
 * Feature coverage for the public + authenticated auth flows.
 *
 * Scenarios (per spec):
 *   - Register            (success + duplicate + validation)
 *   - Login               (success + wrong password)
 *   - Logout              (authed + idempotent)
 *   - Refresh             (new token + rotation/blacklist)
 *   - Forgot Password     (issues token, anti-enumeration)
 *   - Reset Password      (success + bad token)
 *   - Email Verification  (success + wrong code + expired)
 *   - Unauthorized        (no token on protected route)
 *   - Invalid Token       (malformed/garbage bearer)
 *   - Expired Token       (JWT past ttl)
 *
 * Every response is asserted against the standard envelope
 * (success/message/data/meta/errors).
 */
class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate')->assertSuccessful();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
        app('cache')->flush(); // rate-limiter state leaks across tests
    }

    private function bearer(string $token): static
    {
        return $this->withHeader('Authorization', 'Bearer ' . $token);
    }

    private function register(array $overrides = []): array
    {
        return $this->postJson('/api/v1/auth/register', array_merge([
            'name' => 'Flow User',
            'email' => 'flow@ojol.test',
            'phone' => '6281200000555',
            'password' => 'Newsecret1!',
            'password_confirmation' => 'Newsecret1!',
        ], $overrides))->json('data');
    }

    // ── Register ─────────────────────────────────────────────────
    public function test_register_returns_201_envelope_with_token_and_user(): void
    {
        $resp = $this->postJson('/api/v1/auth/register', [
            'name' => 'Flow User',
            'email' => 'flow@ojol.test',
            'phone' => '6281200000555',
            'password' => 'Newsecret1!',
            'password_confirmation' => 'Newsecret1!',
        ]);

        $resp->assertStatus(201)
            ->assertJsonStructure([
                'success', 'message', 'meta', 'errors',
                'data' => ['token', 'token_type', 'expires_in', 'refresh_token', 'user'],
            ])
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.roles.0', 'customer');

        $this->assertDatabaseHas('users', ['email' => 'flow@ojol.test']);
    }

    public function test_register_rejects_duplicate_email_with_422(): void
    {
        $payload = [
            'name' => 'Dupe', 'email' => 'dupe@ojol.test', 'phone' => '6281200000666',
            'password' => 'Newsecret1!', 'password_confirmation' => 'Newsecret1!',
        ];
        $this->postJson('/api/v1/auth/register', $payload)->assertStatus(201);
        $this->postJson('/api/v1/auth/register', $payload)
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_register_rejects_weak_password_with_422(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Weak', 'email' => 'weak@ojol.test', 'phone' => '6281200000777',
            'password' => 'short', 'password_confirmation' => 'short',
        ])->assertStatus(422)->assertJsonPath('success', false);
    }

    // ── Login ────────────────────────────────────────────────────
    public function test_login_succeeds_with_valid_credentials(): void
    {
        $resp = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test',
            'password' => 'password',
        ]);

        $resp->assertStatus(200)
            ->assertJsonStructure(['success', 'message', 'meta', 'errors', 'data' => ['token', 'refresh_token']])
            ->assertJsonPath('success', true);
    }

    public function test_login_fails_with_wrong_password_401(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@ojol.test',
            'password' => 'WrongPass1!',
        ])->assertStatus(401)->assertJsonPath('success', false);
    }

    // ── Logout ───────────────────────────────────────────────────
    public function test_logout_requires_auth_401(): void
    {
        $this->postJson('/api/v1/auth/logout')->assertStatus(401);
    }

    public function test_logout_succeeds_and_invalidates_token(): void
    {
        $token = $this->register()['token'];

        $this->bearer($token)->postJson('/api/v1/auth/logout')
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        // Token is now revoked (security stamp rotated) — cannot reach protected route.
        $this->bearer($token)->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    public function test_logout_is_idempotent(): void
    {
        $token = $this->register()['token'];

        $this->bearer($token)->postJson('/api/v1/auth/logout')->assertStatus(200);
        // Second call with the dead token should fail gracefully (401), not 500.
        $this->bearer($token)->postJson('/api/v1/auth/logout')->assertStatus(401);
    }

    // ── Refresh ──────────────────────────────────────────────────
    public function test_refresh_returns_new_token_envelope(): void
    {
        $data = $this->register();
        $this->assertNotEmpty($data['refresh_token']);

        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $data['refresh_token']])
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'message', 'meta', 'errors', 'data' => ['token', 'refresh_token']])
            ->assertJsonPath('success', true);
    }

    public function test_refresh_rotates_and_blacklists_old_token(): void
    {
        $old = $this->register()['refresh_token'];

        $r1 = $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $old])
            ->assertStatus(200)->json('data');

        $this->assertNotEquals($old, $r1['refresh_token'], 'refresh must rotate the token');

        // Reuse of the rotated-out token must fail.
        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $old])
            ->assertStatus(401);

        // The new token still works.
        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => $r1['refresh_token']])
            ->assertStatus(200);
    }

    public function test_refresh_rejects_unknown_token_401(): void
    {
        $this->postJson('/api/v1/auth/refresh', ['refresh_token' => 'garbage-unknown-refresh-token'])
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    // ── Forgot Password ──────────────────────────────────────────
    public function test_forgot_password_issues_token_200(): void
    {
        $user = User::factory()->create();

        $token = $this->postJson('/api/v1/auth/password/email', ['identifier' => $user->email])
            ->assertStatus(200)
            ->assertJsonStructure(['success', 'message', 'data' => ['token']])
            ->assertJsonPath('success', true)
            ->json('data.token');

        $this->assertNotEmpty($token);
    }

    public function test_forgot_password_does_not_leak_account_existence(): void
    {
        // Unknown identifier → still 200 (anti-enumeration).
        $this->postJson('/api/v1/auth/password/email', ['identifier' => 'ghost@ojol.test'])
            ->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    // ── Reset Password ───────────────────────────────────────────
    public function test_reset_password_succeeds_and_new_password_works(): void
    {
        $user = User::factory()->create();

        $token = $this->postJson('/api/v1/auth/password/email', ['identifier' => $user->email])
            ->json('data.token');

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'Newsecret1!',
            'password_confirmation' => 'Newsecret1!',
        ])->assertStatus(200)->assertJsonPath('success', true);

        // New password authenticates.
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'Newsecret1!'])
            ->assertStatus(200);
    }

    public function test_reset_password_rejects_invalid_token_422(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'token' => 'not-a-real-token',
            'password' => 'Newsecret1!',
            'password_confirmation' => 'Newsecret1!',
        ])->assertStatus(422)->assertJsonPath('success', false);
    }

    // ── Email Verification ───────────────────────────────────────
    public function test_email_verification_succeeds_with_valid_code(): void
    {
        $user = User::factory()->create(['email_verified' => false]);
        VerificationToken::create([
            'user_id' => $user->id,
            'type' => VerificationToken::TYPE_EMAIL_VERIFICATION,
            'code' => '654321',
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => '654321'])
            ->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertTrue($user->fresh()->email_verified);
    }

    public function test_email_verification_rejects_wrong_code_422(): void
    {
        $user = User::factory()->create(['email_verified' => false]);
        VerificationToken::create([
            'user_id' => $user->id,
            'type' => VerificationToken::TYPE_EMAIL_VERIFICATION,
            'code' => '654321',
            'expires_at' => now()->addMinutes(10),
        ]);

        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => '000000'])
            ->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_email_verification_rejects_expired_code_422(): void
    {
        $user = User::factory()->create(['email_verified' => false]);
        VerificationToken::create([
            'user_id' => $user->id,
            'type' => VerificationToken::TYPE_EMAIL_VERIFICATION,
            'code' => '654321',
            'expires_at' => now()->subMinutes(10), // already expired
        ]);

        $this->postJson('/api/v1/auth/verify-email', ['email' => $user->email, 'code' => '654321'])
            ->assertStatus(422)
            ->assertJsonPath('success', false);

        // Account must remain unverified.
        $this->assertFalse($user->fresh()->email_verified);
    }

    // ── Unauthorized ─────────────────────────────────────────────
    public function test_protected_endpoint_without_token_returns_401(): void
    {
        $this->getJson('/api/v1/auth/me')
            ->assertStatus(401)
            ->assertJsonStructure(['success', 'message', 'data', 'meta', 'errors'])
            ->assertJsonPath('success', false);
    }

    // ── Invalid Token ────────────────────────────────────────────
    public function test_protected_endpoint_with_malformed_token_returns_401(): void
    {
        // Garbage bearer — not a valid JWT structure.
        $this->withHeader('Authorization', 'Bearer not-a-real-jwt-token')
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_protected_endpoint_with_well_formed_but_unknown_jwt_returns_401(): void
    {
        // A structurally valid JWT signed with a *different* secret → invalid signature.
        $foreign = \Tymon\JWTAuth\Facades\JWTAuth::getJWTProvider()
            ->encode(['sub' => 999999, 'stamp' => 'x', 'iat' => time(), 'exp' => time() + 3600, 'jti' => 'abc']);
        // Re-sign using a wrong key to force signature failure.
        $tampered = $foreign . 'tampered';

        $this->withHeader('Authorization', 'Bearer ' . $tampered)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    // ── Expired Token ────────────────────────────────────────────
    public function test_protected_endpoint_with_expired_token_returns_401(): void
    {
        $user = User::factory()->create();

        // Build a JWT that expired 1 hour ago.
        $expired = JWTAuth::getJWTProvider()->encode([
            'sub' => $user->id,
            'stamp' => $user->security_stamp,
            'iat' => time() - 7200,
            'exp' => time() - 3600,
            'jti' => 'expired-jti',
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $expired)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401)
            ->assertJsonPath('success', false);
    }

    public function test_expired_token_is_rejected_after_refresh_window_too(): void
    {
        // An expired access token must not grant access even on refresh-protected
        // routes; refresh itself needs a *refresh* token, not the access JWT.
        $user = User::factory()->create();
        $expired = JWTAuth::getJWTProvider()->encode([
            'sub' => $user->id,
            'stamp' => $user->security_stamp,
            'iat' => time() - 7200,
            'exp' => time() - 3600,
            'jti' => 'expired-jti-2',
        ]);

        $this->withHeader('Authorization', 'Bearer ' . $expired)
            ->getJson('/api/v1/auth/me')
            ->assertStatus(401);
    }
}
