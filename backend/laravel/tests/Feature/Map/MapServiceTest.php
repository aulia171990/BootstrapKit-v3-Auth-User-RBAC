<?php

namespace Tests\Feature\Map;

use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MapServiceTest extends TestCase
{
    #[Test]
    public function openstreetmap_provider_returns_forward_geocode_result(): void
    {
        $provider = new \App\Gateways\Map\OpenStreetMapProvider();
        $result = $provider->forwardGeocode('Jakarta');

        $this->assertInstanceOf(\App\Gateways\Map\GeocodeResult::class, $result);
        $this->assertTrue($result->success);
        $this->assertSame('Jakarta', $result->query);
        $this->assertSame('OSM Forward', $result->displayName);
    }

    #[Test]
    public function routing_service_roundtrips_polyline_decode(): void
    {
        $service = new \App\Services\Map\RoutingService(new \App\Gateways\Map\OpenStreetMapProvider());

        $decoded = $service->decodePolyline('_p~iF~ps|U_ulLnnqC');

        $this->assertIsArray($decoded);
        $this->assertNotEmpty($decoded);
        $this->assertSame(38.5, round($decoded[0]['lat'], 1));
        $this->assertSame(-120.2, round($decoded[0]['lng'], 1));
    }
}
