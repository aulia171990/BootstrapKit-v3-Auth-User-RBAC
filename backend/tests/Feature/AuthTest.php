<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthTest extends TestCase
{
    public function test_login_endpoint_exists(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'demo@example.com',
            'password' => 'password'
        ]);

        $response->assertStatus(200);
    }
}
