<?php

namespace App\Http\Controllers\Map;

use App\Http\Controllers\Controller;
use App\Http\Requests\Map\ETACalculationRequest as ETACalculationFormRequest;
use App\Http\Requests\Map\DistanceMatrixRequest as DistanceMatrixFormRequest;
use App\Http\Requests\Map\GeocodeRequest;
use App\Http\Requests\Map\ReverseGeocodeRequest;
use App\Http\Requests\Map\RouteCalculationRequest;
use App\Http\Requests\Map\SearchAddressRequest;
use App\Services\Map\DistanceService;
use App\Services\Map\ETAService;
use App\Services\Map\GeocodingService;
use App\Services\Map\RoutingService;
use Illuminate\Http\JsonResponse;

class MapController extends Controller
{
    public function __construct(
        private GeocodingService $geocoding,
        private RoutingService $routing,
        private DistanceService $distance,
        private ETAService $eta,
    ) {}

    public function search(SearchAddressRequest $request): JsonResponse
    {
        $result = $this->geocoding->search(new \App\DTOs\Map\MapSearchRequest(
            $request->input('query'),
            $request->input('context'),
        ));

        return response()->json(['success' => true, 'data' => [
            'display_name' => $result->displayName,
            'lat' => $result->lat,
            'lng' => $result->lng,
            'address_components' => $result->addressComponents,
        ]], 200);
    }

    public function geocode(GeocodeRequest $request): JsonResponse
    {
        $result = $this->geocoding->forward($request->input('address'));

        return response()->json(['success' => true, 'data' => [
            'display_name' => $result->displayName,
            'lat' => $result->lat,
            'lng' => $result->lng,
            'address_components' => $result->addressComponents,
        ]], 200);
    }

    public function reverseGeocode(ReverseGeocodeRequest $request): JsonResponse
    {
        $result = $this->geocoding->reverse($request->input('lat'), $request->input('lng'));

        return response()->json(['success' => true, 'data' => [
            'display_name' => $result->displayName,
            'lat' => $result->lat,
            'lng' => $result->lng,
            'address_components' => $result->addressComponents,
        ]], 200);
    }

    public function route(RouteCalculationRequest $request): JsonResponse
    {
        $waypoints = [];
        foreach ($request->input('waypoints', []) as $point) {
            $waypoints[] = new \App\DTOs\Map\Coordinate((float) $point['lat'], (float) $point['lng']);
        }

        $result = $this->routing->calculate(new \App\DTOs\Map\RouteRequest($waypoints, $request->input('options')));

        return response()->json(['success' => true, 'data' => [
            'distance_meters' => $result->distanceMeters,
            'duration_seconds' => $result->durationSeconds,
            'polyline' => $result->polyline,
            'legs' => $result->legs,
            'summary' => $result->summary,
        ]], 200);
    }

    public function distance(DistanceMatrixFormRequest $request): JsonResponse
    {
        $origins = [];
        foreach ($request->input('origins', []) as $point) {
            $origins[] = new \App\DTOs\Map\Coordinate((float) $point['lat'], (float) $point['lng']);
        }

        $destinations = [];
        foreach ($request->input('destinations', []) as $point) {
            $destinations[] = new \App\DTOs\Map\Coordinate((float) $point['lat'], (float) $point['lng']);
        }

        $result = $this->distance->matrix(new \App\DTOs\Map\DistanceMatrixRequest($origins, $destinations, $request->input('options')));

        return response()->json(['success' => true, 'data' => [
            'rows' => $result->rows,
        ]], 200);
    }

    public function eta(ETACalculationFormRequest $request): JsonResponse
    {
        $result = $this->eta->calculate(new \App\DTOs\Map\ETACalculationRequest(
            new \App\DTOs\Map\Coordinate((float) $request->input('from_lat'), (float) $request->input('from_lng')),
            new \App\DTOs\Map\Coordinate((float) $request->input('to_lat'), (float) $request->input('to_lng')),
            $request->input('mode', 'driving'),
        ));

        return response()->json(['success' => true, 'data' => [
            'eta_seconds' => $result,
        ]], 200);
    }
}
