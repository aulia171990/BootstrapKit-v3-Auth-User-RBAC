<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Verifies the OpenAPI documentation is served and well-formed, and that the
 * seven required auth endpoints are documented.
 */
class OpenApiDocsTest extends TestCase
{
    public function test_openapi_yaml_is_served_and_parses(): void
    {
        $resp = $this->get('/api/docs/openapi.yaml');

        $resp->assertStatus(200)
            ->assertHeader('Content-Type', 'application/yaml');

        $spec = \Symfony\Component\Yaml\Yaml::parse($resp->getContent());

        $this->assertSame('3.1.0', $spec['openapi'] ?? null);
        $this->assertArrayHasKey('paths', $spec);
        $this->assertArrayHasKey('components', $spec);
        $this->assertArrayHasKey('securitySchemes', $spec['components']);
    }

    public function test_all_required_auth_endpoints_documented(): void
    {
        $resp = $this->get('/api/docs/openapi.yaml');
        $spec = \Symfony\Component\Yaml\Yaml::parse($resp->getContent());

        $paths = array_keys($spec['paths']);
        $required = [
            '/auth/register',
            '/auth/login',
            '/auth/refresh',
            '/auth/logout',
            '/auth/password/email',
            '/auth/password/reset',
            '/auth/verify-email',
        ];

        foreach ($required as $p) {
            $this->assertContains($p, $paths, "Endpoint {$p} missing from OpenAPI spec");
            $this->assertArrayHasKey('post', $spec['paths'][$p], "{$p} must document POST");
        }
    }

    public function test_docs_viewer_page_loads(): void
    {
        $this->get('/api/docs')->assertStatus(200)->assertSee('swagger-ui');
    }
}
