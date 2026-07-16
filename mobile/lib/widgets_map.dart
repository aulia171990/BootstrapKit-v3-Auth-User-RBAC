import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

/// Peta tracking: marker driver (live), pickup, dropoff.
///
/// [driverPos] null = driver belum broadcast posisi. Map otomatis pindah
/// kamera ke posisi driver tiap update (animate).
class TrackMap extends StatefulWidget {
  final LatLng? driverPos;
  final LatLng? pickup;
  final LatLng? dropoff;
  final double? initialLat;
  final double? initialLng;

  const TrackMap({
    super.key,
    this.driverPos,
    this.pickup,
    this.dropoff,
    this.initialLat,
    this.initialLng,
  });

  @override
  State<TrackMap> createState() => _TrackMapState();
}

class _TrackMapState extends State<TrackMap> {
  final Completer<GoogleMapController> _ctrl = Completer<GoogleMapController>();
  LatLng? _lastDriver;

  LatLng get _center {
    if (widget.driverPos != null) return widget.driverPos!;
    if (widget.pickup != null) return widget.pickup!;
    if (widget.dropoff != null) return widget.dropoff!;
    return LatLng(widget.initialLat ?? -6.2, widget.initialLng ?? 106.8);
  }

  Set<Marker> get _markers {
    final m = <Marker>{};
    if (widget.pickup != null) {
      m.add(Marker(markerId: const MarkerId('pickup'), position: widget.pickup!, infoWindow: const InfoWindow(title: 'Pickup'), icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen)));
    }
    if (widget.dropoff != null) {
      m.add(Marker(markerId: const MarkerId('dropoff'), position: widget.dropoff!, infoWindow: const InfoWindow(title: 'Dropoff'), icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed)));
    }
    if (widget.driverPos != null) {
      m.add(Marker(markerId: const MarkerId('driver'), position: widget.driverPos!, infoWindow: const InfoWindow(title: 'Driver'), icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure)));
    }
    return m;
  }

  @override
  void didUpdateWidget(covariant TrackMap old) {
    super.didUpdateWidget(old);
    if (widget.driverPos != null && widget.driverPos != _lastDriver) {
      _lastDriver = widget.driverPos;
      _ctrl.future.then((c) => c.animateCamera(CameraUpdate.newLatLng(widget.driverPos!)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 280,
      child: GoogleMap(
        initialCameraPosition: CameraPosition(target: _center, zoom: 14),
        markers: _markers,
        myLocationEnabled: false,
        zoomControlsEnabled: false,
        onMapCreated: (c) => _ctrl.complete(c),
      ),
    );
  }
}
