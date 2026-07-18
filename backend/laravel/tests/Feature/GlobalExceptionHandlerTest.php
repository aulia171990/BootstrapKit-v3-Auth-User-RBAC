<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use PDOException;
use Tests\TestCase;

/**
 * Verifies the global exception handler: every error path returns the
 * standard envelope, with a correct HTTP status, and NEVER leaks SQL,
 * stack traces, or internal error messages to the client.
 */
class GlobalExceptionHandlerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate')->assertSuccessful();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
        app('cache')->flush();
    }

    private function body(string $content): string
    {
        return $content;
    }

    public function test_404_is_sanitised_no_model_class_leak(): void
    {
        $resp = $this->getJson('/api/v1/does-not-exist');
        $body = $resp->getContent();

        $resp->assertStatus(404)
            ->assertJsonStructure(['success', 'message', 'data', 'meta', 'errors'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Data tidak ditemukan')
            ->assertJsonMissingExact(['message' => 'No query results for model']);

        $this->assertStringNotContainsStringIgnoringCase('App\\Models', $body);
    }

    public function test_404_for_missing_model_is_sanitised(): void
    {
        // Route model binding miss throws ModelNotFoundException → 404 envelope.
        $resp = $this->getJson('/api/v1/drivers/00000000-0000-0000-0000-000000000000');
        $body = $resp->getContent();

        $resp->assertStatus(404)
            ->assertJsonStructure(['success', 'message', 'data', 'meta', 'errors'])
            ->assertJsonPath('message', 'Data tidak ditemukan');

        $this->assertStringNotContainsStringIgnoringCase('App\\Models', $body);
    }

    public function test_unhandled_exception_returns_500_without_internal_details(): void
    {
        Route::get('/api/v1/_probe_boom', fn () => throw new \RuntimeException('DB_PASSWORD=secret; SELECT * FROM users'));

        $resp = $this->getJson('/api/v1/_probe_boom');
        $body = $resp->getContent();

        $resp->assertStatus(500)
            ->assertJsonStructure(['success', 'message', 'data', 'meta', 'errors'])
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Terjadi kesalahan pada server');

        // Leak guards — none of these must ever appear in the body.
        foreach (['SELECT', 'DB_PASSWORD', 'RuntimeException', 'trace', '"file"', 'users'] as $needle) {
            $this->assertStringNotContainsStringIgnoringCase($needle, $body);
        }
    }

    public function test_query_exception_never_leaks_sql(): void
    {
        // 23* SQLSTATE = integrity/constraint violation → 409 generic message.
        $pdo = new PDOException('SQLSTATE[23505]: duplicate key "users_email_unique"', 23505);
        $pdo->errorInfo = ['23505', 7, 'duplicate key "users_email_unique"'];
        $qe = new QueryException('pgsql', 'SELECT 1', [], $pdo);

        Route::get('/api/v1/_probe_sql', fn () => throw $qe);

        $resp = $this->getJson('/api/v1/_probe_sql');
        $body = $resp->getContent();

        $resp->assertStatus(409)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Konflik data (kemungkinan duplikat)');

        foreach (['users_email_unique', 'SELECT', 'SQLSTATE'] as $needle) {
            $this->assertStringNotContainsStringIgnoringCase($needle, $body);
        }
    }

    public function test_unauthenticated_uses_envelope(): void
    {
        $this->getJson('/api/v1/auth/me')
            ->assertStatus(401)
            ->assertJsonStructure(['success', 'message', 'data', 'meta', 'errors'])
            ->assertJsonPath('success', false);
    }
}
