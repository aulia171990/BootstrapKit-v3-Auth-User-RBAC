<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Tests\TestCase;

/**
 * Asserts the *standard API response envelope* is present on every kind of
 * endpoint and error path.
 *
 * Envelope contract:
 * {
 *     "success": bool,
 *     "message": string,
 *     "data":    mixed,   // {} when empty
 *     "meta":    object,  // {} when unused, pagination info for paginators
 *     "errors":  array    // [] when none
 * }
 */
class ApiResponseEnvelopeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
        app('cache')->flush();
    }

    /** @dataProvider endpointProvider */
    public function test_envelope_has_all_keys_on_success(string $method, string $uri, ?array $payload, ?string $token): void
    {
        $req = $this->call($method, $uri, $payload ?? [], [], [], $token ? ['HTTP_AUTHORIZATION' => 'Bearer ' . $token] : []);

        $req->assertJsonStructure(['success', 'message', 'data', 'meta', 'errors']);
        $req->assertJsonPath('success', true);
        $this->assertIsArray($req->json('errors'));
        $this->assertIsArray($req->json('meta'));
    }

    public static function endpointProvider(): array
    {
        return [
            'register'           => ['POST', '/api/v1/auth/register', ['name' => 'Env', 'email' => 'env@ojol.test', 'phone' => '6281200000999', 'password' => 'Newsecret1!', 'password_confirmation' => 'Newsecret1!'], null],
            'login'              => ['POST', '/api/v1/auth/login', ['email' => 'admin@ojol.test', 'password' => 'password'], null],
            'otp request'        => ['POST', '/api/v1/auth/otp/request', ['identifier' => 'admin@ojol.test'], null],
            'password/email'     => ['POST', '/api/v1/auth/password/email', ['identifier' => 'admin@ojol.test'], null],
        ];
    }

    public function test_authenticated_endpoint_envelope(): void
    {
        $token = JWTAuth::fromUser(User::where('email', 'admin@ojol.test')->first());

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me')
            ->assertJsonStructure(['success', 'message', 'data', 'meta', 'errors'])
            ->assertJsonPath('success', true);

        // Paginated list → meta carries pagination fields.
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/orders')
            ->assertJsonStructure(['success', 'data', 'meta', 'errors'])
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 20);
    }

    public function test_validation_error_uses_envelope(): void
    {
        $this->postJson('/api/v1/auth/register', ['email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonStructure(['success', 'message', 'data', 'meta', 'errors'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('meta', [])
            ->assertJsonPath('errors.email', fn ($v) => is_array($v));
    }

    public function test_unauthenticated_uses_envelope(): void
    {
        $this->getJson('/api/v1/auth/me')
            ->assertStatus(401)
            ->assertJsonStructure(['success', 'message', 'data', 'meta', 'errors'])
            ->assertJsonPath('success', false);
    }

    public function test_forbidden_abort_uses_envelope(): void
    {
        $user = User::factory()->create(['email_verified' => false]);
        $token = JWTAuth::fromUser($user);

        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/auth/password/change', ['current_password' => 'password', 'password' => 'Newpass1!', 'password_confirmation' => 'Newpass1!'])
            ->assertStatus(403)
            ->assertJsonStructure(['success', 'message', 'data', 'meta', 'errors'])
            ->assertJsonPath('success', false);
    }
}
